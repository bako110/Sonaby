const { z } = require('zod');
const { emailValidation, optionalEmailValidation } = require('../../utils/validation');

const createUserSchema = z.object({
  matricule: z.string()
    .min(1, 'Le matricule est requis')
    .max(50, 'Le matricule ne peut pas dépasser 50 caractères')
    .optional(),
  firstName: z.string()
    .min(1, "First name is required")
    .max(100, "First name cannot exceed 100 characters"),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(100, "Last name cannot exceed 100 characters"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores")
    .optional(),
  email: emailValidation,
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters"),
  role: z.enum(['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'])
    .optional()
    .default('AGENT_CONTROLE'),
  phone: z.string()
    .regex(/^[0-9+\-\s()]{10,20}$/, "Phone number must be valid")
    .optional()
    .or(z.literal('')),
  isActive: z.boolean()
    .optional()
    .default(true),
  assignedSites: z.array(
    z.string().uuid('ID de site invalide (doit être un UUID)')
  ).optional().default([]),
  permissions: z.array(
    z.string().min(1, 'Nom de permission invalide')
  ).default([])
});

const updateUserSchema = z.object({
  matricule: z.string()
    .min(1, 'Le matricule est requis')
    .max(50, 'Le matricule ne peut pas dépasser 50 caractères')
    .optional()
    .or(z.literal('')),
  firstName: z.string()
    .min(1, "First name is required")
    .max(100, "First name cannot exceed 100 characters")
    .optional(),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(100, "Last name cannot exceed 100 characters")
    .optional(),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores")
    .optional()
    .or(z.literal('')),
  email: optionalEmailValidation,
  phone: z.string()
    .regex(/^[0-9+\-\s()]{10,20}$/, "Phone number must be valid")
    .optional()
    .or(z.literal('')),
  role: z.enum(['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'])
    .optional(),
  isActive: z.boolean()
    .optional(),
  assignedSites: z.array(
    z.string().uuid('ID de site invalide (doit être un UUID)')
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

module.exports = {
  createUserSchema,
  updateUserSchema,
  updatePasswordSchema,
  updateAuthSettingsSchema
};