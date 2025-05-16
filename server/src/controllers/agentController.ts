import { Request, Response } from 'express';
import Agent, { IAgent } from '../models/Agent';
import { parse } from 'csv-parse';
import { Readable } from 'stream';

export const createAgent = async (req: Request, res: Response) => {
  try {
    const agent = new Agent(req.body);
    await agent.save();
    res.status(201).json(agent);
  } catch (error) {
    res.status(400).json({ error: 'Error creating agent' });
  }
};

export const getAllAgents = async (req: Request, res: Response) => {
  try {
    const agents = await Agent.find({});
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching agents' });
  }
};

export const uploadCSV = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const records: any[] = [];

    const parser = parse({
      columns: true,
      skip_empty_lines: true
    });

    parser.on('readable', function() {
      let record;
      while ((record = parser.read()) !== null) {
        records.push({
          firstName: record.FirstName,
          phone: record.Phone,
          notes: record.Notes
        });
      }
    });

    parser.on('error', function(err) {
      console.error(err);
      res.status(400).json({ error: 'Error parsing CSV file' });
    });

    parser.on('end', async function() {
      try {
        const agents = await Agent.find({});
        const tasksPerAgent = Math.ceil(records.length / agents.length);
        
        for (let i = 0; i < agents.length; i++) {
          const start = i * tasksPerAgent;
          const end = Math.min(start + tasksPerAgent, records.length);
          const agentTasks = records.slice(start, end);
          
          await Agent.findByIdAndUpdate(
            agents[i]._id,
            { $set: { assignedTasks: agentTasks } },
            { new: true }
          );
        }
        
        res.json({ message: 'Tasks distributed successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Error distributing tasks' });
      }
    });

    Readable.from(fileBuffer).pipe(parser);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}; 