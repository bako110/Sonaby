const express = require('express');
const checkpointController = require('./checkpoint.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     AssignAgentRequest:
 *       type: object
 *       required:
 *         - agentId
 *       properties:
 *         agentId:
 *           type: string
 *           description: ID de l'agent à assigner au checkpoint
 *           example: "990e8400-e29b-41d4-a716-446655440001"
 *       example:
 *         agentId: "990e8400-e29b-41d4-a716-446655440001"
 *     Checkpoint:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID unique du checkpoint
 *           example: "770e8400-e29b-41d4-a716-446655440001"
 *         name:
 *           type: string
 *           description: Nom du checkpoint
 *           example: "Checkpoint Entrée Principale"
 *         siteId:
 *           type: string
 *           format: uuid
 *           description: ID du site associé
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         sosId:
 *           type: string
 *           description: Identifiant unique pour les alertes SOS
 *           example: "SOS-ENT-001"
 *         description:
 *           type: string
 *           description: Description du checkpoint
 *           example: "Point de contrôle principal à l'entrée du site"
 *         zone:
 *           type: string
 *           description: Zone du checkpoint
 *           example: "Entrée principale"
 *         building:
 *           type: string
 *           description: Bâtiment où se trouve le checkpoint
 *           example: "Bâtiment A"
 *         floor:
 *           type: string
 *           description: Étage du checkpoint
 *           example: "Rez-de-chaussée"
 *         status:
 *           type: string
 *           enum: ["active", "inactive", "maintenance", "error"]
 *           description: Statut du checkpoint
 *           example: "active"
 *         checkpointType:
 *           type: string
 *           enum: ["entry", "exit", "internal", "external", "emergency", "patrol"]
 *           description: Type de checkpoint
 *           example: "entry"
 *         priority:
 *           type: string
 *           enum: ["low", "medium", "high", "critical"]
 *           description: Priorité du checkpoint
 *           example: "high"
 *         controlFrequency:
 *           type: string
 *           enum: ["hourly", "daily", "weekly", "monthly", "on_demand"]
 *           description: Fréquence de contrôle
 *           example: "daily"
 *         specialInstructions:
 *           type: string
 *           description: Instructions spéciales pour ce checkpoint
 *           example: "Vérifier les badges visiteurs"
 *         active:
 *           type: boolean
 *           description: Le checkpoint est-il actif ?
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *           example: "2024-01-15T08:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de mise à jour
 *           example: "2024-11-24T15:30:00.000Z"
 *         site:
 *           $ref: '#/components/schemas/Site'
 *         coordinatesLatitude:
 *           type: string
 *           description: Latitude du checkpoint
 *           example: "12.345678"
 *         coordinatesLongitude:
 *           type: string
 *           description: Longitude du checkpoint
 *           example: "-1.234567"
 *         agentId:
 *           type: string
 *           description: ID de l'agent assigné
 *           example: "990e8400-e29b-41d4-a716-446655440001"
 *         equipment:
 *           type: array
 *           description: Équipements du checkpoint
 *           items:
 *             type: string
 *           example: ["Badgeuse", "Caméra", "Détecteur"]
 *     CreateCheckpointRequest:
 *       type: object
 *       required:
 *         - name
 *         - siteId
 *         - sosId
 *         - checkpointType
 *         - status
 *         - priority
 *         - controlFrequency
 *         - active
 *       properties:
 *         name:
 *           type: string
 *           description: Nom du checkpoint
 *           maxLength: 100
 *           example: "Checkpoint Entrée Principale"
 *         siteId:
 *           type: string
 *           format: uuid
 *           description: ID du site associé
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         sosId:
 *           type: string
 *           description: Identifiant unique pour les alertes SOS
 *           maxLength: 100
 *           example: "SOS-ENT-001"
 *         description:
 *           type: string
 *           description: Description du checkpoint
 *           example: "Point de contrôle principal à l'entrée du site"
 *         zone:
 *           type: string
 *           description: Zone du checkpoint
 *           maxLength: 100
 *           example: "Entrée principale"
 *         building:
 *           type: string
 *           description: Bâtiment où se trouve le checkpoint
 *           maxLength: 100
 *           example: "Bâtiment A"
 *         floor:
 *           type: string
 *           description: Étage du checkpoint
 *           maxLength: 50
 *           example: "Rez-de-chaussée"
 *         coordinatesLatitude:
 *           type: string
 *           description: Latitude du checkpoint
 *           example: "12.345678"
 *         coordinatesLongitude:
 *           type: string
 *           description: Longitude du checkpoint
 *           example: "-1.234567"
 *         agentId:
 *           type: string
 *           description: ID de l'agent assigné
 *           example: "990e8400-e29b-41d4-a716-446655440001"
 *         status:
 *           type: string
 *           enum: ["active", "inactive", "maintenance", "error"]
 *           description: Statut du checkpoint
 *           example: "active"
 *         checkpointType:
 *           type: string
 *           enum: ["entry", "exit", "internal", "external", "emergency", "patrol"]
 *           description: Type de checkpoint
 *           example: "entry"
 *         priority:
 *           type: string
 *           enum: ["low", "medium", "high", "critical"]
 *           description: Priorité du checkpoint
 *           example: "high"
 *         controlFrequency:
 *           type: string
 *           enum: ["hourly", "daily", "weekly", "monthly", "on_demand"]
 *           description: Fréquence de contrôle
 *           example: "daily"
 *         equipment:
 *           type: array
 *           description: Équipements du checkpoint
 *           items:
 *             type: string
 *           example: ["Badgeuse", "Caméra"]
 *         specialInstructions:
 *           type: string
 *           description: Instructions spéciales pour ce checkpoint
 *           example: "Vérifier les badges visiteurs"
 *         active:
 *           type: boolean
 *           description: Le checkpoint est-il actif ?
 *           example: true
 *       example:
 *         name: "Checkpoint Entrée Principale"
 *         siteId: "550e8400-e29b-41d4-a716-446655440001"
 *         sosId: "SOS-ENT-001"
 *         description: "Point de contrôle principal à l'entrée du site"
 *         zone: "Entrée principale"
 *         building: "Bâtiment A"
 *         floor: "Rez-de-chaussée"
 *         coordinatesLatitude: "12.345678"
 *         coordinatesLongitude: "-1.234567"
 *         agentId: "990e8400-e29b-41d4-a716-446655440001"
 *         status: "active"
 *         checkpointType: "entry"
 *         priority: "high"
 *         controlFrequency: "daily"
 *         equipment: ["Badgeuse", "Caméra"]
 *         specialInstructions: "Vérifier les badges visiteurs"
 *         active: true
 *     UpdateCheckpointRequest:
 *       type: object
 *       description: Données pour mettre à jour un checkpoint (tous les champs sont optionnels)
 *       additionalProperties: false
 *       properties:
 *         name:
 *           type: string
 *           description: Nouveau nom du checkpoint
 *           maxLength: 100
 *           example: "Checkpoint Entrée Principale - Rénové"
 *         siteId:
 *           type: string
 *           format: uuid
 *           description: ID du nouveau site associé
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         sosId:
 *           type: string
 *           description: Nouvel identifiant unique pour les alertes SOS
 *           maxLength: 100
 *           example: "SOS-ENT-001-V2"
 *         description:
 *           type: string
 *           description: Description du checkpoint
 *           example: "Point de contrôle principal après rénovation"
 *         zone:
 *           type: string
 *           description: Zone du checkpoint
 *           example: "Entrée principale"
 *         building:
 *           type: string
 *           description: Bâtiment où se trouve le checkpoint
 *           example: "Bâtiment A"
 *         floor:
 *           type: string
 *           description: Étage du checkpoint
 *           example: "Rez-de-chaussée"
 *         status:
 *           type: string
 *           enum: ["active", "inactive", "maintenance", "error"]
 *           description: Statut du checkpoint
 *           example: "active"
 *         checkpointType:
 *           type: string
 *           enum: ["entry", "exit", "internal", "external", "emergency", "patrol"]
 *           description: Type de checkpoint
 *           example: "entry"
 *         priority:
 *           type: string
 *           enum: ["low", "medium", "high", "critical"]
 *           description: Priorité du checkpoint
 *           example: "high"
 *         controlFrequency:
 *           type: string
 *           enum: ["hourly", "daily", "weekly", "monthly", "on_demand"]
 *           description: Fréquence de contrôle
 *           example: "daily"
 *         coordinatesLatitude:
 *           type: string
 *           description: Latitude du checkpoint
 *           example: "12.345678"
 *         coordinatesLongitude:
 *           type: string
 *           description: Longitude du checkpoint
 *           example: "-1.234567"
 *         agentId:
 *           type: string
 *           description: ID de l'agent assigné
 *           example: "990e8400-e29b-41d4-a716-446655440001"
 *         equipment:
 *           type: array
 *           description: Équipements du checkpoint
 *           items:
 *             type: string
 *           example: ["Badgeuse", "Caméra"]
 *         specialInstructions:
 *           type: string
 *           description: Instructions spéciales pour ce checkpoint
 *           example: "Vérifier les badges visiteurs"
 *         active:
 *           type: boolean
 *           description: Le checkpoint est-il actif ?
 *           example: true
 *       example:
 *         name: "Checkpoint Entrée Principale - Rénové"
 *         siteId: "550e8400-e29b-41d4-a716-446655440001"
 *         sosId: "SOS-ENT-001-V2"
 *         description: "Point de contrôle principal après rénovation"
 *         zone: "Entrée principale"
 *         building: "Bâtiment A"
 *         floor: "Rez-de-chaussée"
 *         coordinatesLatitude: "12.345678"
 *         coordinatesLongitude: "-1.234567"
 *         agentId: "990e8400-e29b-41d4-a716-446655440001"
 *         status: "active"
 *         checkpointType: "entry"
 *         priority: "high"
 *         controlFrequency: "daily"
 *         equipment: ["Badgeuse", "Caméra"]
 *         specialInstructions: "Vérifier les badges visiteurs"
 *         active: true
 */

/**
 * @swagger
 * /api/checkpoints:
 *   get:
 *     summary: Récupérer tous les checkpoints
 *     tags: [Checkpoints]
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
 *         description: Recherche par nom ou identifiant SOS
 *       - in: query
 *         name: siteId
 *         schema:
 *           type: string
 *         description: Filtrer par site
 *     responses:
 *       200:
 *         description: Liste des checkpoints
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Checkpoint'
 *                 pagination:
 *                   type: object
 */
router.get('/', checkpointController.getAllCheckpoints);

/**
 * @swagger
 * /api/checkpoints/stats:
 *   get:
 *     summary: Statistiques des checkpoints
 *     tags: [Checkpoints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques des checkpoints
 */
router.get('/stats', checkpointController.getCheckpointStats);

/**
 * @swagger
 * /api/checkpoints:
 *   post:
 *     summary: Créer un nouveau checkpoint
 *     tags: [Checkpoints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCheckpointRequest'
 *     responses:
 *       201:
 *         description: Checkpoint créé avec succès
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
 *                   $ref: '#/components/schemas/Checkpoint'
 *       403:
 *         description: Accès refusé - ADMIN ou AGENT_GESTION requis
 *       400:
 *         description: Données invalides ou identifiant SOS déjà utilisé
 */
router.post('/', checkpointController.createCheckpoint);

/**
 * @swagger
 * /api/checkpoints/{id}:
 *   get:
 *     summary: Récupérer un checkpoint par ID
 *     tags: [Checkpoints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du checkpoint
 *     responses:
 *       200:
 *         description: Détails du checkpoint
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Checkpoint'
 *       404:
 *         description: Checkpoint non trouvé
 */
router.get('/:id', checkpointController.getCheckpointById);

/**
 * @swagger
 * /api/checkpoints/{id}:
 *   put:
 *     summary: 🔧 Mettre à jour un checkpoint
 *     description: |
 *       Met à jour les informations d'un checkpoint existant.
 *       
 *       **Permissions requises :** ADMIN ou AGENT_GESTION
 *       
 *       **Champs modifiables :**
 *       - Nom du checkpoint
 *       - Site associé
 *       - Identifiant SOS (doit être unique)
 *     tags: [Checkpoints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID unique du checkpoint à modifier
 *         example: "770e8400-e29b-41d4-a716-446655440001"
 *     requestBody:
 *       required: true
 *       description: Données de mise à jour du checkpoint
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCheckpointRequest'
 *           examples:
 *             update_name:
 *               summary: Modifier le nom
 *               value:
 *                 name: "Nouveau nom du checkpoint"
 *             update_site:
 *               summary: Changer de site
 *               value:
 *                 siteId: "550e8400-e29b-41d4-a716-446655440002"
 *             update_sos:
 *               summary: Modifier l'identifiant SOS
 *               value:
 *                 sosId: "SOS-NEW-001"
 *             update_status:
 *               summary: Changer le statut uniquement
 *               value:
 *                 status: "maintenance"
 *             update_active:
 *               summary: Activer/Désactiver le checkpoint
 *               value:
 *                 active: false
 *             complete_update:
 *               summary: Mise à jour complète
 *               value:
 *                 name: "Checkpoint Entrée Principale - Rénové"
 *                 siteId: "550e8400-e29b-41d4-a716-446655440001"
 *                 sosId: "SOS-ENT-001-V2"
 *     responses:
 *       200:
 *         description: ✅ Checkpoint mis à jour avec succès
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
 *                   example: "Checkpoint mis à jour avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Checkpoint'
 *             example:
 *               success: true
 *               message: "Checkpoint mis à jour avec succès"
 *               data:
 *                 id: "770e8400-e29b-41d4-a716-446655440001"
 *                 name: "Checkpoint Entrée Principale - Rénové"
 *                 siteId: "550e8400-e29b-41d4-a716-446655440001"
 *                 sosId: "SOS-ENT-001-V2"
 *                 createdAt: "2024-11-24T08:00:00Z"
 *                 updatedAt: "2024-11-24T15:30:00Z"
 *       400:
 *         description: ❌ Données invalides
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
 *             examples:
 *               sos_exists:
 *                 summary: Identifiant SOS déjà utilisé
 *                 value:
 *                   success: false
 *                   message: "Identifiant SOS déjà utilisé par un autre checkpoint"
 *               invalid_site:
 *                 summary: Site inexistant
 *                 value:
 *                   success: false
 *                   message: "Site non trouvé"
 *       403:
 *         description: ❌ Accès refusé
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
 *                   example: "Accès refusé. Seuls les administrateurs et agents de gestion peuvent modifier les checkpoints."
 *       404:
 *         description: ❌ Checkpoint non trouvé
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
 *                   example: "Checkpoint non trouvé"
 */
router.put('/:id', checkpointController.updateCheckpoint);

/**
 * @swagger
 * /api/checkpoints/{id}:
 *   delete:
 *     summary: Supprimer un checkpoint
 *     tags: [Checkpoints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du checkpoint
 *     responses:
 *       200:
 *         description: Checkpoint supprimé avec succès
 *       403:
 *         description: Accès refusé - ADMIN ou AGENT_GESTION requis
 *       404:
 *         description: Checkpoint non trouvé
 *       400:
 *         description: Checkpoint a des visites associées
 */
router.delete('/:id', checkpointController.deleteCheckpoint);

/**
 * @swagger
 * /api/checkpoints/{id}/assign-agent:
 *   post:
 *     summary: Assigner un agent à un checkpoint
 *     description: |
 *       Assigne un agent à un checkpoint en utilisant la table AgentCheckpointAssignment.
 *       Plusieurs agents peuvent être assignés au même checkpoint en appelant cet endpoint plusieurs fois.
 *       
 *       **Permissions requises :** ADMIN ou AGENT_GESTION
 *       
 *       **Fonctionnement :**
 *       - L'agent doit avoir le rôle AGENT_CONTROLE
 *       - Utilise upsert pour éviter les doublons
 *       - Ajoute l'agent sans remplacer les affectations existantes
 *     tags: [Checkpoints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du checkpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignAgentRequest'
 *           example:
 *             agentId: "990e8400-e29b-41d4-a716-446655440001"
 *     responses:
 *       200:
 *         description: ✅ Agent assigné avec succès
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
 *                   example: "Agent assigné avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Checkpoint'
 *       403:
 *         description: ❌ Accès refusé
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
 *                   example: "Accès refusé. Seuls les administrateurs et agents de gestion peuvent assigner des agents."
 *       404:
 *         description: ❌ Checkpoint ou agent non trouvé
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
 *                   example: "Agent non trouvé"
 */
router.post('/:id/assign-agent', checkpointController.assignAgent);

/**
 * @swagger
 * /api/checkpoints/{id}/agents:
 *   get:
 *     summary: Récupérer les agents assignés à un checkpoint
 *     description: |
 *       Retourne la liste de tous les agents assignés à un checkpoint spécifique.
 *       
 *       **Fonctionnement :**
 *       - Affiche seulement les affectations actives (endDate = null)
 *       - Inclut les informations complètes des agents
 *       - Trié par date d'assignation (plus récent d'abord)
 *     tags: [Checkpoints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du checkpoint
 *     responses:
 *       200:
 *         description: ✅ Liste des agents récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     checkpointId:
 *                       type: string
 *                       example: "770e8400-e29b-41d4-a716-446655440001"
 *                     checkpointName:
 *                       type: string
 *                       example: "Entrée Principale"
 *                     totalAgents:
 *                       type: integer
 *                       example: 3
 *                     agents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           assignmentId:
 *                             type: string
 *                             example: "assignment-uuid"
 *                           assignedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-11-28T08:30:00.000Z"
 *                           agent:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "agent-uuid"
 *                               firstName:
 *                                 type: string
 *                                 example: "Jean"
 *                               lastName:
 *                                 type: string
 *                                 example: "Dupont"
 *                               email:
 *                                 type: string
 *                                 example: "jean.dupont@example.com"
 *                               phone:
 *                                 type: string
 *                                 example: "+225 XX XX XX XX"
 *       404:
 *         description: ❌ Checkpoint non trouvé
 *       403:
 *         description: ❌ Accès refusé
 */
router.get('/:id/agents', checkpointController.getCheckpointAgents);

/**
 * @swagger
 * /api/checkpoints/{id}/sos:
 *   post:
 *     summary: Envoyer une alerte SOS depuis un checkpoint
 *     tags: [Checkpoints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du checkpoint
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SOSRequest'
 *     responses:
 *       201:
 *         description: SOS envoyé avec succès
 *       404:
 *         description: Checkpoint non trouvé
 *       400:
 *         description: Un SOS est déjà actif pour ce checkpoint
 */
router.post('/:id/sos', checkpointController.sendSOS);

module.exports = router;
