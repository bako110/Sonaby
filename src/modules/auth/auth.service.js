const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../../config/prisma');
const { appConfig } = require('../../config/appConfig');
const { AppError } = require('../../middleware/errorHandler');

class AuthService {
    // Inscription
   async register(data) {
    const { email, username, password, firstName, lastName, role } = data;

    // Vérifier si l'utilisateur existe déjà par email ou username
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                username ? { username } : undefined
            ].filter(Boolean) // enlève les undefined si username n'est pas fourni
        }
    });

    if (existingUser) {
        throw new AppError(400, 'User already exists with this email or username');
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
        data: {
            email,
            username, // ajoute username
            passwordHash,
            firstName,
            lastName,
            role: role || 'AGENT_GESTION'
        },
        select: {
            id: true,
            email: true,
            username: true, // sélectionne username
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

    console.log('🔍 [LOGIN DEBUG] Tentative de connexion avec identifiant:', identifier);

    // Vérifier si c'est un email, téléphone ou username
    const isEmail = identifier.includes('@');
    const isPhone = /^[0-9+\-\s()]{10,20}$/.test(identifier);
    
    // Construire la condition pour rechercher par email, phone OU username
    let whereCondition;
    
    if (isEmail) {
        // Si c'est un email
        whereCondition = { email: identifier };
    } else if (isPhone) {
        // Si c'est un téléphone
        whereCondition = { phone: identifier };
    } else {
        // Sinon, c'est un username (vérifier aussi si c'est vide)
        if (!identifier || identifier.trim() === '') {
            throw new AppError(401, 'Identifiant requis');
        }
        whereCondition = { username: identifier };
    }

    const user = await prisma.user.findFirst({
        where: whereCondition,
        select: {
            id: true,
            email: true,
            phone: true,
            username: true,
            passwordHash: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    });

    console.log('🔍 [LOGIN DEBUG] Utilisateur trouvé:', user ? 'Oui' : 'Non');
    
    if (!user) {
        throw new AppError(401, 'Identifiant ou mot de passe incorrect');
    }

    if (!user.isActive) {
        throw new AppError(403, 'Votre compte est désactivé. Veuillez contacter un administrateur.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new AppError(401, 'Identifiant ou mot de passe incorrect');
    }

    const tokens = await this.generateTokens(user.id, user.role);
    const { passwordHash, ...userWithoutPassword } = user;

    let additionalData = {};

    // ----------------------------------------------------------
    // 1️⃣ AGENT DE CONTRÔLE → dashboard
    // ----------------------------------------------------------
    if (user.role === 'AGENT_CONTROLE') {
        try {
            additionalData.dashboard = await this.getAgentDashboardData(user.id);
        } catch (error) {
            console.error('Erreur lors du dashboard:', error.message);
            additionalData.dashboard = {
                agent: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    username: user.username,
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

    // ----------------------------------------------------------
    // 2️⃣ AGENT_GESTION → Sites assignés + checkpoints
    // ----------------------------------------------------------
    if (user.role === 'AGENT_GESTION') {
        additionalData.sites = await prisma.site.findMany({
            where: {
                manager: user.id
            },
            include: {
                checkpoints: true
            }
        });
    }

    // ----------------------------------------------------------
    // 3️⃣ CHEF_SERVICE → sites dont il est manager
    // ----------------------------------------------------------
    if (user.role === 'CHEF_SERVICE') {
        additionalData.sites = await prisma.site.findMany({
            where: {
                manager: user.id
            },
            include: {
                checkpoints: true,
                assignedUsers: true
            }
        });
    }

    return {
        user: userWithoutPassword,
        ...tokens,
        ...additionalData
    };
  }

  async generateTokens(userId, role) {
    const accessToken = jwt.sign(
      { userId, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Sauvegarder le refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
      }
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer'
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
    async getUserProfile({ userId, email } = {}) {
    // Vérifier qu'au moins un identifiant est fourni
    if (!userId && !email) {
        throw new AppError(400, 'At least one identifier is required');
    }

    // Construire l'objet `where` pour Prisma
    const where = {};
    if (userId) where.id = userId;
    else if (email) where.email = email;

    // Requête Prisma
    const user = await prisma.user.findUnique({
        where,
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

    // 1️⃣ Charger l'utilisateur
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
            }
            // NOTE: On ne charge plus assignedSites ici
        }
    });

    if (!user) {
        throw new AppError(404, "Agent non trouvé");
    }

    // 2️⃣ Récupérer le checkpoint UNIQUEMENT via AgentCheckpointAssignment
    console.log("🔍 DEBUG → Recherche UNIQUE dans AgentCheckpointAssignment…");

    const assignment = await prisma.agentCheckpointAssignment.findFirst({
        where: { 
            userId: userId,
            // Optionnel: vérifier que l'assignation est encore valide
            // OR: [
            //     { endDate: null },
            //     { endDate: { gt: new Date() } }
            // ]
        },
        include: {
            checkpoint: {
                include: {
                    site: {
                        select: { id: true, name: true, city: true, address: true }
                    },
                    _count: { select: { visits: true, sosAlerts: true } }
                }
            }
        },
        orderBy: { startDate: 'desc' } // Prend la plus récente
    });

    console.log("🔍 DEBUG → Assignment trouvé:", assignment ? "OUI" : "NON");

    // 3️⃣ Si AUCUN assignment → tableau vide
    if (!assignment) {
        console.log("⚠️  Aucun checkpoint assigné via AgentCheckpointAssignment");
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

    // Récupérer le checkpoint depuis l'assignment
    const agentCheckpoint = assignment.checkpoint;
    const checkpointId = agentCheckpoint.id; // ← L'ID UNIQUE du checkpoint

    console.log(
        "✅ Checkpoint trouvé via AgentCheckpointAssignment:",
        agentCheckpoint.name,
        "(ID:", checkpointId + ")"
    );

    // 4️⃣ Récupérer visiteurs + visites du checkpoint (avec son ID)
    const [visitors, visits] = await Promise.all([
        prisma.visitor.findMany({
            where: {
                visits: { some: { checkpointId: checkpointId } } // ← Utilise checkpointId
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
                        visits: { where: { checkpointId: checkpointId } } // ← Ici aussi
                    }
                }
            },
            distinct: ["id"],
            orderBy: { createdAt: "desc" }
        }),

        prisma.visit.findMany({
            where: { checkpointId: checkpointId }, // ← Et ici
            include: {
                visitor: true,
                checkpoint: true
            },
            orderBy: { createdAt: "desc" },
            take: 50
        })
    ]);

    // 5️⃣ Statistiques (toujours avec checkpointId)
    const [activeVisitsCount, todayVisitsCount, blacklistedVisitorsCount] = await Promise.all([
        prisma.visit.count({
            where: { checkpointId: checkpointId, status: "ACTIVE" }
        }),
        prisma.visit.count({
            where: {
                checkpointId: checkpointId,
                entryTime: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }
        }),
        prisma.visitor.count({
            where: {
                isBlacklisted: true,
                visits: { some: { checkpointId: checkpointId } }
            }
        })
    ]);

    // 6️⃣ Retourner les données
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
        },
        // Optionnel: retourner l'ID du assignment aussi
        assignmentInfo: {
            assignmentId: assignment.id,
            startDate: assignment.startDate,
            endDate: assignment.endDate
        }
    };
}
}

const authService = new AuthService();
module.exports = { authService };