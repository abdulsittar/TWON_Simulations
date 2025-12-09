import React, { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { ToastContainer, toast } from "react-toastify";
import { Bar, Line } from "react-chartjs-2";
import "react-toastify/dist/ReactToastify.css";
import "chart.js/auto";

type User = {
  id: string;
  followers: string[];
  following: string[];
  posts: number;
  comments: number;
  community: string;
};

type NetworkMetrics = {
  time: number;
  assortativity: number;
  modularity: number;
  echoChamber: number;
  density: number;
  clustering: number;
  reciprocity: number;
  pathLength: number;
  intraCommunityFraction: number;
  interCommunityFraction: number;
};

const SERVER_URL = "http://194.249.231.76:1071";

const SchedulerControl: React.FC = () => {
  /** Toggle this to switch DUMMY / REAL */
  const USE_DUMMY = false; // set to true to run full dummy simulation

  const [simulationRunning, setSimulationRunning] = useState(false);
  const [timer, setTimer] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState("50");
  const [network, setNetwork] = useState("Barabasi");
  const [history, setHistory] = useState<{ time: number; posts: number; comments: number }[]>([]);
  const [networkHistory, setNetworkHistory] = useState<NetworkMetrics[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });

  const fgRef = useRef<any>(null);

  /** -------------------------
   *  Utility: Create users (initial)
   *  ------------------------- */
  const createDummyUsers = (count: number, networkType?: string): User[] => {
    const comms = ["A", "B", "C", "D"];
    // Initialize users with communities assigned by simple round-robin or SBM seed
    const base: User[] = Array.from({ length: count }, (_, i) => ({
      id: `user${i + 1}`,
      followers: [],
      following: [],
      posts: 0,
      comments: 0,
      community: comms[i % comms.length],
    }));

    // optionally pre-connect some links depending on networkType to give a realistic starting point
    if (networkType === "ErdosRenyi") {
      const p = 0.03 + Math.min(0.3, 2 / count);
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          if (Math.random() < p) {
            base[i].following.push(base[j].id);
            base[j].followers.push(base[i].id);
          }
          if (Math.random() < p * 0.6) {
            base[j].following.push(base[i].id);
            base[i].followers.push(base[j].id);
          }
        }
      }
    } else if (networkType === "Barabasi") {
      // simple preferential attachment seed
      const m = Math.max(1, Math.floor(count / 20));
      for (let i = 0; i < count; i++) {
        if (i === 0) continue;
        // choose m targets preferentially
        for (let k = 0; k < m; k++) {
          const targetIdx = Math.floor(Math.random() * Math.min(i, Math.max(1, Math.floor(i / 2))));
          const target = base[targetIdx];
          if (!base[i].following.includes(target.id)) {
            base[i].following.push(target.id);
            target.followers.push(base[i].id);
          }
        }
      }
    } else if (networkType === "SBM") {
      // stochastic block: more edges within community
      const intraProb = 0.12;
      const interProb = 0.01;
      for (let i = 0; i < count; i++) {
        for (let j = 0; j < count; j++) {
          if (i === j) continue;
          const p = base[i].community === base[j].community ? intraProb : interProb;
          if (Math.random() < p) {
            base[i].following.push(base[j].id);
            base[j].followers.push(base[i].id);
          }
        }
      }
    }

    return base;
  };

  /** -------------------------
   *  Community detection (connected components over undirected follow graph)
   *  ------------------------- */
  const detectCommunities = (usersArr: User[]) => {
    const communities: Record<string, string> = {};
    let cid = 0;
    const idToIndex = new Map(usersArr.map((u, i) => [u.id, i]));

    for (const u of usersArr) {
      if (communities[u.id]) continue;
      const label = `C${cid++}`;
      // BFS
      const queue: string[] = [u.id];
      communities[u.id] = label;
      while (queue.length) {
        const cur = queue.shift()!;
        const curNode = usersArr[idToIndex.get(cur)!];
        // neighbors: followers + following (treat as undirected)
        const neighbors = [...curNode.followers, ...curNode.following];
        for (const n of neighbors) {
          if (!communities[n]) {
            communities[n] = label;
            queue.push(n);
          }
        }
      }
    }
    return communities; // map userId -> communityLabel
  };

  /** -------------------------
   *  Compute network structural metrics (approx)
   *  ------------------------- */
  const computeNetworkMetrics = (usersArr: User[]) => {
    const N = usersArr.length;
    const edges = usersArr.reduce((s, u) => s + u.following.length, 0);
    const density = N > 1 ? edges / (N * (N - 1)) : 0;

    // reciprocity
    let recCount = 0;
    usersArr.forEach((u) => {
      u.following.forEach((fId) => {
        const t = usersArr.find((x) => x.id === fId);
        if (t && t.following.includes(u.id)) recCount++;
      });
    });
    const reciprocity = edges ? recCount / edges : 0;

    // clustering coefficient (approx): use density as baseline
    const clustering = Math.min(1, density * 3 + 0.02);

    // average path length (approx): use small-world-ish approx
    const pathLength = edges > 0 ? Math.max(1, Math.log(N) / Math.log(Math.max(2, edges / N + 1))) : 0;

    // assortativity (degree-degree correlation) simplified
    let assortAccum = 0;
    usersArr.forEach((u) => {
      const du = u.followers.length + u.following.length;
      u.following.forEach((fId) => {
        const v = usersArr.find((x) => x.id === fId);
        if (v) assortAccum += du * (v.followers.length + v.following.length);
      });
    });
    const assortativity = N ? assortAccum / N : 0;

    // modularity like: fraction of intra-community edges
    let intra = 0;
    let inter = 0;
    usersArr.forEach((u) => {
      u.following.forEach((fId) => {
        const v = usersArr.find((x) => x.id === fId);
        if (!v) return;
        if (v.community === u.community) intra++;
        else inter++;
      });
    });
    const modularity = intra + inter ? intra / (intra + inter) : 0;
    const intraCommunityFraction = intra + inter ? intra / (intra + inter) : 0;
    const interCommunityFraction = intra + inter ? inter / (intra + inter) : 0;

    const echoChamber = modularity; // simple proxy

    return {
      density,
      clustering,
      reciprocity,
      assortativity,
      pathLength,
      modularity,
      intraCommunityFraction,
      interCommunityFraction,
      echoChamber,
    };
  };

  /** -------------------------
   *  Setup initial users / graph when selectedUsers or network changes
   *  ------------------------- */
  useEffect(() => {
    const count = parseInt(selectedUsers || "10", 10);
    const newUsers = createDummyUsers(count, network);
    setUsers(newUsers);

    setGraphData({
      nodes: newUsers.map((u) => ({ id: u.id, val: 4, color: "rgb(200,200,200)" })),
      links: [],
    });

    setTimer(0);
    setHistory([]);
    setNetworkHistory([]);
  }, [selectedUsers, network]);

  /** -------------------------
   *  Compute and append structural metrics periodically (works for both real & dummy)
   *  This watcher appends metrics based on current `users`.
   *  If you prefer backend-provided metrics in real mode, those will overwrite via stats polling.
   *  ------------------------- */
  useEffect(() => {
    if (!simulationRunning) return;
    const interval = setInterval(() => {
      // compute metrics and append
      const metrics = computeNetworkMetrics(users);
      setNetworkHistory((prev) =>
        [...prev, { time: timer, assortativity: metrics.assortativity, modularity: metrics.modularity, echoChamber: metrics.echoChamber, density: metrics.density, clustering: metrics.clustering, reciprocity: metrics.reciprocity, pathLength: metrics.pathLength, intraCommunityFraction: metrics.intraCommunityFraction, interCommunityFraction: metrics.interCommunityFraction }].slice(-200)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [simulationRunning, users, timer]);

  /** -------------------------
   *  DUMMY simulation: posts/comments, realistic follows, community detection, history, graph update
   *  Runs only if USE_DUMMY === true
   *  ------------------------- */
  useEffect(() => {
    if (!USE_DUMMY || !simulationRunning) return;

    const interval = setInterval(() => {
      setTimer((t) => t + 1);

      setUsers((prev) => {
        // clone shallow users
        const updated = prev.map((u) => ({ ...u, followers: [...u.followers], following: [...u.following] }));

        // posts/comments patches
        updated.forEach((u) => {
          if (Math.random() < 0.22) u.posts += 1;
          if (Math.random() < 0.33) u.comments += 1;
        });

        // Preferential attachment + community bias for new follows
        const followOps = Math.min(updated.length, Math.ceil(Math.random() * Math.max(1, updated.length / 4)));
        for (let op = 0; op < followOps; op++) {
          const sourceIdx = Math.floor(Math.random() * updated.length);
          const source = updated[sourceIdx];

          // build weights: more weight for popular nodes and same-community nodes
          const weights = updated.map((u) => {
            const base = 1 + u.followers.length * 1.5; // popularity
            const communityBoost = u.community === source.community ? 4 : 0;
            return base + communityBoost;
          });

          // normalize & sample
          const totalW = weights.reduce((s, w) => s + w, 0);
          let r = Math.random() * totalW;
          let targetIdx = 0;
          for (let i = 0; i < weights.length; i++) {
            r -= weights[i];
            if (r <= 0) {
              targetIdx = i;
              break;
            }
          }

          // apply follow
          const target = updated[targetIdx];
          if (source.id !== target.id && !source.following.includes(target.id)) {
            source.following.push(target.id);
            target.followers.push(source.id);
          }
        }

        // Occasionally add some random unfollows to keep dynamics
        if (Math.random() < 0.05) {
          const a = updated[Math.floor(Math.random() * updated.length)];
          if (a.following.length > 0) {
            const idx = Math.floor(Math.random() * a.following.length);
            const fid = a.following.splice(idx, 1)[0];
            const fNode = updated.find((x) => x.id === fid);
            if (fNode) {
              const fIdx = fNode.followers.indexOf(a.id);
              if (fIdx >= 0) fNode.followers.splice(fIdx, 1);
            }
          }
        }

        // Community detection & assign community labels
        const detected = detectCommunities(updated);
        updated.forEach((u) => {
          u.community = detected[u.id] ?? u.community;
        });

        // Update graph data
        setGraphData(() => {
          const maxFollowing = Math.max(...updated.map((u) => u.following.length), 1);
          const nodes = updated.map((u) => {
            const intensity = Math.floor((u.following.length / maxFollowing) * 200);
            // color mapped by community or following intensity
            return { id: u.id, val: Math.max(4, 4 + u.followers.length), color: `rgb(${255 - intensity}, ${180 - intensity / 2}, ${120 + (intensity % 100)})` };
          });
          const links = updated.flatMap((u) => u.following.map((f) => ({ source: u.id, target: f })));
          return { nodes, links };
        });

        // push history metrics
        const totalPosts = updated.reduce((s, u) => s + u.posts, 0);
        const totalComments = updated.reduce((s, u) => s + u.comments, 0);
        setHistory((h) => [...h, { time: timer + 1, posts: totalPosts, comments: totalComments }].slice(-500));

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [simulationRunning, USE_DUMMY, timer]);

  /** -------------------------
   *  REAL mode: status polling (reads /status)
   *  ------------------------- */
  useEffect(() => {
    if (USE_DUMMY) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${SERVER_URL}/status`);
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data.running === "boolean") setSimulationRunning(Boolean(data.running));
      } catch (e) {
        // silent
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [USE_DUMMY]);

  /** -------------------------
   *  REAL mode: stats polling (reads /stats)
   *  When simulationRunning is true we poll stats frequently.
   *  ------------------------- */
  useEffect(() => {
    if (USE_DUMMY) return;
    if (!simulationRunning) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${SERVER_URL}/stats`);
        if (!res.ok) return;
        const data = await res.json();

        // server may provide absolute start_time (unix seconds)
        if (data.start_time) {
          setTimer(Math.floor(Date.now() / 1000 - data.start_time));
        }

        // users object expected shape: { userId: { posts, comments, followers?, following?, community? } }
        if (data.users) {
          const backendUsers: User[] = Object.entries(data.users).map(([id, s]: any) => ({
            id,
            posts: s.posts ?? 0,
            comments: s.comments ?? 0,
            followers: Array.isArray(s.followers) ? s.followers : [],
            following: Array.isArray(s.following) ? s.following : [],
            community: s.community ?? (typeof s.community === "string" ? s.community : "A"),
          }));

          // assign to state
          setUsers(backendUsers);

          // graph
          setGraphData({
            nodes: backendUsers.map((u) => ({
              id: u.id,
              val: Math.max(4, 4 + u.followers.length),
              color: `hsl(${Math.min(u.following.length * 20, 360)},70%,50%)`,
            })),
            links: backendUsers.flatMap((u) => u.following.map((f) => ({ source: u.id, target: f }))),
          });

          // push history (posts/comments)
          const totalPosts = backendUsers.reduce((s, u) => s + u.posts, 0);
          const totalComments = backendUsers.reduce((s, u) => s + u.comments, 0);
          setHistory((h) => [...h, { time: timer, posts: totalPosts, comments: totalComments }].slice(-500));
        }

        // metrics returned by backend (optional)
        if (data.metrics) {
          const m = data.metrics;
          setNetworkHistory((prev) =>
            [...prev, { time: timer, assortativity: m.assortativity ?? 0, modularity: m.modularity ?? 0, echoChamber: m.echo ?? 0, density: m.density ?? 0, clustering: m.clustering ?? 0, reciprocity: m.reciprocity ?? 0, pathLength: m.path_length ?? 0, intraCommunityFraction: m.intra ?? 0, interCommunityFraction: m.inter ?? 0 }].slice(-200)
          );
        }
      } catch (e) {
        // silent failure; keep UI responsive
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [simulationRunning, USE_DUMMY, timer]);

  /** -------------------------
   *  Start / Stop handlers (unified for DUMMY & REAL)
   *  ------------------------- */
  const handleStartStop = async () => {
    if (USE_DUMMY) {
      if (simulationRunning) {
        setSimulationRunning(false);
        toast.info("Dummy simulation stopped");
      } else {
        // reset users and start
        const count = parseInt(selectedUsers, 10);
        setUsers(createDummyUsers(count, network));
        setTimer(0);
        setHistory([]);
        setNetworkHistory([]);
        setGraphData((g) => ({
          nodes: Array.from({ length: count }, (_, i) => ({ id: `user${i + 1}`, val: 4, color: "rgb(200,200,200)" })),
          links: [],
        }));
        setSimulationRunning(true);
        toast.success("Dummy simulation started");
      }
      return;
    }

    // REAL mode
    try {
      if (simulationRunning) {
        // stop
        const res = await fetch(`${SERVER_URL}/stop`, { method: "POST" });
        if (!res.ok) throw new Error("stop failed");
        setSimulationRunning(false);
        toast.info("Backend simulation stopped");
      } else {
        // start
        const body = {
          num_users: parseInt(selectedUsers, 10),
          network,
          platform: "twitter",
          ranker: "default",
          topic: "demo",
          token: "",
          num_events: 1000,
          llm: "api",
        };
        const res = await fetch(`${SERVER_URL}/start`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error("start failed");
        setTimer(0);
        setHistory([]);
        setNetworkHistory([]);
        setSimulationRunning(true);
        toast.success("Backend simulation started");
      }
    } catch (e) {
      toast.error("Backend unreachable or returned error");
    }
  };

  /** -------------------------
   *  Reset handler
   *  ------------------------- */
  const handleReset = () => {
    setSimulationRunning(false);
    setTimer(0);
    const count = parseInt(selectedUsers, 10);
    const newUsers = createDummyUsers(count, network);
    setUsers(newUsers);
    setGraphData({
      nodes: newUsers.map((u) => ({ id: u.id, val: 4, color: "rgb(255,255,255)" })),
      links: [],
    });
    setHistory([]);
    setNetworkHistory([]);
    toast.info("Reset complete");
  };

  /** -------------------------
   *  Derived memo for community metrics for charting
   *  ------------------------- */
  const communityMetrics = React.useMemo(() => {
    if (!users.length) return { numCommunities: 0, modularity: 0, largestCommunity: 0 };

    const groups: Record<string, User[]> = {};
    users.forEach((u) => {
      if (!groups[u.community]) groups[u.community] = [];
      groups[u.community].push(u);
    });

    const numCommunities = Object.keys(groups).length;
    let intra = 0;
    let total = 0;
    users.forEach((u) => {
      u.following.forEach((f) => {
        total++;
        const t = users.find((x) => x.id === f);
        if (t && t.community === u.community) intra++;
      });
    });
    const modularity = total ? intra / total : 0;
    const largestCommunity = Math.max(...Object.values(groups).map((g) => g.length)) / users.length * 100;

    return { numCommunities, modularity, largestCommunity };
  }, [users]);

  /** -------------------------
   *  Chart datasets
   *  ------------------------- */
  const degreeData = {
    labels: users.map((u) => u.id),
    datasets: [
      { label: "Followers", data: users.map((u) => u.followers.length), backgroundColor: "rgba(255,99,132,0.6)" },
      { label: "Following", data: users.map((u) => u.following.length), backgroundColor: "rgba(54,162,235,0.6)" },
    ],
  };

  const echoLineData = {
    labels: networkHistory.map((n) => n.time),
    datasets: [
      { label: "Intra-community frac", data: networkHistory.map((n) => n.intraCommunityFraction), borderColor: "red", fill: false },
      { label: "Inter-community frac", data: networkHistory.map((n) => n.interCommunityFraction), borderColor: "blue", fill: false },
    ],
  };

  const structuralData = {
    labels: networkHistory.map((n) => n.time),
    datasets: [
      { label: "Density", data: networkHistory.map((n) => n.density), borderColor: "blue", fill: false },
      { label: "Clustering", data: networkHistory.map((n) => n.clustering), borderColor: "green", fill: false },
      { label: "Reciprocity", data: networkHistory.map((n) => n.reciprocity), borderColor: "orange", fill: false },
      { label: "Avg Path", data: networkHistory.map((n) => n.pathLength), borderColor: "red", fill: false },
    ],
  };

  /** -------------------------
   *  Render
   *  ------------------------- */
  return (
    <div className="p-4">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="mb-4 flex flex-wrap gap-2">
        <select value={selectedUsers} onChange={(e) => setSelectedUsers(e.target.value)} className="p-2 border rounded">
          <option value="10">10 Users</option>
          <option value="50">50 Users</option>
          <option value="100">100 Users</option>
          <option value="250">250 Users</option>
        </select>

        <select value={network} onChange={(e) => setNetwork(e.target.value)} className="p-2 border rounded">
          <option value="Barabasi">Barabasi</option>
          <option value="ErdosRenyi">ErdosRenyi</option>
          <option value="SBM">SBM (Stochastic Block)</option>
        </select>

        <button onClick={handleStartStop} className="px-4 py-2 bg-blue-500 text-white rounded">
          {simulationRunning ? "Stop" : "Start"}
        </button>

        <button onClick={handleReset} className="px-4 py-2 bg-red-500 text-white rounded">
          Reset
        </button>

        <div className="ml-4 self-center text-sm">
          Mode: <strong>{USE_DUMMY ? "DUMMY (local simulation)" : "REAL (backend)"}</strong>
        </div>
      </div>

      <div className="mb-4">Timer: {timer}s</div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded bg-white h-[500px] overflow-auto">
          <h3 className="text-center font-semibold mb-2">Users</h3>
          <table className="border-collapse border border-gray-300 w-full text-sm">
            <thead>
              <tr>
                <th className="border p-2">User</th>
                <th className="border p-2">Posts</th>
                <th className="border p-2">Comments</th>
                <th className="border p-2">Followers</th>
                <th className="border p-2">Following</th>
                <th className="border p-2">Community</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="border p-2">{u.id}</td>
                  <td className="border p-2">{u.posts}</td>
                  <td className="border p-2">{u.comments}</td>
                  <td className="border p-2">{u.followers.length}</td>
                  <td className="border p-2">{u.following.length}</td>
                  <td className="border p-2">{u.community}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border rounded bg-white h-[500px]">
          <h3 className="text-center font-semibold mb-2">Degree Distribution</h3>
          <div style={{ width: "100%", height: "420px" }}>
            <Bar
              data={degreeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "top" }, title: { display: true, text: "Followers & Following" } },
                scales: { x: { title: { display: true, text: "Users" } }, y: { title: { display: true, text: "Count" } } },
              }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>

        <div className="p-4 border rounded bg-white h-[500px]">
          <h3 className="text-center font-semibold mb-2">Network Graph</h3>
          <div style={{ width: "100%", height: "420px" }}>
            <ForceGraph2D
              ref={fgRef}
              width={550}
              height={400}
              graphData={graphData}
              nodeVal={(n: any) => n.val}
              nodeColor={(n: any) => n.color}
              nodeLabel={(node: any) => {
                const u = users.find((usr) => usr.id === node.id);
                return `${node.id}\nFollowers: ${u?.followers.length}\nFollowing: ${u?.following.length}\nCommunity: ${u?.community}`;
              }}
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={1}
            />
          </div>
        </div>

        <div className="p-4 border rounded bg-white h-[500px]">
          <h3 className="text-center font-semibold mb-2">Network Structural Metrics Over Time</h3>
          <div style={{ width: "100%", height: "420px" }}>
            <Line
              data={structuralData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "top" }, title: { display: true, text: "Network Structural Metrics" } },
                scales: { x: { title: { display: true, text: "Time (s)" } }, y: { title: { display: true, text: "Value" }, beginAtZero: true } },
              }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>

        <div className="p-4 border rounded bg-white h-[500px]">
          <h3 className="text-center font-semibold mb-2">Community Structure & Modularity</h3>
          <div style={{ width: "100%", height: "420px" }}>
            <Bar
              data={{
                labels: ["Communities"],
                datasets: [
                  { label: "Number of Communities", data: [communityMetrics.numCommunities], backgroundColor: "purple" },
                  { label: "Modularity (Q)", data: [Number(communityMetrics.modularity.toFixed(3))], backgroundColor: "orange" },
                  { label: "Largest Community (%)", data: [Number(communityMetrics.largestCommunity.toFixed(1))], backgroundColor: "cyan" },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "top" }, title: { display: true, text: "Community Metrics" } },
                scales: { x: { title: { display: true, text: "Metric" } }, y: { title: { display: true, text: "Value" }, beginAtZero: true } },
              }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>

        <div className="p-4 border rounded bg-white h-[500px]">
          <h3 className="text-center font-semibold mb-2">Echo Chamber Tendencies</h3>
          <div style={{ width: "100%", height: "420px" }}>
            <Line
              data={echoLineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "top" }, title: { display: true, text: "Echo Chamber Metrics" } },
                scales: { x: { title: { display: true, text: "Time (s)" } }, y: { title: { display: true, text: "Fraction" }, beginAtZero: true, max: 1 } },
              }}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulerControl;
