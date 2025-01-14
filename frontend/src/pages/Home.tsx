import  { useEffect} from 'react';
import { useState } from 'react';
import TopDealsBox from '../components/topDealsBox/TopDealsBox';
import ChartBox from '../components/charts/ChartBox';
import { useQuery, useQueryClient } from '@tanstack/react-query';
 
//import io from 'socket.io-client'; 

//const socket = io('http://localhost:5000');
import { 
  fetchTotalTime
} from '../api/ApiCollection';


import {  
} from 'react-icons/md';
import { io } from 'socket.io-client';

const Home = () => {


  const socket = io('http://localhost:5000',
  {
    transports: ['websocket', 'polling'], // Use WebSocket transport
 }
  );
  const queryClient = useQueryClient(); 

  const [selectedModel, setSelectedModel] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [textInput, setTextInput] = useState('');


  const handleOkClick = () => {
    // Handle the logic for OK button
    console.log('Selected Model:', selectedModel);
    console.log('Selected Platform:', selectedPlatform);
    console.log('Selected Topic:', selectedTopic);
    console.log('Text input:', textInput);
  };


  const handleCancelClick = () => {
    // Handle the logic for Cancel button
    setSelectedModel('');
    setSelectedPlatform('');
    setSelectedTopic('');
    setTextInput('');
  };

  useEffect(() => {
  
    console.log('Attempting to connect to WebSocket...');
    
    socket.on('connect_error', (err) => {
      console.log('ttempting to connect to WebSocket', err.message);
      console.log('ttempting to connect to WebSocket', err);
    });
    
    // Check if WebSocket is connected
    socket.on('connect', () => {
      console.log('Connected to WebSocket:', socket.id);
    });
  
    socket.on('update-data', (updatedData) => {
      console.log('Real-time update received:', updatedData);

      // Update the react-query cache with the new data
      queryClient.setQueryData(['totalvisit'], updatedData);
      queryClient.setQueryData(['totalprofit'], updatedData);
    });

    //return () => {
      //socket.disconnect(); // Clean up the listener when the component unmounts
    //};
  }, [queryClient]);


  /*const queryGetTotalUsers = useQuery({
    queryKey: ['totalusers'],
    queryFn: fetchTotalUsers,
  });

  const queryGetTotalProducts = useQuery({
    queryKey: ['totalproducts'],
    queryFn: fetchTotalProducts,
  });
  
  const queryGetTotalRatio = useQuery({
    queryKey: ['totalratio'],
    queryFn: fetchTotalRatio,
  });

  const queryGetTotalRevenue = useQuery({
    queryKey: ['totalrevenue'],
    queryFn: fetchTotalRevenue,
  });

  const queryGetTotalSource = useQuery({
    queryKey: ['totalsource'],
    queryFn: fetchTotalSource,
  });

  const queryGetTotalRevenueByProducts = useQuery({
    queryKey: ['totalrevenue-by-products'],
    queryFn: fetchTotalRevenueByProducts,
  });*/

  const queryGetTotalVisit = useQuery({
    queryKey: ['totalvisit'],
    queryFn: fetchTotalTime,
  });

  const queryGetTotalProfit = useQuery({
    queryKey: ['totalprofit'],
    queryFn: fetchTotalTime,
  });

  return (
    // screen
    <div className="home w-full p-0 m-0">
      {/* grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 grid-flow-dense auto-rows-[minmax(200px,auto)] xl:auto-rows-[minmax(150px,auto)] gap-3 xl:gap-3 px-0">
       
        
        {/* Parameters Section */}
        <div className="box col-span-full sm:col-span-1 xl:col-span-1">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-3">Parameters</h2>
            
            {/* Select Menu for Model */}
            <label className="block text-sm font-medium mb-2">Large language model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="mb-4 p-2 border rounded w-full"
            >
              <option value="">Select a Model</option>
              <option value="Model A">Model A</option>
              <option value="Model B">Model B</option>
              <option value="Model C">Model C</option>
            </select>
  
            {/* Select Menu for Platform */}
            <label className="block text-sm font-medium mb-2">Platform</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="mb-4 p-2 border rounded w-full"
            >
              <option value="">Select a Platform</option>
              <option value="OpenAI">OpenAI</option>
              <option value="Together.io">Together.io</option>
              <option value="Local">Local</option>
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
              placeholder="Enter additional text"
              className="mb-4 p-2 border rounded w-full"
            />
  
            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleOkClick}
                className="btn btn-primary px-4 py-2 rounded"
              >
                OK
              </button>
              <button
                onClick={handleCancelClick}
                className="btn btn-secondary px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
  
        {/* TopDealsBox */}
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3 3xl:row-span-5">
          <TopDealsBox />
        </div>
  
        {/* ChartBox for Total Visit */}
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 3xl:row-span-2">
          <ChartBox
            chartType={'bar'}
            title="Total Posts"
            {...queryGetTotalVisit.data}
            isLoading={queryGetTotalVisit.isLoading}
            isSuccess={queryGetTotalVisit.isSuccess}
          />
        </div>
  
        {/* ChartBox for Total Profit */}
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 3xl:row-span-2">
          <ChartBox
            chartType={'bar'}
            title="Total Likes"
            {...queryGetTotalProfit.data}
            isLoading={queryGetTotalProfit.isLoading}
            isSuccess={queryGetTotalProfit.isSuccess}
          />
        </div>
  
      </div>
    </div>
  );
  
};

export default Home;
