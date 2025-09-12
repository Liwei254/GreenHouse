import React, { useState } from 'react';
import { Typography, Grid, Card, CardContent, Button, Box } from '@mui/material';
import axios from 'axios';

const SensorPage = () => {
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSensorData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://192.168.0.105:5000/api/sensor-data`);
      setSensorData(response.data);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSensorData();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <img src="/logo192.png" alt="Logo" style={{ height: 40, marginRight: 16 }} />
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Sensor Data
        </Typography>
        <Button variant="contained" onClick={fetchSensorData} disabled={loading}>
          Refresh
        </Button>
      </Box>
      {sensorData ? (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Temperature</Typography>
                <Typography>{sensorData.temperature} °C</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Humidity</Typography>
                <Typography>{sensorData.humidity} %</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Soil Moisture</Typography>
                <Typography>{sensorData.soilMoisture} %</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Light Intensity</Typography>
                <Typography>{sensorData.lightIntensity} lx</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Battery Level</Typography>
                <Typography>{sensorData.batteryLevel} %</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Typography>Loading sensor data...</Typography>
      )}
    </Box>
  );
};

export default SensorPage;
