const express = require('express');
const nonDesirableController = require('./nondesirable.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/nondesirables:
 *   get:
 *     summary: Lister tous les visiteurs indésirables
 *     tags: [Nondesirables]
 *     security:
 *       - bearerAuth: []
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
 *         description: Terme de recherche
 *     responses:
 *       200:
 *         description: Liste des visiteurs indésirables
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     nondesirables:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Nondesirable'
 *                     pagination:
 *                       type: object
 */
router.get('/', nonDesirableController.getAllNonDesirables);

/**
 * @swagger
 * /api/nondesirables:
 *   post:
 *     summary: Ajouter un visiteur à la liste des indésirables
 *     description: |
 *       Ajouter un visiteur existant à la liste des indésirables.
 *       Cette action va automatiquement:
 *       - Activer `isBlacklisted = true` sur le visiteur
 *       - Ajouter la raison dans `blacklistReason`
 *       - Créer un historique dans BlacklistHistory
 *       - Créer une entrée dans NonDesirable
 *     tags: [Nondesirables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNondesirableInput'
 *           example:
 *             visitorId: "880e8400-e29b-41d4-a716-446655440001"
 *             reason: "Comportement inapproprié lors de la dernière visite"
 *     responses:
 *       201:
 *         description: Visiteur ajouté à la liste des indésirables avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Nondesirable'
 *       400:
 *         description: Erreur de validation ou visiteur déjà dans la liste
 *       404:
 *         description: Visiteur non trouvé (si visitorId fourni)
 */
router.post('/', nonDesirableController.createNonDesirable);

/**
 * @swagger
 * /api/nondesirables/unknown:
 *   post:
 *     summary: Ajouter un indésirable inconnu (ADMIN seulement)
 *     description: |
 *       Permet à l'administrateur d'ajouter une personne à la liste des indésirables
 *       même si elle n'est pas enregistrée comme visiteur dans le système.
 *       Cette action crée directement un historique dans BlacklistHistory sans créer de visiteur.
 *     tags: [Nondesirables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUnknownNondesirableInput'
 *           example:
 *             firstName: "Jean"
 *             lastName: "SUSPECT"
 *             birthDate: "15/06/1980"
 *             birthPlace: "Ouagadougou"
 *             sexe: "M"
 *             givingDate: "01/01/2020"
 *             expirationDate: "01/01/2030"
 *             phone: "+226 70 11 22 33"
 *             email: "suspect@example.com"
 *             idType: "CNI"
 *             idNumber: "B1234567890"
 *             idScanUrl: "https://example.com/scans/suspect123.jpg"
 *             photoUrl: "https://example.com/photos/suspect123.jpg"
 *             company: "Entreprise Suspecte SARL"
 *             nationality: "Burkinabé"
 *             reason: "Comportement suspect signalé par les autorités"
 *             incidentDate: "2024-11-20"
 *             incidentLocation: "Entrée principale"
 *             severityLevel: 3
 *     responses:
 *       201:
 *         description: Indésirable inconnu ajouté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/UnknownNondesirable'
 *       400:
 *         description: Personne déjà dans la liste
 *       403:
 *         description: Accès refusé - ADMIN requis
 */
router.post('/unknown', nonDesirableController.createUnknownNonDesirable);

/**
 * @swagger
 * /api/nondesirables/visitor/{visitorId}:
 *   delete:
 *     summary: Retirer un visiteur de la liste des indésirables (recommandé)
 *     description: |
 *       Retire complètement un visiteur de la liste des indésirables.
 *       Cette action va automatiquement:
 *       - Désactiver `isBlacklisted = false` sur le visiteur
 *       - Supprimer `blacklistReason`
 *       - Créer un historique UNBLACKLIST dans BlacklistHistory
 *       - Supprimer l'entrée NonDesirable
 *     tags: [Nondesirables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: visitorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du visiteur à retirer de la blacklist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: La raison pour laquelle le visiteur est retiré de la blacklist
 *                 example: "Comportement corrigé et approuvé par l'administration"
 *     responses:
 *       200:
 *         description: Visiteur retiré de la liste des indésirables avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Visiteur non trouvé ou pas blacklisté
 */
router.delete('/visitor/:visitorId', nonDesirableController.removeNonDesirable);


/**
 * @swagger
 * /api/nondesirables/{id}:
 *   delete:
 *     summary: Supprimer une entrée indésirable (sans déblacklister)
 *     description: Supprime seulement l'entrée NonDesirable sans modifier le statut du visiteur
 *     tags: [Nondesirables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'entrée indésirable à supprimer
 *     responses:
 *       200:
 *         description: Entrée supprimée avec succès
 *       404:
 *         description: Entrée indésirable non trouvée
 */
router.delete('/:id', nonDesirableController.deleteNonDesirable);
/**
 * @swagger
 * /api/non-desirables/known:
 *   get:
 *     summary: Lister les visiteurs indésirables connus
 *     description: Retourne tous les visiteurs indésirables liés à un visitorId existant.
 *     tags: [Nondesirables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de la page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d’éléments par page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche par nom, prénom ou matricule
 *     responses:
 *       200:
 *         description: Liste récupérée avec succès
 *       403:
 *         description: Permissions insuffisantes
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/known', nonDesirableController.getKnownNonDesirables);

/**
 * @swagger
 * /api/non-desirables/unknown:
 *   get:
 *     summary: Lister les visiteurs indésirables inconnus
 *     description: Retourne les indésirables sans visitorId (créés manuellement).
 *     tags: [Nondesirables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de la page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d’éléments par page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche textuelle
 *     responses:
 *       200:
 *         description: Liste récupérée avec succès
 *       403:
 *         description: Permissions insuffisantes
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/unknown/list', nonDesirableController.getUnknownNonDesirables);

/**
 * @swagger
 * /visitor/{id}/blacklist-history:
 *   get:
 *     summary: Récupère l'historique de blacklist d'un visiteur
 *     tags:
 *       - NonDesirables
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du visiteur
 *     responses:
 *       200:
 *         description: Historique récupéré avec succès
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
 *                     example: { date: "2025-12-04", action: "Ajouté à la blacklist", user: "ADMIN" }
 *       404:
 *         description: Visiteur non trouvé
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
 *                   example: Visiteur non trouvé
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
 *                   example: Erreur serveur
 */
router.get('/visitor/:id/blacklist-history', nonDesirableController.getBlacklistHistory);

/**
 * @swagger
 * /unknown:
 *   delete:
 *     summary: Supprimer un indésirable non connu de la liste
 *     description: Supprime un indésirable non connu et ajoute une raison dans l'historique.
 *     tags:
 *       - NonDesirable
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reportedBy:
 *                 type: string
 *                 description: ID de l'utilisateur qui fait la suppression
 *               reason:
 *                 type: string
 *                 description: Raison de la suppression
 *             required:
 *               - reportedBy
 *               - reason
 *     responses:
 *       200:
 *         description: Succès de la suppression
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete('/unknown/user', nonDesirableController.removeUnknown);


/**
 * @swagger
 * /api/non_desirables/unknown/{id}:
 *   get:
 *     summary: Récupérer un indésirable inconnu par ID
 *     description: Retourne les détails d’un indésirable non enregistré comme visiteur.
 *     tags: [Nondesirables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l’indésirable inconnu
 *     responses:
 *       200:
 *         description: Détails récupérés avec succès
 *       404:
 *         description: Indésirable non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
router.get('/unknown/:id', nonDesirableController.getUnknownById);


module.exports = router;
