const express = require('express');
const incidentController = require('./incident.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken);

// Routes principales pour les incidents
router.get('/', incidentController.getIncidents);
router.get('/statistics', incidentController.getIncidentStatistics);
router.get('/visitor/:visitorId', incidentController.getIncidentsByVisitor);
router.post('/', incidentController.createIncident);
router.get('/:id', incidentController.getIncidentById);
router.put('/:id', incidentController.updateIncident);
router.patch('/:id/resolve', incidentController.resolveIncident);
router.delete('/:id', incidentController.deleteIncident);

module.exports = router;
