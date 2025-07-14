import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth tokens or user info here
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Smart Agriculture Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={Link} to="/sensors">
            Sensors
          </Button>
          <Button color="inherit" component={Link} to="/actuators">
            Actuators
          </Button>
          <Button color="inherit" component={Link} to="/devices">
            Devices
          </Button>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
