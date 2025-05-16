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
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { createAgent, getAllAgents, uploadCSV } from '../services/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

interface NewAgent {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
}

interface ServerError {
  error: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newAgent, setNewAgent] = useState<NewAgent>({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<NewAgent>>({});

  useEffect(() => {
    fetchAgents();
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobileNumber = (number: string): boolean => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(number);
  };

  const validateForm = (): boolean => {
    const errors: Partial<NewAgent> = {};
    let isValid = true;

    if (!newAgent.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!newAgent.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(newAgent.email)) {
      errors.email = 'Invalid email format';
      isValid = false;
    }

    if (!newAgent.mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile number is required';
      isValid = false;
    } else if (!validateMobileNumber(newAgent.mobileNumber)) {
      errors.mobileNumber = 'Invalid mobile number format';
      isValid = false;
    }

    if (!newAgent.password.trim()) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (newAgent.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const data = await getAllAgents();
      setAgents(data);
      setError(null);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        const serverError = error.response.data as ServerError;
        setError(serverError.error || 'Failed to fetch agents');
      } else {
        setError('An unexpected error occurred while fetching agents');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await createAgent(newAgent);
      setOpenDialog(false);
      setNewAgent({
        name: '',
        email: '',
        mobileNumber: '',
        password: '',
      });
      setFormErrors({});
      setSuccessMessage('Agent created successfully');
      await fetchAgents();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        const serverError = error.response.data as ServerError;
        setError(serverError.error || 'Error creating agent');
      } else {
        setError('An unexpected error occurred while creating agent');
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      setError(`Invalid file type. Allowed types are: ${allowedTypes.join(', ')}`);
      return;
    }

    try {
      await uploadCSV(file);
      setSuccessMessage('Tasks distributed successfully');
      await fetchAgents();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        const serverError = error.response.data as ServerError;
        setError(serverError.error || 'Error uploading file');
      } else {
        setError('An unexpected error occurred while uploading file');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

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
            sx={{ mr: 2 }}
          >
            Add Agent
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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
            {agents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No agents found
                </TableCell>
              </TableRow>
            ) : (
              agents.map((agent) => (
                <TableRow key={agent._id}>
                  <TableCell>{agent.name}</TableCell>
                  <TableCell>{agent.email}</TableCell>
                  <TableCell>{agent.mobileNumber}</TableCell>
                  <TableCell>{agent.assignedTasks.length}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setFormErrors({});
          setNewAgent({
            name: '',
            email: '',
            mobileNumber: '',
            password: '',
          });
        }}
      >
        <DialogTitle>Add New Agent</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            required
            value={newAgent.name}
            onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
            error={!!formErrors.name}
            helperText={formErrors.name}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            required
            value={newAgent.email}
            onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
            error={!!formErrors.email}
            helperText={formErrors.email}
          />
          <TextField
            margin="dense"
            label="Mobile Number"
            fullWidth
            required
            value={newAgent.mobileNumber}
            onChange={(e) => setNewAgent({ ...newAgent, mobileNumber: e.target.value })}
            error={!!formErrors.mobileNumber}
            helperText={formErrors.mobileNumber}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            required
            value={newAgent.password}
            onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
            error={!!formErrors.password}
            helperText={formErrors.password}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenDialog(false);
              setFormErrors({});
              setNewAgent({
                name: '',
                email: '',
                mobileNumber: '',
                password: '',
              });
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateAgent}>Create</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />
    </Container>
  );
};

export default Dashboard; 