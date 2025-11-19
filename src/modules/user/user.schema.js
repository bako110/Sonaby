const { z } = require('zod');
const { emailValidation, optionalEmailValidation } = require('../../utils/validation');

const createUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: emailValidation,
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE']).optional().default('AGENT_CONTROLE'),
  phone: z.string().optional(),
  isActive: z.boolean().optional().default(true)
});

const updateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: optionalEmailValidation,
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE']).optional(),
  isActive: z.boolean().optional()
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters")
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