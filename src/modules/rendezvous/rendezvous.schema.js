const { z } = require('zod');

// Enum pour les statuts de rendez-vous
const rendezvousStatusEnum = z.enum(['pending', 'validated', 'cancelled']);

// Schéma de création d'un rendez-vous
const createRendezvousSchema = z.object({
  organizerId: z.string().uuid('ID d\'organisateur invalide'),
  visitorId: z.string().uuid('ID de visiteur invalide').optional(),
  groupCode: z.string().max(100, 'Le code de groupe ne peut pas dépasser 100 caractères').optional(),
  serviceId: z.string().uuid('ID de service invalide'),
  reason: z.string().min(1, 'La raison est requise'),
  visitDate: z.string().date('Date de visite invalide'),
  startTime: z.string().time('Heure de début invalide').optional(),
  endTime: z.string().time('Heure de fin invalide').optional(),
  qrCode: z.string().max(255, 'Le QR code ne peut pas dépasser 255 caractères'),
  status: rendezvousStatusEnum.default('pending').optional(),
  notes: z.string().optional()
});

// Schéma de mise à jour
const updateRendezvousSchema = z.object({
  visitorId: z.string().uuid('ID de visiteur invalide').optional(),
  groupCode: z.string().max(100, 'Le code de groupe ne peut pas dépasser 100 caractères').optional(),
  serviceId: z.string().uuid('ID de service invalide').optional(),
  reason: z.string().min(1, 'La raison est requise').optional(),
  visitDate: z.string().date('Date de visite invalide').optional(),
  startTime: z.string().time('Heure de début invalide').optional(),
  endTime: z.string().time('Heure de fin invalide').optional(),
  status: rendezvousStatusEnum.optional(),
  notes: z.string().optional()
});

// Schéma pour l'ID du rendez-vous
const rendezvousIdSchema = z.object({
  id: z.string().uuid('ID de rendez-vous invalide')
});

// Schéma de requête avec filtres
const rendezvousQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  organizerId: z.string().uuid().optional(),
  visitorId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  status: rendezvousStatusEnum.optional(),
  visitDate: z.string().optional(),
  upcoming: z.string().optional().transform(val => val === 'true' ? true : val === 'false' ? false : undefined)
});

// Schéma pour valider un rendez-vous
const validateRendezvousSchema = z.object({
  status: z.literal('validated')
});

// Schéma pour annuler un rendez-vous
const cancelRendezvousSchema = z.object({
  status: z.literal('cancelled'),
  notes: z.string().optional()
});

module.exports = {
  createRendezvousSchema,
  updateRendezvousSchema,
  rendezvousIdSchema,
  rendezvousQuerySchema,
  validateRendezvousSchema,
  cancelRendezvousSchema,
  // Export de l'énumération pour réutilisation
  rendezvousStatusEnum
};
