import { useEffect, useState } from "react";
import { fetchAnalyticsData, fetchLatestUserActions, fetchAnalyticsMotivation, fetchAnalyticsTimeBudget, 
fetchLatestUserInteraction, fetchLatestUserRanking } from "../services/api";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
//import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { GridRenderCellParams } from "@mui/x-data-grid";
//

const Home = () => {
  const [userActivity, setUserActivity] = useState<Record<string, { time: string; status: number }[]>>({});
  const [userInteraction, setUserInteraction ] = useState<Record<string, { time: string; spendTime: number }[]>>({});
  const [userRanking, setUserRanking]          = useState<Record<string, { time: string; spendTime: number }[]>>({});
  
  const [userActions, setUserActions] = useState<any[]>([]);  
  const [userMotivation , setUserMotivation] = useState<any[]>([]);
  const [userTimeBudget , setUserTimeBudget ] = useState<any[]>([]);
  
    // Transform data for heatmap representation
    const uniqueUsers = Array.from(new Set(userActions.map(a => a.user)));
    const uniqueTimes = Array.from(new Set(userActions.map(a => a.time)));
  
  
    //const [data, setData] = useState<any[][]>([]);
    // Generate heatmap data
    const heatmapData = uniqueUsers.map(user => ({
      id: user,
      user,
      ...Object.fromEntries(
        uniqueTimes.map(time => [time, userActions.filter(a => a.user === user && a.time === time).length])
      ),
    }));
    
    const actionColors: Record<Action, string> = {
      like: "rgba(33, 150, 243, 0.7)",     // Blue for 'like'
      comment: "rgba(76, 175, 80, 0.7)",   // Green for 'comment'
      post: "rgba(255, 87, 34, 0.7)",      // Orange for 'post'
      dislike: "rgba(244, 67, 54, 0.7)",   // Red for 'dislike'
    };
    
    type Action = 'like' | 'comment' | 'post' | 'dislike';
    const actionValues: Record<Action, number> = {
      like: 1,
      comment: 2,
      post: 3,
      dislike: 4,
    };
    
    //const heatmapData2 = uniqueUsers.map(() => new Array(uniqueTimes.length).fill(0));
    
    //userActions.forEach(({ user, time, action }) => {
    //  const userIndex = uniqueUsers.indexOf(user);
    //  const timeIndex = uniqueTimes.indexOf(time);
    //  heatmapData2[userIndex][timeIndex] = actionValues[action as Action];
    //});

   // setData(heatmapData2);
  
    // Create columns for the heatmap
    const columns = [
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
    ];


  //const users = Array.from(new Set(userActions.map(action => action.user)));

  const loadData = async () => {
    try {
      const data = await fetchAnalyticsData();
    
      if (data?.userActivity) {
        const groupedData: Record<string, { time: string; status: number }[]> = {};
    
        data.userActivity.forEach(({ time, user, status }) => {
          const timeKey = new Date(time).toLocaleTimeString(); // Format timestamp
    
          if (!groupedData[user]) {
            groupedData[user] = [];
          }
    
          groupedData[user].push({ time: timeKey, status });
        });
  
    
        console.log("Final Grouped User Activity Data:", groupedData);
        setUserActivity(groupedData);
      } else {
        console.error("Invalid userActivity structure:", data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    }
    
    
    try {
      const data = await fetchLatestUserRanking();
      console.error("fetchLatestUserRanking:", data?.rankings);
    
      if (data?.rankings) {
        const groupedData: Record<string, { time: string; spendTime: number }[]> = {};
    
        data.rankings.forEach(({ time, user, spendTime }) => {
          const timeKey = new Date(time).toLocaleTimeString(); // Format timestamp
         // const spendTimeKey = new Date(spendTime).toLocaleTimeString();
    
          if (!groupedData[user]) {
            groupedData[user] = [];
          }
    
         // const updatedStatus = status === 5 ? 1 : status;
    
          groupedData[user].push({ time: timeKey, spendTime: spendTime });
        });
    
        console.log("Final Grouped User Ranking Data:", groupedData);
        setUserRanking(groupedData);
      } else {
        console.error("Invalid rankings structure:", data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    }
    
    
    try {
      const data = await fetchLatestUserInteraction();
      console.error("fetchLatestUserInteraction:", data?.interactions);
    
      if (data?.interactions) {
        const groupedData: Record<string, { time: string; spendTime: number }[]> = {};
    
        data.interactions.forEach(({ time, user, spendTime }) => {
          const timeKey = new Date(time).toLocaleTimeString(); // Format timestamp
          //const spendTimeKey = new Date(spendTime).toLocaleTimeString();
          
          if (!groupedData[user]) {
            groupedData[user] = []; // Initialize array if not exists
          }
    
          // Replace status 5 with 1
         // const updatedStatus = spendTime === 5 ? 1 : spendTime;
    
          groupedData[user].push({ time: timeKey, spendTime: spendTime }); // Store formatted time with updated status
        });
    
        console.log("Final Grouped Data with Updated Status:", groupedData);
        setUserInteraction(groupedData);
      } else {
        console.error("Invalid userActivity structure:", data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    }

    try {
      const user_Actions = await fetchLatestUserActions();
    
      if (user_Actions?.userActions) {
        const groupedActions: Record<string, any> = {};
    
        user_Actions.userActions.forEach(({ time, user, action }) => {
          const timeKey = new Date(time).toLocaleTimeString();
    
          // Ensure each user has a separate entry for that time
          if (!groupedActions[timeKey]) {
            groupedActions[timeKey] = {};
          }
    
          if (!groupedActions[timeKey][user]) {
            groupedActions[timeKey][user] = { time: timeKey, user, like: 0, comment: 0, post: 0, dislike: 0 };
          }
    
          // Increment action counts dynamically for the user
          groupedActions[timeKey][user][action] = (groupedActions[timeKey][user][action] || 0) + 1;
        });
    
        // Convert object structure to an array for the chart
        const formattedData = Object.values(groupedActions).flatMap(users => Object.values(users));
    
        setUserActions(formattedData); // ✅ Data now includes multiple users
        //users = Array.from(new Set(userActions.map(action => action.user)));
      } else {
        console.error("Invalid userActions structure:", user_Actions);
      }
    } catch (error) {
      console.error("Failed to fetch user actions:", error);
    }

    /*try {
      const user_Actions = await fetchLatestUserActions();

      if (user_Actions?.userActions) {
        const groupedActions: Record<string, any> = {};

        user_Actions.userActions.forEach(({ time, action }) => {
          const timeKey = new Date(time).toLocaleTimeString();

          if (!groupedActions[timeKey]) {
            groupedActions[timeKey] = { time: timeKey, like: 0, comment: 0, post: 0, dislike: 0 };
          }

          // Increment action counts dynamically
          groupedActions[timeKey][action] = (groupedActions[timeKey][action] || 0) + 1;
        });

        setUserActions(Object.values(groupedActions)); // Convert object to array for Recharts
      } else {
        console.error("Invalid userActions structure:", user_Actions);
      }
    } catch (error) {
      console.error("Failed to fetch user actions:", error);
    } */

    try {
      const user_Actions5 = await fetchAnalyticsMotivation();
      console.log("Motivation API Response:", user_Actions5);
    
      if (user_Actions5?.timebudget) {
        const groupedActions: Record<string, any> = {};
    
        user_Actions5.timebudget.forEach(({ time, user, motivation }) => {
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
        console.log("Final Formatted Motivation Data:", formattedData);
    
        setUserMotivation(formattedData); // ✅ Update State
      } else {
        console.error("Invalid userActions structure:", user_Actions5);
      }
    } catch (error) {
      console.error("Failed to fetch user actions:", error);
    }
    
    

  try {
    const user_Actions6 = await fetchAnalyticsTimeBudget();

    if (user_Actions6?.timebudget) {
      const groupedActions: Record<string, any> = {};

      user_Actions6.timebudget.forEach(({ time, user, total }) => {
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

      setUserTimeBudget(Object.values(groupedActions)); // Convert object to array for Recharts
    } else {
      console.error("Invalid userActions structure:", user_Actions6);
    }
  } catch (error) {
    console.error("Failed to fetch user actions:", error);
  }
};


  useEffect(() => {
    loadData();
    console.log("Updated Graph Data:", userMotivation);
  }, []);

  return (
    <div className="p-4">
      {/* Line Chart: User Activity */}
      
      <div className="bg-white p-4 shadow rounded-lg mb-4">
        <h2 className="text-lg font-bold">Agents' Lifecycle Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart>
            <XAxis dataKey="time"/>
            <YAxis />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" />
            {Object.keys(userActivity).map(user => (
              <Line
                key={user}
                data={userActivity[user]}
                dataKey="status"
                name={user}
                stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-white p-4 shadow rounded-lg">
  <h2 className="text-lg font-bold">Agents' Motivation Analysis</h2>
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
      
      <div className="bg-white p-4 shadow rounded-lg">
        <h2 className="text-lg font-bold">Agents' Time Budget Analysis</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={userTimeBudget}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="user1" stackId="a" fill="#4CAF50" name="user1" />
            <Bar dataKey="user2" stackId="a" fill="#2196F3" name="user2" />
            <Bar dataKey="user3" stackId="a" fill="#FFC107" name="user3" />
            <Bar dataKey="user4" stackId="a" fill="#F44336" name="user4" />
            <Bar dataKey="user5" stackId="a" fill="#9C27B0" name="User 5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      
      
      
      <div className="bg-white p-4 shadow rounded-lg mb-4">
        <h2 className="text-lg font-bold">User Interactions Frequency</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart>
            <XAxis dataKey="time"  />
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
      
      
      <div className="bg-white p-4 shadow rounded-lg mb-4">
        <h2 className="text-lg font-bold">Ranking Frequency</h2>
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


    
      
      

      {/* Stacked Bar Chart: User Actions */}
       
      <div className="bg-white p-4 shadow rounded-lg">
      <h2 className="text-lg font-bold">User Actions Heatmap</h2>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid rows={heatmapData} columns={columns} pageSizeOptions={[5]} />
      </div>
    </div>
      
    
      
    </div>
  );
};

export default Home;
