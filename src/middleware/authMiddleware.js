const jwt = require('jsonwebtoken');
const { appConfig } = require('../config/appConfig');
const { AppError } = require('./errorHandler');

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return next(new AppError(401, 'Access denied. No token provided.'));
        }

        const decoded = jwt.verify(token, appConfig.jwtSecret);

        req.user = decoded;

        next();
    } catch (error) {
        return next(new AppError(401, 'Invalid or expired token.'));
    }
};

// Middleware de vérification des rôles
const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError(401, 'Authentication required.'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError(403, 'Insufficient permissions.'));
        }

        next();
    };
};

module.exports = { authenticateToken, allowRoles };
