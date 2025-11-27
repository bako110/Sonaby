const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../../middleware/asyncHandler');
const rendezvousController = require('./rendezvous.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Rendezvous:
 *       type: object
 *       required:
 *         - organizerId
 *         - siteId
 *         - firstName
 *         - lastName
 *         - office
 *         - serviceName
 *         - reason
 *         - visitDate
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID unique du rendez-vous
 *         organizerId:
 *           type: string
 *           format: uuid
 *           description: ID de l'organisateur
 *         siteId:
 *           type: string
 *           format: uuid
 *           description: ID du site
 *         firstName:
 *           type: string
 *           description: Prénom de la personne
 *         lastName:
 *           type: string
 *           description: Nom de la personne
 *         office:
 *           type: string
 *           description: Bureau de la personne
 *         serviceName:
 *           type: string
 *           description: Nom du service
 *         reason:
 *           type: string
 *           description: Raison du rendez-vous
 *         visitDate:
 *           type: string
 *           format: date
 *           description: Date de la visite
 *         startTime:
 *           type: string
 *           format: time
 *           description: Heure de début
 *         endTime:
 *           type: string
 *           format: time
 *           description: Heure de fin
 *         status:
 *           type: string
 *           enum: [pending, validated, cancelled]
 *           description: Statut du rendez-vous
 *         notes:
 *           type: string
 *           description: Notes additionnelles
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de mise à jour
 *         organizer:
 *           $ref: '#/components/schemas/User'
 *         site:
 *           $ref: '#/components/schemas/Site'
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         organizerId: "123e4567-e89b-12d3-a456-426614174000"
 *         siteId: "550e8400-e29b-41d4-a716-446655440001"
 *         firstName: "Jean"
 *         lastName: "Dupont"
 *         office: "Bureau 101"
 *         serviceName: "Service Client"
 *         reason: "Rendez-vous d'affaires"
 *         visitDate: "2024-01-15"
 *         startTime: "09:00"
 *         endTime: "10:00"
 *         status: "pending"
 *         notes: "Notes importantes"
 *         createdAt: "2024-01-10T10:00:00Z"
 *         updatedAt: "2024-01-10T10:00:00Z"
 * 
 *     CreateRendezvousRequest:
 *       type: object
 *       required:
 *         - organizerId
 *         - siteId
 *         - firstName
 *         - lastName
 *         - office
 *         - serviceName
 *         - reason
 *         - visitDate
 *       properties:
 *         organizerId:
 *           type: string
 *           format: uuid
 *           description: ID de l'organisateur
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         siteId:
 *           type: string
 *           format: uuid
 *           description: ID du site
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         firstName:
 *           type: string
 *           description: Prénom de la personne
 *           example: "Jean"
 *         lastName:
 *           type: string
 *           description: Nom de la personne
 *           example: "Dupont"
 *         office:
 *           type: string
 *           description: Bureau de la personne
 *           example: "Bureau 101"
 *         serviceName:
 *           type: string
 *           description: Nom du service
 *           example: "Service Client"
 *         reason:
 *           type: string
 *           description: Raison du rendez-vous
 *           example: "Rendez-vous d'affaires"
 *         visitDate:
 *           type: string
 *           format: date
 *           description: Date de la visite
 *           example: "2024-01-15"
 *         startTime:
 *           type: string
 *           format: time
 *           description: Heure de début
 *           example: "09:00"
 *         endTime:
 *           type: string
 *           format: time
 *           description: Heure de fin
 *           example: "10:00"
 *         status:
 *           type: string
 *           enum: [pending, validated, cancelled]
 *           description: Statut du rendez-vous
 *           example: "pending"
 *         notes:
 *           type: string
 *           description: Notes additionnelles
 *           example: "Notes importantes"
 * 
 *     UpdateRendezvousRequest:
 *       type: object
 *       properties:
 *         siteId:
 *           type: string
 *           format: uuid
 *           description: ID du site
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         firstName:
 *           type: string
 *           description: Prénom de la personne
 *           example: "Jean"
 *         lastName:
 *           type: string
 *           description: Nom de la personne
 *           example: "Dupont"
 *         office:
 *           type: string
 *           description: Bureau de la personne
 *           example: "Bureau 101"
 *         serviceName:
 *           type: string
 *           description: Nom du service
 *           example: "Service Client"
 *         reason:
 *           type: string
 *           description: Raison du rendez-vous
 *           example: "Rendez-vous d'affaires"
 *         visitDate:
 *           type: string
 *           format: date
 *           description: Date de la visite
 *           example: "2024-01-15"
 *         startTime:
 *           type: string
 *           format: time
 *           description: Heure de début
 *           example: "09:00"
 *         endTime:
 *           type: string
 *           format: time
 *           description: Heure de fin
 *           example: "10:00"
 *         status:
 *           type: string
 *           enum: [pending, validated, cancelled]
 *           description: Statut du rendez-vous
 *           example: "validated"
 *         notes:
 *           type: string
 *           description: Notes additionnelles
 *           example: "Notes mises à jour"
 */

/**
 * @swagger
 * /api/v1/rendezvous:
 *   post:
 *     summary: Créer un nouveau rendez-vous
 *     tags: [Rendezvous]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRendezvousRequest'
 *     responses:
 *       201:
 *         description: Rendez-vous créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rendez-vous créé avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Rendezvous'
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/', asyncHandler(rendezvousController.createRendezvous));

/**
 * @swagger
 * /api/v1/rendezvous:
 *   get:
 *     summary: Récupérer tous les rendez-vous
 *     tags: [Rendezvous]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche textuelle
 *       - in: query
 *         name: organizerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'organisateur
 *       - in: query
 *         name: firstName
 *         schema:
 *           type: string
 *         description: Prénom de la personne
 *       - in: query
 *         name: lastName
 *         schema:
 *           type: string
 *         description: Nom de la personne
 *       - in: query
 *         name: serviceName
 *         schema:
 *           type: string
 *         description: Nom du service
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, validated, cancelled]
 *         description: Statut du rendez-vous
 *       - in: query
 *         name: visitDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de visite
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Rendez-vous à venir uniquement
 *     responses:
 *       200:
 *         description: Liste des rendez-vous
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rendez-vous récupérés avec succès"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Rendezvous'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', asyncHandler(rendezvousController.getAllRendezvous));

/**
 * @swagger
 * /api/v1/rendezvous/{id}:
 *   get:
 *     summary: Récupérer un rendez-vous par son ID
 *     tags: [Rendezvous]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du rendez-vous
 *     responses:
 *       200:
 *         description: Rendez-vous trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rendez-vous récupéré avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Rendezvous'
 *       404:
 *         description: Rendez-vous non trouvé
 */
router.get('/:id', asyncHandler(rendezvousController.getRendezvousById));

/**
 * @swagger
 * /api/v1/rendezvous/{id}:
 *   put:
 *     summary: Mettre à jour un rendez-vous
 *     tags: [Rendezvous]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du rendez-vous
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRendezvousRequest'
 *     responses:
 *       200:
 *         description: Rendez-vous mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rendez-vous mis à jour avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Rendezvous'
 *       404:
 *         description: Rendez-vous non trouvé
 *       400:
 *         description: Erreur de validation
 */
router.put('/:id', asyncHandler(rendezvousController.updateRendezvous));

/**
 * @swagger
 * /api/v1/rendezvous/{id}:
 *   delete:
 *     summary: Supprimer un rendez-vous
 *     tags: [Rendezvous]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du rendez-vous
 *     responses:
 *       200:
 *         description: Rendez-vous supprimé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rendez-vous supprimé avec succès"
 *       404:
 *         description: Rendez-vous non trouvé
 */
router.delete('/:id', asyncHandler(rendezvousController.deleteRendezvous));

/**
 * @swagger
 * /api/v1/rendezvous/{id}/validate:
 *   post:
 *     summary: Valider un rendez-vous
 *     tags: [Rendezvous]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du rendez-vous
 *     responses:
 *       200:
 *         description: Rendez-vous validé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rendez-vous validé avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Rendezvous'
 *       404:
 *         description: Rendez-vous non trouvé
 */
router.post('/:id/validate', asyncHandler(rendezvousController.validateRendezvous));

/**
 * @swagger
 * /api/v1/rendezvous/{id}/cancel:
 *   post:
 *     summary: Annuler un rendez-vous
 *     tags: [Rendezvous]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du rendez-vous
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Raison de l'annulation
 *                 example: "Le rendez-vous a été annulé pour des raisons personnelles"
 *     responses:
 *       200:
 *         description: Rendez-vous annulé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Rendez-vous annulé avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Rendezvous'
 *       404:
 *         description: Rendez-vous non trouvé
 */
router.post('/:id/cancel', asyncHandler(rendezvousController.cancelRendezvous));

/**
 * @swagger
 * /api/v1/rendezvous/stats:
 *   get:
 *     summary: Récupérer les statistiques des rendez-vous
 *     tags: [Rendezvous]
 *     responses:
 *       200:
 *         description: Statistiques des rendez-vous
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Statistiques récupérées avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Nombre total de rendez-vous
 *                     pending:
 *                       type: integer
 *                       description: Nombre de rendez-vous en attente
 *                     validated:
 *                       type: integer
 *                       description: Nombre de rendez-vous validés
 *                     cancelled:
 *                       type: integer
 *                       description: Nombre de rendez-vous annulés
 *                     today:
 *                       type: integer
 *                       description: Nombre de rendez-vous aujourd'hui
 *                     upcoming:
 *                       type: integer
 *                       description: Nombre de rendez-vous à venir
 */
router.get('/stats', asyncHandler(rendezvousController.getRendezvousStats));

module.exports = router;
