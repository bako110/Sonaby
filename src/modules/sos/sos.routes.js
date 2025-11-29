const express = require('express');
const sosController = require('./sos.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken);

router.get('/', sosController.getAllSOS);
router.get('/active', sosController.getActiveSOS);
router.get('/stats', sosController.getSOSStats);
router.post('/', sosController.createSOS);
router.post('/general', sosController.createGeneralSOS);
router.get('/:id', sosController.getSOSById);
router.patch('/:id', sosController.deactivateSOS);

module.exports = router;
