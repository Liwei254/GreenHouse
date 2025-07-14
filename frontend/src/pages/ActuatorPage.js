import React, { useEffect, useState } from 'react';
import { Typography, Grid, Card, CardContent, Switch, FormControlLabel, Button, Box } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';

const ActuatorPage = () => {
  const [actuatorState, setActuatorState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deviceId, setDeviceId] = useState('device1'); // Placeholder deviceId

  const fetchActuatorState = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/actuators/${deviceId}`);
      setActuatorState(response.data);
    } catch (error) {
      console.error('Error fetching actuator state:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActuatorState();
  }, [deviceId]);

  const handleToggle = (field) => async (event) => {
    const newValue = event.target.checked;
    try {
      const response = await axios.put(`http://localhost:5000/api/actuators/${deviceId}`, {
        [field]: newValue,
      });
      setActuatorState(response.data.data);
    } catch (error) {
      console.error('Error updating actuator state:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <img src="/logo192.png" alt="Logo" style={{ height: 40, marginRight: 16 }} />
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Actuator Control
        </Typography>
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={fetchActuatorState} disabled={loading}>
          Refresh
        </Button>
      </Box>
      {loading ? (
        <Typography>Loading actuator state...</Typography>
      ) : !actuatorState ? (
        <Typography>No actuator state found for device {deviceId}</Typography>
      ) : (
        <Grid container spacing={2}>
          {['waterPump', 'fan', 'growLights', 'manualOverride'].map((field) => (
            <Grid item xs={12} sm={6} md={3} key={field}>
              <Card>
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!actuatorState[field]}
                        onChange={handleToggle(field)}
                        name={field}
                        color="primary"
                      />
                    }
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ActuatorPage;
