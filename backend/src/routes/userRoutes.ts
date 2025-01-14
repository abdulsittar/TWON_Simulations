import { Router } from 'express';
import { getTotalTime, getAllUsers, UserController } from '../controllers/userController';

const router = Router();

// Existing routes
router.get('/total-Time', getTotalTime); // Fetch total time for all users
router.get('/getAllUsers', getAllUsers); // Fetch all users with populated timeBudget

// New routes
router.post('/create', UserController.createUser); // Route to create a new user
router.put('/update/:id', UserController.updateUser); // Route to update a user by ID

export default router;
