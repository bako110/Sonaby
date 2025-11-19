const express = require('express');
const incidentController = require('./incident.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken);

router.get('/', incidentController.getAllIncidents);
router.post('/', incidentController.createIncident);
router.get('/:id', incidentController.getIncidentById);
router.delete('/:id', incidentController.deleteIncident);

module.exports = router;
