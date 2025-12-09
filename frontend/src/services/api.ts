import { IMotivations } from "../types/IAMotivations";
import { IAnalytics } from "../types/IAnalytics";
import { IRanking } from "../types/IRanking";

//import { IAMotivations } from "../types/IAMotivations";
//import { IInteractions } from "../types/IInteractions";
//import { ITimeBudget } from "../types/ITimeBudget";
import axios from "axios";
import { ITimeBudget } from "../types/ITimeBudget";
import { IInteractions } from "../types/IInteractions";
import { ISentimentScores } from "../types/ISentimentScores";


const API_BASE_URL = "http://localhost:5000";

export const connectToDatabase = async (databaseName: string): Promise<void> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/connect`, { databaseName });
    
    if (response.status === 200) {
      console.log(`Successfully connected to database: ${databaseName}`);
    } else {
      console.error('Failed to connect to the database:', response.data);
    }
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};


export const fetchAnalyticsData = async (): Promise<IAnalytics | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/latestAnalytics`);
    
    if (!response.data || !response.data.userActivity) {
      console.error("Invalid data structure:", response.data);
      return null;
    }

    return response.data as IAnalytics;  // ✅ Type assertion
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    throw error;
  }
};



  export const fetchSentimentScoresComments = async (): Promise<ISentimentScores | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/sentimentScoresFromComments`);
  
      if (!response.data || !response.data.sentimentScores) {
        console.error("Invalid sentiment response structure:", response.data);
        return null;
      }
  
      return response.data.sentimentScores as ISentimentScores;
    } catch (error) {
      console.error("Error fetching sentiment scores:", error);
      throw error;
    }
  };

export const fetchSentimentScores = async (): Promise<ISentimentScores | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/sentimentScores`);

    if (!response.data || !response.data.sentimentScores) {
      console.error("Invalid sentiment response structure:", response.data);
      return null;
    }

    return response.data.sentimentScores as ISentimentScores;
  } catch (error) {
    console.error("Error fetching sentiment scores:", error);
    throw error;
  }
};

export const fetchLatestUserRanking = async (): Promise<IRanking | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/latestUserActionsRanking`);
    
    if (!response.data || !response.data.rankings) {
      console.error("Invalid data structure:", response.data);
      return null;
    }

    return response.data as IRanking;  // ✅ Type assertion
  } catch (error) {
    console.error("Error fetching actions data:", error);
    throw error;
  }
};

export const fetchLatestUserInteraction = async (): Promise<IInteractions | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/latestUserActionsInteraction`);
    
    if (!response.data || !response.data.interactions) {
      console.error("Invalid data structure:", response.data);
      return null;
    }

    return response.data as IInteractions;  // ✅ Type assertion
  } catch (error) {
    console.error("Error fetching actions data:", error);
    throw error;
  }
};

export const fetchAnalyticsMotivation = async (): Promise<IMotivations | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/latestAnalyticsMotivation`);
    
    if (!response.data || !response.data.timebudget) {
      console.error("Invalid data structure:", response.data);
      return null;
    }

    return response.data as IMotivations;  // ✅ Type assertion
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    throw error;
  }
};

export const fetchAnalyticsTimeBudget = async (): Promise<ITimeBudget | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/latestAnalyticsTB`);
    
    if (!response.data || !response.data.timebudget) {
      console.error("Invalid data structure:", response.data);
      return null;
    }

    return response.data as ITimeBudget;  // ✅ Type assertion
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    throw error;
  }
};



export const fetchLatestUserActions = async (): Promise<IAnalytics | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/latestUserActions`);
    
    if (!response.data || !response.data.userActions) {
      console.error("Invalid data structure:", response.data);
      return null;
    }

    return response.data as IAnalytics;  // ✅ Type assertion
  } catch (error) {
    console.error("Error fetching actions data:", error);
    throw error;
  }
};



