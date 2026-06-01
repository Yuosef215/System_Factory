import express from 'express';

import {getAllActivityLog,deleteAllActivityLog} from '../../Services/ActivityLog/ActivityLogServices.js';
import { protect, allowedTo } from '../../Services/users/usersSevices.js';


const router = express.Router();


router.get("/get_allActivity_log",protect,allowedTo("developer"),getAllActivityLog);
router.delete("/delete_allActivity_log",protect,allowedTo("developer"),deleteAllActivityLog);


export default router;

