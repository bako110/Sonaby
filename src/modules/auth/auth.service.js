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
        const { identifier, password } = data;
        
        console.log('🔍 [LOGIN DEBUG] Tentative de connexion');
        console.log('  - Identifier:', identifier);
        console.log('  - Password provided:', password ? 'YES' : 'NO');
        
        // Déterminer si l'identifier est un email ou un téléphone
        const isEmail = identifier.includes('@');
        console.log('  - Is email:', isEmail);
        
        // Trouver l'utilisateur par email ou téléphone
        const user = await prisma.user.findFirst({
            where: isEmail 
                ? { email: identifier }
                : { phone: identifier },
            select: {
                id: true,
                email: true,
                phone: true,
                passwordHash: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        });
        
        console.log('🔍 [LOGIN DEBUG] Utilisateur trouvé:', user ? 'YES' : 'NO');
        if (user) {
            console.log('  - User ID:', user.id);
            console.log('  - Email:', user.email);
            console.log('  - Phone:', user.phone);
            console.log('  - Role:', user.role);
            console.log('  - Is active:', user.isActive);
        }
        
        if (!user || !user.isActive) {
            console.log('❌ [LOGIN DEBUG] Utilisateur non trouvé ou inactif');
            throw new AppError(401, 'Invalid credentials');
        }
        
        // Vérifier le mot de passe
        console.log('🔍 [LOGIN DEBUG] Vérification du mot de passe...');
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        console.log('  - Password valid:', isPasswordValid);
        
        if (!isPasswordValid) {
            console.log('❌ [LOGIN DEBUG] Mot de passe invalide');
            throw new AppError(401, 'Invalid credentials');
        }
        
        // Générer les tokens
        const tokens = await this.generateTokens(user.id, user.role);
        
        // Retourner les données utilisateur sans le mot de passe
        const { passwordHash, ...userWithoutPassword } = user;
        
        // Si c'est un agent de contrôle, inclure les données complètes du dashboard
        let additionalData = {};
        if (user.role === 'AGENT_CONTROLE') {
            try {
                additionalData.dashboard = await this.getAgentDashboardData(user.id);
            } catch (error) {
                // Si erreur lors de la récupération des données dashboard, log mais ne pas bloquer la connexion
                console.error('Erreur lors de la récupération des données dashboard:', error.message);
                // ✅ CORRECTION : Retourner un dashboard vide avec des valeurs à 0 au lieu de null
                additionalData.dashboard = {
                    agent: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        phone: user.phone,
                        role: user.role,
                        permissions: []
                    },
                    assignedCheckpoint: null,
                    site: null,
                    visitors: [],
                    visits: [],
                    statistics: {
                        activeVisits: 0,
                        todayVisits: 0,
                        activeCheckpoints: 0,
                        blacklistedVisitors: 0,
                        totalCheckpoints: 0,
                        totalVisitors: 0,
                        checkpointEfficiency: '0%'
                    }
                };
            }
        }
        
        return {
            user: userWithoutPassword,
            ...tokens,
            ...additionalData
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
        // Access Token (24 heures)
        const accessToken = jwt.sign(
            { userId, role },
            appConfig.jwtSecret,
            { expiresIn: '24h' }
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

    // Tableau de bord complet pour agent de contrôle
    async getAgentDashboardData(userId) {
    console.log("🔍 DEBUG → Chargement dashboard agent:", userId);

    // 1️⃣ Charger l'utilisateur + sites
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
            permissions: {
                select: {
                    permission: { select: { name: true, description: true } }
                }
            },
            assignedSites: {
                select: {
                    site: { select: { id: true, name: true, city: true, address: true } }
                }
            }
        }
    });

    if (!user) {
        throw new AppError(404, "Agent non trouvé");
    }

    // 2️⃣ Récupérer checkpoint assigné via AgentCheckpointAssignment
    console.log("🔍 DEBUG → Recherche assignment checkpoint…");

    const assignments = await prisma.agentCheckpointAssignment.findMany({
        where: { userId },
        include: {
            checkpoint: {
                include: {
                    site: {
                        select: { id: true, name: true, city: true, address: true }
                    },
                    _count: { select: { visits: true, sosAlerts: true } }
                }
            }
        }
    });

    let agentCheckpoint = assignments.length > 0 ? assignments[0].checkpoint : null;

    console.log(
        "🔍 DEBUG → Checkpoint trouvé via assignment:",
        agentCheckpoint ? agentCheckpoint.name : "AUCUN"
    );

    // 3️⃣ Si aucun checkpoint via assignment → utiliser les sites assignés
    if (!agentCheckpoint && user.assignedSites.length > 0) {
        const siteId = user.assignedSites[0].site.id;

        console.log("🔍 DEBUG → Lookup checkpoint par site assigné →", siteId);

        agentCheckpoint = await prisma.checkpoint.findFirst({
            where: { siteId },
            include: {
                site: { select: { id: true, name: true, city: true, address: true } },
                _count: { select: { visits: true, sosAlerts: true } }
            }
        });

        console.log(
            "🔍 DEBUG → Checkpoint par site:",
            agentCheckpoint ? agentCheckpoint.name : "AUCUN"
        );
    }

    // 4️⃣ Si toujours rien → tableau vide
    if (!agentCheckpoint) {
        return {
            agent: {
                ...user,
                permissions: user.permissions.map(p => p.permission)
            },
            site: null,
            assignedCheckpoint: null,
            visitors: [],
            visits: [],
            statistics: {
                activeVisits: 0,
                todayVisits: 0,
                activeCheckpoints: 0,
                blacklistedVisitors: 0,
                totalCheckpoints: 0,
                totalVisitors: 0,
                checkpointEfficiency: "0%"
            }
        };
    }

    // 5️⃣ Récupérer visiteurs + visites du checkpoint
    const [visitors, visits] = await Promise.all([
        prisma.visitor.findMany({
            where: {
                visits: { some: { checkpointId: agentCheckpoint.id } }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
                isBlacklisted: true,
                createdAt: true,
                _count: {
                    select: {
                        visits: { where: { checkpointId: agentCheckpoint.id } }
                    }
                }
            },
            distinct: ["id"],
            orderBy: { createdAt: "desc" }
        }),

        prisma.visit.findMany({
            where: { checkpointId: agentCheckpoint.id },
            include: {
                visitor: true,
                checkpoint: true
            },
            orderBy: { createdAt: "desc" },
            take: 50
        })
    ]);

    // 6️⃣ Statistiques
    const [activeVisitsCount, todayVisitsCount, blacklistedVisitorsCount] = await Promise.all([
        prisma.visit.count({
            where: { checkpointId: agentCheckpoint.id, status: "ACTIVE" }
        }),
        prisma.visit.count({
            where: {
                checkpointId: agentCheckpoint.id,
                entryTime: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }
        }),
        prisma.visitor.count({
            where: {
                isBlacklisted: true,
                visits: { some: { checkpointId: agentCheckpoint.id } }
            }
        })
    ]);

    return {
        agent: {
            ...user,
            permissions: user.permissions.map(p => p.permission)
        },
        site: agentCheckpoint.site,
        assignedCheckpoint: {
            ...agentCheckpoint,
            totalVisits: agentCheckpoint._count.visits,
            totalSOSAlerts: agentCheckpoint._count.sosAlerts
        },
        visitors: visitors.map(v => ({
            ...v,
            checkpointVisitCount: v._count.visits
        })),
        visits,
        statistics: {
            activeVisits: activeVisitsCount,
            todayVisits: todayVisitsCount,
            activeCheckpoints: 1,
            blacklistedVisitors: blacklistedVisitorsCount,
            totalCheckpoints: 1,
            totalVisitors: visitors.length,
            checkpointEfficiency:
                agentCheckpoint._count.visits > 0
                    ? `${((activeVisitsCount / agentCheckpoint._count.visits) * 100).toFixed(2)}%`
                    : "0%"
        }
    };
}

}

const authService = new AuthService();
module.exports = { authService };
