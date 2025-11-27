const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

class UserService {
  async createUser(data) {
    // Vérifier l'unicité de l'email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Vérifier l'unicité du matricule si fourni
    if (data.matricule) {
      const existingMatricule = await prisma.user.findUnique({
        where: { matricule: data.matricule }
      });
      if (existingMatricule) {
        throw new Error('Un utilisateur avec ce matricule existe déjà');
      }
    }

    // Vérifier que les sites existent
    if (data.assignedSites && data.assignedSites.length > 0) {
      const sites = await prisma.site.findMany({
        where: { id: { in: data.assignedSites } }
      });
      if (sites.length !== data.assignedSites.length) {
        throw new Error('Un ou plusieurs sites spécifiés n\'existent pas');
      }
    }

    // ✅ MODIFICATION : ACCEPTE TOUTES LES PERMISSIONS SANS VÉRIFICATION
    console.log('🔐 Permissions reçues du frontend:', data.permissions);

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const { assignedSites, permissions, password, ...userData } = data;

    // ✅ MODIFICATION : Créer les permissions si elles n'existent pas
    let permissionOperations = undefined;
    if (permissions && permissions.length > 0) {
      permissionOperations = {
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

    return prisma.user.create({
      data: {
        ...userData,
        passwordHash: hashedPassword,
        role: data.role || 'AGENT_CONTROLE',
        assignedSites: assignedSites && assignedSites.length > 0 ? {
          create: assignedSites.map(siteId => ({ siteId }))
        } : undefined,
        permissions: permissionOperations
      },
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

  async getAllUsers() {
    return prisma.user.findMany({
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
    if (data.matricule && data.matricule !== existingUser.matricule) {
      const matriculeExists = await prisma.user.findUnique({
        where: { matricule: data.matricule }
      });
      if (matriculeExists) {
        throw new Error('Un utilisateur avec ce matricule existe déjà');
      }
    }

    // Vérifier que les sites existent
    if (data.assignedSites && data.assignedSites.length > 0) {
      const sites = await prisma.site.findMany({
        where: { id: { in: data.assignedSites } }
      });
      if (sites.length !== data.assignedSites.length) {
        throw new Error('Un ou plusieurs sites spécifiés n\'existent pas');
      }
    }

    // ✅ MODIFICATION : ACCEPTE TOUTES LES PERMISSIONS SANS VÉRIFICATION
    console.log('🔐 Permissions reçues pour mise à jour:', data.permissions);

    const { assignedSites, permissions, password, ...updateData } = data;

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    // Gérer les mises à jour des relations
    const updateOperations = {
      ...updateData
    };

    // Mettre à jour les sites assignés
    if (assignedSites !== undefined) {
      await prisma.userSite.deleteMany({
        where: { userId: id }
      });
      if (assignedSites.length > 0) {
        updateOperations.assignedSites = {
          create: assignedSites.map(siteId => ({ siteId }))
        };
      }
    }

    // ✅ MODIFICATION : Mettre à jour les permissions (création automatique si nécessaire)
    if (permissions !== undefined) {
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

    return prisma.user.update({
      where: { id },
      data: updateOperations,
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

  async deleteUser(id) {
    return prisma.user.delete({
      where: { id }
    });
  }
}

module.exports = new UserService();