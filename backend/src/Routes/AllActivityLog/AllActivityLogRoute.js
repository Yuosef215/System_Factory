import express from 'express';

import {getAllActivityLog} from '../../Services/ActivityLog/ActivityLogServices.js';
import { protect, allowedTo } from '../../Services/users/usersSevices.js';


const router = express.Router();


router.get("/get_allActivity_log",protect,allowedTo("developer"),getAllActivityLog);


export default router;

