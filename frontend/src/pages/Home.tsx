import { useEffect } from 'react';
import { useState } from 'react';
import TopDealsBox from '../components/topDealsBox/TopDealsBox';
import ChartBox from '../components/charts/ChartBox';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { fetchTotalTime } from '../api/ApiCollection';

const Home = () => {
  const socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling'], // Use WebSocket transport
  });

  const queryClient = useQueryClient();

  const [selectedModel, setSelectedModel] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [textInput, setTextInput] = useState('');

  const handleOkClick = () => {
    console.log('Selected Model:', selectedModel);
    console.log('Selected Platform:', selectedPlatform);
    console.log('Selected Topic:', selectedTopic);
    console.log('Text input:', textInput);
  };

  const handleCancelClick = () => {
    setSelectedModel('');
    setSelectedPlatform('');
    setSelectedTopic('');
    setTextInput('');
  };

  useEffect(() => {
    console.log('Attempting to connect to WebSocket...');

    socket.on('connect_error', (err) => {
      console.log('Attempting to connect to WebSocket', err.message);
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket:', socket.id);
    });

    socket.on('update-data', (updatedData) => {
      console.log('Real-time update received:', updatedData);

      queryClient.setQueryData(['totalvisit'], updatedData);
      queryClient.setQueryData(['totalprofit'], updatedData);
    });
  }, [queryClient]);

  const queryGetTotalVisit = useQuery({
    queryKey: ['totalvisit'],
    queryFn: fetchTotalTime,
  });

  const queryGetTotalProfit = useQuery({
    queryKey: ['totalprofit'],
    queryFn: fetchTotalTime,
  });

  return (
    <div className="home w-full p-0 m-0">
      {/* grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 grid-flow-dense auto-rows-[minmax(200px,auto)] xl:auto-rows-[minmax(150px,auto)] gap-3 xl:gap-3 px-0">

        {/* Parameters Section (First row, spanning 2 columns) */}
        <div className="box col-span-full sm:col-span-2 xl:col-span-2">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-3">Setup Simulation</h2>

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
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                Run
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
            title="Time Budget"
            {...queryGetTotalVisit.data}
            isLoading={queryGetTotalVisit.isLoading}
            isSuccess={queryGetTotalVisit.isSuccess}
          />
        </div>

        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3">
          <ChartBox
            chartType={'bar'}
            title="Time Used"
            {...queryGetTotalProfit.data}
            isLoading={queryGetTotalProfit.isLoading}
            isSuccess={queryGetTotalProfit.isSuccess}
          />
        </div>
        
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3">
          <ChartBox
            chartType={'bar'}
            title="Replenish Rate"
            {...queryGetTotalProfit.data}
            isLoading={queryGetTotalProfit.isLoading}
            isSuccess={queryGetTotalProfit.isSuccess}
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
            {...queryGetTotalVisit.data}
            isLoading={queryGetTotalVisit.isLoading}
            isSuccess={queryGetTotalVisit.isSuccess}
          />
        </div>

        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3">
          <ChartBox
            chartType={'bar'}
            title="Total Likes"
            {...queryGetTotalProfit.data}
            isLoading={queryGetTotalProfit.isLoading}
            isSuccess={queryGetTotalProfit.isSuccess}
          />
        </div>
        
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3">
          <ChartBox
            chartType={'bar'}
            title="Total Dislikes"
            {...queryGetTotalProfit.data}
            isLoading={queryGetTotalProfit.isLoading}
            isSuccess={queryGetTotalProfit.isSuccess}
          />
        </div>
        
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3">
          <ChartBox
            chartType={'bar'}
            title="Total Comments"
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
