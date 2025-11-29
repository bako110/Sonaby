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
        console.log('🔍 [DEBUG] Récupération dashboard pour userId:', userId);
        
        // 1. Récupérer l'utilisateur avec ses sites assignés
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
                assignedSites: {
                    select: {
                        site: {
                            select: {
                                id: true,
                                name: true,
                                address: true,
                                city: true,
                                postalCode: true,
                                country: true,
                                phone: true,
                                email: true,
                                manager: true,
                                managerPhone: true,
                                managerEmail: true,
                                status: true,
                                coordinates: true,
                                description: true,
                                activityType: true,
                                code: true,
                                region: true,
                                fax: true,
                                website: true,
                                area: true,
                                usableArea: true,
                                employeeCount: true,
                                maxEmployeeCapacity: true,
                                buildingCount: true,
                                creationDate: true,
                                modificationDate: true,
                                openingDate: true,
                                closingDate: true,
                                comments: true,
                                monthlyCost: true,
                                annualBudget: true,
                                certifications: true,
                                lastInspection: true,
                                nextInspection: true,
                                equipment: true,
                                services: true,
                                wheelchairAccessible: true,
                                parkingAvailable: true,
                                parkingSpaces: true,
                                securitySystem: true,
                                securityGuard: true,
                                environmentalCertification: true,
                                energyConsumption: true,
                                createdBy: true,
                                modifiedBy: true,
                                version: true
                            }
                        }
                    }
                },
                permissions: {
                    select: {
                        permission: {
                            select: {
                                name: true,
                                description: true
                            }
                        }
                    }
                }
            }
        });

        console.log('🔍 [DEBUG] Utilisateur trouvé:', user ? 'OUI' : 'NON');
        console.log('🔍 [DEBUG] Sites assignés:', user?.assignedSites?.length || 0);
        
        if (!user) {
            throw new AppError(404, 'Agent non trouvé');
        }

        // 2. Récupérer le checkpoint assigné à cet agent (priorité à assignedCheckpoints)
        console.log('🔍 [DEBUG] Recherche du checkpoint assigné à l\'agent...');
        
        let agentCheckpoint = null;
        
        // Méthode 1: Chercher via assignedCheckpoints (priorité)
        const userWithCheckpoints = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                assignedCheckpoints: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        siteId: true,
                        site: {
                            select: {
                                id: true,
                                name: true,
                                city: true,
                                address: true,
                                postalCode: true,
                                country: true,
                                phone: true,
                                email: true,
                                manager: true,
                                managerPhone: true,
                                managerEmail: true,
                                status: true,
                                coordinates: true,
                                description: true,
                                activityType: true,
                                code: true,
                                region: true,
                                fax: true,
                                website: true,
                                area: true,
                                usableArea: true,
                                employeeCount: true,
                                maxEmployeeCapacity: true,
                                buildingCount: true,
                                creationDate: true,
                                modificationDate: true,
                                openingDate: true,
                                closingDate: true,
                                comments: true,
                                monthlyCost: true,
                                annualBudget: true,
                                certifications: true,
                                lastInspection: true,
                                nextInspection: true,
                                equipment: true,
                                services: true,
                                wheelchairAccessible: true,
                                parkingAvailable: true,
                                parkingSpaces: true,
                                securitySystem: true,
                                securityGuard: true,
                                environmentalCertification: true,
                                energyConsumption: true,
                                createdBy: true,
                                modifiedBy: true,
                                version: true
                            }
                        },
                        _count: {
                            select: {
                                visits: true,
                                sosAlerts: true
                            }
                        }
                    }
                }
            }
        });
        
        if (userWithCheckpoints?.assignedCheckpoints?.length > 0) {
            agentCheckpoint = userWithCheckpoints.assignedCheckpoints[0];
            console.log('✅ [DEBUG] Checkpoint trouvé via assignedCheckpoints:', agentCheckpoint.name);
        } else {
            console.log('⚠️ [DEBUG] Aucun checkpoint trouvé via assignedCheckpoints');
        }
        
        // Méthode 2: Si pas trouvé, chercher via agentId direct (ancienne méthode)
        if (!agentCheckpoint) {
            console.log('🔍 [DEBUG] Recherche via agentId direct...');
            agentCheckpoint = await prisma.checkpoint.findFirst({
                where: { 
                    agentId: userId 
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    siteId: true,
                    site: {
                        select: {
                            id: true,
                            name: true,
                            city: true,
                            address: true,
                            postalCode: true,
                            country: true,
                            phone: true,
                            email: true,
                            manager: true,
                            managerPhone: true,
                            managerEmail: true,
                            status: true,
                            coordinates: true,
                            description: true,
                            activityType: true,
                            code: true,
                            region: true,
                            fax: true,
                            website: true,
                            area: true,
                            usableArea: true,
                            employeeCount: true,
                            maxEmployeeCapacity: true,
                            buildingCount: true,
                            creationDate: true,
                            modificationDate: true,
                            openingDate: true,
                            closingDate: true,
                            comments: true,
                            monthlyCost: true,
                            annualBudget: true,
                            certifications: true,
                            lastInspection: true,
                            nextInspection: true,
                            equipment: true,
                            services: true,
                            wheelchairAccessible: true,
                            parkingAvailable: true,
                            parkingSpaces: true,
                            securitySystem: true,
                            securityGuard: true,
                            environmentalCertification: true,
                            energyConsumption: true,
                            createdBy: true,
                            modifiedBy: true,
                            version: true
                        }
                    },
                    _count: {
                        select: {
                            visits: true,
                            sosAlerts: true
                        }
                    }
                }
            });
            
            console.log('🔍 [DEBUG] Checkpoint via agentId:', agentCheckpoint ? 'TROUVÉ' : 'NON TROUVÉ');
        }

        console.log('🔍 [DEBUG] Checkpoint trouvé:', agentCheckpoint ? 'OUI' : 'NON');
        
        if (agentCheckpoint) {
            console.log('✅ [DEBUG] Checkpoint trouvé:', agentCheckpoint.name);
            console.log('🔍 [DEBUG] Site du checkpoint:', agentCheckpoint.site?.name);
        }

        // Si aucun checkpoint assigné, essayer de trouver via les sites assignés
        if (!agentCheckpoint) {
            console.log('⚠️ [DEBUG] Aucun checkpoint assigné directement - vérification des sites...');
            
            // Vérifier si l'agent a des sites assignés
            if (!user.assignedSites || user.assignedSites.length === 0) {
                console.log('❌ [DEBUG] Aucun site assigné - vérification des UserSite...');
                
                // Vérifier directement dans la table UserSite
                const directUserSites = await prisma.userSite.findMany({
                    where: { userId },
                    include: {
                        site: {
                            select: {
                                id: true,
                                name: true,
                                city: true
                            }
                        }
                    }
                });
                
                console.log('🔍 [DEBUG] UserSite direct:', directUserSites.length, 'trouvés');
                
                if (directUserSites.length === 0) {
                    // Aucun site assigné, retourner un dashboard vide
                    console.log('⚠️ [DEBUG] Aucun site assigné - dashboard vide retourné');
                    return {
                        agent: {
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            phone: user.phone,
                            role: user.role,
                            // ✅ CORRECTION : Gérer le cas où permissions est null/undefined
                            permissions: user.permissions ? user.permissions.map(p => p.permission) : []
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
                
                // Utiliser les sites trouvés directement
                user.assignedSites = directUserSites;
            }

            // Prendre le premier site assigné
            const assignedSite = user.assignedSites[0].site;
            const siteId = assignedSite.id;
            
            console.log('🔍 [DEBUG] Site assigné:', assignedSite.name, '(ID:', siteId, ')');
            console.log('🔍 [DEBUG] Recherche checkpoint sur ce site...');

            // Chercher un checkpoint sur ce site pour cet agent
            agentCheckpoint = await prisma.checkpoint.findFirst({
                where: { 
                    siteId,
                    agentId: userId 
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    zone: true,
                    building: true,
                    floor: true,
                    sosId: true,
                    checkpointType: true,
                    status: true,
                    priority: true,
                    controlFrequency: true,
                    specialInstructions: true,
                    active: true,
                    coordinatesLatitude: true,
                    coordinatesLongitude: true,
                    createdAt: true,
                    site: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                            city: true,
                            phone: true,
                            manager: true,
                            managerPhone: true
                        }
                    },
                    _count: {
                        select: {
                            visits: true,
                            sosAlerts: true
                        }
                    }
                }
            });

            console.log('🔍 [DEBUG] Checkpoint trouvé sur site:', agentCheckpoint ? 'OUI' : 'NON');
            
            if (!agentCheckpoint) {
                console.log('⚠️ [DEBUG] Aucun checkpoint trouvé sur ce site');
            }
        }

        // Afficher les détails complets du checkpoint final
        console.log('🔍 [DEBUG] Détails finaux du checkpoint:');
        console.log('  - ID:', agentCheckpoint.id);
        console.log('  - Nom:', agentCheckpoint.name);
        console.log('  - Site:', agentCheckpoint.site?.name);
        console.log('  - Zone:', agentCheckpoint.zone);
        console.log('  - Total visites:', agentCheckpoint._count?.visits || 0);
        console.log('  - Total SOS:', agentCheckpoint._count?.sosAlerts || 0);

        console.log('🔍 [DEBUG] Récupération des visiteurs et visites...');
        
        const [visitors, visits] = await Promise.all([
            // Visiteurs qui ont passé par le checkpoint de l'agent
            prisma.visitor.findMany({
                where: {
                    visits: {
                        some: {
                            checkpointId: agentCheckpoint.id
                        }
                    }
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    idType: true,
                    idNumber: true,
                    isBlacklisted: true,
                    blacklistReason: true,
                    createdAt: true,
                    _count: {
                        select: {
                            visits: {
                                where: {
                                    checkpointId: agentCheckpoint.id
                                }
                            }
                        }
                    }
                },
                distinct: ['id'],
                orderBy: {
                    createdAt: 'desc'
                }
            }),

            // Visites sur le checkpoint de l'agent
            prisma.visit.findMany({
                where: {
                    checkpointId: agentCheckpoint.id
                },
                select: {
                    id: true,
                    visitorId: true,
                    checkpointId: true,
                    entryTime: true,
                    exitTime: true,
                    status: true,
                    reason: true,
                    notes: true,
                    createdAt: true,
                    visitor: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            isBlacklisted: true
                        }
                    },
                    checkpoint: {
                        select: {
                            id: true,
                            name: true,
                            zone: true,
                            building: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 50 // Limiter aux 50 dernières visites
            })
        ]);

        console.log('🔍 [DEBUG] Données récupérées:');
        console.log('  - Visiteurs trouvés:', visitors.length);
        console.log('  - Visites trouvées:', visits.length);

        // 5. Statistiques spécifiques au checkpoint de l'agent
        const [activeVisitsCount, todayVisitsCount, blacklistedVisitorsCount] = await Promise.all([
            // Visites actives sur le checkpoint de l'agent
            prisma.visit.count({
                where: {
                    checkpointId: agentCheckpoint.id,
                    status: 'ACTIVE'
                }
            }),

            // Visites aujourd'hui sur le checkpoint de l'agent
            prisma.visit.count({
                where: {
                    checkpointId: agentCheckpoint.id,
                    entryTime: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }),

            // Visiteurs blacklistés qui ont passé par le checkpoint de l'agent
            prisma.visitor.count({
                where: {
                    visits: {
                        some: {
                            checkpointId: agentCheckpoint.id
                        }
                    },
                    isBlacklisted: true
                }
            })
        ]);

        console.log('🔍 [DEBUG] Statistiques calculées:');
        console.log('  - Visites actives:', activeVisitsCount);
        console.log('  - Visites aujourd\'hui:', todayVisitsCount);
        console.log('  - Visiteurs blacklistés:', blacklistedVisitorsCount);

        return {
            // Informations de l'agent
            agent: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                // ✅ CORRECTION : Gérer le cas où permissions est null/undefined
                permissions: user.permissions ? user.permissions.map(p => p.permission) : []
            },

            // Site d'affectation
            site: agentCheckpoint.site,

            // Checkpoint assigné à l'agent (principal)
            assignedCheckpoint: {
                ...agentCheckpoint,
                totalVisits: agentCheckpoint._count.visits,
                totalSOSAlerts: agentCheckpoint._count.sosAlerts
            },

            // Visiteurs du checkpoint de l'agent
            visitors: visitors.map(v => ({
                ...v,
                checkpointVisitCount: v._count.visits
            })),

            // Visites du checkpoint de l'agent
            visits,

            // Statistiques
            statistics: {
                activeVisits: activeVisitsCount,
                todayVisits: todayVisitsCount,
                activeCheckpoints: 1, // Un seul checkpoint assigné
                blacklistedVisitors: blacklistedVisitorsCount,
                totalCheckpoints: 1, // Le checkpoint de l'agent
                totalVisitors: visitors.length,
                checkpointEfficiency: agentCheckpoint._count.visits > 0 ? 
                    ((activeVisitsCount / agentCheckpoint._count.visits) * 100).toFixed(2) + '%' : '0%'
            }
        };
    }
}

const authService = new AuthService();
module.exports = { authService };
