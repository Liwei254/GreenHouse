# Greenhouse Automation

An IoT-enabled greenhouse automation system for remote monitoring and control of environmental conditions using sensors and actuators. Built with a Node.js backend (Express, MongoDB) and a React frontend.

---

## Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [Setup & Installation](#setup--installation)
* [API Endpoints](#api-endpoints)
* [Project Structure](#project-structure)
* [Contributing](#contributing)
* [License](#license)

---

## Overview

This project enables automated control and monitoring of greenhouse devices such as water pumps, fans, and grow lights. It integrates sensor data collection with actuator management, allowing both manual override and automatic responses to environmental changes. It also supports real-time alerts and device authentication.

---

## Features

* REST API to manage sensors, actuators, alerts, authentication, and devices
* Real-time actuator state retrieval and updates
* Historical actuator data querying within custom time windows
* IoT device communication endpoint tailored for ESP32 or similar hardware
* React SPA frontend served by Express backend
* Health check endpoint to monitor API and database status
* CORS and logging middleware for smooth development and debugging

---

## Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB (via Mongoose ODM)
* **Frontend:** React (served as static files)
* **Others:** CORS, Winston or custom logger, ESP32 HTTP IoT integration

---

## Setup & Installation

### Prerequisites

* Node.js (v14+)
* MongoDB instance (local or cloud)
* npm or yarn package manager

### Installation Steps

1. Clone the repo:

   ```bash
   git clone https://github.com/yourusername/greenhouse-automation.git
   cd greenhouse-automation
   ```

2. Install backend dependencies:

   ```bash
   npm install
   ```

3. Configure MongoDB connection in `config/db.js`.

4. Build and serve frontend (from `frontend/`):

   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

5. Start the backend server:

   ```bash
   npm start
   ```

6. Access the frontend at `http://localhost:PORT` (default port in your config).

---

## API Endpoints

### Actuators

* **GET** `/api/actuators/:deviceId`
  Retrieve current actuator state for a device.

* **PUT** `/api/actuators/:deviceId`
  Update actuator states (water pump, fan, grow lights, manual override).
  **Body:**

  ```json
  {
    "waterPump": true,
    "fan": false,
    "growLights": true,
    "manualOverride": false
  }
  ```

* **GET** `/api/actuators/history/:deviceId/:hours`
  Fetch actuator state changes for a device within the last X hours.

### Sensors, Alerts, Auth, Devices

* `/api/sensors` - Manage sensor data
* `/api/alerts` - Alert notifications
* `/api/auth` - User/device authentication
* `/api/devices` - Device management

### IoT Device Communication

* `/iot` - Endpoints for ESP32 or similar devices to send data or receive commands.

### Misc

* `/health` - Check server and database health status.

---

## Project Structure

```
/backend
  /config
    db.js            # MongoDB connection
  /middlewares
    errorHandler.js  # Error handling middleware
  /models
    Actuator.js      # Actuator data model
    Sensor.js        # Sensor data model (not shown)
  /routes
    actuatorRoutes.js
    sensorRoutes.js
    alertRoutes.js
    authRoutes.js
    deviceRoutes.js
    iotRoutes.js
  /utils
    logger.js        # Custom logging
  app.js             # Express app initialization
/frontend            # React frontend source
```

---

## Contributing

Contributions are welcome! Please open issues or pull requests for bug fixes, feature requests, or improvements.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
