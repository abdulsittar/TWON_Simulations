//import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import DataTable from '../components/DataTable';
import { useQuery } from '@tanstack/react-query';
//import toast from 'react-hot-toast';
//import { fetchLogs } from '../api/ApiCollection';
//, getComments 
import { getUsersData, getComments, getPosts  } from '../api/ApiCollection'; 


 
const Logs = () => {
  const users               = useQuery({ queryKey: ['all-users'], queryFn: getUsersData, }); 
  
  const posts = useQuery({ queryKey: ['all-posts'], queryFn: getPosts, });
  
  const comments = useQuery({ queryKey: ['all-comments'], queryFn: getComments, });

  const columns1: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: '_id',
      headerName: 'userId',
      minWidth: 220,
      flex: 1,
      renderCell: (params) => {
        return (
          <div className="flex gap-3 py-[6px] items-center">
            <span className="mb-0 pb-0 leading-none">
              {params.row.firstName} {params.row.lastName}
            </span>
          </div>
        );
      },
    },
    {
      field: 'username',
      headerName: 'username',
      minWidth: 80,
      flex: 1,
      renderCell: (params) => {
        return (
          <div className="flex gap-3 py-[6px] items-center">
            <span className="mb-0 pb-0 leading-none">
              {params.row.username}
            </span>
          </div>
        );
      },
    },
    {
      field: 'email',
      type: 'string',
      headerName: 'Email',
      minWidth: 150,
      flex: 1,
    },
    {
      field: 'party',
      headerName: 'party',
      minWidth: 100,
      type: 'string',
      flex: 1,
      renderCell: (params) => {
        return (
          <div className="flex whitespace-normal">
            {params.row.username}
          </div>
        );
      },
    },
  ];
  
  const columns2: GridColDef[] = [
    { field: '_id', headerName: 'ID', width: 90 },
    {
      field: 'userId',
      headerName: 'userId',
      minWidth: 220,
      flex: 1,
      renderCell: (params) => {
        return (
          <div className="flex gap-3 py-[6px] items-center">
            <span className="mb-0 pb-0 leading-none">
              {params.row.userId}
            </span>
          </div>
        );
      },
    },
    {
      field: 'desc',
      type: 'string',
      headerName: 'Post',
      minWidth: 200,
      flex: 1,
    },
  ];

  const columns3: GridColDef[] = [
    { field: '_id', headerName: 'ID', width: 90 },
    {
      field: 'postId',
      headerName: 'postId',
      minWidth: 220,
      flex: 1,
      renderCell: (params) => {
        return (
          <div className="flex gap-3 py-[6px] items-center">
            <span className="mb-0 pb-0 leading-none">
              {params.row.postId}
            </span>
          </div>
        );
      },
    },
    {
      field: 'username',
      headerName: 'username',
      minWidth: 220,
      flex: 1,
      renderCell: (params) => {
        return (
          <div className="flex gap-3 py-[6px] items-center">
            <span className="mb-0 pb-0 leading-none">
              {params.row.username}
            </span>
          </div>
        );
      },
    },
    {
      field: 'body',
      type: 'string',
      headerName: 'body',
      minWidth: 200,
      flex: 1,
    },
  ];
 
  return (
    // screen
    <div className="w-full p-0 m-0">
      {/* container */}
      <div className="w-full flex flex-col items-stretch gap-3">
        {/* block 1 */}
        <div className="w-full flex justify-between mb-5">
          <div className="flex gap-1 justify-start flex-col items-start">
            <h2 className="font-bold text-2xl xl:text-4xl mt-0 pt-0 text-base-content dark:text-neutral-200">
              Agents
            </h2>
            {users.data && users.data.length > 0 && (
              <span className="text-neutral dark:text-neutral-content font-medium text-base">
                {users.data.length} agents
              </span>
            )}
          </div>
        </div>
         
          {users.data && users.data.length > 0 && (  <DataTable
              slug="logs"
              columns={columns1}
              rows={users.data}
              getRowId={(row) => row._id || row.id}
              includeActionColumn={false}
            />
          )}
           </div>
      
      {/* container */}
      <div className="w-full flex flex-col items-stretch gap-3">
        {/* block 1 */}
        <div className="w-full flex justify-between mb-5">
          <div className="flex gap-1 justify-start flex-col items-start">
            <h2 className="font-bold text-2xl xl:text-4xl mt-0 pt-0 text-base-content dark:text-neutral-200">
              Posts
            </h2>
            {posts.data && posts.data.length > 0 && (
              <span className="text-neutral dark:text-neutral-content font-medium text-base">
                {posts.data.length} posts
              </span>
            )}
          </div>
        </div>

        
        {posts.data && posts.data.length > 0 && (  <DataTable
              slug="logs"
              columns={columns2}
              rows={posts.data}
              includeActionColumn={false}
            />
          )}
           </div>
      
      
      
      
      {/* container */}
      <div className="w-full flex flex-col items-stretch gap-3">
        {/* block 1 */}
        <div className="w-full flex justify-between mb-5">
          <div className="flex gap-1 justify-start flex-col items-start">
            <h2 className="font-bold text-2xl xl:text-4xl mt-0 pt-0 text-base-content dark:text-neutral-200">
              Comments
            </h2>
            {comments.data && comments.data.length > 0 && (
              <span className="text-neutral dark:text-neutral-content font-medium text-base">
                {comments.data.length} comments
              </span>
            )}
          </div>
        </div>

       
            {comments.data && comments.data.length > 0 && (  <DataTable
              slug="logs"
              columns={columns3}
              rows={comments.data}
              includeActionColumn={false}
              getRowId={(row) => row._id}
            />
          )}
           </div>
    </div>
  );
};

export default Logs;
