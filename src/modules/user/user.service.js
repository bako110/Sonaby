const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

class UserService {
  async createUser(data) {
    // Vérifier email unique
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Vérifier que les sites existent (obligatoire seulement pour les agents, pas pour les chefs de service)
    if (data.role !== 'CHEF_SERVICE') {
      if (!data.assignedSites || data.assignedSites.length === 0) {
        throw new Error('Au moins un site doit être assigné à un utilisateur');
      }
    }

    // Vérifier que les sites existent (seulement si des sites sont fournis)
    if (data.assignedSites && data.assignedSites.length > 0) {
      const sites = await prisma.site.findMany({
        where: { id: { in: data.assignedSites } }
      });

      if (sites.length !== data.assignedSites.length) {
        throw new Error('Un ou plusieurs sites spécifiés n\'existent pas');
      }
    }

    // ---------------------------
    // 🔥 VALIDATION DES CHECKPOINTS (OPTIONNEL)
    // ---------------------------
    if (data.assignedCheckpoints && data.assignedCheckpoints.length > 0) {
      const checkpoints = await prisma.checkpoint.findMany({
        where: { id: { in: data.assignedCheckpoints } },
        include: { site: true }
      });

      if (checkpoints.length !== data.assignedCheckpoints.length) {
        throw new Error("Un ou plusieurs checkpoints n'existent pas");
      }

      // Vérifier qu'un checkpoint appartient bien à un site assigné
      for (const cp of checkpoints) {
        if (!data.assignedSites.includes(cp.siteId)) {
          throw new Error(
            `Le checkpoint "${cp.name}" n'appartient pas au site sélectionné (${cp.site?.name})` 
          );
        }
      }
    }

    console.log('🔐 Permissions reçues du frontend:', data.permissions);

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const { assignedSites, assignedCheckpoints, permissions, password, ...userData } = data;

    // ---------------------------
    // 🔥 PERMISSIONS (AUTO-CREATION)
    // ---------------------------
    let permissionOperations = undefined;

    if (permissions && permissions.length > 0) {
      permissionOperations = {
        create: await Promise.all(
          permissions.map(async (permName) => {
            let perm = await prisma.permission.findUnique({
              where: { name: permName }
            });

            if (!perm) {
              console.log(`➕ Création automatique de la permission: ${permName}`);
              perm = await prisma.permission.create({
                data: {
                  name: permName,
                  description: `Permission créée automatiquement` 
                }
              });
            }

            return { permissionId: perm.id };
          })
        )
      };
    }

    // ---------------------------
    // 🔥 CREATION DE L'UTILISATEUR
    // ---------------------------
    return prisma.user.create({
      data: {
        ...userData,
        passwordHash: hashedPassword,
        role: data.role || 'AGENT_CONTROLE',

        // Assignation sites (obligatoire)
        assignedSites:
          assignedSites && assignedSites.length > 0
            ? {
                create: assignedSites.map((siteId) => ({
                  siteId
                }))
              }
            : undefined,

        // Assignation checkpoints (optionnel)
        assignedCheckpoints:
          assignedCheckpoints && assignedCheckpoints.length > 0
            ? {
                connect: assignedCheckpoints.map((checkpointId) => ({
                  id: checkpointId
                }))
              }
            : undefined,

        permissions: permissionOperations
      },

      // ---------------------------
      // 🔥 RETOUR DE DONNÉES
      // ---------------------------
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        phone: true,
        createdAt: true,
        updatedAt: true,

        assignedSites: {
          select: {
            site: {
              select: { id: true, name: true, city: true }
            }
          }
        },

        assignedCheckpoints: {
          select: {
            id: true,
            name: true,
            siteId: true,
            site: { select: { id: true, name: true } }
          }
        },

        permissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });
  }

