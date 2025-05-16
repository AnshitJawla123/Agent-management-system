import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { createAgent, getAllAgents, uploadCSV } from '../services/api';

interface Agent {
  _id: string;
  name: string;
  email: string;
  mobileNumber: string;
  assignedTasks: Array<{
    firstName: string;
    phone: string;
    notes: string;
  }>;
}

const Dashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const data = await getAllAgents();
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleCreateAgent = async () => {
    try {
      await createAgent(newAgent);
      setOpenDialog(false);
      setNewAgent({ name: '', email: '', mobileNumber: '', password: '' });
      fetchAgents();
    } catch (error) {
      console.error('Error creating agent:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await uploadCSV(file);
        fetchAgents();
      } catch (error) {
        console.error('Error uploading CSV:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Agent Management Dashboard
        </Typography>
        <Box>
          <Button
            variant="contained"
            component="label"
            sx={{ mr: 2 }}
          >
            Upload CSV
            <input
              type="file"
              hidden
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
            />
          </Button>
          <Button
            variant="contained"
            onClick={() => setOpenDialog(true)}
          >
            Add Agent
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Mobile Number</TableCell>
              <TableCell>Assigned Tasks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent._id}>
                <TableCell>{agent.name}</TableCell>
                <TableCell>{agent.email}</TableCell>
                <TableCell>{agent.mobileNumber}</TableCell>
                <TableCell>{agent.assignedTasks.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Agent</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newAgent.name}
            onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={newAgent.email}
            onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Mobile Number"
            fullWidth
            value={newAgent.mobileNumber}
            onChange={(e) => setNewAgent({ ...newAgent, mobileNumber: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={newAgent.password}
            onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateAgent}>Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 