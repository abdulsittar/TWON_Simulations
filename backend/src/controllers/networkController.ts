import { Request, Response } from "express";
import Graph from "graphology";
import randomLayout from "graphology-layout/random";
import { MultiGraph } from "graphology"; // Import MultiGraph
import { User } from "../models/user/user.model"; // Import your User model
import { MongoClient, ObjectId } from "mongodb";

// Define request body type for type safety
interface NetworkRequestBody {
  userIds: string[]; // Array of user IDs
  model: string;
  numOfUsers: number;
  m: number;
}

interface GraphNode {
  _id: string;  // The actual user ID
  x: number;
  y: number;
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

        // Ensure userIds length matches numOfUsers
        if (userIds.length !== numOfUsers) {
            console.log("Mismatch between userIds and numOfUsers.");
            return res.status(400).json({ message: "Mismatch between userIds and numOfUsers." });
        }

        // Generate the graph
        const graph = generateNetwork(userIds, model, numOfUsers, m);
        console.log("Successfully network generated");
        console.log(graph);

        // Create a mapping of graph nodes to userIds
        const nodeIdToUserId: { [key: string]: string } = {};
        graph.nodes().forEach((node, index) => {
            console.log(`Node ID: ${node}, Mapping to userId: ${userIds[index]}`);
            nodeIdToUserId[node] = userIds[index]; // Map node to userId
        });

        console.log("Node-to-UserId mapping:", nodeIdToUserId);

        // Process edges
        const edges = graph.edges().map((edgeKey) => {
            const sourceNode = graph.source(edgeKey); // Get source node of the edge
            const targetNode = graph.target(edgeKey); // Get target node of the edge

            console.log(`Edge: ${sourceNode} -> ${targetNode}`);

            // Map graph node ID to userIds
            const sourceId = nodeIdToUserId[sourceNode];
            const targetId = nodeIdToUserId[targetNode];

            if (!sourceId || !targetId) {
                console.log(`Skipping invalid edge: ${sourceNode} -> ${targetNode}`);
                return null; // Skip invalid edges
            }

            console.log(`Mapping edge from node ${sourceNode} to node ${targetNode} to userIds: ${sourceId} -> ${targetId}`);

            return { source: sourceId, target: targetId };
        }).filter(Boolean); // Remove any null values resulting from invalid edges

        console.log("Edges generated:", edges);

        // Prepare database updates
        const updates = graph.edges().map((edgeKey) => {
            const sourceNode = graph.source(edgeKey);
            const targetNode = graph.target(edgeKey);

            const sourceId = nodeIdToUserId[sourceNode];
            const targetId = nodeIdToUserId[targetNode];

            if (!sourceId || !targetId) {
                console.log(`Skipping invalid edge update: ${sourceId} -> ${targetId}`);
                return [];
            }

            console.log(`Updating source user: ${sourceId}, following user: ${targetId}`);
            console.log(`Updating target user: ${targetId}, followed by user: ${sourceId}`);

            return [
                User.findByIdAndUpdate(sourceId, { $addToSet: { followings: targetId } }),
                User.findByIdAndUpdate(targetId, { $addToSet: { followers: sourceId } }),
            ];
        }).flat(); // Flatten the array of promises

        if (updates.length > 0) {
            await Promise.all(updates);
            console.log("Successfully updated network in the database");
        } else {
            console.log("No valid updates to execute");
        }

        // Prepare nodes and edges for response
        const nodes = graph.nodes().map((node) => ({
            id: nodeIdToUserId[node], // Map node ID to userId
            ...graph.getNodeAttributes(node),
        }));

        return res.status(200).json({
            message: "Graph and database updated successfully",
            nodes,
            edges,
        });
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

function generateNetwork(userIds: string[], model: string, numOfUsers: number, m: number): MultiGraph {
  const graph = new MultiGraph(); // Use MultiGraph instead of Graph

  // Add nodes to the graph
  var i=0
  userIds.forEach(userId => {
    graph.addNode(i.toString(), {
      _id: `${userId}`
    });
    i = i + 1;
  });

  // Generate edges based on the model type
  switch (model) {
    case "Barabasi":
      for (let i = 1; i < numOfUsers; i++) {
        const existingNodes = new Set(); // To prevent duplicate edges
        let attempts = 0;  // Add a maximum number of attempts to avoid infinite loops

        for (let j = 0; j < m; j++) {
          let target = Math.floor(Math.random() * i);

          // Prevent self-loops and check for duplicates
          while (target === i || existingNodes.has(target)) {
            target = Math.floor(Math.random() * i);
            attempts++;  // Increment attempts

            // Avoid infinite loops by limiting attempts
            if (attempts > 100) {
              console.log("Too many attempts, breaking out of loop.");
              break;
            }
          }

          if (attempts > 100) break;  // Exit the loop if we hit the limit

          // Ensure the node IDs are valid
          graph.addEdge(i.toString(), target.toString());
          existingNodes.add(target);
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
      // Create two blocks (equivalent to the 'sizes' in the Python code)
      const sizes = [Math.floor(numOfUsers / 2), Math.ceil(numOfUsers / 2)];

      // Probability matrix for edge creation
      const probMatrix = [
        [0.1 * m, 0.02 * m],  // Probability of edge between block 0 and block 1
        [0.02 * m, 0.1 * m]   // Probability of edge between block 1 and block 0
      ];

      // Add edges between blocks based on the probability matrix
      for (let i = 0; i < sizes[0]; i++) {
        for (let j = sizes[0]; j < numOfUsers; j++) {
          const probability = probMatrix[0][1];  // Probability between block 0 and block 1
          if (Math.random() < probability) {
            graph.addEdge(i.toString(), j.toString());
          }
        }
      }

      for (let i = sizes[0]; i < numOfUsers; i++) {
        for (let j = 0; j < sizes[0]; j++) {
          const probability = probMatrix[1][0];  // Probability between block 1 and block 0
          if (Math.random() < probability) {
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
