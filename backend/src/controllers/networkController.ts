import { Request, Response } from "express";
import Graph from "graphology";
import randomLayout from "graphology-layout/random";
import { MultiGraph } from "graphology"; // Import MultiGraph

// Define request body type for type safety
interface NetworkRequestBody {
  userIds: [''],
  model: string;
  numOfUsers: number;
  m: number;
}

export class NetworkController {

  // Generate Graph Handler
  static async createNetwork(req: Request, res: Response) {
    try {
    
    console.log(req.body);
    const { userIds, model, numOfUsers, m }: NetworkRequestBody = req.body;

      // Validate input
      if (!userIds || !model || !numOfUsers || m === undefined) {
        console.log("Missing required parameters.");
        return res.status(400).json({ message: "Missing required parameters." });
      }

      if (numOfUsers <= 0 || m < 0) {
        console.log("Invalid parameters: numOfUsers should be > 0 and m should be >= 0.");
        return res.status(400).json({ message: "Invalid parameters: numOfUsers should be > 0 and m should be >= 0." });
      }

      // Generate graph using the selected model
      const graph = generateNetwork(model, numOfUsers, m);

      // Convert graph to a JSON-friendly format to send as a response
      const nodes = graph.nodes().map(node => ({
        id: node,
        ...graph.getNodeAttributes(node),
      }));

      const edges = graph.edges().map(edge => ({
        source: edge[0],
        target: edge[1],
      }));

      console.log("Graph generated successfully.");
      return res.status(200).json({ message: "Graph generated successfully", nodes, edges });

    } catch (error: unknown) {
      console.error("Error generating graph:", error);

      // Better error handling for unknown error types
      if (error instanceof Error) {
        return res.status(500).json({ message: "Error generating graph", error: error.message });
      } else {
        return res.status(500).json({ message: "Error generating graph", error: "An unknown error occurred" });
      }
    }
  }
}

// Function to generate the network graph based on the model
function generateNetwork(model: string, numOfUsers: number, m: number): MultiGraph {
  const graph = new MultiGraph(); // Use MultiGraph instead of Graph

  // Add nodes to the graph
  for (let i = 0; i < numOfUsers; i++) {
    graph.addNode(i.toString(), {
      label: `User ${i + 1}`,
      motivation: Math.random() * 100,
      engagement: Math.random() * 100,
      success: Math.random() * 100,
    });
  }

  // Generate edges based on the model type
  switch (model) {
    case "Barabasi":
      for (let i = 1; i < numOfUsers; i++) {
        for (let j = 0; j < m; j++) {
          const target = Math.floor(Math.random() * i);
          if (target !== i) {
            graph.addEdge(i.toString(), target.toString()); // Avoid self-loops
          }
        }
      }
      break;

    case "ErdosRenyi":
      for (let i = 0; i < numOfUsers; i++) {
        for (let j = 0; j < numOfUsers; j++) {
          if (i !== j && Math.random() < m / numOfUsers) {
            graph.addEdge(i.toString(), j.toString());
          }
        }
      }
      break;

    case "StochasticBlockModel":
      const sizes = [Math.floor(numOfUsers / 2), Math.ceil(numOfUsers / 2)];
      for (let i = 0; i < sizes[0]; i++) {
        for (let j = sizes[0]; j < numOfUsers; j++) {
          if (Math.random() < m / 10) {
            graph.addEdge(i.toString(), j.toString());
          }
        }
      }
      break;

    default:
      throw new Error("Invalid model type");
  }

  // Apply a random layout for visualization
  randomLayout.assign(graph);

  return graph;
}
