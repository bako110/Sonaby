const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../../config/prisma');
const { appConfig } = require('../../config/appConfig');
const { AppError } = require('../../middleware/errorHandler');

class AuthService {
    // Inscription
    async register(data) {
        const { email, password, firstName, lastName, role } = data;
        
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        
        if (existingUser) {
            throw new AppError(400, 'User already exists with this email');
        }
        
        // Hasher le mot de passe
        const passwordHash = await bcrypt.hash(password, 12);
        
        // Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                role: role || 'AGENT_GESTION'
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true
            }
        });
        
        // Générer les tokens
        const tokens = await this.generateTokens(user.id, user.role);
        
        return {
            user,
            ...tokens
        };
    }
    
    // Connexion
    async login(data) {
        const { email, password } = data;
        
        // Trouver l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                passwordHash: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });
        
        if (!user || !user.isActive) {
            throw new AppError(401, 'Invalid credentials');
        }
        
        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new AppError(401, 'Invalid credentials');
        }
        
        // Générer les tokens
        const tokens = await this.generateTokens(user.id, user.role);
        
        // Retourner les données utilisateur sans le mot de passe
        const { passwordHash, ...userWithoutPassword } = user;
        
        return {
            user: userWithoutPassword,
            ...tokens
        };
    }
    
    // Rafraîchir le token
    async refreshToken(data) {
        const { refreshToken } = data;
        
        try {
            // Vérifier le refresh token
            const decoded = jwt.verify(refreshToken, appConfig.refreshTokenSecret);
            
            // Trouver le token en base
            const storedToken = await prisma.refreshToken.findUnique({
                where: { token: refreshToken },
                include: { user: true }
            });
            
            if (!storedToken || storedToken.expiresAt < new Date()) {
                throw new AppError(401, 'Invalid refresh token');
            }
            
            // Supprimer l'ancien refresh token
            await prisma.refreshToken.delete({
                where: { id: storedToken.id }
            });
            
            // Générer de nouveaux tokens
            const tokens = await this.generateTokens(storedToken.userId, storedToken.user.role);
            
            return tokens;
        } catch (error) {
            throw new AppError(401, 'Invalid refresh token');
        }
    }
    
    // Déconnexion
    async logout(refreshToken) {
        await prisma.refreshToken.deleteMany({
            where: { token: refreshToken }
        });
    }
    
    // Générer les tokens JWT
    async generateTokens(userId, role) {
        // Access Token (15 minutes)
        const accessToken = jwt.sign(
            { userId, role },
            appConfig.jwtSecret,
            { expiresIn: '15m' }
        );
        
        // Refresh Token (7 jours)
        const refreshToken = jwt.sign(
            { userId },
            appConfig.refreshTokenSecret,
            { expiresIn: '7d' }
        );
        
        // Stocker le refresh token en base
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
            }
        });
        
        return {
            accessToken,
            refreshToken
        };
    }

    // Récupérer le profil utilisateur
    async getUserProfile(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                phone: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        return user;
    }
}

const authService = new AuthService();
module.exports = { authService };
