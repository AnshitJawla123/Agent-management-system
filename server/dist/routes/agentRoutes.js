"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const agentController_1 = require("../controllers/agentController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post('/', auth_1.auth, agentController_1.createAgent);
router.get('/', auth_1.auth, agentController_1.getAllAgents);
router.post('/upload-csv', auth_1.auth, upload.single('file'), agentController_1.uploadCSV);
exports.default = router;
