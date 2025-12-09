import { Request, Response } from "express";
import { MultiGraph } from "graphology"; // Import MultiGraph
import { User } from "../models/user/user.model"; // Import your User model
import randomLayout from "graphology-layout/random";

//import { createCanvas } from "canvas";
import fs from "fs";
//import { Sigma } from "sigma";
import  Graph from "graphology";
//import { renderToStaticMarkup } from "react-dom/server";
import { exec } from "child_process";


// Define request body type for type safety
interface NetworkRequestBody {
  userIds: string[]; // Array of user IDs
  model: string;
  numOfUsers: number;
  m: number;
}

export class NetworkController {
  // Generate Graph Handler
 
     
  
  static async createNetwork(req: Request, res: Response) {
    try {
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

      // Create a mapping of graph nodes to userIds
      const nodeIdToUserId: { [key: string]: string } = {};
      graph.nodes().forEach((node, index) => {
        nodeIdToUserId[node] = userIds[index]; // Map node to userId
      });

      // Process edges
      const edges = graph.edges().map((edgeKey) => {
        const sourceNode = graph.source(edgeKey); // Get source node of the edge
        const targetNode = graph.target(edgeKey); // Get target node of the edge

        const sourceId = nodeIdToUserId[sourceNode];
        const targetId = nodeIdToUserId[targetNode];

        if (!sourceId || !targetId) {
          console.log(`Skipping invalid edge: ${sourceNode} -> ${targetNode}`);
          return null; // Skip invalid edges
        }

        return { source: sourceId, target: targetId };
      }).filter(Boolean); // Remove any null values resulting from invalid edges

      


      // Prepare database updates for followers and followings
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
 
      
      // Save to file
    fs.writeFileSync("network.dot", exportToDOT(graph));
    
    // Convert DOT to PNG using Graphviz
    exec("dot -Tpng network.dot -o network.png", (error) => {
      if (error) console.error("Error generating PNG:", error);
      else console.log("✅ Graph saved as network.png");
    });


      return res.status(200).json({
        message: "Graph and database updated successfully",
        nodes,
        edges,
      });
    } catch (error: unknown) {
      console.error("Error generating graph:", error);
      if (error instanceof Error) {
        return res.status(500).json({ message: "Error generating graph", error: error.message });
      } else {
        return res.status(500).json({ message: "Error generating graph", error: "An unknown error occurred" });
      }
    }
  }
}

function exportToDOT(graph: MultiGraph): string {
  let dot = "graph G {\n";
  graph.forEachEdge((edge, _, source, target) => {
    dot += `  "${source}" -- "${target}";\n`;
  });
  dot += "}";
  return dot;
}


function generateNetwork(userIds: string[], model: string, numOfUsers: number, m: number): MultiGraph {
  const graph = new MultiGraph(); // Use MultiGraph instead of Graph

  // Add nodes to the graph
  userIds.forEach((userId, i) => {
    graph.addNode(i.toString(), { _id: `${userId}` });
  });


  // Generate edges based on the model type
  switch (model) {
    case "Barabasi":
      for (let i = 1; i < numOfUsers; i++) {
        const existingNodes = new Set(); // To prevent duplicate edges
        let attempts = 0;  // Add a maximum number of attempts to avoid infinite loops

        for (let j = 0; j < m; j++) {
          let target = Math.floor(Math.random() * i);

          while (target === i || existingNodes.has(target)) {
            target = Math.floor(Math.random() * i);
            attempts++;
            if (attempts > 100) {
              console.log("Too many attempts, breaking out of loop.");
              break;
            }
          }

          if (attempts > 100) break;
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
      const sizes = [Math.floor(numOfUsers / 2), Math.ceil(numOfUsers / 2)];
      const probMatrix = [
        [0.1 * m, 0.02 * m],
        [0.02 * m, 0.1 * m]
      ];

      for (let i = 0; i < sizes[0]; i++) {
        for (let j = sizes[0]; j < numOfUsers; j++) {
          const probability = probMatrix[0][1];
          if (Math.random() < probability) {
            graph.addEdge(i.toString(), j.toString());
          }
        }
      }

      for (let i = sizes[0]; i < numOfUsers; i++) {
        for (let j = 0; j < sizes[0]; j++) {
          const probability = probMatrix[1][0];
          if (Math.random() < probability) {
            graph.addEdge(i.toString(), j.toString());
          }
        }
      }
      break;

    default:
      throw new Error("Invalid model type");
  }

  randomLayout.assign(graph); // Apply a random layout
  return graph;
}
