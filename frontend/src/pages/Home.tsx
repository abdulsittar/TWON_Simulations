import { useEffect, useState  } from "react";
import { connectToDatabase , fetchAnalyticsData, fetchSentimentScores,fetchSentimentScoresComments, fetchLatestUserActions, fetchAnalyticsMotivation, fetchAnalyticsTimeBudget, 
fetchLatestUserInteraction, fetchLatestUserRanking } from "../services/api";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
//import React from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
//import { TailSpin } from 'react-loader-spinner';

import { useQuery } from '@tanstack/react-query';
import { getAllDatabases } from '../api/ApiCollection'; 
import { IMotivations } from "../types/IAMotivations";
import { IAnalytics } from "../types/IAnalytics";
import { IInteractions } from "../types/IInteractions";
import { IRanking } from "../types/IRanking";
import { ITimeBudget } from "../types/ITimeBudget";
import { ISentimentScores } from "../types/ISentimentScores";


type BarChartData = {
  time: string;
  activeUsers: number;
};

type Action = "like" | "comment" | "post" | "dislike";

interface UserAction {
  time: string;      // Full timestamp
  user: string;
  action: Action;
}


// Color mappings
const actionColors: Record<Action, string> = {
  like: "rgba(33, 150, 243, 0.7)",     // Blue
  comment: "rgba(76, 175, 80, 0.7)",   // Green
  post: "rgba(255, 87, 34, 0.7)",      // Orange
  dislike: "rgba(244, 67, 54, 0.7)",   // Red
};

interface SentimentChartData {
  username: string;
  hate: number;
  not_hate: number;
  non_offensive: number;
  irony: number;
  neutral: number;
  positive: number;
  negative: number;
}

type UserActivityEntry = {
  time: number;   // ✅ Fix: was string
  user: string;
  status: number;
};

const Home = () => {
   const [userInteraction, setUserInteraction ] = useState<Record<string, { time: string; spendTime: number }[]>>({});
  const [userRanking, setUserRanking]          = useState<Record<string, { time: string; spendTime: number }[]>>({});
  
  //const [userActions, setUserActions] = useState<any[]>([]);  
  const [userMotivation , setUserMotivation] = useState<any[]>([]);
  const [userTimeBudget , setUserTimeBudget ] = useState<any[]>([]); 
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const [sentimentChartData, setSentimentChartData] = useState<SentimentChartData[]>([]);
  const [sentimentChartDataCom, setSentimentChartDataCom] = useState<SentimentChartData[]>([]);
  
  const [barChartData, setBarChartData] = useState<BarChartData[]>([]);
  
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  
    // Transform data for heatmap representation
    //const uniqueUsers = Array.from(new Set(userActions.map(a => a.user)));
    //const uniqueTimes = Array.from(new Set(userActions.map(a => a.time)));
  
    const { data: databases, isLoading } = useQuery({
      queryKey: ['databases'],
      queryFn: getAllDatabases,
    });
  
    //const [data, setData] = useState<any[][]>([]);
    // Generate heatmap data
    /*const heatmapData = uniqueUsers.map(user => ({
      id: user,
      user,
      ...Object.fromEntries(
        uniqueTimes.map(time => [time, userActions.filter(a => a.user === user && a.time === time).length])
      ),
    }));*/
    
    //const heatmapData2 = uniqueUsers.map(() => new Array(uniqueTimes.length).fill(0));
    
    //userActions.forEach(({ user, time, action }) => {
    //  const userIndex = uniqueUsers.indexOf(user);
    //  const timeIndex = uniqueTimes.indexOf(time);
    //  heatmapData2[userIndex][timeIndex] = actionValues[action as Action];
    //});

   // setData(heatmapData2);
  
    // Create columns for the heatmap
    /*const columns = [
      { field: "user", headerName: "User", width: 150 },
      ...uniqueTimes.map((time) => ({
        field: time,
        headerName: time,
        width: 100,
        renderCell: (params: GridRenderCellParams<any>) => {
          const actionIndex = params.value - 1; // Subtract 1 to get the correct action index (since actionValues are 1-indexed)
          const actionKeys = Object.keys(actionValues) as Array<keyof typeof actionValues>;
      const action = actionKeys[actionIndex];
      const backgroundColor = action ? actionColors[action as Action] : "rgba(0, 0, 0, 0.1)"; // Default to a light color if no action
    
          return (
            <div
              style={{
                backgroundColor: backgroundColor,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: action ? "#fff" : "#000",  // Change text color for better contrast
                fontWeight: "bold",
              }}
            >
              {params.value || ""}
            </div>
          );
        },
      })),
    ];*/

  //const users = Array.from(new Set(userActions.map(action => action.user)));

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch all necessary data
      const userActivityData = await fetchAnalyticsData();
      const userRankingData = await fetchLatestUserRanking( );
      const userInteractionData = await fetchLatestUserInteraction( );
      const userActionsData = await fetchLatestUserActions( );
      const motivationData = await fetchAnalyticsMotivation( );
      const timeBudgetData = await fetchAnalyticsTimeBudget( );
      const postsSentiment = await fetchSentimentScores();
      const commentsSentiment = await fetchSentimentScoresComments(); 
  
      // Call the function to process and set data
      processAndSetData(
        userActivityData,
        userRankingData,
        userInteractionData,
        userActionsData,
        motivationData,
        timeBudgetData,
        postsSentiment,
        commentsSentiment
      );
      setLoading(false);
    } catch (error) {
      console.error("Error in loadData:", error);
      setLoading(false);
    }
  };



const handleDatabaseChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {

  const databaseName = event.target.value || ""; // If no database is selected, send an empty string
  setSelectedDatabase(databaseName);
  setLoading(true);
  try {
    await connectToDatabase(selectedDatabase);
    // Optionally, fetch analytics data after the connection
    console.log(`Connected to database: ${selectedDatabase}`); 
 
  try {
    // Make API calls to fetch data, passing the database name (empty string if not selected)
    const userActivityData = await fetchAnalyticsData();
    const userRankingData = await fetchLatestUserRanking();
    const userInteractionData = await fetchLatestUserInteraction();
    const userActionsData = await fetchLatestUserActions();
    const motivationData = await fetchAnalyticsMotivation();
    const timeBudgetData = await fetchAnalyticsTimeBudget();
    const postsSentimentData = await fetchSentimentScores();
    const commentsSentimentData = await fetchSentimentScoresComments();

    // Process and set the data as needed
    processAndSetData(userActivityData, userRankingData, userInteractionData, userActionsData, motivationData, timeBudgetData, postsSentimentData, commentsSentimentData);
    setLoading(false);
  } catch (error) {
  
    console.error("Error fetching data:", error);
    setLoading(false);
  }
} catch (error) {

  setLoading(false);
  console.error('Failed to connect to the database:', error);
}
  
};


