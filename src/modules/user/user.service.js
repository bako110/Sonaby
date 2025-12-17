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

    // Vérifier matricule unique
    if (data.matricule) {
      const existingMatricule = await prisma.user.findUnique({
        where: { matricule: data.matricule }
      });
      if (existingMatricule) {
        throw new Error('Un utilisateur avec ce matricule existe déjà');
      }
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
        matricule: true,
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

  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        matricule: true,
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
      }
    });
  }

  async getUserById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        matricule: true,
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
    console.log('🔵 updateUser called with id:', id);
    console.log('📝 updateUser data:', JSON.stringify(data, null, 2));
    
    const existingUser = await this.getUserById(id);
    if (!existingUser) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier l'unicité de l'email si modifié
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email }
      });
      if (emailExists) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
    }

    // Vérifier l'unicité du matricule si modifié
    // if (data.matricule && data.matricule !== existingUser.matricule) {
    //   const matriculeExists = await prisma.user.findUnique({
    //     where: { matricule: data.matricule }
    //   });
    //   if (matriculeExists) {
    //     throw new Error('Un utilisateur avec ce matricule existe déjà');
    //   }
    // }

    // Vérifier l'unicité du username si modifié
    if (data.username && data.username !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username: data.username }
      });
      if (usernameExists) {
        throw new Error('Un utilisateur avec ce nom d\'utilisateur existe déjà');
      }
    }

    // Vérifier que les sites existent
    if (data.assignedSites && data.assignedSites.length > 0) {
      console.log('🔵 Checking sites:', data.assignedSites);
      const sites = await prisma.site.findMany({
        where: { id: { in: data.assignedSites } }
      });
      if (sites.length !== data.assignedSites.length) {
        throw new Error('Un ou plusieurs sites spécifiés n\'existent pas');
      }
    }

    // Vérifier que les checkpoints existent
    if (data.assignedCheckpoints && data.assignedCheckpoints.length > 0) {
      console.log('🔵 Checking checkpoints:', data.assignedCheckpoints);
      const checkpoints = await prisma.checkpoint.findMany({
        where: { id: { in: data.assignedCheckpoints } }
      });
      if (checkpoints.length !== data.assignedCheckpoints.length) {
        throw new Error('Un ou plusieurs checkpoints spécifiés n\'existent pas');
      }
    }

    // Vérifier que le rôle existe dans la table user_roles
    if (data.role && data.role !== existingUser.role) {
      console.log('🔵 Checking role:', data.role);
      const roleExists = await prisma.user_roles.findUnique({
        where: { role_name: data.role }
      });
      if (!roleExists) {
        throw new Error(`Le rôle "${data.role}" n'existe pas dans le système`);
      }
    }

    console.log('🔐 Permissions reçues pour mise à jour:', data.permissions);

    const { assignedSites, permissions, assignedCheckpoints, password, ...updateData } = data;

    // Gérer le mot de passe
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    // Gérer les mises à jour des relations
    const updateOperations = {
      ...updateData
    };

    // Mettre à jour les sites assignés
    if (assignedSites !== undefined) {
      console.log('🔵 Updating assignedSites');
      await prisma.userSite.deleteMany({
        where: { userId: id }
      });
      if (assignedSites.length > 0) {
        updateOperations.assignedSites = {
          create: assignedSites.map(siteId => ({ siteId }))
        };
      }
    }

    // Mettre à jour les checkpoints assignés
    if (assignedCheckpoints !== undefined) {
      console.log('🔵 Updating assignedCheckpoints');
      // Supprimer les anciennes assignations de checkpoints
      await prisma.agentCheckpointAssignment.deleteMany({
        where: { userId: id }
      });
      
      if (assignedCheckpoints.length > 0) {
        // Créer de nouvelles assignations
        const now = new Date();
        updateOperations.agentAssignments = {
          create: assignedCheckpoints.map(checkpointId => ({
            checkpointId,
            startDate: now
          }))
        };
      }
    }

    // Mettre à jour les permissions (création automatique si nécessaire)
    if (permissions !== undefined) {
      console.log('🔵 Updating permissions');
      await prisma.userPermission.deleteMany({
        where: { userId: id }
      });
      
      if (permissions.length > 0) {
        updateOperations.permissions = {
          create: await Promise.all(
            permissions.map(async (permName) => {
              // Vérifier si la permission existe, sinon la créer
              let perm = await prisma.permission.findUnique({
                where: { name: permName }
              });
              
              if (!perm) {
                // Créer la permission automatiquement si elle n'existe pas
                console.log(`➕ Création automatique de la permission: ${permName}`);
                perm = await prisma.permission.create({
                  data: {
                    name: permName,
                    description: `Permission créée automatiquement: ${permName}`
                  }
                });
              }
              
              return { permissionId: perm.id };
            })
          )
        };
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateOperations,
      select: {
        id: true,
        matricule: true,
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

    // Formater la réponse
    return {
      ...updatedUser,
      assignedSites: updatedUser.assignedSites.map(us => us.site),
      assignedCheckpoints: updatedUser.assignedCheckpoints,
      permissions: updatedUser.permissions.map(up => up.permission)
    };

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'utilisateur:', error.message);
    console.error('❌ Stack:', error.stack);
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