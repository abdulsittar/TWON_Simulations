import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import ForceGraph2D from "react-force-graph-2d";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type UserStats = { posts: number; comments: number };
type User = { id: string; followers: string[]; following: string[]; posts: number; comments: number };

const SchedulerControl: React.FC = () => {
  const USE_DUMMY = true; // toggle dummy/backend
  const SERVER_URL = "http://194.249.231.76:1071";

  const [simulationRunning, setSimulationRunning] = useState(false);
  const [timer, setTimer] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState("10");
  const [network, setNetwork] = useState("Barabasi");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedRanker, setSelectedRanker] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [textInput, setTextInput] = useState("");

  const fgRef = useRef<any>(null);

  // Initialize users
  const createDummyUsers = (count: number) => {
    const arr: User[] = [];
    for (let i = 1; i <= count; i++) {
      arr.push({ id: `user${i}`, followers: [], following: [], posts: 0, comments: 0 });
    }
    return arr;
  };

  useEffect(() => {
    const count = parseInt(selectedUsers || "10", 10);
    setUsers(createDummyUsers(count));
    setTimer(0);
  }, [selectedUsers, network]);

  // Dummy simulation
  useEffect(() => {
    if (!USE_DUMMY || !simulationRunning) return;
    const interval = setInterval(() => {
      setTimer((t) => t + 1);
      setUsers((prev) => {
        const updated = [...prev];
        updated.forEach((u) => {
          if (Math.random() < 0.2) u.posts += 1;
          if (Math.random() < 0.3) u.comments += 1;
        });

        // Add random follow links
        if (updated.length > 1 && Math.random() < 0.4) {
          const aIdx = Math.floor(Math.random() * updated.length);
          let bIdx = Math.floor(Math.random() * updated.length);
          while (bIdx === aIdx) bIdx = Math.floor(Math.random() * updated.length);
          const a = updated[aIdx];
          const b = updated[bIdx];
          if (!a.following.includes(b.id)) {
            a.following.push(b.id);
            b.followers.push(a.id);
          }
        }
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [simulationRunning, USE_DUMMY]);

  // Backend polling
  useEffect(() => {
    if (USE_DUMMY) return;
    const statusInterval = setInterval(async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/status`);
        setSimulationRunning(res.data.running);
      } catch {}
    }, 3000);
    return () => clearInterval(statusInterval);
  }, [USE_DUMMY]);

  useEffect(() => {
    if (USE_DUMMY) return;
    const statsInterval = setInterval(async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/stats`);
        if (res.data.users) {
          const backendUsers: User[] = Object.entries(res.data.users).map(([id, s]: any) => ({
            id,
            posts: s.posts,
            comments: s.comments,
            followers: [],
            following: [],
          }));
          setUsers(backendUsers);
        }
        if (res.data.start_time) setTimer(Math.floor(Date.now() / 1000 - res.data.start_time));
      } catch {}
    }, 2000);
    return () => clearInterval(statsInterval);
  }, [USE_DUMMY]);

  // Graph data for ForceGraph
  const graphData = {
    nodes: users.map((u) => ({
      id: u.id,
      val: Math.max(4, 4 + u.followers.length), // size by followers
      color: `hsl(${Math.min(u.following.length * 20, 360)},70%,50%)`, // color by following
    })),
    links: users.flatMap((u) => u.following.map((f) => ({ source: u.id, target: f }))),
  };

  const handleStartStop = async () => {
    if (USE_DUMMY) {
      if (simulationRunning) {
        setSimulationRunning(false);
        toast.info("Dummy scheduler stopped.");
      } else {
        setUsers(createDummyUsers(parseInt(selectedUsers, 10)));
        setTimer(0);
        setSimulationRunning(true);
        toast.success("Dummy scheduler started!");
      }
      return;
    }

    try {
      if (simulationRunning) {
        await axios.post(`${SERVER_URL}/stop`);
        setSimulationRunning(false);
        toast.info("Scheduler stopped.");
      } else {
        await axios.post(`${SERVER_URL}/start`, {
          num_users: parseInt(selectedUsers, 10),
          network,
          platform: selectedPlatform,
          ranker: selectedRanker,
          topic: selectedTopic,
          token: textInput,
          num_events: 100,
          llm: "api",
        });
        setSimulationRunning(true);
        toast.success("Scheduler started.");
      }
    } catch {
      toast.error("Backend unreachable.");
    }
  };

  const handleReset = () => {
    setSimulationRunning(false);
    setTimer(0);
    setUsers(createDummyUsers(parseInt(selectedUsers, 10)));
  };

  return (
    <div className="p-4">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="mb-4 flex flex-wrap gap-2">
        <select value={selectedUsers} onChange={(e) => setSelectedUsers(e.target.value)} className="p-2 border rounded">
          <option value="10">10 Users</option>
          <option value="50">50 Users</option>
          <option value="100">100 Users</option>
        </select>

        <select value={network} onChange={(e) => setNetwork(e.target.value)} className="p-2 border rounded">
          <option value="Barabasi">Barabasi</option>
          <option value="ErdosRenyi">Erdos-Renyi</option>
          <option value="SBM">Stochastic Block</option>
        </select>

        <button onClick={handleStartStop} className="px-4 py-2 bg-blue-500 text-white rounded">
          {simulationRunning ? "Stop" : "Start"}
        </button>
        <button onClick={handleReset} className="px-4 py-2 bg-red-500 text-white rounded">
          Reset
        </button>
      </div>

      <div className="mb-4">Timer: {timer}s</div>

      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1, maxHeight: 300, overflowY: "auto" }}>
          <table className="border-collapse border border-gray-300 w-full text-sm">
            <thead>
              <tr>
                <th className="border p-2">User</th>
                <th className="border p-2">Posts</th>
                <th className="border p-2">Comments</th>
                <th className="border p-2">Followers</th>
                <th className="border p-2">Following</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ flex: 1 }}>
          <ForceGraph2D
            ref={fgRef}
            width={600}
            height={400}
            graphData={graphData}
            nodeAutoColorBy="color"
            nodeVal={(node: any) => node.val}
            nodeLabel={(node: any) => {
              const u = users.find((usr) => usr.id === node.id);
              return `${node.id}\nFollowers: ${u?.followers.length}\nFollowing: ${u?.following.length}`;
            }}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={1}
          />
        </div>
      </div>
    </div>
  );
};

export default SchedulerControl;
