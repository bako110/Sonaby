const { z } = require('zod');

const createCheckpointSchema = z.object({
  name: z.string().min(1, 'Le nom du checkpoint est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  siteId: z.string().cuid('ID de site invalide'),
  sosIdentifier: z.string().min(1, 'L\'identifiant SOS est requis').max(50, 'L\'identifiant SOS ne peut pas dépasser 50 caractères')
});

const updateCheckpointSchema = z.object({
  name: z.string().min(1, 'Le nom du checkpoint est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères').optional(),
  siteId: z.string().cuid('ID de site invalide').optional(),
  sosIdentifier: z.string().min(1, 'L\'identifiant SOS est requis').max(50, 'L\'identifiant SOS ne peut pas dépasser 50 caractères').optional()
});

const checkpointIdSchema = z.object({
  id: z.string().cuid('ID de checkpoint invalide')
});

const checkpointQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  siteId: z.string().cuid().optional()
});

const assignAgentSchema = z.object({
  agentId: z.string().cuid('ID d\'agent invalide')
});

const sosSchema = z.object({
  message: z.string().optional()
});

module.exports = {
  createCheckpointSchema,
  updateCheckpointSchema,
  checkpointIdSchema,
  checkpointQuerySchema,
  assignAgentSchema,
  sosSchema
};
