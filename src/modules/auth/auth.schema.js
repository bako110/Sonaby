const { z } = require('zod');
const { emailValidation } = require('../../utils/validation');

const registerSchema = z.object({
    email: emailValidation,
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    role: z.enum(['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE']).optional()
});

const loginSchema = z.object({
    identifier: z.string()
        .min(1, 'Email ou téléphone requis')
        .describe('Email ou numéro de téléphone pour la connexion'),
    password: z.string()
        .min(1, 'Mot de passe requis')
        .describe('Mot de passe de l\'utilisateur')
});

const resetPasswordByAdminSchema = z.object({
    newPassword: z.string()
        .min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères')
        .max(100, 'Le mot de passe est trop long')
});

const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
});

module.exports = {
    registerSchema,
    loginSchema,
    resetPasswordByAdminSchema,
    refreshTokenSchema
};
