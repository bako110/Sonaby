const { z } = require('zod');

/**
 * ===============================
 * Helpers
 * ===============================
 */

// Transforme "" ou "   " en null
const nullableString = () =>
  z
    .string()
    .optional()
    .nullable()
    .transform(v => (typeof v === 'string' && v.trim() === '' ? null : v));

/**
 * ===============================
 * Validations simples
 * ===============================
 */

// Accepter n'importe quelle chaîne pour les valeurs du frontend
const checkpointStatusValidation = nullableString();
const checkpointTypeValidation = nullableString();
const checkpointPriorityValidation = nullableString();
const controlFrequencyValidation = nullableString();

/**
 * ===============================
 * Création Checkpoint
 * ===============================
 */

const createCheckpointSchema = z.object({
  // Infos de base
  name: z.string().min(1, 'Le nom du checkpoint est requis'),
  description: nullableString(),
  siteId: z.string().min(1, "L'ID du site est requis"),

  // Localisation
  zone: nullableString(),
  building: nullableString(),
  floor: nullableString(),
  coordinatesLatitude: nullableString(),
  coordinatesLongitude: nullableString(),

  // Agent
  agentId: nullableString(),

  // Statut / configuration
  checkpointType: checkpointTypeValidation,
  status: checkpointStatusValidation,
  priority: checkpointPriorityValidation,
  controlFrequency: controlFrequencyValidation,

  // Équipements
  equipment: z.array(z.string()).default([]),
  devicesId: z.array(z.string()).default([]),

  // Instructions
  specialInstructions: nullableString(),

  // État
  active: z.boolean()
});

/**
 * ===============================
 * Mise à jour (tout optionnel)
 * ===============================
 */

const updateCheckpointSchema = createCheckpointSchema.partial();

/**
 * ===============================
 * ID Checkpoint
 * ===============================
 */

const checkpointIdSchema = z.object({
  id: z.string().min(1, 'ID de checkpoint requis')
});

/**
 * ===============================
 * Filtres / Query
 * ===============================
 */

const checkpointQuerySchema = z
  .object({
    search: nullableString(),
    siteId: z.string().uuid().optional().nullable(),
    zone: nullableString(),

    checkpointType: checkpointTypeValidation,
    status: checkpointStatusValidation,
    priority: checkpointPriorityValidation,

    agentId: z.string().uuid().optional().nullable(),

    dateCreationDebut: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .nullable(),

    dateCreationFin: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .nullable(),

    avecAgent: z.enum(['true', 'false']).optional().nullable(),
    enAlerte: z.enum(['true', 'false']).optional().nullable(),

    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10)
  })
  .refine(data => {
    if (data.dateCreationDebut && data.dateCreationFin) {
      return new Date(data.dateCreationDebut) <= new Date(data.dateCreationFin);
    }
    return true;
  }, {
    message: 'La date de début ne peut pas être après la date de fin',
    path: ['dateCreationDebut']
  });

/**
 * ===============================
 * Assignation Agent
 * ===============================
 */

const assignAgentSchema = z.object({
  agentId: z.string().min(1, "L'ID de l'agent est requis")
});

const unassignAgentSchema = z.object({
  agentId: z.string().uuid({ message: "L'ID de l'agent doit être un UUID valide" })
});

/**
 * ===============================
 * Exports
 * ===============================
 */

module.exports = {
  createCheckpointSchema,
  updateCheckpointSchema,
  checkpointIdSchema,
  checkpointQuerySchema,
  assignAgentSchema,
  unassignAgentSchema
};
