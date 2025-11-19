const express = require('express');
const visitController = require('./visit.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/visits:
 *   get:
 *     summary: Récupérer toutes les visites
 *     tags: [Visites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des visites
 */
router.get('/', visitController.getAllVisits);
router.get('/stats', visitController.getVisitStats);
router.get('/active', visitController.getActiveVisits);
router.post('/', visitController.createVisit);
router.get('/:id', visitController.getVisitById);
router.patch('/:id/checkout', visitController.checkoutVisit);
router.delete('/:id', visitController.deleteVisit);

module.exports = router;