  async getAllUsers(filters = {}) {
    const { page = 1, limit = 10, search, role, isActive, siteId } = filters;
    
    // Calculer l'offset pour la pagination
    const skip = (page - 1) * limit;
    
    // Construire les conditions WHERE
    const where = {};
    
    // Filtre par recherche globale
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Filtre par rôle
    if (role) {
      where.role = role;
    }
    
    // Filtre par statut actif
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    // Filtre par site assigné
    if (siteId) {
      where.assignedSites = {
        some: {
          siteId: siteId
        }
      };
    }
    
    // Compter le nombre total d'utilisateurs (pour la pagination)
    const total = await prisma.user.count({ where });
    
    // Récupérer les utilisateurs avec pagination
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        username: true,
        isActive: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        assignedSites: {
          select: {
            site: {
              select: {
                id: true,
                name: true,
                city: true
              }
            }
          }
        },
        permissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return {
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    };
  }

  async getUserById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        assignedSites: {
          select: {
            site: {
              select: {
                id: true,
                name: true,
                city: true
              }
            }
          }
        },
        permissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });
  }

  async updateUser(id, data) {
  try {
    // console.log('==============================');
    // console.log('🔵 updateUser CALLED');
    // console.log('🆔 ID reçu du frontend:', id);
    // console.log('📦 Type de data:', typeof data);
    // console.log('📦 Data brute reçue:', data);
    // console.log('📦 Data stringify:', JSON.stringify(data, null, 2));
    // console.log('==============================');

    // Accepter toute modification sans vérification, mais ignorer matricule
    const { assignedSites, permissions, assignedCheckpoints, password, matricule, ...updateData } = data || {};

    // console.log('🟢 Champs extraits:');
    // console.log('   - assignedSites:', assignedSites);
    // console.log('   - assignedCheckpoints:', assignedCheckpoints);
    // console.log('   - permissions:', permissions);
    // console.log('   - password fourni ?: ', !!password);
    // console.log('   - matricule ignoré:', matricule);
    // console.log('   - autres champs updateData:', JSON.stringify(updateData, null, 2));

    // Gérer le mot de passe
    if (password) {
      console.log('🔐 Hashing password...');
      updateData.passwordHash = await bcrypt.hash(password, 12);
      console.log('🔐 Password hash généré');
    }

    const updateOperations = {
      ...updateData
    };

    // Mettre à jour les sites assignés
    if (assignedSites !== undefined && assignedSites !== null && Array.isArray(assignedSites)) {
      console.log('🔵 Updating assignedSites - Valeur reçue:', assignedSites);
      console.log('🗑 Suppression anciens userSite...');
      
      await prisma.userSite.deleteMany({
        where: { userId: id }
      });

      if (assignedSites.length > 0) {
        console.log('➕ Création nouveaux sites:', assignedSites);
        updateOperations.assignedSites = {
          create: assignedSites.map(siteId => ({ siteId }))
        };
      } else {
        console.log('⚠️ assignedSites est un tableau vide');
      }
    }

    // Mettre à jour les checkpoints assignés
    if (assignedCheckpoints !== undefined && assignedCheckpoints !== null && Array.isArray(assignedCheckpoints)) {
      console.log('🔵 Updating assignedCheckpoints - Valeur reçue:', assignedCheckpoints);

      await prisma.agentCheckpointAssignment.deleteMany({
        where: { userId: id }
      });

      if (assignedCheckpoints.length > 0) {
        const now = new Date();
        console.log('➕ Création nouvelles assignations checkpoints à:', now);

        updateOperations.agentAssignments = {
          create: assignedCheckpoints.map(checkpointId => ({
            checkpointId,
            startDate: now
          }))
        };
      } else {
        console.log('⚠️ assignedCheckpoints est vide');
      }
    }

    // Mettre à jour les permissions
    if (permissions !== undefined && permissions !== null && Array.isArray(permissions)) {
      console.log('🔵 Updating permissions - Valeur reçue:', permissions);

      await prisma.userPermission.deleteMany({
        where: { userId: id }
      });

      if (permissions.length > 0) {
        updateOperations.permissions = {
          create: await Promise.all(
            permissions.map(async (permName) => {
              console.log('🔍 Vérification permission:', permName);

              let perm = await prisma.permission.findUnique({
                where: { name: permName }
              });

              if (!perm) {
                console.log(`➕ Création automatique permission: ${permName}`);
                perm = await prisma.permission.create({
                  data: {
                    name: permName,
                    description: `Permission créée automatiquement: ${permName}`
                  }
                });
              }

              console.log('✅ Permission ID utilisé:', perm.id);
              return { permissionId: perm.id };
            })
          )
        };
      } else {
        console.log('⚠️ permissions est vide');
      }
    }

    console.log('📤 updateOperations final:', JSON.stringify(updateOperations, null, 2));

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateOperations,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        isActive: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        assignedSites: {
          select: {
            site: {
              select: {
                id: true,
                name: true,
                code: true,
                city: true
              }
            }
          }
        },
        assignedCheckpoints: {
          select: {
            id: true,
            name: true,
            siteId: true,
            site: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        permissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });

    console.log('✅ Utilisateur mis à jour:', JSON.stringify(updatedUser, null, 2));

    return {
      ...updatedUser,
      assignedSites: updatedUser.assignedSites.map(us => us.site),
      assignedCheckpoints: updatedUser.assignedCheckpoints,
      permissions: updatedUser.permissions.map(up => up.permission)
    };

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'utilisateur:', error.message);
    console.error('❌ Stack:', error.stack);
    console.error('❌ Data reçue au moment de l’erreur:', JSON.stringify(data, null, 2));
    throw error;
  }
}
  async deleteUser(id) {
    console.log(' [DEBUG] Suppression de l\'utilisateur:', id);
    
    // 1. Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    console.log(' [DEBUG] Utilisateur trouvé:', user.email);

    // 2. Supprimer les relations avec les sites (UserSite)
    const deletedSites = await prisma.userSite.deleteMany({
      where: { userId: id }
    });
    console.log(' [DEBUG] Sites assignés supprimés:', deletedSites.count, 'relations');

    // 3. Supprimer les relations avec les checkpoints (assignedCheckpoints)
    // Pour la relation many-to-many, il faut déconnecter les checkpoints
    const userWithCheckpoints = await prisma.user.findUnique({
      where: { id },
      select: {
        assignedCheckpoints: {
          select: { id: true }
        }
      }
    });

    if (userWithCheckpoints?.assignedCheckpoints?.length > 0) {
      const checkpointIds = userWithCheckpoints.assignedCheckpoints.map(cp => cp.id);
      
      // Déconnecter tous les checkpoints assignés
      await prisma.user.update({
        where: { id },
        data: {
          assignedCheckpoints: {
            disconnect: checkpointIds.map(checkpointId => ({ id: checkpointId }))
          }
        }
      });
      console.log(' [DEBUG] Checkpoints assignés déconnectés:', checkpointIds.length, 'checkpoints');
    }

    // 4. Supprimer les permissions de l'utilisateur (UserPermission)
    const deletedPermissions = await prisma.userPermission.deleteMany({
      where: { userId: id }
    });
    console.log(' [DEBUG] Permissions supprimées:', deletedPermissions.count, 'permissions');

    // 5. Supprimer les refresh tokens de l'utilisateur
    const deletedTokens = await prisma.refreshToken.deleteMany({
      where: { userId: id }
    });
    console.log(' [DEBUG] Refresh tokens supprimés:', deletedTokens.count, 'tokens');

    // 6. Mettre à jour les checkpoints où cet agent était assigné via agentId
    const updatedCheckpoints = await prisma.checkpoint.updateMany({
      where: { agentId: id },
      data: { agentId: null }
    });
    console.log(' [DEBUG] Checkpoints mis à jour (agentId null):', updatedCheckpoints.count, 'checkpoints');

    // 7. Supprimer l'utilisateur lui-même
    const deletedUser = await prisma.user.delete({
      where: { id }
    });

    console.log(' [DEBUG] Utilisateur supprimé avec succès:', deletedUser.email);

    return {
      message: 'Utilisateur et toutes ses relations supprimés avec succès',
      deletedUser: {
        id: deletedUser.id,
        email: deletedUser.email,
        firstName: deletedUser.firstName,
        lastName: deletedUser.lastName
      },
      summary: {
        deletedSitesRelations: deletedSites.count,
        disconnectedCheckpoints: userWithCheckpoints?.assignedCheckpoints?.length || 0,
        deletedPermissions: deletedPermissions.count,
        deletedTokens: deletedTokens.count,
        updatedCheckpoints: updatedCheckpoints.count
      }
    };
  }
}

module.exports = new UserService();