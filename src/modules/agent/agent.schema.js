const { z } = require('zod');
const { emailValidation, optionalEmailValidation } = require('../../utils/validation');

const createAgentSchema = z.object({
  matricule: z.string().min(1, 'Le matricule est requis').max(50, 'Le matricule ne peut pas dépasser 50 caractères'),
  firstName: z.string().min(1, 'Le prénom est requis').max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  lastName: z.string().min(1, 'Le nom est requis').max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  email: emailValidation,
  phone: z.string().max(20, 'Le téléphone ne peut pas dépasser 20 caractères').optional(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  role: z.enum(['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'], {
    errorMap: () => ({ message: 'Rôle invalide. Valeurs acceptées: ADMIN, AGENT_GESTION, AGENT_CONTROLE, CHEF_SERVICE' })
  }),
  assignedSites: z.array(z.string().uuid('ID de site invalide (doit être un UUID)')).default([]),
  permissions: z.array(z.string().min(1, 'Nom de permission invalide')).default([]),
  checkpointId: z.string().uuid('ID de checkpoint invalide (doit être un UUID)').optional()
});

const updateAgentSchema = z.object({
  matricule: z.string().min(1, 'Le matricule est requis').max(50, 'Le matricule ne peut pas dépasser 50 caractères').optional(),
  firstName: z.string().min(1, 'Le prénom est requis').max(50, 'Le prénom ne peut pas dépasser 50 caractères').optional(),
  lastName: z.string().min(1, 'Le nom est requis').max(50, 'Le nom ne peut pas dépasser 50 caractères').optional(),
  email: optionalEmailValidation,
  phone: z.string().max(20, 'Le téléphone ne peut pas dépasser 20 caractères').optional(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional(),
  role: z.enum(['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'], {
    errorMap: () => ({ message: 'Rôle invalide. Valeurs acceptées: ADMIN, AGENT_GESTION, AGENT_CONTROLE, CHEF_SERVICE' })
  }).optional(),
  assignedSites: z.array(z.string().uuid('ID de site invalide (doit être un UUID)')).optional(),
  permissions: z.array(z.string().min(1, 'Nom de permission invalide')).optional(),
  checkpointId: z.string().uuid('ID de checkpoint invalide (doit être un UUID)').optional().nullable()
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