const processAndSetData = ( 
    userActivityData: IAnalytics | null | undefined, 
    userRankingData: IRanking| null | undefined, 
    userInteractionData: IInteractions | null  | undefined, 
    userActionsData: IAnalytics | null, 
    motivationData: IMotivations | null, 
    timeBudgetData: ITimeBudget | null,
    postsSentimentData: ISentimentScores | null,
    commentsSentimentData: ISentimentScores | null,
    ) => {
    // Process user activity data
    if (userActivityData?.userActivity) {
      const groupedData: Record<string, { time: string; status: number }[]> = {};

      userActivityData.userActivity.forEach(({ time, status }: UserActivityEntry) => {
        const timeKey = new Date(time).toISOString(); // or use .toLocaleString(...) as above
      
        if (!groupedData[timeKey]) {
          groupedData[timeKey] = [];
        }
      
        groupedData[timeKey].push({ time: timeKey, status });
      });

    const barData: BarChartData[] = Object.entries(groupedData).map(
      ([time, entries]) => {
        const activeCount = entries.filter(e => e.status === 1).length; // Example: count active users
        return { time, activeUsers: activeCount };
      }
    );

    setBarChartData(barData); // Set the processed data for the chart
  } else {
    console.error("Invalid userActivityData:", userActivityData);
  }

  if (userRankingData?.rankings) {
    const groupedData: Record<string, { time: string; spendTime: number }[]> = {};

    userRankingData.rankings.forEach(({ time, user, spendTime }) => {
      const timeKey = new Date(time).toLocaleTimeString(); // Format timestamp
     // const spendTimeKey = new Date(spendTime).toLocaleTimeString();

      if (!groupedData[user]) {
        groupedData[user] = [];
      }

     // const updatedStatus = status === 5 ? 1 : status;

      groupedData[user].push({ time: timeKey, spendTime: spendTime });
    });

    setUserRanking(groupedData); // Set user ranking data
  } else {
    console.error("Invalid userRankingData:", userRankingData);
  }

    if (userInteractionData?.interactions) {
      const groupedData: Record<string, { time: string; spendTime: number }[]> = {};
  
      userInteractionData.interactions.forEach(({ time, user, spendTime }) => {
        const timeKey = new Date(time).toLocaleTimeString(); // Format timestamp
        //const spendTimeKey = new Date(spendTime).toLocaleTimeString();
        
        if (!groupedData[user]) {
          groupedData[user] = []; // Initialize array if not exists
        }
  
        // Replace status 5 with 1
       // const updatedStatus = spendTime === 5 ? 1 : spendTime;
  
        groupedData[user].push({ time: timeKey, spendTime: spendTime }); // Store formatted time with updated status
      });

    setUserInteraction(groupedData); // Set user interaction data
  } else {
    console.error("Invalid userInteractionData:", userInteractionData);
  }


  // Process user actions data
  if (userActionsData?.userActions) {
    const actions: UserAction[] = userActionsData.userActions.map((item) => ({
      time: new Date(item.time).toISOString(), // convert number to ISO string
      user: item.user,
      action: item.action as Action
    }));

    // Get unique users and times
    const uniqueUsers = Array.from(new Set(actions.map((a) => a.user)));
    const uniqueTimes = Array.from(new Set(actions.map((a) => a.time)));

    // Build heatmap data
    const heatmapData = uniqueUsers.map((user) => {
      const row: any = { id: user, user };
      uniqueTimes.forEach((time) => {
        const match = actions.find((a) => a.user === user && a.time === time);
        row[time] = match ? match.action : null;
      });
      return row;
    });

    const heatmapColumns: GridColDef[] = [
      { field: "user", headerName: "User", width: 150 },
      ...uniqueTimes.map((time) => ({
        field: time,
        headerName: time,
        width: 200,
        renderCell: (params: GridRenderCellParams<any>) => {
          const action = params.value as Action;
          const backgroundColor = action ? actionColors[action] : "rgba(0,0,0,0.05)";
          return (
            <div
              style={{
                backgroundColor,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: action ? "#fff" : "#000",
                fontWeight: "bold",
              }}
            >
              {action ? action.toUpperCase() : ""}
            </div>
          );
        },
      })),
    ];

    setRows(heatmapData);
    setColumns(heatmapColumns); // Set heatmap data
  } else {
    console.error("Invalid userActionsData:", userActionsData);
  }
  
  
  if (motivationData?.timebudget) {
    const groupedActions: Record<string, any> = {};

    motivationData.timebudget.forEach(({ time, user, motivation }) => {
      const timeKey = new Date(time).toLocaleTimeString(); // Format timestamp
      console.log(`Processing: Time: ${timeKey}, User: ${user}, Motivation: ${motivation}`);

      // ✅ Ensure all users exist in each time entry
      if (!groupedActions[timeKey]) {
        groupedActions[timeKey] = { 
          time: timeKey, 
          user1: null, 
          user2: null, 
          user3: null, 
          user4: null, 
          user5: null 
        };
      }

      // ✅ Assign motivation score dynamically to the correct user
      groupedActions[timeKey][user] = motivation;
      console.log("Grouped Actions After Update:", groupedActions);
    });
    const formattedData = Object.values(groupedActions);
    setUserMotivation(formattedData); // Set motivation data
  } else {
    console.error("Invalid motivationData:", motivationData);
  }
  

  if (timeBudgetData?.timebudget) {
    const groupedActions: Record<string, any> = {};

    timeBudgetData.timebudget.forEach(({ time, user, total }) => {
      const timeKey = new Date(time).toLocaleTimeString();

      console.log(`Processing: Time: ${timeKey}, User: ${user}, Motivation: ${total}`);
  
        // ✅ Ensure all users exist in each time entry
        if (!groupedActions[timeKey]) {
          groupedActions[timeKey] = { 
            time: timeKey, 
            user1: null, 
            user2: null, 
            user3: null, 
            user4: null, 
            user5: null 
          };
        }

        groupedActions[timeKey][user] = total;
        console.log("Grouped Actions After Update:", groupedActions);
    });

    setUserTimeBudget(Object.values(groupedActions)); // Set time budget data
  } else {
    console.error("Invalid timeBudgetData:", timeBudgetData);
  }


  if (postsSentimentData) {
    const chartData: SentimentChartData[] = Object.entries(postsSentimentData).map(
      ([username, scores]) => ({
        username,
        hate: scores.hate,
        not_hate: scores.not_hate,
        non_offensive: scores.non_offensive,
        irony: scores.irony,
        neutral: scores.neutral,
        positive: scores.positive,
        negative: scores.negative,
      })
    );
  
    setSentimentChartData(chartData);
  } else {
    console.error("Invalid sentiment data:", postsSentimentData);
  }
  
  
  if (commentsSentimentData) {
    const chartData: SentimentChartData[] = Object.entries(commentsSentimentData).map(
      ([username, scores]) => ({
        username,
        hate: scores.hate,
        not_hate: scores.not_hate,
        non_offensive: scores.non_offensive,
        irony: scores.irony,
        neutral: scores.neutral,
        positive: scores.positive,
        negative: scores.negative,
      })
    );
  
    setSentimentChartDataCom(chartData);
  } else {
    console.error("Invalid sentiment data:", postsSentimentData);
  }

};


  useEffect(() => {
    loadData();
    console.log("Updated Graph Data:", userMotivation);
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      
      {/* Select Database Section */}
      
      {loading && (
  <div className="fixed inset-0 bg-white bg-opacity-60 z-50 flex items-center justify-center">
    <div className="flex flex-col items-center">
      <svg
        className="animate-spin h-10 w-10 text-blue-500 mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        />
      </svg>
      <span className="text-blue-600 font-semibold text-lg">Loading...</span>
    </div>
  </div>
)}
      
      <div className="mb-4 bg-gray-100 p-4 border border-blue-400 rounded-lg">
        <label className="block mb-2 font-medium text-gray-700">Select Database:</label>
        {isLoading ? (
          <p className="text-gray-500">Loading databases...</p>
        ) : (
          <select
            value={selectedDatabase}
            onChange={handleDatabaseChange}
            //onChange={(e) => setSelectedDatabase(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Select a database</option>
            {databases?.map((dbName: string, idx: number) => (
              <option key={idx} value={dbName}>
                {dbName}
              </option>
            ))}
          </select>
        )}
      </div>
      
      {/* User Activity Bar Chart */}
      <div className="bg-white p-4 shadow rounded-lg mb-4">
        <h2 className="text-xl font-semibold mb-4">User Activity Bar Chart</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barChartData}>
            <XAxis dataKey="time" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="activeUsers" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
  
      {/* Agents' Motivation Analysis */}
      <div className="bg-white p-4 shadow rounded-lg mb-4">
        <h2 className="text-lg font-bold mb-4">Agents' Motivation Analysis</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={userMotivation}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="user1" stackId="a" fill="#4CAF50" name="User 1" />
            <Bar dataKey="user2" stackId="a" fill="#2196F3" name="User 2" />
            <Bar dataKey="user3" stackId="a" fill="#FFC107" name="User 3" />
            <Bar dataKey="user4" stackId="a" fill="#F44336" name="User 4" />
            <Bar dataKey="user5" stackId="a" fill="#9C27B0" name="User 5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
  
      {/* Agents' Time Budget Analysis */}
      <div className="bg-white p-4 shadow rounded-lg mb-4">
        <h2 className="text-lg font-bold mb-4">Agents' Time Budget Analysis</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={userTimeBudget}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="user1" stackId="a" fill="#4CAF50" name="User 1" />
            <Bar dataKey="user2" stackId="a" fill="#2196F3" name="User 2" />
            <Bar dataKey="user3" stackId="a" fill="#FFC107" name="User 3" />
            <Bar dataKey="user4" stackId="a" fill="#F44336" name="User 4" />
            <Bar dataKey="user5" stackId="a" fill="#9C27B0" name="User 5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
  
      {/* User Interactions Frequency */}
      <div className="bg-white p-4 shadow rounded-lg mb-4">
        <h2 className="text-lg font-bold mb-4">User Interactions Frequency</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" />
            {Object.keys(userInteraction).map(user => (
              <Line
                key={user}
                data={userInteraction[user]}
                dataKey="spendTime"
                name={user}
                stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
  
      {/* Ranking Frequency */}
      <div className="bg-white p-4 shadow rounded-lg mb-4">
        <h2 className="text-lg font-bold mb-4">Ranking Frequency</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" />
            {Object.keys(userRanking).map(user => (
              <Line
                key={user}
                data={userRanking[user]}
                dataKey="spendTime"
                name={user}
                stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
  
      {/* User Actions Heatmap */}
      <div className="bg-white p-4 shadow rounded-lg mb-4">
        <h2 className="text-lg font-bold mb-4">User Actions Heatmap</h2>
        <div style={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[5, 10, 25]}
            initialState={{ 
              pagination: { 
                paginationModel: { 
                  pageSize: 100, 
                  page: 0 
                }
              }
            }}
          />
        </div>
      </div>
  
  {/* Sentiment Analysis per User */}
<div className="bg-white p-4 shadow rounded-lg mb-4">
  <h2 className="text-lg font-bold mb-4">Sentiments of posts by top users</h2>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={sentimentChartData}>
      <XAxis dataKey="username" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="positive" fill="#4CAF50" name="Positive" />
      <Bar dataKey="neutral" fill="#2196F3" name="Neutral" />
      <Bar dataKey="negative" fill="#F44336" name="Negative" />
      <Bar dataKey="hate" fill="#9C27B0" name="Hate" />
      <Bar dataKey="not_hate" fill="#FFC107" name="Not Hate" />
      <Bar dataKey="non_offensive" fill="#00BCD4" name="Non-Offensive" />
      <Bar dataKey="irony" fill="#FF5722" name="Irony" />
    </BarChart>
  </ResponsiveContainer>
</div>

{/* Sentiment Analysis per User */}
<div className="bg-white p-4 shadow rounded-lg mb-4">
  <h2 className="text-lg font-bold mb-4">Sentiments of comments by top users</h2>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={sentimentChartDataCom}>
      <XAxis dataKey="username" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="positive" fill="#4CAF50" name="Positive" />
      <Bar dataKey="neutral" fill="#2196F3" name="Neutral" />
      <Bar dataKey="negative" fill="#F44336" name="Negative" />
      <Bar dataKey="hate" fill="#9C27B0" name="Hate" />
      <Bar dataKey="not_hate" fill="#FFC107" name="Not Hate" />
      <Bar dataKey="non_offensive" fill="#00BCD4" name="Non-Offensive" />
      <Bar dataKey="irony" fill="#FF5722" name="Irony" />
    </BarChart>
  </ResponsiveContainer>
</div>

    </div>
  );
};

export default Home;
