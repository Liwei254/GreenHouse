const express = require('express');

let latestCommands = {
  fan: false,
  bulb: false,
  pump: false,
  tap: false,
};

// Store sensor data in MongoDB
const Sensor = require('../models/Sensor');

exports.receiveSensorData = async (req, res) => {
  try {
    const {
      temp,
      hum,
      ldr,
      soil,
      water,
      fan,
      bulb,
      pump,
      servo
    } = req.body;

    // For simplicity, deviceId is hardcoded or can be passed in req.body if available
    const deviceId = req.body.deviceId || 'esp32-device';

    // Create sensor data document
    const sensorData = new Sensor({
      deviceId,
      temperature: temp,
      humidity: hum,
      soilMoisture: soil,
      lightIntensity: ldr,
      batteryLevel: 0, // No battery info from ESP32 code
      timestamp: new Date()
    });

    await sensorData.save();

    // Optionally update actuator states based on received data
    latestCommands.fan = fan === 1;
    latestCommands.bulb = bulb === 1;
    latestCommands.pump = pump === 1;
    latestCommands.tap = servo === 1;

    res.status(200).json({ message: 'Data received' });
  } catch (error) {
    console.error('Error receiving sensor data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getActuatorCommands = (req, res) => {
  res.status(200).json(latestCommands);
};

exports.updateActuatorCommands = (req, res) => {
  latestCommands = req.body;
  res.status(200).json({ message: 'Commands updated' });
};
