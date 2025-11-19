const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/user/user.routes');
const fileRoutes = require('../modules/file/file.routes');
const siteRoutes = require('../modules/site/site.routes');
const checkpointRoutes = require('../modules/checkpoint/checkpoint.routes');
const agentRoutes = require('../modules/agent/agent.routes');
const serviceRoutes = require('../modules/service/service.routes');
const visitorRoutes = require('../modules/visitor/visitor.routes');
const visitRoutes = require('../modules/visit/visit.routes');
const appointmentRoutes = require('../modules/appointment/appointment.routes');
const incidentRoutes = require('../modules/incident/incident.routes');
const nonDesirableRoutes = require('../modules/nondesirable/nondesirable.routes');
const sosRoutes = require('../modules/sos/sos.routes');

const router = express.Router();

// Routes des modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/files', fileRoutes);
router.use('/sites', siteRoutes);
router.use('/checkpoints', checkpointRoutes);
router.use('/agents', agentRoutes);
router.use('/services', serviceRoutes);
router.use('/visitors', visitorRoutes);
router.use('/visits', visitRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/incidents', incidentRoutes);
router.use('/nondesirables', nonDesirableRoutes);
router.use('/sos', sosRoutes);

// Route de santé de l'API
router.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'API is healthy',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
