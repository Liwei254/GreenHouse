const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');

router.post('/data', iotController.receiveSensorData);
router.get('/commands', iotController.getActuatorCommands);
router.post('/control', iotController.updateActuatorCommands);

module.exports = router;
