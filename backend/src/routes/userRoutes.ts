import { Router } from 'express'; 
import { getTotalTime, getAllUsers } from '../controllers/user.controller'; 

const router = Router();

router.get('/total-Time', getTotalTime);
router.get('/getAllUsers', getAllUsers);

export default router;
