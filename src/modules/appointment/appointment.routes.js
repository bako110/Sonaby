const express = require('express');
const appointmentController = require('./appointment.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken);

router.get('/', appointmentController.getAllAppointments);
router.post('/', appointmentController.createAppointment);
router.get('/:id', appointmentController.getAppointmentById);
router.get('/:id/qr-code', appointmentController.generateQRCode);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);
/**
 * @swagger
 * tags:
 *   name: Rendezvous
 *   description: Gestion des rendez-vous
 */

/**
 * @swagger
 * /rendezvous/site/{siteId}:
 *   get:
 *     summary: Récupère tous les rendez-vous d'un site
 *     tags: [Rendezvous]
 *     parameters:
 *       - in: path
 *         name: siteId
 *         schema:
 *           type: string
 *         required: true
 *         description: L'ID du site pour lequel récupérer les rendez-vous
 *     responses:
 *       200:
 *         description: Liste des rendez-vous du site
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       office:
 *                         type: string
 *                       serviceName:
 *                         type: string
 *                       reason:
 *                         type: string
 *                       visitDate:
 *                         type: string
 *                         format: date-time
 *                       startTime:
 *                         type: string
 *                       endTime:
 *                         type: string
 *                       status:
 *                         type: string
 *                       notes:
 *                         type: string
 *                       organizer:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           role:
 *                             type: string
 *                       site:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           address:
 *                             type: string
 *                           city:
 *                             type: string
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Erreur lors de la récupération des rendez-vous
 */
router.get('/site/:siteId', appointmentController.getBySite);

module.exports = router;
