import { Db } from "mongodb";
import { generateRandomGraph } from "../utils/graphUtils";
import { IUser } from "../models/user/user.model";

import Graph from "graphology";
import { MultiGraph } from "graphology"; // Import MultiGraph
import randomLayout from "graphology-layout/random";
import  responseLogger  from '../utils/logs/logger';

// Export the generateNetwork function
export function generateNetwork(model: string, numOfUsers: number, m: number): MultiGraph {
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

  // Generate edges based on model type
  switch (model) {
    case "Barabasi":
      for (let i = 1; i < numOfUsers; i++) {
        for (let j = 0; j < m; j++) {
          const target = Math.floor(Math.random() * i);
          graph.addEdge(i.toString(), target.toString());
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

// Keep the other functions as is
export const processUsersAndGenerateGraph = async (
    db: Db,
    model: string,
    numOfUsers: number,
    m: number
) => {
    const users = await fetchUsers(db, numOfUsers);
    const graph = generateRandomGraph(model, numOfUsers, m);

    await saveUsersToDatabase(db, users, graph);
    responseLogger.debug("Successfully completed!");
};

const fetchUsers = async (db: Db, count: number): Promise<IUser[]> => {
    const users = await db.collection("selectedusers").find().limit(count).toArray();
    if (users.length < count) throw new Error("Not enough users available in the database");
    return users as IUser[];
};

const saveUsersToDatabase = async (db: Db, users: IUser[], graph: any) => {
    const userCollection = db.collection("users");
    const currentTime = new Date();

    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const vertex = graph.vs[i];

        await userCollection.insertOne({
            ...user,
            uniqueId: vertex.id,
            createdAt: currentTime,
            updatedAt: currentTime,
        });
    }
};
