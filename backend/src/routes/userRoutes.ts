import { Router } from 'express'; 
import { getTotalTime } from '../controllers/user.controller'; 

const router = Router();

router.get('/total-Time', getTotalTime);

export default router;
