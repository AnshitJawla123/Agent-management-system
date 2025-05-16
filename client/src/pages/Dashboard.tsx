import React, { useState, useEffect, useCallback } from 'react';
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
  AlertColor,
  IconButton
} from '@mui/material';
import { createAgent, getAllAgents, uploadCSV } from '../services/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; // Import App CSS

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

interface AlertMessage {
  message: string;
  severity: AlertColor;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<AlertMessage | null>(null);
  const [newAgent, setNewAgent] = useState<NewAgent>({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<NewAgent>>({});

  const fetchAgents = useCallback(async () => {
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
  }, [navigate]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

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
      setAlertState({
        message: 'Agent created successfully',
        severity: 'success'
      });
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
      setAlertState({
        message: 'Tasks distributed successfully',
        severity: 'success'
      });
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

  const handleCloseAlert = () => {
    setAlertState(null);
  };

  if (loading) {
    return (
      <Container sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'var(--background-light)'
      }}>
        <CircularProgress sx={{ color: 'var(--primary-color)' }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }} className="app-container">
      <Box className="main-content">
        <Box className="dashboard-header">
          <Typography variant="h4" component="h1" className="dashboard-heading">
            Agent Management Dashboard
          </Typography>
          <Box className="dashboard-actions">
            <Button
              variant="contained"
              component="label"
              sx={{ 
                backgroundColor: 'var(--primary-color)',
                '&:hover': {
                  backgroundColor: 'var(--primary-dark)',
                }
              }}
              className="btn btn-primary"
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
              sx={{ 
                backgroundColor: 'var(--secondary-color)',
                '&:hover': {
                  backgroundColor: '#d81b60',
                }
              }}
              className="btn btn-secondary"
            >
              Add Agent
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleLogout}
              sx={{
                borderColor: 'var(--error-color)',
                color: 'var(--error-color)',
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.04)',
                  borderColor: '#d32f2f'
                }
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>

        {error && (
          <Box className="alert alert-error" sx={{ mb: 3 }}>
            {error}
            <IconButton 
              size="small" 
              aria-label="close" 
              onClick={() => setError(null)}
              sx={{ ml: 2, padding: '4px' }}
            >
              ✕
            </IconButton>
          </Box>
        )}

        <Paper className="paper" elevation={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Mobile Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Assigned Tasks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {agents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No agents found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  agents.map((agent) => (
                    <TableRow key={agent._id} hover>
                      <TableCell>{agent.name}</TableCell>
                      <TableCell>{agent.email}</TableCell>
                      <TableCell>{agent.mobileNumber}</TableCell>
                      <TableCell>
                        <Box sx={{ 
                          display: 'inline-block',
                          backgroundColor: 'var(--primary-light)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontWeight: 500,
                          fontSize: '0.85rem',
                          minWidth: '24px',
                          textAlign: 'center'
                        }}>
                          {agent.assignedTasks.length}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

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
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'var(--primary-color)',
          fontWeight: 600,
          fontSize: '1.25rem',
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 24px'
        }}>
          Add New Agent
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <Box className="form-container">
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
              className="form-input"
              sx={{ mb: 2 }}
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
              className="form-input"
              sx={{ mb: 2 }}
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
              className="form-input"
              sx={{ mb: 2 }}
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
              className="form-input"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          padding: '16px 24px',
          borderTop: '1px solid var(--border-color)'
        }}>
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
            sx={{ 
              color: 'var(--text-secondary)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateAgent}
            sx={{ 
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'var(--primary-dark)'
              }
            }}
            className="btn btn-primary"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!alertState}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertState?.severity || 'info'}
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '4px' 
          }}
        >
          {alertState?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;