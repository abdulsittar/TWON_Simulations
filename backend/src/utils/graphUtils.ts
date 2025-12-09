import randomLayout from "graphology-layout/random";
import Graph from "graphology";

export const generateRandomGraph = (model: string, numOfNodes: number, m: number): Graph => {
    const graph = new Graph();
  
    // Add nodes to the graph
    for (let i = 0; i < numOfNodes; i++) {
      graph.addNode(i.toString(), {
        label: `Node ${i + 1}`,
        data: Math.random() * 100, // Example random data
      });
    }
  
    // Handle the graph generation based on the model type
    if (model === 'Barabasi') {
      // Implement Barabási-Albert model or modify as needed
      for (let i = 1; i < numOfNodes; i++) {
        for (let j = 0; j < m; j++) {
          const target = Math.floor(Math.random() * i);
          graph.addEdge(i.toString(), target.toString());
        }
      }
    } else if (model === 'ErdosRenyi') {
      // Implement Erdős-Rényi model or modify as needed
      for (let i = 1; i < numOfNodes; i++) {
        for (let j = 0; j < m; j++) {
          const target = Math.floor(Math.random() * numOfNodes);
          graph.addEdge(i.toString(), target.toString());
        }
      }
    } else {
      throw new Error("Unknown model type");
    }
  
    // Apply random layout for graph visualization
    randomLayout.assign(graph);
  
    return graph;
  };
  