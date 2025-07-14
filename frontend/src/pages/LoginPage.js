import React, { useState } from 'react';
import { Typography, TextField, Button, Box, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      // Save token or user info as needed
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      navigate('/sensors');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8}>
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          required
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
      </form>
    </Box>
  );
};

export default LoginPage;
