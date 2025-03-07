import { Router } from 'express';
import {  PostController } from '../controllers/postController';

const router = Router();

// Existing routes 
router.get('/posts/createPost', PostController.createPost); // Fetch all users with populated timeBudget
router.get('/posts/get_postsPerUser', PostController.get_postsPerUser);
router.get('/posts/get_postsPerUserWithLowRanking', PostController.get_postsPerUserWithLowRanking);

export default router;
