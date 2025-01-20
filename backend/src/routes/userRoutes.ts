import { Router } from 'express';
import {  UserController } from '../controllers/userController';

const router = Router();

// Existing routes 
router.get('/users/getAllUsers', UserController.getAllUsers); // Fetch all users with populated timeBudget
router.get('/users/get_totalTime', UserController.get_totalTime);
router.get('/users/get_replenishTime', UserController.get_replenishTime);
router.get('/users/get_usedTime', UserController.get_usedTime);
// New routes
router.post('/create', UserController.createUser); // Route to create a new user
router.put('/update/:id', UserController.updateUser); // Route to update a user by ID

export default router;
