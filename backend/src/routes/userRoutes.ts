import { Router } from 'express';
import {  UserController } from '../controllers/userController';

const router = Router();

// Existing routes 
router.get('/users/getAllUsers', UserController.getAllUsers); // Fetch all users with populated timeBudget
router.get('/users/get_totalTime', UserController.get_totalTime);
router.get('/users/get_replenishTime', UserController.get_replenishTime);
router.get('/users/get_usedTime', UserController.get_usedTime);
router.get('/users/latestAnalytics', UserController.latestAnalytics);
router.get('/users/latestUserActions', UserController.latestUserActions);
router.get('/users/listDatabases', UserController.listAllDatabases);

router.get('/users/getUsersData', UserController.getUsersData);
router.get('/users/getPosts', UserController.getPosts);
router.get('/users/getComments', UserController.getComments);

router.get('/users/latestAnalyticsMotivation', UserController.latestAnalyticsMotivation);
router.get('/users/latestAnalyticsTB', UserController.latestAnalyticsTB);
router.get("/users/sentimentScores", UserController.sentimentScores);

router.get("/users/sentimentScoresFromComments", UserController.sentimentScoresFromComments);


router.get('/users/latestUserActionsRanking', UserController.latestUserActionsRanking);
router.get('/users/latestUserActionsInteraction', UserController.latestUserActionsInteraction);


// New routeslatestUserActionsInteraction
router.post('/create', UserController.createUser); // Route to create a new user
router.put('/update/:id', UserController.updateUser); // Route to update a user by ID

export default router;
