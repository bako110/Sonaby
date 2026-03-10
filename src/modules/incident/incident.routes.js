const express = require('express');
const incidentController = require('./incident.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken);

// Routes principales pour les incidents
router.get('/', incidentController.getIncidents);
router.get('/statistics', incidentController.getIncidentStatistics);
router.get('/visitor/:visitorId', incidentController.getIncidentsByVisitor);
// Nouvelle route : incidents d'un visiteur à partir d'un visitId
router.get('/visit/:visitId/visitor-incidents', incidentController.getIncidentsByVisitIdVisitor);
router.post('/', incidentController.createIncident);
router.get('/:id', incidentController.getIncidentById);
router.patch('/:id', incidentController.updateIncident);
router.patch('/:id/resolve', incidentController.resolveIncident);
router.delete('/:id', incidentController.deleteIncident);
router.get(
    '/checkpoint/:siteId/weekly',
    incidentController.getWeeklyIncidents
);


router.get(
  '/checkpoint/:checkpointId',
  incidentController.getIncidentsByCheckpoint
);

module.exports = router;
