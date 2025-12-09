import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import ForceGraph from "force-graph";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * SchedulerControl.tsx
 * - USE_DUMMY toggles between backend and dummy mode
 * - Auto-generates N users from Agents dropdown
 * - Simulates posts/comments in dummy mode
 * - Network graph (force-graph - non-react wrapper) rendered below stats
 */

type UserStats = { posts: number; comments: number };
type StatsShape = { users: Record<string, UserStats> };

const SchedulerControl: React.FC = () => {
  // Toggle: true = dummy, false = call real backend
  const USE_DUMMY = true; // <-- flip this

  const SERVER_URL = "http://194.249.231.76:1071";

  // UI state
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [timer, setTimer] = useState(0);
  const [stats, setStats] = useState<StatsShape | null>(null);

  const [selectedUsers, setSelectedUsers] = useState("10");
  const [network, setNetwork] = useState("Barabasi");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedRanker, setSelectedRanker] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [textInput, setTextInput] = useState("");

  // Force-graph refs
  const fgContainerRef = useRef<HTMLDivElement | null>(null);
  const fgInstanceRef = useRef<any>(null); // force-graph instance
  const nodeCountRef = useRef<number>(parseInt(selectedUsers || "10", 10));

  // Helper: create dummy stats object for N users
  const createDummyStats = (count: number): StatsShape => {
    const users: Record<string, UserStats> = {};
    for (let i = 1; i <= count; i++) {
      users[`user${i}`] = { posts: 0, comments: 0 };
    }
    return { users };
  };

  // Graph generation helpers
  const generateNodes = (n: number, groupByHalf = false) => {
    const nodes = [];
    for (let i = 1; i <= n; i++) {
      nodes.push({ id: `user${i}`, group: groupByHalf ? (i <= n / 2 ? 0 : 1) : 0 });
    }
    return nodes;
  };

  const generateBarabasi = (n: number, m = 1) => {
    if (n <= 0) return { nodes: [], links: [] };
    const nodes = generateNodes(n);
    const links: any[] = [];

    // start with m+1 clique
    const k = Math.min(n, m + 1);
    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        links.push({ source: nodes[i].id, target: nodes[j].id });
      }
    }

    const degreeList: string[] = [];
    // initialize degree list
    nodes.slice(0, k).forEach((nd) => {
      const initialDeg = Math.max(1, k - 1);
      for (let r = 0; r < initialDeg; r++) degreeList.push(nd.id);
    });

    for (let newIdx = k; newIdx < n; newIdx++) {
      const newId = nodes[newIdx].id;
      const targets = new Set<string>();
      while (targets.size < m && degreeList.length > 0) {
        const pick = degreeList[Math.floor(Math.random() * degreeList.length)];
        targets.add(pick);
      }
      // fallback if degreeList empty
      while (targets.size < m) {
        const rnd = `user${Math.floor(Math.random() * newIdx) + 1}`;
        targets.add(rnd);
      }
      targets.forEach((t) => {
        links.push({ source: newId, target: t });
        // update degree list
        degreeList.push(newId);
        degreeList.push(t);
      });
    }
    return { nodes, links };
  };

  const generateErdosRenyi = (n: number, p = 0.04) => {
    const nodes = generateNodes(n);
    const links: any[] = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.random() < p) links.push({ source: nodes[i].id, target: nodes[j].id });
      }
    }
    return { nodes, links };
  };

  const generateSBM = (n: number, p_in = 0.08, p_out = 0.01) => {
    const nodes = generateNodes(n, true);
    const links: any[] = [];
    const n1 = Math.floor(n * 0.5);
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const same = (i < n1 && j < n1) || (i >= n1 && j >= n1);
        const prob = same ? p_in : p_out;
        if (Math.random() < prob) links.push({ source: nodes[i].id, target: nodes[j].id });
      }
    }
    return { nodes, links };
  };

  const buildGraph = (count: number, netType: string) => {
    if (netType === "Barabasi") return generateBarabasi(count, Math.max(1, Math.floor(count / 50)));
    if (netType === "ErdosRenyi") {
      const p = count <= 10 ? 0.25 : count <= 50 ? 0.06 : 0.02;
      return generateErdosRenyi(count, p);
    }
    return generateSBM(count, 0.06, 0.01);
  };

  // Rebuild graph & stats when user count or network selection changes
  useEffect(() => {
    const n = parseInt(selectedUsers || "10", 10) || 10;
    nodeCountRef.current = n;

    // set initial stats & timer
    setStats(createDummyStats(n));
    setTimer(0);

    // build initial graph data
    const g = buildGraph(n, network);
    // If instance exists, update its data, else create in next effect
    if (fgInstanceRef.current) {
      fgInstanceRef.current.graphData(g);
    } else {
      // store graph data in container's dataset for initial creation
      // we'll set it up in container init below
    }
  }, [selectedUsers, network]);

  // Initialize force-graph once
  useEffect(() => {
    if (!fgContainerRef.current) return;

    // create instance
    const fg = ForceGraph()(fgContainerRef.current)
      .nodeId("id")
      .linkSource("source")
      .linkTarget("target")
      .cooldownTicks(60)
      .d3VelocityDecay(0.2)
      .onNodeClick((node: any) => {
        // center on click
        const distance = 120;
        const distRatio = 1 + distance / Math.hypot(node.x || 1, node.y || 1);
        (fg as any).cameraPosition(
          { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: 300 },
          { x: node.x, y: node.y, z: 0 },
          400
        );
      })
      .nodeCanvasObject((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const id = node.id as string;
        const userStats = stats?.users?.[id];
        const activity = userStats ? userStats.posts + userStats.comments : 0;
        const size = Math.max(4, Math.min(16, 4 + Math.sqrt(activity)));
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.group === 1 ? "#f59e0b" : "#3b82f6";
        ctx.fill();
        ctx.font = `${Math.max(8, 10 - globalScale)}px Sans-Serif`;
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.fillText(id, node.x, node.y - (size + 6));
      });

    fgInstanceRef.current = fg;

    // initial graph data
    const n = nodeCountRef.current || parseInt(selectedUsers || "10", 10);
    const initialGraph = buildGraph(n, network);
    fg.graphData(initialGraph);

    // cleanup on unmount
    return () => {
      try {
        // force-graph exposes internal destructor via ._destructor in some versions
        (fg as any)._destructor?.();
      } catch {
        // fallback - try to null instance and clear container
      }
      fgInstanceRef.current = null;
      if (fgContainerRef.current) fgContainerRef.current.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // Update graphData when graph links/nodes change (for example we add a link)
  // We'll call graphData update when graph-changing code runs (see dummy tick effect)

  // Dummy stats + occasional graph evolution (runs every second while running)
  useEffect(() => {
    if (!USE_DUMMY || !simulationRunning) return;

    const interval = setInterval(() => {
      // update stats
      setStats((prev) => {
        const n = nodeCountRef.current || parseInt(selectedUsers || "10", 10);
        if (!prev) return createDummyStats(n);
        const nextUsers: Record<string, UserStats> = {};
        for (const [k, v] of Object.entries(prev.users)) {
          const addPosts = Math.random() < 0.25 ? 1 : 0;
          const addComments = Math.floor(Math.random() * 3);
          nextUsers[k] = { posts: v.posts + addPosts, comments: v.comments + addComments };
        }
        return { users: nextUsers };
      });

      // occasional graph update: add a random edge with small probability
      if (fgInstanceRef.current && Math.random() < 0.04) {
        const g = fgInstanceRef.current.graphData();
        const nodes = g.nodes || [];
        if (nodes.length >= 2) {
          const a = nodes[Math.floor(Math.random() * nodes.length)].id;
          const b = nodes[Math.floor(Math.random() * nodes.length)].id;
          if (a !== b) {
            // avoid duplicates
            const exists = (g.links || []).some((l: any) => (l.source === a && l.target === b) || (l.source === b && l.target === a));
            if (!exists) {
              const newLinks = [...(g.links || []), { source: a, target: b }];
              const newG = { nodes: g.nodes, links: newLinks };
              fgInstanceRef.current.graphData(newG);
            }
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [USE_DUMMY, simulationRunning, selectedUsers]);

  // Timer tick (runs while simulationRunning)
  useEffect(() => {
    let t: NodeJS.Timeout | null = null;
    if (simulationRunning) {
      t = setInterval(() => setTimer((s) => s + 1), 1000);
    }
    return () => {
      if (t) clearInterval(t);
    };
  }, [simulationRunning]);

  // Backend polling (status + stats)
  useEffect(() => {
    if (USE_DUMMY) return;
    const si = setInterval(async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/status`);
        setSimulationRunning(res.data.running);
      } catch (err) {
        console.error("Status poll error", err);
      }
    }, 3000);
    return () => clearInterval(si);
  }, [USE_DUMMY]);

  useEffect(() => {
    if (USE_DUMMY) return;
    const si = setInterval(async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/stats`);
        setStats(res.data);
        if (res.data.start_time) {
          setTimer(Math.floor(Date.now() / 1000 - res.data.start_time));
        }
      } catch (err) {
        console.error("Stats poll error", err);
      }
    }, 2000);
    return () => clearInterval(si);
  }, [USE_DUMMY]);

  // Start / Stop handler
  const handleOkClick = async () => {
    if (USE_DUMMY) {
      if (simulationRunning) {
        setSimulationRunning(false);
        toast.info("Dummy scheduler stopped.");
      } else {
        nodeCountRef.current = parseInt(selectedUsers || "10", 10);
        setStats(createDummyStats(nodeCountRef.current));
        setTimer(0);
        setSimulationRunning(true);
        // ensure force graph is reloaded with correct node count
        const g = buildGraph(nodeCountRef.current, network);
        fgInstanceRef.current?.graphData(g);
        toast.success("Dummy scheduler started!");
      }
      return;
    }

    // backend mode
    try {
      if (simulationRunning) {
        await axios.post(`${SERVER_URL}/stop`);
        setSimulationRunning(false);
        toast.info("Scheduler stopped.");
      } else {
        const payload = {
          num_users: parseInt(selectedUsers, 10),
          network,
          platform: selectedPlatform,
          ranker: selectedRanker,
          topic: selectedTopic,
          token: textInput,
          num_events: 100,
          llm: "api",
        };
        await axios.post(`${SERVER_URL}/start`, payload);
        setSimulationRunning(true);
        toast.success("Scheduler started.");
      }
    } catch (err) {
      console.error("Backend error", err);
      toast.error("Backend unreachable.");
    }
  };

  // Cancel handler
  const handleCancelClick = async () => {
    setSelectedUsers("10");
    setNetwork("Barabasi");
    setSelectedPlatform("");
    setSelectedRanker("");
    setSelectedTopic("");
    setTextInput("");
    setTimer(0);
    setStats(createDummyStats(parseInt("10", 10)));
    nodeCountRef.current = 10;
    // stop if running
    if (simulationRunning) {
      if (USE_DUMMY) {
        setSimulationRunning(false);
      } else {
        try {
          await axios.post(`${SERVER_URL}/stop`);
          setSimulationRunning(false);
        } catch {
          toast.error("Failed to stop backend.");
        }
      }
    }
    // reset graph
    fgInstanceRef.current?.graphData(buildGraph(nodeCountRef.current, network));
  };

  // Render UI
  return (
    <div className="home w-full p-0 m-0">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-3 px-0">
        {/* Controls */}
        <div className="box col-span-full sm:col-span-2 xl:col-span-2">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-3">
              Scheduler Control {USE_DUMMY ? "(Dummy Mode)" : "(Backend Mode)"}
            </h2>

            {/* Agents */}
            <label className="block text-sm font-medium mb-2">Agents</label>
            <select value={selectedUsers} onChange={(e) => setSelectedUsers(e.target.value)} className="mb-4 p-2 border rounded w-full">
              <option value="10">10</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>

            {/* Network */}
            <label className="block text-sm font-medium mb-2">Network</label>
            <select value={network} onChange={(e) => setNetwork(e.target.value)} className="mb-4 p-2 border rounded w-full">
              <option value="Barabasi">Barabasi</option>
              <option value="ErdosRenyi">ErdosRenyi</option>
              <option value="StochasticBlockModel">StochasticBlockModel</option>
            </select>

            {/* Platform */}
            <label className="block text-sm font-medium mb-2">Platform</label>
            <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} className="mb-4 p-2 border rounded w-full">
              <option value="">Select Platform</option>
              <option value="Together.io">Together.io</option>
            </select>

            {/* Ranker */}
            <label className="block text-sm font-medium mb-2">Ranker</label>
            <select value={selectedRanker} onChange={(e) => setSelectedRanker(e.target.value)} className="mb-4 p-2 border rounded w-full">
              <option value="">Select Ranker</option>
              <option value="Random">Random</option>
              <option value="Chronological">Chronological</option>
              <option value="Success">Success based ranking</option>
            </select>

            {/* Topic */}
            <label className="block text-sm font-medium mb-2">Topic</label>
            <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} className="mb-4 p-2 border rounded w-full">
              <option value="">Select Topic</option>
              <option value="Ukraine war">Ukraine war</option>
              <option value="US Elections">US Elections</option>
            </select>

            <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Enter secret token here" className="mb-4 p-2 border rounded w-full" />

            <div className="flex space-x-4">
              <button onClick={handleOkClick} className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">
                {simulationRunning ? "Stop Scheduler" : "Start Scheduler"}
              </button>
              <button onClick={handleCancelClick} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="box col-span-full sm:col-span-1 xl:col-span-1">
          <div className="p-4 bg-white rounded-lg shadow-md text-center">
            <h2 className="text-lg font-semibold mb-2">Scheduler Timer</h2>
            <p className="text-2xl font-bold">{timer} s</p>
            <p className="text-xs text-gray-500 mt-1">{simulationRunning ? "Running" : "Stopped"}</p>
          </div>
        </div>

        {/* Live Stats */}
        <div className="box col-span-full sm:col-span-2 xl:col-span-3 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Live Statistics</h2>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div className="mb-2 text-sm text-gray-600">Users: <strong>{Object.keys(stats?.users || {}).length}</strong></div>
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                <table className="w-full text-sm border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border p-2">User</th>
                      <th className="border p-2">Posts</th>
                      <th className="border p-2">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats ? (
                      Object.entries(stats.users).map(([username, userStats]) => (
                        <tr key={username}>
                          <td className="border p-2">{username}</td>
                          <td className="border p-2">{userStats.posts}</td>
                          <td className="border p-2">{userStats.comments}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td className="border p-2" colSpan={3}>No stats yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* GRAPH (below stats) */}
          <div style={{ marginTop: 16 }}>
            <h3 className="text-sm font-medium mb-2">Network Graph</h3>
            <div ref={fgContainerRef} style={{ width: "100%", height: 400, border: "1px solid #e5e7eb", borderRadius: 8 }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulerControl;
