import request from 'supertest';
import app from '../../src/app'; // Assuming app is your Express instance
import mongoose from 'mongoose';
import connectDB from '../../src/config/db';
import  {AMCDOpinionModel}  from "../../src/models/user/opinion.model";
import { SimpleLogger } from "../../src/models/user/logger.model";
import { DefaultActor } from "../../src/models/user/actor.model";

// This will be run before all tests in this suite
beforeAll(async () => {
  jest.setTimeout(20000); // Set a timeout for the database connection
  console.log('Connecting to MongoDB...');
  await connectDB(); // Connect to MongoDB
  console.log('MongoDB connected');
});

// This will be run after all tests in this suite
afterAll(async () => {
  await mongoose.disconnect(); // Disconnect from MongoDB
  console.log('MongoDB disconnected');
});

// Grouping the tests in a describe block
describe('User Controller Tests', () => {
  // Test case: Should create 10 users successfully
  test('should create 10 users successfully', async () => {
    jest.setTimeout(200000);
  
    const usersPayload = Array.from({ length: 51 }).map((_, index) => ({
      username: `user${index + 1}`,
      name: `user${index + 1}`,
      email: `user${index + 1}@example.com`,
      motivation: Math.floor(Math.random() * 100), // Random motivation between 0 and 100
      engagement: 70 + index, // Engagement increases with each user
      success: 10 + index, // Success increases with each user
      isPublic: true,
      timeBudget: { totalTime: 100, usedTime: 0 }, // Total time budget
      opinionModel: { politics: 0, sports: 0, technology: 0 }, // Send as a plain object
      logger: new SimpleLogger(), // Logger object
      actor: new DefaultActor(), // Actor object
      frustration: 25, // Arbitrary frustration value
      biases: { politics: 0.5 }, // Arbitrary bias for politics
      timeBudgetRemaining: 100, // Starting with a full time budget
      wantToReply: {},
      timeSpent: Math.max(0, Math.floor(Math.random() * 100)), // Ensure valid value for timeSpent
      feedbackScore: Math.max(0, Math.floor(Math.random() * 10)), // Ensure feedbackScore is >= 0
      entertainmentScore: Math.max(0, Math.floor(Math.random() * 10)), // Ensure entertainmentScore is >= 0
    }));
    
  
    // Send all requests in parallel
    const responses = await Promise.all(
      usersPayload.map((userPay) =>
        request(app).post('/users/create').set('Content-Type', 'application/json').send(userPay)
      )
    );
  
    // Validate all responses
    responses.forEach((response, index) => {
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('username', usersPayload[index].username);
    });
  });
});
