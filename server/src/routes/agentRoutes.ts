import express, { Router } from 'express';
import multer from 'multer';
import { createAgent, getAllAgents, uploadCSV } from '../controllers/agentController';
import { auth } from '../middleware/auth';

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', auth as express.RequestHandler, createAgent as express.RequestHandler);
router.get('/', auth as express.RequestHandler, getAllAgents as express.RequestHandler);
router.post('/upload-csv', auth as express.RequestHandler, upload.single('file'), uploadCSV as express.RequestHandler);

export default router; 