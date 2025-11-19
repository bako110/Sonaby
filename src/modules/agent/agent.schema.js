const { z } = require('zod');
const { emailValidation, optionalEmailValidation } = require('../../utils/validation');

const createAgentSchema = z.object({
  firstname: z.string().min(1, 'Le prénom est requis').max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  lastname: z.string().min(1, 'Le nom est requis').max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  email: emailValidation,
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  checkpointId: z.string().cuid('ID de checkpoint invalide').optional()
});

const updateAgentSchema = z.object({
  firstname: z.string().min(1, 'Le prénom est requis').max(50, 'Le prénom ne peut pas dépasser 50 caractères').optional(),
  lastname: z.string().min(1, 'Le nom est requis').max(50, 'Le nom ne peut pas dépasser 50 caractères').optional(),
  email: optionalEmailValidation,
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional(),
  checkpointId: z.string().cuid('ID de checkpoint invalide').optional().nullable()
});

const agentIdSchema = z.object({
  id: z.string().cuid('ID d\'agent invalide')
});

const agentQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  checkpointId: z.string().cuid().optional()
});

module.exports = {
  createAgentSchema,
  updateAgentSchema,
  agentIdSchema,
  agentQuerySchema
};
