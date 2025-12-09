import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';  // Update with your backend URL

//const API_BASE_URL = 'http://lss-twon.ijs.si';  // Update with your backend URL

// Function to fetch total time
export const getUsersData = async () => {
  try {
    //const response = await axios.get(`${API_BASE_URL}simulation/startSimulation`);//total-Time`);
    const response = await axios.get(`${API_BASE_URL}/users/getUsersData`);
    console.log(response.data);  // This should log the formatted data
    return response.data;  // Return the formatted data
  } catch (error) {
    console.error('Error fetching total time:', error);
    throw error;
  }
};


// Function to fetch total time
export const getPosts = async () => {
  try {
    //const response = await axios.get(`${API_BASE_URL}simulation/startSimulation`);//total-Time`);
    const response = await axios.get(`${API_BASE_URL}/users/getPosts`);
    console.log(response.data);  // This should log the formatted data
    return response.data;  // Return the formatted data
  } catch (error) {
    console.error('Error fetching total time:', error);
    throw error;
  }
};


// Function to fetch total time
export const getComments = async () => {
  try {
    //const response = await axios.get(`${API_BASE_URL}simulation/startSimulation`);//total-Time`);
    const response = await axios.get(`${API_BASE_URL}/users/getComments`);
    console.log(response.data);  // This should log the formatted data
    return response.data;  // Return the formatted data
  } catch (error) {
    console.error('Error fetching total time:', error);
    throw error;
  }
};




// Function to fetch total time
export const fetchTotalTime = async () => {
  try {
    //const response = await axios.get(`${API_BASE_URL}simulation/startSimulation`);//total-Time`);
    const response = await axios.get(`${API_BASE_URL}/users/getAllUsers`);
    console.log(response.data);  // This should log the formatted data
    return response.data;  // Return the formatted data
  } catch (error) {
    console.error('Error fetching total time:', error);
    throw error;
  }
};


export const getAllDatabases = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/listDatabases`);
    return response.data;
  } catch (error) {
    console.error('Error fetching databases:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/getAllUsers`); 
    return response.data;  // Return the formatted data
  } catch (error) {
    console.error('Error fetching total time:', error);
    throw error;
  }
};


export const getTotalTime = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/get_totalTime`); 
    return response.data;  // Return the formatted data
  } catch (error) {
    console.error('Error fetching total time:', error);
    throw error;
  }
};

export const getReplenishRate = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/get_replenishTime`); 
    return response.data;  // Return the formatted data
  } catch (error) {
    console.error('Error fetching total time:', error);
    throw error;
  }
};

export const getUsedTime = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/get_usedTime`); 
    return response.data;  // Return the formatted data
  } catch (error) {
    console.error('Error fetching total time:', error);
    throw error;
  }
};


export const getPostsPerUser = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/posts/get_postsPerUser`); 
    return response.data;  // Return the formatted data
  } catch (error) {
    console.error('Error fetching total time:', error);
    throw error;
  }
};


export const get_postsPerUserWithLowRanking = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/posts/get_postsPerUserWithLowRanking`); 
    return response.data;  // Return the formatted data
  } catch (error) {
    console.error('Error fetching total time:', error);
    throw error;
  }
};



// GET TOP DEALS
export const fetchTopDeals = async () => {
  const response = await axios
    .get('https://react-admin-ui-v1-api.vercel.app/topdeals')
    .then((res) => {
      console.log('axios get:', res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

  return response;
};

// GET TOTAL USERS
export const fetchTotalUsers = async () => {
  const response = await axios
    .get('https://react-admin-ui-v1-api.vercel.app/totalusers')
    .then((res) => {
      console.log('axios get:', res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

  return response;
};




// GET TOTAL PRODUCTS
export const fetchTotalProducts2 = async () => {
  const response = await axios
    .get('https://react-admin-ui-v1-api.vercel.app/totalproducts')
    .then((res) => {
      console.log('axios get:', res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

  return response;
};

// GET TOTAL RATIO
export const fetchTotalRatio = async () => {
  const response = await axios
    .get('https://react-admin-ui-v1-api.vercel.app/totalratio')
    .then((res) => {
      console.log('axios get:', res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

  return response;
};

// GET TOTAL REVENUE
export const fetchTotalRevenue = async () => {
  const response = await axios
    .get('https://react-admin-ui-v1-api.vercel.app/totalrevenue')
    .then((res) => {
      console.log('axios get:', res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

  return response;
};

// GET TOTAL SOURCE
export const fetchTotalSource = async () => {
  const response = await axios
    .get('https://react-admin-ui-v1-api.vercel.app/totalsource')
    .then((res) => {
      console.log('axios get:', res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

  return response;
};

// GET TOTAL VISIT
export const fetchTotalVisit = async () => {

  console.error("fetchTotalVisit");
  const response = await axios
    .get('https://react-admin-ui-v1-api.vercel.app/totalvisit')
    .then((res) => {
      console.log('axios get:', res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

  return response;
};

// GET TOTAL REVENUE BY PRODUCTS
export const fetchTotalRevenueByProducts = async () => {
  const response = await axios
    .get(
      'https://react-admin-ui-v1-api.vercel.app/totalrevenue-by-product'
    )
    .then((res) => {
      console.log('axios get:', res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

  return response;
};

// GET TOTAL PROFIT
export const fetchTotalProfit = async () => {
  const response = await axios
    .get('https://react-admin-ui-v1-api.vercel.app/totalprofit')
    .then((res) => {
      console.log('axios get:', res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

  return response;
};

// GET ALL USERS
export const fetchUsers = async () => {
  const response = await axios
    .get('https://react-admin-ui-v1-api.vercel.app/users')
    .then((res) => {
      console.log('axios get:', res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

  return response;
};

// GET SINGLE USER
export const fetchSingleUser = async (id: string) => {
  const response = await axios
    .get(`https://react-admin-ui-v1-api.vercel.app/users/${id}`)
    .then((res) => {
      console.log('axios get:', res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

  return response;
};

// GET ALL PRODUCTS
export const fetchProducts = async () => {
  const response = await axios
    .get('https://react-admin-ui-v1-api.vercel.app/products')
    .then((res) => {
      console.log('axios get:', res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

  return response;
};

// GET SINGLE PRODUCT
export const fetchSingleProduct = async (id: string) => {
  const response = await axios
    .get(`https://react-admin-ui-v1-api.vercel.app/products/${id}`)
    .then((res) => {
      console.log('axios get:', res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

  return response;
};

// GET ALL ORDERS
export const fetchOrders = async () => {
  const response = await axios
    .get('https://react-admin-ui-v1-api.vercel.app/orders')
    .then((res) => {
      console.log('axios get:', res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

  return response;
};

// GET ALL POSTS
export const fetchPosts = async () => {
  const response = await axios
    .get('https://react-admin-ui-v1-api.vercel.app/posts')
    .then((res) => {
      console.log('axios get:', res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

  return response;
};

// GET ALL NOTES
export const fetchNotes = async () => {
  const response = await axios
    .get(`https://react-admin-ui-v1-api.vercel.app/notes?q=`)
    .then((res) => {
      console.log('axios get:', res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

  return response;
};

// GET ALL LOGS
export const fetchLogs = async () => {
  const response = await axios
    .get(`https://react-admin-ui-v1-api.vercel.app/logs`)
    .then((res) => {
      console.log('axios get:', res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

  return response;
};
