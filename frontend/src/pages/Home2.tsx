import { useEffect } from 'react';
import { useState } from 'react';
import TopDealsBox from '../components/topDealsBox/TopDealsBox';
import ChartBox from '../components/charts/ChartBox';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { fetchTotalTime, getTotalTime, getReplenishRate, getUsedTime, getPostsPerUser, get_postsPerUserWithLowRanking } from '../api/ApiCollection';
import axios from 'axios'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Home = () => {
  /*const socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling'], // Use WebSocket transport
  });*/

  const queryClient = useQueryClient();
  //const qc_agentLifeCycle = useQueryClient();
  const [simulationRunning, setSimulationRunning] = useState(false);
  const queryGet_totaltime  = useQuery({queryKey:  ['totaltime'], queryFn: getTotalTime,});
  const queryGet_replenishRate  = useQuery({queryKey:  ['replenishrate'], queryFn: getReplenishRate,});
  const queryGet_userTime  = useQuery({queryKey:  ['usedtime'], queryFn: getUsedTime,});
  const queryGet_posts_per_user  = useQuery({queryKey:  ['postsperuser'], queryFn: getPostsPerUser,});
  
  const queryGet_get_postsPerUserWithLowRanking  = useQuery({queryKey:  ['get_postsPerUserWithLowRanking'], queryFn: get_postsPerUserWithLowRanking,});

  const queryGetTotalProfit = useQuery({queryKey: ['totalprofit'], queryFn: fetchTotalTime, });
  
  //const queryGetTotalVisit = useQuery({queryKey: ['totalprofit'], queryFn: fetchTotalTime, });
  
  const [selectedUsers, setSelectedUsers] = useState('10');
  const [network, setNetwork] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  
  const [selectedRanker, setSelectedRanker] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [textInput, setTextInput] = useState('');
  const [timer, setTimer] = useState(0); 
    
    
  const handleOkClick = async () => {
    console.log('Selected users:', selectedUsers);
    console.log('Selected network:', network);
    console.log('Selected Platform:', selectedPlatform);
    console.log('Selected Ranker:', selectedRanker);
    console.log('Selected Topic:', selectedTopic);
    console.log('token:', textInput); 
  
    /*if (simulationRunning) {
      try {
        const response = await axios.post('http://localhost:5000/simulation/stopSimulation');
  
        if (response.data.message) {
          socket.emit('stop-simulation');
          setSimulationRunning(false);
          toast.success('Simulation stopped successfully!');
        } else {
          toast.error('Failed to stop simulation.');
        } 
      } catch (error) { 
        console.error('Error stopping simulation:', error);
        toast.error('Error occurred while stopping simulation.');
      }
    } else {
      try {
        const response = await axios.post('http://localhost:5000/simulation/startSimulation', {
          model: selectedModel,
          platform: selectedPlatform,
          ranker: selectedRanker,
          topic: selectedTopic,
          key: textInput,
        });
  
        if (response.data.error) {
          console.log('Simulation response.data.error:', response.data.error);
          toast.error(`Error: ${response.data.error}`);
        } else {
          setSimulationRunning(true);
          console.log('Simulation started:', response.data);
          toast.success('Simulation started successfully!');
        } 
      } catch (error) { 
        console.error('Error starting simulation:', error);
        toast.error('Error occurred while starting simulation.');
      }
    }*/
  };

  const handleCancelClick = async() => { 
    setSelectedUsers('10');
    setNetwork('');
    setSelectedModel('');
    setSelectedPlatform('');
    setSelectedRanker('');
    setSelectedTopic('');
    setTextInput('');
    try {
      const response = await axios.post('http://localhost:5000/simulation/stopSimulation');

      /*if (response.data.message) {
        socket.emit('stop-simulation');
        setSimulationRunning(false);
        toast.success('Simulation stopped successfully!');
      } else {
        toast.error('Failed to stop simulation.');
      }
      } */
    } catch (error) { 
      console.error('Error stopping simulation:', error);
      toast.error('Error occurred while stopping simulation.');
    }
    
  };

  useEffect(() => {
    console.log('Attempting to connect to WebSocket...');

    /*socket.on('simulation-status', (data) => {
      setSimulationRunning(data.running);
      console.log('setSimulationRunning', data.running);
    });


    socket.on('timer-update', (data) => {
      setTimer(data.seconds);
    });
  

    socket.on('connect_error', (err) => {
      console.log('Attempting to connect to WebSocket', err.message);
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket:', socket.id);
    });

    socket.on('update-data', (updatedData) => {
      console.log('Real-time update received:', updatedData["response"]);

      queryClient.setQueryData(['totalvisit'], updatedData["response"]);
      //queryClient.setQueryData(['totalprofit'], updatedData);
    });
    
    socket.on('timebudget_totaltime', (updatedData) => {
      console.log('Real-time update total time:', updatedData["response1"]);
      queryClient.setQueryData(['totaltime'], updatedData["response1"]); 
    });
    socket.on('timebudget_replenish', (updatedData) => {
      console.log('Real-time update replenish time:', updatedData["response2"]);
      queryClient.setQueryData(['replenishrate'], updatedData["response2"]); 
    });
    socket.on('timebudget_usedtime', (updatedData) => {
      console.log('Real-time update used time:', updatedData["response3"]);
      queryClient.setQueryData(['usedtime'], updatedData["response3"]); 
    });
    socket.on('posts_per_user', (updatedData) => {
      console.log('Real-time update posts per user:', updatedData["response4"]);
      queryClient.setQueryData(['postsperuser'], updatedData["response4"]); 
    });
    
    socket.on('get_postsPerUserWithLowRanking', (updatedData) => {
      console.log('Real-time update posts per user:', updatedData["response5"]);
      queryClient.setQueryData(['get_postsPerUserWithLowRanking'], updatedData["response5"]); 
    });
    
    socket.on('simulation-complete', (data) => {
      console.log('Simulation completed:', data.message); 
    });
    
    return () => {
      socket.off('simulation-status');
      socket.off('timer-update');
    };*/
    
  }, [queryClient]);

  return (
    <div className="home w-full p-0 m-0">
      {/* grid */}
      
      <ToastContainer 
        position="top-center" 
        autoClose={5000} 
        hideProgressBar={false} 
        newestOnTop={true}  // This should now be valid
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover
        /> 
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 grid-flow-dense auto-rows-[minmax(200px,auto)] xl:auto-rows-[minmax(150px,auto)] gap-3 xl:gap-3 px-0">

        {/* Parameters Section (First row, spanning 2 columns) */}
        <div className="box col-span-full sm:col-span-2 xl:col-span-2">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-3">Setup Simulation</h2>

            {/* Select Menu for Model */}
            
            
            <label className="block text-sm font-medium mb-2">Agents</label>
            <select
              value={selectedUsers}
              onChange={(e) => setSelectedUsers(e.target.value)}
              className="mb-4 p-2 border rounded w-full"
            >
              <option value="">Select number of agents</option>
              <option value="10">10</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            
            
            <label className="block text-sm font-medium mb-2">Network</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="mb-4 p-2 border rounded w-full"
            >
              <option value="">Select a Network</option>
              <option value="Barabasi">Barabasi</option>
              <option value="ErdosRenyi">ErdosRenyi</option>
              <option value="StochasticBlockModel">StochasticBlockModel</option>
            </select>
            
            
           {/* <label className="block text-sm font-medium mb-2">Large language model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="mb-4 p-2 border rounded w-full"
            >
              <option value="">Select a Model</option>
              <option value="Model A">Model A</option>
              <option value="Model B">Model B</option>
              <option value="Model C">Model C</option>
            </select>*/}

            {/* Select Menu for Platform */}
            <label className="block text-sm font-medium mb-2">Platform</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="mb-4 p-2 border rounded w-full"
            >
              <option value="">Select a Platform</option>
              {/*<option value="OpenAI">OpenAI</option>*/}
              <option value="Together.io">Together.io</option>
              {/*<option value="Local">Local</option>*/}
            </select>
            
            {/* Select Menu for Platform */}
            <label className="block text-sm font-medium mb-2">Ranker</label>
            <select
              value={selectedRanker}
              onChange={(e) => setSelectedRanker(e.target.value)}
              className="mb-4 p-2 border rounded w-full"
            >
              <option value="">Select a Ranker</option>
              
              {<option value="OpenAI">Random</option>}
              <option value="Together.io">Chronological</option>
              {<option value="Local">Success based ranking</option>}
              
            </select>

            

            {/* Select Menu for Topic */}
            <label className="block text-sm font-medium mb-2">Topic</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="mb-4 p-2 border rounded w-full"
            >
              <option value="">Select a Topic</option>
              <option value="Ukraine war">Ukraine war</option>
              <option value="US Elections">US Elections</option>
            </select>

            {/* Text input */}
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter secret token here"
              className="mb-4 p-2 border rounded w-full"
            />

            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleOkClick}
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                {simulationRunning ? 'Stop Simulation' : 'Start Simulation'}
              </button>
              <button
                onClick={handleCancelClick}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>


        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-1">
           <div className="p-4 bg-white rounded-lg shadow-md text-center">
           <h2 className="text-lg font-semibold mb-2">Simulation Timer</h2>
           <p className="text-2xl font-bold">{timer} seconds</p>
           </div>
        </div>


        {/* Agents Life Cycle heading (Second row) */}
        <div className="col-span-full row-span-start row-span-1 flex items-center">
  <h2 className="text-3xl font-semibold mb-4">Agents Life Cycle</h2>
</div>

        {/* The other 3 boxes on the second row (TopDealsBox, ChartBox for Total Visit, and ChartBox for Total Profit) */}
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3">
          <TopDealsBox />
        </div>

        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3">
          <ChartBox
            chartType={'bar'}
            title="Total Time"
            {...queryGet_totaltime.data}
            isLoading={queryGet_totaltime.isLoading}
            isSuccess={queryGet_totaltime.isSuccess}
          />
        </div>

        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3">
          <ChartBox
            chartType={'bar'}
            title="Time Used"
            {...queryGet_userTime.data}
            isLoading={queryGet_userTime.isLoading}
            isSuccess={queryGet_userTime.isSuccess}
          />
        </div>
        
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3">
          <ChartBox
            chartType={'bar'}
            title="Replenish Rate"
            {...queryGet_replenishRate.data}
            isLoading={queryGet_replenishRate.isLoading}
            isSuccess={queryGet_replenishRate.isSuccess}
          />
        </div>
      
        
        {/* Agents Life Cycle heading (Second row) */}
        <div className="col-span-full row-span-start row-span-1 flex items-center">
          <h2 className="text-3xl font-semibold mb-4">Generated Data</h2>
        </div>
        
        
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3">
          <ChartBox
            chartType={'bar'}
            title="Total Posts"
            {...queryGet_posts_per_user.data}
            isLoading={queryGet_posts_per_user.isLoading}
            isSuccess={queryGet_posts_per_user.isSuccess}
          />
        </div>

        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3">
          <ChartBox
            chartType={'bar'}
            title="Ranker"
            {...queryGet_get_postsPerUserWithLowRanking.data}
            isLoading={queryGet_get_postsPerUserWithLowRanking.isLoading}
            isSuccess={queryGet_get_postsPerUserWithLowRanking.isSuccess}
          />
        </div>
        
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3">
          <ChartBox
            chartType={'bar'}
            title="Online Users"
            {...queryGetTotalProfit.data}
            isLoading={queryGetTotalProfit.isLoading}
            isSuccess={queryGetTotalProfit.isSuccess}
          />
        </div>
        
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3">
          <ChartBox
            chartType={'bar'}
            title="Offline Users"
            {...queryGetTotalProfit.data}
            isLoading={queryGetTotalProfit.isLoading}
            isSuccess={queryGetTotalProfit.isSuccess}
          />
        </div>
        
      
        
         {/* Agents Life Cycle heading (Second row) 
         <div className="col-span-full row-span-start row-span-1 flex items-center">
          <h2 className="text-3xl font-semibold mb-4">Debate Quality Metrics</h2>
        </div>
        
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3">
          <ChartBox
            chartType={'bar'}
            title="Metric 1"
            {...queryGetTotalProfit.data}
            isLoading={queryGetTotalProfit.isLoading}
            isSuccess={queryGetTotalProfit.isSuccess}
          />
        </div>
        
       
        
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3">
          <ChartBox
            chartType={'bar'}
            title="Metric 2"
            {...queryGetTotalVisit.data}
            isLoading={queryGetTotalVisit.isLoading}
            isSuccess={queryGetTotalVisit.isSuccess}
          />
        </div>

        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3">
          <ChartBox
            chartType={'bar'}
            title="Metric 3"
            {...queryGetTotalProfit.data}
            isLoading={queryGetTotalProfit.isLoading}
            isSuccess={queryGetTotalProfit.isSuccess}
          />
        </div>
        
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3">
          <ChartBox
            chartType={'bar'}
            title="Metric 4"
            {...queryGetTotalProfit.data}
            isLoading={queryGetTotalProfit.isLoading}
            isSuccess={queryGetTotalProfit.isSuccess}
          />
        </div>
        */}
        
        
        
      </div> 
   
    </div>
  );
};

export default Home;
