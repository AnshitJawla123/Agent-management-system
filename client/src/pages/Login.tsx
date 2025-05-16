import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography, Paper } from '@mui/material';
import { login } from '../services/api';
import axios, { AxiosError } from 'axios';
import '../App.css'; // Import the app CSS

interface LoginError {
  error: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    
    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }

      const response = await login(email, password);
      localStorage.setItem('token', response.token);
      navigate('/dashboard');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<LoginError>;
        const errorMessage = axiosError.response?.data?.error || 'Login failed. Please try again.';
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs" className="app-container">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          justifyContent: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}
          className="paper"
        >
          <Typography 
            component="h1" 
            variant="h5" 
            align="center" 
            gutterBottom
            sx={{ 
              color: 'var(--primary-color)',
              fontWeight: 600,
              marginBottom: '1.5rem' 
            }}
          >
            Admin Login
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }} className="form-container">
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!error}
              sx={{
                marginBottom: '1.25rem',
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'var(--primary-color)',
                  },
                },
              }}
              className="form-input"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error}
              sx={{
                marginBottom: '1.25rem',
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'var(--primary-color)',
                  },
                },
              }}
              className="form-input"
            />
            {error && (
              <Box className="alert alert-error" sx={{ mt: 2, mb: 2 }}>
                {error}
              </Box>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                backgroundColor: 'var(--primary-color)',
                '&:hover': {
                  backgroundColor: 'var(--primary-dark)',
                },
                padding: '0.75rem',
                textTransform: 'uppercase',
                fontWeight: 500,
                borderRadius: '4px'
              }}
              className="btn btn-primary"
            >
              Sign In
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 