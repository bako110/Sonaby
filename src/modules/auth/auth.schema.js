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
    email: emailValidation,
    password: z.string().min(1, 'Password is required')
});

const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
});

module.exports = {
    registerSchema,
    loginSchema,
    refreshTokenSchema
};
