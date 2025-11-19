const { z } = require('zod');

// Pattern d'email plus permissif qui accepte la plupart des emails valides
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validation d'email réutilisable
const emailValidation = z.string()
    .min(1, 'Email is required')
    .regex(emailPattern, 'Invalid email format');

// Validation d'email optionnelle
const optionalEmailValidation = z.string()
    .regex(emailPattern, 'Invalid email format')
    .optional();

module.exports = {
    emailValidation,
    optionalEmailValidation,
    emailPattern
};
