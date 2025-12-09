import request from 'supertest';
import app from '../../src/app'; // Assuming app is your Express instance
import { User } from '../../src/models/user/user.model';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../../src/config/db';

jest.setTimeout(800000);

// Loading environment variables
dotenv.config({ path: './tests/.env' });

beforeAll(async () => {
  jest.setTimeout(80000); // Set a timeout for the database connection
  console.log('Connecting to MongoDB...');
  await connectDB(); // Connect to MongoDB
  console.log('MongoDB connected');
});

afterAll(async () => {
  await mongoose.disconnect(); // Disconnect from MongoDB
  console.log('MongoDB disconnected');
});

describe('Network Controller Tests', () => {
  test('should create a network and update users successfully', async () => {
    jest.setTimeout(80000);

    let createdUsers: any[] = [];
    createdUsers = await User.find(); // Get all users from the database
    console.log('Fetched existing users:', createdUsers);

    if (createdUsers.length === 0) {
      throw new Error('No users found in the database to create a network.');
    }

    const userIds = createdUsers.map(user => user._id); // Extract user IDs for network creation
    const modelName = "StochasticBlockModel"; // The model name you want to send
    const m = 3; // The value of m

    const response = await request(app)
      .post('/network/create')
      .send({
        userIds,
        model: modelName,
        numOfUsers: userIds.length,
        m: m
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Graph and database updated successfully');
    expect(response.body).toHaveProperty('nodes');
    expect(response.body).toHaveProperty('edges');

    // Validate the database state
    const updatedUsers = await User.find({ _id: { $in: userIds } });
    updatedUsers.forEach(user => {
      expect(user.followings).toBeDefined();
      expect(user.followers).toBeDefined();
    });
  });
});
