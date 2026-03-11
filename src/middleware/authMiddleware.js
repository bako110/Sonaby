const jwt = require('jsonwebtoken');
const { appConfig } = require('../config/appConfig');
const { AppError } = require('./errorHandler');
const { prisma } = require('../config/prisma');

// Middleware d'authentification amélioré
const authenticateToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return next(new AppError(401, 'Access denied. No token provided.'));
        }

        let decoded;
        try {
            // Vérifie et décode le token
            decoded = jwt.verify(token, appConfig.jwtSecret);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new AppError(401, 'Token expired. Please login again.'));
            } else if (err.name === 'JsonWebTokenError') {
                return next(new AppError(401, 'Invalid token.'));
            } else {
                return next(new AppError(401, 'Authentication error.'));
            }
        }

        // Vérifie que le token contient bien l'identifiant
        if (!decoded.userId) {
            return next(new AppError(401, 'Invalid token payload.'));
        }

        // Charger l'utilisateur depuis Prisma
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                assignedSites: {
                    include: {
                        site: {
                            include: {
                                checkpoints: true, // checkpoints sont dans Site
                            },
                        },
                    },
                },
                assignedCheckpoints: {
                    include: { site: true },
                },
            },
        });

        if (!user) {
            return next(new AppError(401, 'User not found.'));
        }

        // Injecter uniquement les infos nécessaires dans req.user
        req.user = {
            userId: user.id,
            role: user.role,
            email: user.email,
            assignedSites: user.assignedSites,
            assignedCheckpoints: user.assignedCheckpoints,
        };

        next();
    } catch (error) {
        console.error("AUTH ERROR:", error);
        return next(new AppError(500, 'Internal server error.'));
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
