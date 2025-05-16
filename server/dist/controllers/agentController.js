"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadCSV = exports.getAllAgents = exports.createAgent = void 0;
const Agent_1 = __importDefault(require("../models/Agent"));
const csv_parse_1 = require("csv-parse");
const stream_1 = require("stream");
const createAgent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const agent = new Agent_1.default(req.body);
        yield agent.save();
        res.status(201).json(agent);
    }
    catch (error) {
        res.status(400).json({ error: 'Error creating agent' });
    }
});
exports.createAgent = createAgent;
const getAllAgents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const agents = yield Agent_1.default.find({});
        res.json(agents);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching agents' });
    }
});
exports.getAllAgents = getAllAgents;
const uploadCSV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const fileBuffer = req.file.buffer;
        const records = [];
        const parser = (0, csv_parse_1.parse)({
            columns: true,
            skip_empty_lines: true
        });
        parser.on('readable', function () {
            let record;
            while ((record = parser.read()) !== null) {
                records.push({
                    firstName: record.FirstName,
                    phone: record.Phone,
                    notes: record.Notes
                });
            }
        });
        parser.on('error', function (err) {
            console.error(err);
            res.status(400).json({ error: 'Error parsing CSV file' });
        });
        parser.on('end', function () {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const agents = yield Agent_1.default.find({});
                    const tasksPerAgent = Math.ceil(records.length / agents.length);
                    for (let i = 0; i < agents.length; i++) {
                        const start = i * tasksPerAgent;
                        const end = Math.min(start + tasksPerAgent, records.length);
                        const agentTasks = records.slice(start, end);
                        yield Agent_1.default.findByIdAndUpdate(agents[i]._id, { $set: { assignedTasks: agentTasks } }, { new: true });
                    }
                    res.json({ message: 'Tasks distributed successfully' });
                }
                catch (error) {
                    res.status(500).json({ error: 'Error distributing tasks' });
                }
            });
        });
        stream_1.Readable.from(fileBuffer).pipe(parser);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.uploadCSV = uploadCSV;
