import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';
import SensorPage from './pages/SensorPage';
import ActuatorPage from './pages/ActuatorPage';
import DevicePage from './pages/DevicePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <CssBaseline />
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/sensors" replace />} />
          <Route path="/sensors" element={<SensorPage />} />
          <Route path="/actuators" element={<ActuatorPage />} />
          <Route path="/devices" element={<DevicePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
