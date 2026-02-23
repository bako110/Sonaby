const { z } = require('zod');
const { emailValidation, optionalEmailValidation } = require('../../utils/validation');

const createUserSchema = z.object({
  firstName: z.string()
    .min(1, "First name is required")
    .max(100, "First name cannot exceed 100 characters"),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(100, "Last name cannot exceed 100 characters"),
  username: z.string()
    .optional()
    .nullable(),
  email: optionalEmailValidation,
  
  email: emailValidation,
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters"),
  role: z.enum(['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'])
    .optional()
    .default('AGENT_CONTROLE'),
  phone: z.string().optional().or(z.literal('')).nullable(),
  isActive: z.boolean()
    .optional()
    .default(true),
  assignedSites: z.array(
    z.union([
      z.string().uuid('ID de site invalide (doit être un UUID)'),
      z.object({
        site: z.object({
          id: z.string().uuid('ID de site invalide (doit être un UUID)'),
          name: z.string().optional(),
          city: z.string().optional()
        })
      }),
      z.object({
        id: z.string().uuid('ID de site invalide (doit être un UUID)'),
        name: z.string().optional()
      }),
      z.record(z.string(), z.unknown()) // Accepter n'importe quel objet
    ])
  ).optional().default([]),
  permissions: z.array(
    z.string().min(1, 'Nom de permission invalide')
  ).default([])
});

const updateUserSchema = z.object({
  firstName: z.string()
    .min(1, "First name is required")
    .max(100, "First name cannot exceed 100 characters")
    .optional(),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(100, "Last name cannot exceed 100 characters")
    .optional(),
  username: z.string()
    .optional()
    .nullable(),
  email: optionalEmailValidation,
  phone: z.string().optional().or(z.literal('')).nullable(),
  role: z.enum(['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'])
    .optional(),
  isActive: z.boolean()
    .optional(),
  assignedSites: z.array(
    z.union([
      z.string().uuid('ID de site invalide (doit être un UUID)'),
      z.object({
        site: z.object({
          id: z.string().uuid('ID de site invalide (doit être un UUID)'),
          name: z.string().optional(),
          city: z.string().optional()
        })
      }),
      z.object({
        id: z.string().uuid('ID de site invalide (doit être un UUID)'),
        name: z.string().optional()
      }),
      z.record(z.string(), z.unknown()) // Accepter n'importe quel objet
    ])
  ).optional(),
  permissions: z.array(
    z.string().min(1, 'Nom de permission invalide')
  ).optional()
});

const updatePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, "Current password is required"),
  newPassword: z.string()
    .min(6, "New password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters")
});

const updateAuthSettingsSchema = z.object({
  twoFactorEnabled: z.boolean().optional(),
  biometricEnabled: z.boolean().optional(),
  preferredAuthMethod: z.enum(['PASSWORD', 'FACE_ID', 'FINGERPRINT', 'BIOMETRIC', 'QR_CODE']).optional()
});

const userFilterSchema = z.object({
  // 🔍 Recherche globale (cherche dans plusieurs champs)
  search: z.string().optional(),
  
  // 🏷️ Filtres spécifiques
  role: z.enum(['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE']).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  
  // 🏢 Filtres relationnels
  siteId: z.string().uuid().optional(), // Utilisateurs assignés à un site spécifique
  
  // 📊 Pagination
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  updatePasswordSchema,
  updateAuthSettingsSchema,
  userFilterSchema 
};