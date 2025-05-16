import express, { Router } from 'express';
import { login } from '../controllers/userController';

const router: Router = express.Router();

router.post('/login', login as express.RequestHandler);

export default router; 