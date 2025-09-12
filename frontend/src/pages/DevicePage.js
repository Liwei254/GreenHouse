import React, { useState } from 'react';
import { Typography, List, ListItem, ListItemText, Paper, Box, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';

const DevicePage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/devices');
      setDevices(response.data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <img src="/logo192.png" alt="Logo" style={{ height: 40, marginRight: 16 }} />
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Devices
        </Typography>
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={fetchDevices} disabled={loading}>
          Refresh
        </Button>
      </Box>
      <Paper>
        <List>
          {devices.length > 0 ? (
            devices.map((device) => (
              <ListItem key={device._id} divider>
                <ListItemText
                  primary={device.name || device.deviceId}
                  secondary={`ID: ${device.deviceId}`}
                />
              </ListItem>
            ))
          ) : (
            <Typography sx={{ p: 2 }}>No devices found.</Typography>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default DevicePage;
