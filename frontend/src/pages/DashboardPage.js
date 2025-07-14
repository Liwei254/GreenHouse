import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const DashboardPage = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [actuatorState, setActuatorState] = useState(null);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingSensor, setLoadingSensor] = useState(false);
  const [loadingActuator, setLoadingActuator] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/devices`
        );
        setDevices(response.data);
        if (response.data.length > 0) {
          setSelectedDeviceId(response.data[0].deviceId);
        }
      } catch (error) {
        console.error("Error fetching devices:", error);
      } finally {
        setLoadingDevices(false);
      }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    if (!selectedDeviceId) return;

    const fetchSensorData = async () => {
      setLoadingSensor(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/sensors/${selectedDeviceId}/latest`
        );
        setSensorData(response.data);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        setSensorData(null);
      } finally {
        setLoadingSensor(false);
      }
    };

    const fetchActuatorState = async () => {
      setLoadingActuator(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/actuators/${selectedDeviceId}`
        );
        setActuatorState(response.data);
      } catch (error) {
        console.error("Error fetching actuator state:", error);
        setActuatorState(null);
      } finally {
        setLoadingActuator(false);
      }
    };

    fetchSensorData();
    fetchActuatorState();
  }, [selectedDeviceId]);

  const handleDeviceSelect = (deviceId) => {
    setSelectedDeviceId(deviceId);
  };

  const handleToggle = (field) => async (event) => {
    const newValue = event.target.checked;
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/actuators/${selectedDeviceId}`,
        {
          [field]: newValue,
        }
      );
      setActuatorState(response.data.data);
    } catch (error) {
      console.error("Error updating actuator state:", error);
    }
  };

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      <Grid item xs={12} md={3}>
        <Typography variant="h5" gutterBottom>
          Devices
        </Typography>
        <Paper style={{ maxHeight: 400, overflow: "auto" }}>
          {loadingDevices ? (
            <CircularProgress />
          ) : (
            <List>
              {devices.length > 0 ? (
                devices.map((device) => (
                  <ListItem
                    button
                    key={device._id}
                    selected={device.deviceId === selectedDeviceId}
                    onClick={() => handleDeviceSelect(device.deviceId)}
                  >
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
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} md={9}>
        <Typography variant="h5" gutterBottom>
          Device Details
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Sensor Data</Typography>
            {loadingSensor ? (
              <CircularProgress />
            ) : sensorData ? (
              <Grid container spacing={2}>
                {[
                  { label: "Temperature", value: sensorData.temperature, unit: "°C" },
                  { label: "Humidity", value: sensorData.humidity, unit: "%" },
                  { label: "Soil Moisture", value: sensorData.soilMoisture, unit: "%" },
                  { label: "Light Intensity", value: sensorData.lightIntensity, unit: "lx" },
                  { label: "Battery Level", value: sensorData.batteryLevel, unit: "%" },
                ].map(({ label, value, unit }) => (
                  <Grid item xs={12} sm={6} key={label}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1">{label}</Typography>
                        <Typography variant="h6">
                          {value !== undefined ? `${value} ${unit}` : "N/A"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>No sensor data available.</Typography>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6">Actuator Control</Typography>
            {loadingActuator ? (
              <CircularProgress />
            ) : actuatorState ? (
              <Grid container spacing={2}>
                {["waterPump", "fan", "growLights", "manualOverride"].map((field) => (
                  <Grid item xs={12} sm={6} key={field}>
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
            ) : (
              <Typography>No actuator state available.</Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default DashboardPage;
