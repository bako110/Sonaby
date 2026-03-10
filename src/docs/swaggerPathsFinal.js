// Dernière partie de la documentation Swagger
const swaggerPathsFinal = {
  // ==================== SITES ENDPOINTS ====================
  '/api/v1/sites/filter': {
    get: {
      tags: ['Sites'],
      summary: 'Récupérer les sites avec filtres avancés et options automatiques',
      description: 'Récupère les sites filtrés avec options de filtre dynamiques pour une expérience utilisateur automatique',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Recherche textuelle (nom, code, description, adresse, manager)' },
        { name: 'city', in: 'query', schema: { type: 'string' }, description: 'Filtrer par ville' },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'inactive', 'under_maintenance', 'closed'] }, description: 'Statut du site' },
        { name: 'activityType', in: 'query', schema: { type: 'string', enum: ['headquarters', 'branch', 'warehouse', 'factory', 'office', 'retail'] }, description: 'Type d\'activité' },
        { name: 'manager', in: 'query', schema: { type: 'string' }, description: 'Filtrer par nom du manager' },
        { name: 'dateCreationDebut', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date de création début' },
        { name: 'dateCreationFin', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date de création fin' },
        { name: 'wheelchairAccessible', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Filtrer sites accessibles fauteuil roulant' },
        { name: 'parkingAvailable', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Filtrer sites avec parking' },
        { name: 'securitySystem', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Filtrer sites avec système de sécurité' },
        { name: 'securityGuard', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Filtrer sites avec gardien de sécurité' },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Numéro de page' },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Nombre d\'éléments par page' }
      ],
      responses: {
        200: {
          description: 'Sites filtrés récupérés avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Sites filtrés récupérés avec succès' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Site' }
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      page: { type: 'integer', example: 1 },
                      limit: { type: 'integer', example: 10 },
                      total: { type: 'integer', example: 156 },
                      totalPages: { type: 'integer', example: 16 },
                      hasNext: { type: 'boolean', example: true },
                      hasPrev: { type: 'boolean', example: false }
                    }
                  },
                  filterOptions: { $ref: '#/components/schemas/SiteFilterOptionsSchema' },
                  filters: {
                    type: 'object',
                    description: 'Filtres appliqués'
                  }
                }
              }
            }
          }
        },
        400: { description: 'Requête invalide' },
        403: { description: 'Accès refusé' },
        500: { description: 'Erreur serveur' }
      }
    }
  },
  '/api/v1/sites/agent/{userId}/sites': {
    get: {
      tags: ['Sites'],
      summary: 'Récupérer tous les sites assignés à un agent',
      description: 'Récupère la liste complète des sites assignés à un agent spécifique avec leurs checkpoints',
      security: [{ bearerAuth: [] }],
      parameters: [
        { 
          name: 'userId', 
          in: 'path', 
          required: true, 
          schema: { type: 'string', format: 'uuid' },
          description: 'ID de l\'agent' 
        }
      ],
      responses: {
        200: {
          description: 'Liste des sites de l\'agent récupérée avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid', description: 'ID du site' },
                        name: { type: 'string', description: 'Nom du site' },
                        address: { type: 'string', description: 'Adresse du site' },
                        city: { type: 'string', description: 'Ville du site' },
                        status: { type: 'string', description: 'Statut du site' },
                        checkpoints: {
                          type: 'array',
                          description: 'Checkpoints du site',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', format: 'uuid' },
                              name: { type: 'string' },
                              status: { type: 'string' },
                              checkpointType: { type: 'string' }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: { description: 'Identifiant de l\'agent manquant ou invalide' },
        401: { description: 'Non authentifié ou token invalide' },
        403: { description: 'Rôle non autorisé' },
        500: { description: 'Erreur serveur' }
      }
    }
  },
  '/api/v1/sites/filter-options': {
    get: {
      tags: ['Sites'],
      summary: 'Récupérer les options de filtre dynamiques pour les sites',
      description: 'Récupère les options de filtre automatiques qui se mettent à jour selon les filtres sélectionnés',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'city', in: 'query', schema: { type: 'string' }, description: 'Pré-filtrer les options par ville' },
        { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Pré-filtrer les options par statut' },
        { name: 'activityType', in: 'query', schema: { type: 'string' }, description: 'Pré-filtrer les options par type d\'activité' },
        { name: 'manager', in: 'query', schema: { type: 'string' }, description: 'Pré-filtrer les options par manager' }
      ],
      responses: {
        200: {
          description: 'Options de filtre récupérées avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Options de filtre récupérées avec succès' },
                  data: { $ref: '#/components/schemas/SiteFilterOptionsSchema' }
                }
              }
            }
          }
        },
        400: { description: 'Requête invalide' },
        403: { description: 'Accès refusé' },
        500: { description: 'Erreur serveur' }
      }
    }
  },
  // ==================== CHECKPOINTS ENDPOINTS ====================
  '/api/v1/checkpoints/filter': {
    get: {
      tags: ['Checkpoints'],
      summary: 'Récupérer les checkpoints avec filtres avancés et options automatiques',
      description: 'Récupère les checkpoints filtrés avec options de filtre dynamiques pour une expérience utilisateur automatique',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Recherche textuelle (nom, description, SOS ID)' },
        { name: 'siteId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filtrer par site' },
        { name: 'zone', in: 'query', schema: { type: 'string' }, description: 'Filtrer par zone' },
        { name: 'checkpointType', in: 'query', schema: { type: 'string', enum: ['internal', 'external', 'virtual'] }, description: 'Type de checkpoint' },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'inactive', 'maintenance'] }, description: 'Statut du checkpoint' },
        { name: 'priority', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }, description: 'Priorité du checkpoint' },
        { name: 'agentId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filtrer par agent assigné' },
        { name: 'dateCreationDebut', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date de création début' },
        { name: 'dateCreationFin', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date de création fin' },
        { name: 'avecAgent', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Filtrer checkpoints avec/sans agent' },
        { name: 'enAlerte', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Filtrer checkpoints en alerte SOS' },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Numéro de page' },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Nombre d\'éléments par page' }
      ],
      responses: {
        200: {
          description: 'Checkpoints filtrés récupérés avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Checkpoints filtrés récupérés avec succès' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Checkpoint' }
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      page: { type: 'integer', example: 1 },
                      limit: { type: 'integer', example: 10 },
                      total: { type: 'integer', example: 45 },
                      totalPages: { type: 'integer', example: 5 },
                      hasNext: { type: 'boolean', example: true },
                      hasPrev: { type: 'boolean', example: false }
                    }
                  },
                  filterOptions: { $ref: '#/components/schemas/CheckpointFilterOptionsSchema' },
                  filters: {
                    type: 'object',
                    description: 'Filtres appliqués'
                  }
                }
              }
            }
          }
        },
        400: { description: 'Requête invalide' },
        403: { description: 'Accès refusé' },
        500: { description: 'Erreur serveur' }
      }
    }
  },
  '/api/v1/checkpoints/filter-options': {
    get: {
      tags: ['Checkpoints'],
      summary: 'Récupérer les options de filtre dynamiques pour les checkpoints',
      description: 'Récupère les options de filtre automatiques qui se mettent à jour selon les filtres sélectionnés',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'siteId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Pré-filtrer les options par site' },
        { name: 'zone', in: 'query', schema: { type: 'string' }, description: 'Pré-filtrer les options par zone' },
        { name: 'checkpointType', in: 'query', schema: { type: 'string' }, description: 'Pré-filtrer les options par type de checkpoint' },
        { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Pré-filtrer les options par statut' },
        { name: 'priority', in: 'query', schema: { type: 'string' }, description: 'Pré-filtrer les options par priorité' },
        { name: 'agentId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Pré-filtrer les options par agent' }
      ],
      responses: {
        200: {
          description: 'Options de filtre récupérées avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Options de filtre récupérées avec succès' },
                  data: { $ref: '#/components/schemas/CheckpointFilterOptionsSchema' }
                }
              }
            }
          }
        },
        400: { description: 'Requête invalide' },
        403: { description: 'Accès refusé' },
        500: { description: 'Erreur serveur' }
      }
    }
  },
  // ==================== VISIT ENDPOINTS ====================
  '/api/v1/visits/filter': {
    get: {
      tags: ['Visits'],
      summary: 'Récupérer les visites avec filtres avancés et options automatiques',
      description: 'Récupère les visites filtrées avec options de filtre dynamiques pour une expérience utilisateur automatique',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Recherche textuelle (entité visitée, contact, origine, raison, notes, visiteur)' },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['present', 'left', 'refused', 'cancelled'] }, description: 'Statut de la visite' },
        { name: 'visitorId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filtrer par visiteur' },
        { name: 'checkpointId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filtrer par checkpoint' },
        { name: 'siteId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filtrer par site' },
        { name: 'serviceId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filtrer par service' },
        { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date d\'entrée début' },
        { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date d\'entrée fin' },
        { name: 'dateCreationDebut', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date de création début' },
        { name: 'dateCreationFin', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date de création fin' },
        { name: 'withIncidents', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Filtrer visites avec/sans incidents' },
        { name: 'overdue', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Filtrer visites en retard (plus de 8h)' },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Numéro de page' },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Nombre d\'éléments par page' }
      ],
      responses: {
        200: {
          description: 'Visites filtrées récupérées avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Visites filtrées récupérées avec succès' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Visit' }
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      page: { type: 'integer', example: 1 },
                      limit: { type: 'integer', example: 10 },
                      total: { type: 'integer', example: 78 },
                      totalPages: { type: 'integer', example: 8 },
                      hasNext: { type: 'boolean', example: true },
                      hasPrev: { type: 'boolean', example: false }
                    }
                  },
                  filterOptions: { $ref: '#/components/schemas/VisitFilterOptionsSchema' },
                  filters: {
                    type: 'object',
                    description: 'Filtres appliqués'
                  }
                }
              }
            }
          }
        },
        400: { description: 'Requête invalide' },
        403: { description: 'Accès refusé' },
        500: { description: 'Erreur serveur' }
      }
    }
  },
  '/api/v1/visits/filter-options': {
    get: {
      tags: ['Visits'],
      summary: 'Récupérer les options de filtre dynamiques pour les visites',
      description: 'Récupère les options de filtre automatiques qui se mettent à jour selon les filtres sélectionnés',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Pré-filtrer les options par statut' },
        { name: 'siteId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Pré-filtrer les options par site' },
        { name: 'checkpointId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Pré-filtrer les options par checkpoint' },
        { name: 'serviceId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Pré-filtrer les options par service' }
      ],
      responses: {
        200: {
          description: 'Options de filtre récupérées avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Options de filtre récupérées avec succès' },
                  data: { $ref: '#/components/schemas/VisitFilterOptionsSchema' }
                }
              }
            }
          }
        },
        400: { description: 'Requête invalide' },
        403: { description: 'Accès refusé' },
        500: { description: 'Erreur serveur' }
      }
    }
  },
  // ==================== VISITOR ENDPOINTS ====================
  '/api/v1/visitors/filter': {
    get: {
      tags: ['Visitors'],
      summary: 'Récupérer les visiteurs avec filtres avancés et options automatiques',
      description: 'Récupère les visiteurs filtrés avec options de filtre dynamiques pour une expérience utilisateur automatique',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Recherche textuelle (nom, prénom, ID, entreprise, email, téléphone)' },
        { name: 'isBlacklisted', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Filtrer visiteurs blacklistés ou non' },
        { name: 'idType', in: 'query', schema: { type: 'string', enum: ['CNIB', 'PASSEPORT', 'PERMIS_CONDUITE', 'CARTE_CONSULAIRE', 'AUTRE'] }, description: 'Type d\'identifiant' },
        { name: 'company', in: 'query', schema: { type: 'string' }, description: 'Filtrer par entreprise' },
        { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date de première visite début' },
        { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date de première visite fin' },
        { name: 'siteId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filtrer par site visité' },
        { name: 'checkpointId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filtrer par checkpoint visité' },
        { name: 'dateCreationDebut', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date de création début' },
        { name: 'dateCreationFin', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date de création fin' },
        { name: 'actif', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Filtrer visiteurs actifs (avec visites récentes - 30 jours)' },
        { name: 'avecBadge', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Filtrer visiteurs avec/sans badge' },
        { name: 'avecIncidents', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Filtrer visiteurs avec/sans incidents' },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Numéro de page' },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Nombre d\'éléments par page' }
      ],
      responses: {
        200: {
          description: 'Visiteurs filtrés récupérés avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Visiteurs filtrés récupérés avec succès' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Visitor' }
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      page: { type: 'integer', example: 1 },
                      limit: { type: 'integer', example: 10 },
                      total: { type: 'integer', example: 156 },
                      totalPages: { type: 'integer', example: 16 },
                      hasNext: { type: 'boolean', example: true },
                      hasPrev: { type: 'boolean', example: false }
                    }
                  },
                  filterOptions: { $ref: '#/components/schemas/VisitorFilterOptionsSchema' },
                  filters: {
                    type: 'object',
                    description: 'Filtres appliqués'
                  }
                }
              }
            }
          }
        },
        400: { description: 'Requête invalide' },
        403: { description: 'Accès refusé' },
        500: { description: 'Erreur serveur' }
      }
    }
  },
  '/api/v1/visitors/filter-options': {
    get: {
      tags: ['Visitors'],
      summary: 'Récupérer les options de filtre dynamiques pour les visiteurs',
      description: 'Récupère les options de filtre automatiques qui se mettent à jour selon les filtres sélectionnés',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'idType', in: 'query', schema: { type: 'string' }, description: 'Pré-filtrer les options par type d\'ID' },
        { name: 'company', in: 'query', schema: { type: 'string' }, description: 'Pré-filtrer les options par entreprise' },
        { name: 'siteId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Pré-filtrer les options par site' },
        { name: 'checkpointId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Pré-filtrer les options par checkpoint' },
        { name: 'isBlacklisted', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Pré-filtrer les options par statut blacklist' }
      ],
      responses: {
        200: {
          description: 'Options de filtre récupérées avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Options de filtre récupérées avec succès' },
                  data: { $ref: '#/components/schemas/VisitorFilterOptionsSchema' }
                }
              }
            }
          }
        },
        400: { description: 'Requête invalide' },
        403: { description: 'Accès refusé' },
        500: { description: 'Erreur serveur' }
      }
    }
  },

  // ==================== VISITOR GROUP ENDPOINTS ====================
'/api/v1/visitor-groups/filter': {
  get: {
    tags: ['VisitorGroups'],
    summary: 'Récupérer les groupes de visiteurs avec filtres et pagination',
    description: 'Récupère les groupes filtrés. Si checkpointId est fourni, retourne uniquement les groupes de la semaine courante (lundi-dimanche) avec la période',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Recherche textuelle sur le nom/prénom du responsable' },
      { name: 'checkpointId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'ID du checkpoint (filtre par semaine courante)' },
      { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Numéro de page' },
      { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Nombre d\'éléments par page' }
    ],
    responses: {
      200: {
        description: 'Groupes récupérés avec succès',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Groupes récupérés avec succès' },
                data: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      responsibleVisitor: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          firstName: { type: 'string' },
                          lastName: { type: 'string' }
                        }
                      },
                      otherVisitors: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Liste des autres visiteurs (nom complet)'
                      },
                      expectedCount: { type: 'integer' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' }
                    }
                  }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 10 },
                    total: { type: 'integer', example: 56 },
                    pages: { type: 'integer', example: 6 }
                  }
                },
                periode: {
                  type: 'object',
                  description: 'Présent uniquement si checkpointId est fourni',
                  properties: {
                    debut: { type: 'string', format: 'date-time', example: '2026-03-09T23:00:00.000Z' },
                    fin: { type: 'string', format: 'date-time', example: '2026-03-15T22:59:59.999Z' }
                  }
                },
                date: {
                  type: 'string',
                  format: 'date',
                  description: 'Présent uniquement si checkpointId est fourni',
                  example: '2026-03-10'
                }
              }
            }
          }
        }
      },
      400: { description: 'Requête invalide' },
      403: { description: 'Accès refusé' },
      500: { description: 'Erreur serveur' }
    }
  }
},
'/api/v1/visitor-groups/visitors/available': {
  get: {
    tags: ['VisitorGroups'],
    summary: 'Récupérer les visiteurs disponibles pour créer un groupe',
    description: 'Récupère les visiteurs existants pour sélectionner un responsable',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Recherche textuelle sur le nom/prénom' },
      { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Numéro de page' },
      { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 }, description: 'Nombre d\'éléments par page' }
    ],
    responses: {
      200: {
        description: 'Visiteurs récupérés avec succès',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Visiteurs récupérés avec succès' },
                data: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      firstName: { type: 'string' },
                      lastName: { type: 'string' }
                    }
                  }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 50 },
                    total: { type: 'integer', example: 150 },
                    pages: { type: 'integer', example: 15 }
                  }
                }
              }
            }
          }
        }
      },
      400: { description: 'Requête invalide' },
      403: { description: 'Accès refusé' },
      500: { description: 'Erreur serveur' }
    }
  }
},
'/api/v1/visitor-groups': {
  post: {
    tags: ['VisitorGroups'],
    summary: 'Créer un groupe de visiteurs',
    description: 'Crée un groupe avec un responsable existant et une liste d\'autres visiteurs (nom complet)',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['visitorId'],
            properties: {
              visitorId: { type: 'string', format: 'uuid', description: 'ID du visiteur responsable' },
              otherVisitors: {
                type: 'array',
                items: { type: 'string' },
                description: 'Liste des autres visiteurs (nom complet)',
                example: ['Bako Robert', 'Amidoi Sanour']
              }
            }
          }
        }
      }
    },
    responses: {
      201: { description: 'Groupe créé avec succès' },
      400: { description: 'Validation échouée' },
      404: { description: 'Visiteur responsable non trouvé' },
      500: { description: 'Erreur serveur' }
    }
  }
},
'/api/v1/visitor-groups/{id}': {
  get: {
    tags: ['VisitorGroups'],
    summary: 'Récupérer un groupe par ID',
    description: 'Récupère un groupe avec responsable et liste des autres visiteurs',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
    ],
    responses: {
      200: {
        description: 'Groupe récupéré avec succès',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Groupe récupéré avec succès' },
                data: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    responsibleVisitor: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' }
                      }
                    },
                    otherVisitors: {
                      type: 'array',
                      items: { type: 'string' }
                    },
                    expectedCount: { type: 'integer' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        }
      },
      404: { description: 'Groupe non trouvé' },
      500: { description: 'Erreur serveur' }
    }
  }
},

  // ==================== VISIT ENDPOINTS ====================
  '/api/v1/visits': {
    get: {
      tags: ['Visits'],
      summary: 'Lister toutes les visites',
      description: 'Récupère la liste de toutes les visites avec pagination et filtres',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'string', default: '1' }, description: 'Numéro de page' },
        { name: 'limit', in: 'query', schema: { type: 'string', default: '10' }, description: 'Nombre d\'éléments par page' },
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Recherche par nom du visiteur, entité visitée ou contact' },
        { name: 'visitorId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filtrer par ID de visiteur' },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['present', 'left'] }, description: 'Filtrer par statut de la visite' }
      ],
      responses: {
        200: {
          description: 'Liste des visites récupérée avec succès',
          content: { 
            'application/json': { 
              schema: { 
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Visit' }
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      page: { type: 'number', example: 1 },
                      limit: { type: 'number', example: 10 },
                      total: { type: 'number', example: 45 },
                      totalPages: { type: 'number', example: 5 }
                    }
                  }
                }
              }
            }
          }
        },
        403: { description: 'Accès refusé - permissions insuffisantes' },
        500: { description: 'Erreur serveur' }
      }
    },
    post: {
      tags: ['Visits'],
      summary: 'Créer une nouvelle visite',
      description: 'Crée une nouvelle visite pour un visiteur existant',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 
          'application/json': { 
            schema: { $ref: '#/components/schemas/CreateVisitInput' },
            examples: {
              'Exemple standard': {
                value: {
                  visitorId: '550e8400-e29b-41d4-a716-446655440000',
                  checkpointId: '770e8400-e29b-41d4-a716-446655440002',
                  entityVisited: 'Direction Générale',
                  contactPerson: 'Jean KABORE',
                  origin: 'Entreprise ABC',
                  reason: 'Réunion de suivi projet',
                  notes: 'Visiteur attendu à 14h00',
                  status: 'present'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Visite créée avec succès',
          content: { 
            'application/json': { 
              schema: { 
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Visite créée avec succès' },
                  data: { $ref: '#/components/schemas/Visit' }
                }
              }
            }
          }
        },
        400: { description: 'Données invalides' },
        403: { description: 'Accès refusé - permissions insuffisantes' },
        500: { description: 'Erreur serveur' }
      }
    }
  },
  '/api/v1/visits/{id}': {
    get: {
      tags: ['Visits'],
      summary: 'Récupérer une visite par ID',
      description: 'Récupère les détails complets d\'une visite spécifique',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'ID de la visite' }],
      responses: {
        200: {
          description: 'Visite trouvée',
          content: { 
            'application/json': { 
              schema: { 
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/Visit' }
                }
              }
            }
          }
        },
        404: { description: 'Visite non trouvée' },
        403: { description: 'Accès refusé - permissions insuffisantes' },
        500: { description: 'Erreur serveur' }
      }
    },
    delete: {
      tags: ['Visits'],
      summary: 'Supprimer une visite',
      description: 'Supprime définitivement une visite',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'ID de la visite' }],
      responses: {
        200: {
          description: 'Visite supprimée avec succès',
          content: { 
            'application/json': { 
              schema: { 
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Visite supprimée avec succès' }
                }
              }
            }
          }
        },
        404: { description: 'Visite non trouvée' },
        403: { description: 'Accès refusé - permissions insuffisantes' },
        500: { description: 'Erreur serveur' }
      }
    }
  },
  '/api/v1/visits/{id}/checkout': {
    patch: {
      tags: ['Visits'],
      summary: 'Terminer une visite (checkout)',
      description: 'Marque une visite comme terminée avec une heure de sortie',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'ID de la visite' }],
      requestBody: {
        required: true,
        content: { 
          'application/json': { 
            schema: { $ref: '#/components/schemas/CheckoutVisitInput' },
            examples: {
              'Sortie maintenant': {
                value: { endAt: '2024-11-24T18:00:00Z' }
              },
              'Sortie avec heure spécifique': {
                value: { endAt: '2024-11-24T17:30:00Z' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Visite terminée avec succès',
          content: { 
            'application/json': { 
              schema: { 
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Visite terminée avec succès' },
                  data: { $ref: '#/components/schemas/Visit' }
                }
              }
            }
          }
        },
        400: { description: 'Visite déjà terminée ou données invalides' },
        404: { description: 'Visite non trouvée' },
        403: { description: 'Accès refusé - permissions insuffisantes' },
        500: { description: 'Erreur serveur' }
      }
    }
  },
  '/api/v1/visits/stats': {
    get: {
      tags: ['Visits'],
      summary: 'Statistiques des visites',
      description: 'Récupère les statistiques générales des visites',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Statistiques récupérées avec succès',
          content: { 
            'application/json': { 
              schema: { 
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      total: { type: 'number', example: 150, description: 'Nombre total de visites' },
                      present: { type: 'number', example: 12, description: 'Visites en cours (present)' },
                      left: { type: 'number', example: 138, description: 'Visites terminées (left)' },
                      today: { type: 'number', example: 8, description: 'Visites du jour' }
                    }
                  }
                }
              }
            }
          }
        },
        403: { description: 'Accès refusé - permissions insuffisantes' },
        500: { description: 'Erreur serveur' }
      }
    }
  },
  '/api/v1/visits/active': {
    get: {
      tags: ['Visits'],
      summary: 'Liste des visites actives',
      description: 'Récupère la liste des visiteurs actuellement présents',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Visites actives récupérées avec succès',
          content: { 
            'application/json': { 
              schema: { 
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Visit' }
                  },
                  count: { type: 'number', example: 12 }
                }
              }
            }
          }
        },
        403: { description: 'Accès refusé - permissions insuffisantes' },
        500: { description: 'Erreur serveur' }
      }
    }
  },
  // ==================== APPOINTMENT ENDPOINTS ====================
  '/api/v1/appointments': {
    get: {
      tags: ['Appointments'],
      summary: 'Lister tous les rendez-vous',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'string' } },
        { name: 'limit', in: 'query', schema: { type: 'string' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'visitorId', in: 'query', schema: { type: 'string' } },
        { name: 'serviceId', in: 'query', schema: { type: 'string' } },
        { name: 'upcoming', in: 'query', schema: { type: 'string' } }
      ],
      responses: {
        200: {
          description: 'Liste des rendez-vous',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } }
        }
      }
    },
    post: {
      tags: ['Appointments'],
      summary: 'Créer un nouveau rendez-vous',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateAppointmentInput' } } }
      },
      responses: {
        201: {
          description: 'Rendez-vous créé',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Appointment' } } } } }
        }
      }
    }
  },
  '/api/v1/appointments/{id}': {
    get: {
      tags: ['Appointments'],
      summary: 'Récupérer un rendez-vous par ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Rendez-vous trouvé',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Appointment' } } } } }
        }
      }
    },
    put: {
      tags: ['Appointments'],
      summary: 'Mettre à jour un rendez-vous',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateAppointmentInput' } } }
      },
      responses: {
        200: {
          description: 'Rendez-vous mis à jour',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Appointment' } } } } }
        }
      }
    },
    delete: {
      tags: ['Appointments'],
      summary: 'Supprimer un rendez-vous',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Rendez-vous supprimé',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
        }
      }
    }
  },

    // ==================== RENDEZVOUS PAR SITE ====================
  '/api/v1/appointments/site/{siteId}': {
    get: {
      tags: ['Appointments'],
      summary: "Récupère tous les rendez-vous d'un site",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'siteId',
          required: true,
          schema: { type: 'string' },
          description: "L'ID du site pour lequel récupérer les rendez-vous"
        }
      ],
      responses: {
        200: {
          description: 'Liste des rendez-vous du site',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Appointment' }
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'Erreur serveur',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Erreur lors de la récupération des rendez-vous' }
                }
              }
            }
          }
        }
      }
    }
  },
  // ==================== INCIDENT ENDPOINTS ====================
  '/api/v1/incidents': {
  get: {
    tags: ['Incidents'],
    summary: 'Lister tous les incidents',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Numéro de page' },
      { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Nombre d\'éléments par page' },
      { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Recherche textuelle' },
      { name: 'visitId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filtrer par visite' },
      { name: 'siteId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filtrer par site' },
      { name: 'resolved', in: 'query', schema: { type: 'boolean' }, description: 'Filtrer incidents résolus' }
    ],
    responses: {
      200: {
        description: '✅ Liste des incidents récupérée',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Incidents récupérés avec succès' },
                data: { type: 'array', items: { $ref: '#/components/schemas/Incident' } },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 10 },
                    total: { type: 'integer', example: 25 },
                    totalPages: { type: 'integer', example: 3 }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  post: {
    tags: ['Incidents'],
    summary: '🚨 Créer un nouvel incident',
    description: 'Crée un nouvel incident lié à une visite ou à un visiteur',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/CreateIncidentInput' },
          example: {
            titre: "Personne anormale",
            description: "Un fou est entré dans la cellule",
            typeIncident: "AUTRE",
            severite: "MOYENNE",
            priorite: "NORMALE",
            source: "AGENT",
            dateIncident: "2024-12-07T14:30:00.000Z",
            siteId: "d4a30898-d202-11f0-af88-da7d8e8d4741",
            visitId: "2778f2a5-d2b1-11f0-af88-da7d8e8d4741",
            actionsImmediates: "Le visiteur a été raccompagné à la sortie",
            temoinPresent: true,
            notifierAgents: true
          }
        }
      }
    },
    responses: {
      201: {
        description: '✅ Incident créé avec succès',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Incident créé avec succès' },
                data: { $ref: '#/components/schemas/Incident' }
              }
            }
          }
        }
      },
      400: {
        description: '❌ Données invalides',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Titre, description et siteId sont requis' }
              }
            }
          }
        }
      },
      404: {
        description: '❌ Ressource non trouvée',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Site non trouvé' }
              }
            }
          }
        }
      }
    }
  }
},

  '/api/v1/incidents/{id}': {
    get: {
      tags: ['Incidents'],
      summary: '🔍 Récupérer un incident par ID',
      description: 'Récupère les détails complets d\'un incident avec ses relations',
      security: [{ bearerAuth: [] }],
      parameters: [{ 
        name: 'id', 
        in: 'path', 
        required: true, 
        schema: { type: 'string', format: 'uuid' }, 
        description: 'ID de l\'incident',
        example: '31cd07e8-1c78-11f1-9fa5-0242ac140006'
      }],
      responses: {
        200: {
          description: '✅ Incident trouvé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Incident trouvé avec succès' },
                  data: { $ref: '#/components/schemas/Incident' }
                }
              }
            }
          }
        },
        404: {
          description: '❌ Incident non trouvé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Incident non trouvé' }
                }
              }
            }
          }
        }
      }
    },
    patch: {
      tags: ['Incidents'],
      summary: '✏️ Modifier un incident (modification partielle)',
      description: 'Modifie partiellement un incident existant. Seuls les champs fournis seront mis à jour. Les autres champs restent inchangés.',
      security: [{ bearerAuth: [] }],
      parameters: [{ 
        name: 'id', 
        in: 'path', 
        required: true, 
        schema: { type: 'string', format: 'uuid' }, 
        description: 'ID de l\'incident à modifier',
        example: '31cd07e8-1c78-11f1-9fa5-0242ac140006'
      }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                titre: { type: 'string', maxLength: 255, description: 'Titre de l\'incident' },
                description: { type: 'string', description: 'Description détaillée' },
                typeIncident: { type: 'string', description: 'Type d\'incident' },
                severite: { type: 'string', enum: ['FAIBLE', 'MOYENNE', 'ELEVEE', 'CRITIQUE'], description: 'Niveau de sévérité' },
                priorite: { type: 'string', enum: ['BASSE', 'NORMALE', 'HAUTE', 'URGENTE'], description: 'Niveau de priorité' },
                source: { type: 'string', enum: ['AGENT', 'SYSTEME', 'VISITEUR'], description: 'Source de l\'incident' },
                dateIncident: { type: 'string', format: 'date-time', description: 'Date de l\'incident (ISO 8601)' },
                siteId: { type: 'string', format: 'uuid', description: 'ID du site' },
                visitId: { type: 'string', format: 'uuid', description: 'ID de la visite (optionnel)' },
                actionsImmediates: { type: 'string', description: 'Actions immédiates prises' },
                temoinPresent: { type: 'boolean', description: 'Présence de témoins' },
                notifierAgents: { type: 'boolean', description: 'Notifier les agents' }
              }
            },
            examples: {
              'Modification complète': {
                value: {
                  titre: 'Vol de matériel informatique - Mis à jour',
                  description: 'Vol d\'un ordinateur portable dans la salle serveur. Enquête en cours.',
                  typeIncident: 'Vol ou tentative de vol',
                  severite: 'CRITIQUE',
                  priorite: 'URGENTE',
                  source: 'AGENT',
                  dateIncident: '2026-03-10T00:00:00.000Z',
                  siteId: 'a67243c2-d5b2-11f0-9a3d-0242ac140006',
                  actionsImmediates: 'Sécurisation de la salle serveur et revue des caméras de surveillance',
                  temoinPresent: true,
                  notifierAgents: true
                }
              },
              'Modification partielle - Sévérité': {
                value: {
                  severite: 'CRITIQUE',
                  priorite: 'URGENTE'
                }
              },
              'Modification partielle - Description': {
                value: {
                  description: 'Description mise à jour après investigation',
                  actionsImmediates: 'Nouvelles mesures de sécurité mises en place'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: '✅ Incident modifié avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Incident modifié avec succès' },
                  data: { $ref: '#/components/schemas/Incident' }
                }
              }
            }
          }
        },
        400: { 
          description: '❌ Données invalides',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Données invalides' },
                  errors: { type: 'array', items: { type: 'object' } }
                }
              }
            }
          }
        },
        403: { 
          description: '❌ Accès refusé - Permissions insuffisantes (ADMIN, AGENT_GESTION, CHEF_SERVICE requis)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Accès refusé. Permissions insuffisantes.' }
                }
              }
            }
          }
        },
        404: { 
          description: '❌ Incident non trouvé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Incident non trouvé' }
                }
              }
            }
          }
        },
        500: { 
          description: '❌ Erreur serveur',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Erreur lors de la modification de l\'incident' }
                }
              }
            }
          }
        }
      }
    },
    delete: {
      tags: ['Incidents'],
      summary: '🗑️ Supprimer un incident',
      description: 'Supprime définitivement un incident. Cette action est irréversible. Requiert les permissions ADMIN, AGENT_GESTION ou CHEF_SERVICE.',
      security: [{ bearerAuth: [] }],
      parameters: [{ 
        name: 'id', 
        in: 'path', 
        required: true, 
        schema: { type: 'string', format: 'uuid' }, 
        description: 'ID de l\'incident à supprimer',
        example: 'fe87aef6-1be6-11f1-9fa5-0242ac140006'
      }],
      responses: {
        200: {
          description: '✅ Incident supprimé avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Incident supprimé avec succès' }
                }
              }
            }
          }
        },
        403: { 
          description: '❌ Accès refusé - Permissions insuffisantes',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Accès refusé. Permissions insuffisantes.' }
                }
              }
            }
          }
        },
        404: { 
          description: '❌ Incident non trouvé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Incident non trouvé' }
                }
              }
            }
          }
        },
        500: { 
          description: '❌ Erreur serveur',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Erreur lors de la suppression' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/v1/incidents/visitor/{visitorId}': {
    get: {
      tags: ['Incidents'],
      summary: '👤 Récupérer les incidents d\'un visiteur',
      description: 'Récupère tous les incidents liés aux visites d\'un visiteur spécifique',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'visitorId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'ID du visiteur' },
        { name: 'siteId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filtrer par site' },
        { name: 'isResolved', in: 'query', schema: { type: 'boolean' }, description: 'Filtrer incidents résolus' },
        { name: 'severite', in: 'query', schema: { type: 'string', enum: ['FAIBLE', 'MOYENNE', 'ELEVEE', 'CRITIQUE'] }, description: 'Filtrer par sévérité' },
        { name: 'dateDebut', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date de début (YYYY-MM-DD)' },
        { name: 'dateFin', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date de fin (YYYY-MM-DD)' }
      ],
      responses: {
        200: {
          description: '✅ Incidents du visiteur récupérés',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: '3 incident(s) trouvé(s) pour ce visiteur' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Incident' }
                  },
                  total: { type: 'integer', example: 3 }
                }
              }
            }
          }
        },
        404: {
          description: '❌ Aucune visite trouvée pour ce visiteur',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Aucune visite trouvée pour ce visiteur' },
                  data: { type: 'array', items: {} },
                  total: { type: 'integer', example: 0 }
                }
              }
            }
          }
        }
      }
    }
  },

    '/api/v1/incidents/checkpoint/{siteId}/weekly': {
    get: {
      tags: ['Incidents'],
      summary: '📅 Récupérer tous les incidents d’un site pour la semaine en cours',
      description: 'Retourne tous les incidents liés aux visites d’un site spécifique pour la semaine actuelle.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { 
          name: 'siteId', 
          in: 'path', 
          required: true, 
          schema: { type: 'string', format: 'uuid' }, 
          description: 'ID du site' 
        }
      ],
      responses: {
        200: {
          description: '✅ Liste des incidents récupérée avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  total: { type: 'integer', example: 7 },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Incident' }
                  }
                }
              }
            }
          }
        },
        400: {
          description: '❌ siteId manquant ou invalide',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Le checkpointId est requis.' }
                }
              }
            }
          }
        },
        403: {
          description: '❌ Accès refusé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Accès refusé. Permissions insuffisantes.' }
                }
              }
            }
          }
        },
        500: {
          description: '❌ Erreur serveur lors de la récupération des incidents de la semaine',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Erreur serveur lors de la récupération des incidents de la semaine.' }
                }
              }
            }
          }
        }
      }
    }
  },
 '/api/v1/incidents/checkpoint/{checkpointId}': {
  get: {
    tags: ['Incidents'],
    summary: '📍 Récupérer les incidents de la semaine pour un checkpoint',
    description: 'Retourne tous les incidents du site associé au checkpoint pour la semaine en cours (lundi à dimanche).',
    security: [{ bearerAuth: [] }],
    parameters: [
      { 
        name: 'checkpointId', 
        in: 'path', 
        required: true, 
        schema: { 
          type: 'string', 
          format: 'uuid' 
        }, 
        description: 'ID du checkpoint' 
      }
    ],
    responses: {
      200: {
        description: '✅ Incidents récupérés avec succès',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { 
                  type: 'boolean', 
                  example: true 
                },
                message: { 
                  type: 'string', 
                  example: '3 incident(s) trouvé(s) pour la semaine du checkpoint' 
                },
                data: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Incident' }
                }
              }
            }
          }
        }
      },
      400: {
        description: '❌ checkpointId manquant ou invalide',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Le checkpointId est requis.' }
              }
            }
          }
        }
      },
      404: {
        description: '❌ Checkpoint non trouvé',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Checkpoint non trouvé avec l\'ID fourni' }
              }
            }
          }
        }
      },
      403: {
        description: '❌ Accès refusé',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Accès refusé. Vous n\'avez pas les permissions nécessaires.' }
              }
            }
          }
        }
      },
      500: {
        description: '❌ Erreur serveur',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Erreur lors de la récupération des incidents.' }
              }
            }
          }
        }
      }
    }
  }
},
'/api/v1/incidents/visit/{visitId}/visitor-incidents': {
  get: {
    tags: ['Incidents'],
    summary: '👤 Récupérer les incidents du visiteur d\'une visite',
    description: 'Récupère tous les incidents liés au visiteur d\'une visite spécifique (y compris les incidents précédents du même visiteur)',
    security: [{ bearerAuth: [] }],
    parameters: [
      { 
        name: 'visitId', 
        in: 'path', 
        required: true, 
        schema: { 
          type: 'string', 
          format: 'uuid' 
        }, 
        description: 'ID de la visite' 
      },
      { 
        name: 'includeCurrent', 
        in: 'query', 
        schema: { 
          type: 'boolean',
          default: true 
        }, 
        description: 'Inclure les incidents de la visite actuelle' 
      },
      { 
        name: 'siteId', 
        in: 'query', 
        schema: { 
          type: 'string', 
          format: 'uuid' 
        }, 
        description: 'Filtrer par site spécifique' 
      },
      { 
        name: 'isResolved', 
        in: 'query', 
        schema: { 
          type: 'boolean' 
        }, 
        description: 'Filtrer incidents résolus/non résolus' 
      },
      { 
        name: 'severite', 
        in: 'query', 
        schema: { 
          type: 'string', 
          enum: ['FAIBLE', 'MOYENNE', 'ELEVEE', 'CRITIQUE'] 
        }, 
        description: 'Filtrer par sévérité' 
      },
      { 
        name: 'dateDebut', 
        in: 'query', 
        schema: { 
          type: 'string', 
          format: 'date' 
        }, 
        description: 'Date de début (YYYY-MM-DD)' 
      },
      { 
        name: 'dateFin', 
        in: 'query', 
        schema: { 
          type: 'string', 
          format: 'date' 
        }, 
        description: 'Date de fin (YYYY-MM-DD)' 
      },
      { 
        name: 'sortBy', 
        in: 'query', 
        schema: { 
          type: 'string',
          enum: ['dateIncident', 'severite', 'createdAt'],
          default: 'dateIncident'
        }, 
        description: 'Critère de tri' 
      },
      { 
        name: 'sortOrder', 
        in: 'query', 
        schema: { 
          type: 'string',
          enum: ['ASC', 'DESC'],
          default: 'DESC'
        }, 
        description: 'Ordre de tri' 
      }
    ],
    responses: {
      200: {
        description: '✅ Incidents du visiteur récupérés avec succès',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { 
                  type: 'boolean', 
                  example: true 
                },
                message: { 
                  type: 'string', 
                  example: '5 incident(s) trouvé(s) pour le visiteur de cette visite' 
                },
                data: {
                  type: 'object',
                  properties: {
                    currentVisit: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        visitorId: { type: 'string', format: 'uuid' },
                        visitorName: { type: 'string', example: 'John Doe' }
                      }
                    },
                    incidents: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Incident' }
                    },
                    statistics: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer', example: 5 },
                        resolved: { type: 'integer', example: 3 },
                        unresolved: { type: 'integer', example: 2 },
                        bySeverity: {
                          type: 'object',
                          properties: {
                            CRITIQUE: { type: 'integer', example: 1 },
                            ELEVEE: { type: 'integer', example: 1 },
                            MOYENNE: { type: 'integer', example: 2 },
                            FAIBLE: { type: 'integer', example: 1 }
                          }
                        },
                        byType: {
                          type: 'object',
                          additionalProperties: { type: 'integer' }
                        }
                      }
                    }
                  }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 20 },
                    total: { type: 'integer', example: 5 },
                    totalPages: { type: 'integer', example: 1 }
                  }
                }
              }
            }
          }
        }
      },
      400: {
        description: '❌ Paramètres invalides',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Paramètres de requête invalides' },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      path: { type: 'string' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      403: {
        description: '❌ Accès refusé',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Accès refusé. Permissions insuffisantes.' }
              }
            }
          }
        }
      },
      404: {
        description: '❌ Visite ou visiteur non trouvé',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Visite non trouvée ou visiteur introuvable' }
              }
            }
          }
        }
      },
      500: {
        description: '❌ Erreur serveur',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Erreur interne du serveur' }
              }
            }
          }
        }
      }
    }
  }
},




  '/api/v1/nondesirables': {
    get: {
      tags: ['Nondesirables'],
      summary: 'Lister tous les visiteurs indésirables (connus + inconnus)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Numéro de page' },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Nombre d\'éléments par page' },
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Terme de recherche' }
      ],
      responses: {
        200: {
          description: 'Liste des visiteurs indésirables',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      nondesirables: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Nondesirable' }
                      },
                      pagination: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    post: {
      tags: ['Nondesirables'],
      summary: 'Ajouter un visiteur à la liste des indésirables',
      description: 'Ajouter un visiteur existant à la liste des indésirables. Cette action active isBlacklisted=true, ajoute la raison, crée un historique dans BlacklistHistory et une entrée dans NonDesirable.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateNondesirableInput' },
            example: {
              visitorId: '880e8400-e29b-41d4-a716-446655440001',
              reason: 'Comportement inapproprié lors de la dernière visite'
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Visiteur ajouté à la liste des indésirables avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: { $ref: '#/components/schemas/Nondesirable' }
                }
              }
            }
          }
        },
        400: { description: 'Erreur de validation ou visiteur déjà dans la liste' },
        404: { description: 'Visiteur non trouvé' }
      }
    }
  },

  '/api/v1/nondesirables/known': {
    get: {
      tags: ['Nondesirables'],
      summary: 'Lister uniquement les visiteurs indésirables connus',
      description: 'Retourne les visiteurs enregistrés dans la base et marqués comme indésirables.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Liste des indésirables connus',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Nondesirable' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  '/api/v1/nondesirables/unknown/list': {
    get: {
      tags: ['Nondesirables'],
      summary: 'Lister uniquement les visiteurs indésirables inconnus',
      description: 'Individus sans fiche visiteur mais inscrits comme indésirables.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Liste des indésirables inconnus',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/UnknownNondesirable' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  '/api/v1/nondesirables/unknown': {
    post: {
      tags: ['Nondesirables'],
      summary: 'Ajouter un indésirable inconnu (ADMIN seulement)',
      description: 'Ajoute un indésirable non enregistré comme visiteur. Crée un historique dans BlacklistHistory.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateUnknownNondesirableInput' },
            example: {
              firstName: 'Jean',
              lastName: 'SUSPECT',
              birthDate: '1980-06-15',
              birthPlace: 'Ouagadougou',
              sexe: 'M',
              givingDate: '2020-01-01',
              expirationDate: '2030-01-01',
              phone: '+22670112233',
              email: 'suspect@example.com',
              idType: 'CNI',
              idNumber: 'B1234567890',
              idScanUrl: 'https://example.com/scans/suspect123.jpg',
              photoUrl: 'https://example.com/photos/suspect123.jpg',
              company: 'Entreprise Suspecte SARL',
              nationality: 'Burkinabé',
              reason: 'Comportement suspect signalé par les autorités',
              incidentDate: '2024-11-20',
              incidentLocation: 'Entrée principale',
              severityLevel: 3
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Indésirable inconnu ajouté avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: { $ref: '#/components/schemas/UnknownNondesirable' }
                }
              }
            }
          }
        },
        400: { description: 'Personne déjà dans la liste' },
        403: { description: 'Accès refusé - ADMIN requis' }
      }
    }
  },
'/api/v1/nondesirables/unknown': {
  post: {
    tags: ['Nondesirables'],
    summary: 'Ajouter un indésirable inconnu (ADMIN seulement) - FormData avec fichier',
    description: 'Ajoute un indésirable non enregistré comme visiteur. Accepte FormData avec un fichier optionnel (image ou PDF).',
    security: [{ bearerAuth: [] }],
    consumes: ['multipart/form-data'],
    requestBody: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            required: ['firstName', 'lastName', 'reason'],
            properties: {
              // CHAMPS TEXTE
              firstName: { type: 'string', example: 'Jean' },
              lastName: { type: 'string', example: 'SUSPECT' },
              birthDate: { type: 'string', example: '1980-06-15' },
              birthPlace: { type: 'string', example: 'Ouagadougou' },
              sexe: { type: 'string', example: 'M' },
              givingDate: { type: 'string', example: '2020-01-01' },
              expirationDate: { type: 'string', example: '2030-01-01' },
              phone: { type: 'string', example: '+22670112233' },
              email: { type: 'string', example: 'suspect@example.com' },
              idType: { type: 'string', example: 'CNI' },
              idNumber: { type: 'string', example: 'B1234567890' },
              company: { type: 'string', example: 'Entreprise Suspecte SARL' },
              nationality: { type: 'string', example: 'Burkinabé' },
              reason: { type: 'string', example: 'Comportement suspect signalé' },
              incidentDate: { type: 'string', example: '2024-11-20' },
              incidentLocation: { type: 'string', example: 'Entrée principale' },
              severityLevel: { type: 'integer', example: 3 },
              
              // UN SEUL FICHIER (optionnel)
              photo: {
                type: 'string',
                format: 'binary',
                description: 'Fichier image (JPEG, PNG, JPG, WEBP) ou PDF (max 10MB)'
              }
            }
          },
          encoding: {
            photo: {
              contentType: 'image/jpeg, image/png, image/jpg, image/webp, application/pdf'
            }
          }
        }
      }
    },
    responses: {
      201: {
        description: 'Indésirable inconnu ajouté avec succès',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: { $ref: '#/components/schemas/UnknownNondesirable' }
              }
            }
          }
        }
      },
      400: { 
        description: 'Données invalides ou fichier trop volumineux' 
      },
      403: { 
        description: 'Accès refusé - ADMIN requis' 
      },
      413: {
        description: 'Fichier trop volumineux (max 10MB)'
      },
      415: {
        description: 'Type de fichier non supporté'
      }
    }
  }
},
  '/api/v1/nondesirables/visitor/{visitorId}': {
  delete: {
    tags: ['Nondesirables'],
    summary: 'Retirer un visiteur de la liste des indésirables',
    description: 'Désactive isBlacklisted, nettoie la raison, crée un historique UNBLACKLIST et supprime l\'entrée NonDesirable.',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'visitorId',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'ID du visiteur à retirer'
      }
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['reason'],
            properties: {
              reason: {
                type: 'string',
                description: 'La raison pour laquelle le visiteur est retiré de la blacklist',
                example: 'Comportement corrigé et approuvé par l\'administration'
              }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Visiteur retiré avec succès',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
              }
            }
          }
        }
      },
      400: { description: 'Visiteur non trouvé ou pas blacklisté' }
    }
  }
},

 '/api/v1/nondesirables/visitor/{id}/blacklist-history': {
  get: {
    tags: ['Nondesirables'],
    summary: 'Obtenir l’historique de blacklist d’un visiteur',
    description: 'Retourne tous les événements de blacklist associés à un visiteur donné.',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'ID du visiteur'
      }
    ],
    responses: {
      200: {
        description: 'Historique de blacklist du visiteur',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/BlacklistHistory' }
                }
              }
            }
          }
        }
      },
      404: { description: 'Visiteur non trouvé' },
      500: { description: 'Erreur serveur' }
    }
  }
},

'/api/v1/nondesirables/unknown/user': {
  delete: {
    tags: ['Nondesirables'],
    summary: 'Retirer un indésirable inconnu',
    description: 'Supprime un indésirable inconnu en se basant sur son ID et ajoute une raison dans l’historique.',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['id', 'reason', 'reportedBy'],
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                description: 'ID de l’indésirable inconnu à retirer'
              },
              reason: {
                type: 'string',
                description: 'La raison pour laquelle l’indésirable est retiré',
                example: 'Erreur de signalement ou comportement corrigé'
              },
              reportedBy: {
                type: 'string',
                format: 'uuid',
                description: 'ID de l’utilisateur qui effectue la suppression'
              }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Indésirable inconnu retiré avec succès',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
              }
            }
          }
        }
      },
      400: {
        description: 'Indésirable non trouvé ou déjà supprimé'
      },
      500: {
        description: 'Erreur serveur'
      }
    }
  },

  '/api/v1/nondesirables/unknown/{id}': {
  get: {
    tags: ['Nondesirables'],
    summary: 'Récupérer un indésirable inconnu par ID',
    description: 'Retourne les détails d’un indésirable inconnu.',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'ID de l’indésirable inconnu'
      }
    ],
    responses: {
      200: {
        description: 'Détails récupérés avec succès',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: { $ref: '#/components/schemas/UnknownNondesirable' }
              }
            }
          }
        }
      },
      404: { description: 'Indésirable non trouvé' },
      500: { description: 'Erreur serveur' }
    }
  },}
},


  // =================== SOS ENDPOINTS ====================
  // =================== SOS ENDPOINTS ====================
'/api/v1/sos': {
  get: {
    tags: ['SOS'],
    summary: 'Lister toutes les alertes SOS avec filtres avancés',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 }, description: 'Numéro de page' },
      { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }, description: 'Nombre d\'éléments par page' },
      { name: 'checkpointId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filtrer par ID de checkpoint' },
      { name: 'agentId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filtrer par ID d\'agent déclencheur' },
      { name: 'userId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filtrer par ID utilisateur (déclencheur ou résolveur)' },
      { name: 'isResolved', in: 'query', schema: { type: 'boolean' }, description: 'Filtrer par statut de résolution' },
      { name: 'searchTerm', in: 'query', schema: { type: 'string' }, description: 'Recherche textuelle dans message, checkpoint ou site' },
      { name: 'statut', in: 'query', schema: { type: 'string', enum: ['MEDIUM', 'HIGH', 'LOW', 'CRITICAL'] }, description: 'Filtrer par statut du SOS' },
      { name: 'priorite', in: 'query', schema: { type: 'string', enum: ['NORMAL', 'HIGH', 'LOW', 'URGENT'] }, description: 'Filtrer par niveau de priorité' },
      { name: 'typeIncident', in: 'query', schema: { type: 'string', enum: ['GENERAL', 'SECURITY', 'TECHNICAL', 'EMERGENCY', 'OTHER'] }, description: 'Filtrer par type d\'incident' },
      { name: 'dateDebut', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Date de début pour filtrage par période (format ISO 8601)' },
      { name: 'dateFin', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Date de fin pour filtrage par période (format ISO 8601)' },
      { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['triggeredAt', 'isResolved', 'message'], default: 'triggeredAt' }, description: 'Champ de tri' },
      { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }, description: 'Ordre de tri' },
      // Paramètres obsolètes pour compatibilité
      { name: 'triggeredBy', in: 'query', schema: { type: 'string', format: 'uuid' }, description: '[Obsolète] Utiliser agentId à la place' },
      { name: 'active', in: 'query', schema: { type: 'boolean' }, description: '[Obsolète] Utiliser isResolved à la place' }
    ],
    responses: {
      200: {
        description: 'Liste des alertes SOS avec filtres appliqués',
        content: { 
          'application/json': { 
            schema: { 
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: { 
                  type: 'array',
                  items: { $ref: '#/components/schemas/SosAlert' }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    pages: { type: 'integer' },
                    hasNext: { type: 'boolean' },
                    hasPrev: { type: 'boolean' }
                  }
                },
                appliedFilters: { type: 'object', description: 'Filtres appliqués à la requête' }
              }
            }
          } 
        }
      },
      400: {
        description: 'Paramètres de filtrage invalides',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
      },
      401: {
        description: 'Non autorisé',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
      }
    }
  },
  post: {
    tags: ['SOS'],
    summary: 'Déclencher une alerte SOS avec template prédéfini',
    description: 'Créer une alerte SOS en utilisant un template prédéfini. Le message sera automatiquement récupéré depuis la table sos_templates.',
    security: [{ bearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['checkpointId', 'templateId'],
            properties: {
              checkpointId: {
                type: 'string',
                format: 'uuid',
                example: '770e8400-e29b-41d4-a716-446655440002',
                description: 'ID du checkpoint concerné'
              },
              templateId: {
                type: 'integer',
                example: 5,
                description: 'ID du template prédéfini (table sos_templates)'
              },
              triggeredAt: {
                type: 'string',
                format: 'date-time',
                description: 'Date/heure de déclenchement (optionnel)'
              }
            }
          },
          example: {
            checkpointId: '770e8400-e29b-41d4-a716-446655440002',
            templateId: 5
          }
        }
      }
    },
    responses: {
      201: {
        description: 'Alerte SOS créée avec succès',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'boolean',
                  example: true
                },
                message: {
                  type: 'string',
                  example: 'SOS déclenché avec le template sélectionné'
                },
                data: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid'
                    },
                    checkpointId: {
                      type: 'string',
                      format: 'uuid'
                    },
                    message: {
                      type: 'string',
                      description: 'Message récupéré du template'
                    },
                    triggeredBy: {
                      type: 'string',
                      format: 'uuid'
                    },
                    triggeredAt: {
                      type: 'string',
                      format: 'date-time'
                    },
                    isResolved: {
                      type: 'boolean'
                    },
                    templateInfo: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer'
                        },
                        titre: {
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      400: {
        description: 'Données invalides ou SOS déjà actif'
      },
      404: {
        description: 'Checkpoint ou template non trouvé'
      }
    }
  }
},
  '/api/v1/sos/{id}': {
    get: {
      tags: ['SOS'],
      summary: 'Récupérer une alerte SOS par ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Alerte SOS trouvée',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/SosAlert' } } } } }
        }
      }
    },
    patch: {
      tags: ['SOS'],
      summary: 'Résoudre une alerte SOS',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'SOS résolu avec succès',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { $ref: '#/components/schemas/SosAlert' } } } } }
        },
        404: {
          description: 'SOS non trouvé'
        },
        400: {
          description: 'SOS déjà résolu'
        }
      }
    },
    delete: {
      tags: ['SOS'],
      summary: 'Supprimer une alerte SOS',
      description: 'Permet de supprimer définitivement une alerte SOS de la base de données. Cette action est irréversible.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { 
          name: 'id', 
          in: 'path', 
          required: true, 
          schema: { type: 'string', format: 'uuid' },
          description: 'L\'ID unique de l\'alerte SOS à supprimer',
          example: '92f374cf-1beb-11f1-9fa5-0242ac140006'
        }
      ],
      responses: {
        200: {
          description: 'SOS supprimé avec succès',
          content: { 
            'application/json': { 
              schema: { 
                type: 'object', 
                properties: { 
                  success: { type: 'boolean', example: true }, 
                  message: { type: 'string', example: 'SOS supprimé avec succès' }, 
                  data: { $ref: '#/components/schemas/SosAlert' } 
                } 
              } 
            } 
          }
        },
        404: {
          description: 'SOS non trouvé',
          content: { 
            'application/json': { 
              schema: { 
                type: 'object', 
                properties: { 
                  success: { type: 'boolean', example: false }, 
                  message: { type: 'string', example: 'SOS non trouvé' } 
                } 
              } 
            } 
          }
        },
        403: {
          description: 'Accès refusé - Permissions insuffisantes',
          content: { 
            'application/json': { 
              schema: { 
                type: 'object', 
                properties: { 
                  success: { type: 'boolean', example: false }, 
                  message: { type: 'string', example: 'Accès refusé. Permissions insuffisantes.' } 
                } 
              } 
            } 
          }
        },
        500: {
          description: 'Erreur serveur',
          content: { 
            'application/json': { 
              schema: { 
                type: 'object', 
                properties: { 
                  success: { type: 'boolean', example: false }, 
                  message: { type: 'string' } 
                } 
              } 
            } 
          }
        }
      }
    }
  },
  '/api/v1/sos/active': {
    get: {
      tags: ['SOS'],
      summary: 'Lister toutes les alertes SOS actives (non résolues)',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Liste des alertes SOS actives',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/SosAlert' } } } } } }
        }
      }
    }
  },
  '/api/v1/sos/stats': {
    get: {
      tags: ['SOS'],
      summary: 'Statistiques des alertes SOS',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Statistiques SOS',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { total: { type: 'number' }, active: { type: 'number' }, resolved: { type: 'number' }, today: { type: 'number' } } } } } } }
        }
      }
    }
  },
  '/api/v1/sos/general': {
    post: {
      tags: ['SOS'],
      summary: 'Déclencher une alerte SOS générale automatique pour un checkpoint',
      description: 'Déclenche automatiquement une alerte SOS générale avec un message prédéfini. Un seul paramètre requis : checkpointId. Le message est généré automatiquement au format "ALERTE GÉNÉRALE - [Nom du checkpoint]"',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateGeneralSOSInput'
            },
            example: {
              checkpointId: "770e8400-e29b-41d4-a716-446655440002"
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Alerte SOS générale déclenchée automatiquement',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'SOS général déclenché automatiquement'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'ID de l\'alerte SOS créée'
                      },
                      checkpointId: {
                        type: 'string',
                        format: 'uuid',
                        description: 'ID du checkpoint concerné'
                      },
                      message: {
                        type: 'string',
                        example: 'ALERTE GÉNÉRALE - Portail Principal',
                        description: 'Message généré automatiquement'
                      },
                      triggeredBy: {
                        type: 'string',
                        format: 'uuid',
                        description: 'ID de l\'utilisateur qui a déclenché l\'alerte'
                      },
                      isResolved: {
                        type: 'boolean',
                        example: false
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Checkpoint non trouvé'
        },
        403: {
          description: 'Accès refusé'
        },
        500: {
          description: 'Erreur serveur'
        }
      }
    }
  },


  '/api/v1/sos/templates/admin_message': {
    post: {
      tags: ['SOS'],
      summary: 'Créer un nouveau template SOS',
      description: 'Créer un template de message SOS avec titre et message. Ces templates pourront être utilisés pour envoyer des alertes SOS.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['titre', 'message'],
              properties: {
                titre: {
                  type: 'string',
                  maxLength: 100,
                  example: 'Urgence médicale',
                  description: 'Titre du template SOS'
                },
                message: {
                  type: 'string',
                  example: 'Besoin d\'aide médicale immédiate',
                  description: 'Contenu du message SOS'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Template créé avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/SosTemplate' }
                }
              }
            }
          }
        },
        400: {
          description: 'Données invalides - titre et message sont requis'
        },
        401: {
          description: 'Non authentifié'
        },
        500: {
          description: 'Erreur serveur'
        }
      }
    },
    get: {
      tags: ['SOS'],
      summary: 'Lister tous les templates SOS',
      description: 'Récupérer la liste de tous les templates de messages SOS disponibles.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Liste des templates SOS',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/SosTemplate' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  
  '/api/v1/sos/templates/admin_message/{id}': {
    get: {
      tags: ['SOS'],
      summary: 'Récupérer un template SOS par ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'ID du template SOS'
        }
      ],
      responses: {
        200: {
          description: 'Template SOS trouvé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/SosTemplate' }
                }
              }
            }
          }
        },
        404: {
          description: 'Template non trouvé'
        }
      }
    },
    put: {
      tags: ['SOS'],
      summary: 'Mettre à jour un template SOS',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'ID du template SOS'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['titre', 'message'],
              properties: {
                titre: {
                  type: 'string',
                  maxLength: 100,
                  example: 'Urgence médicale modifiée'
                },
                message: {
                  type: 'string',
                  example: 'Besoin d\'une ambulance rapidement'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Template mis à jour',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/SosTemplate' }
                }
              }
            }
          }
        },
        404: {
          description: 'Template non trouvé'
        },
        400: {
          description: 'Données invalides'
        }
      }
    },
    delete: {
      tags: ['SOS'],
      summary: 'Supprimer un template SOS',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'ID du template SOS'
        }
      ],
      responses: {
        200: {
          description: 'Template supprimé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Template supprimé avec succès' }
                }
              }
            }
          }
        },
        404: {
          description: 'Template non trouvé'
        }
      }
    }
  },
  // ==================== FILE ENDPOINTS ====================
  '/api/v1/files/upload': {
    post: {
      tags: ['Files'],
      summary: 'Upload d\'un fichier unique',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                file: {
                  type: 'string',
                  format: 'binary',
                  description: 'Fichier à uploader'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Fichier uploadé avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      filename: { type: 'string' },
                      originalName: { type: 'string' },
                      mimeType: { type: 'string' },
                      size: { type: 'integer' },
                      path: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/v1/files/upload-multiple': {
    post: {
      tags: ['Files'],
      summary: 'Upload de fichiers multiples',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                files: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'binary'
                  },
                  description: 'Fichiers à uploader (max 5)'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Fichiers uploadés avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        filename: { type: 'string' },
                        originalName: { type: 'string' },
                        mimeType: { type: 'string' },
                        size: { type: 'integer' },
                        path: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/v1/files/{id}': {
    get: {
      tags: ['Files'],
      summary: 'Récupérer les métadonnées d\'un fichier',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Métadonnées du fichier',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', format: 'uuid' },
                      filename: { type: 'string' },
                      originalName: { type: 'string' },
                      mimeType: { type: 'string' },
                      size: { type: 'integer' },
                      path: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    delete: {
      tags: ['Files'],
      summary: 'Supprimer un fichier',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Fichier supprimé',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
        }
      }
    }
  },
  '/api/v1/files/{id}/download': {
    get: {
      tags: ['Files'],
      summary: 'Télécharger un fichier',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Fichier téléchargé',
          content: {
            'application/octet-stream': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            }
          }
        }
      }
    }
  },
  '/api/v1/files/{id}/view': {
    get: {
      tags: ['Files'],
      summary: 'Visualiser un fichier',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Fichier affiché',
          content: {
            'image/*': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            },
            'application/pdf': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            }
          }
        }
      }
    }
  },
  // ==================== HEALTH CHECK ====================
  '/api/v1/health': {
    get: {
      tags: ['System'],
      summary: 'Vérification de l\'état de l\'API',
      description: 'Endpoint de santé pour vérifier que l\'API fonctionne correctement',
      responses: {
        200: {
          description: 'API en bonne santé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'OK' },
                  message: { type: 'string', example: 'API is healthy' },
                  timestamp: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    }
  },
// ==================== DASHBOARD ENDPOINTS ====================
'/api/v1/dashboard/checkpoint-stats': {
  get: {
    tags: ['Dashboard'],
    summary: 'Récupérer les statistiques journalières pour un checkpoint',
    description: 'Retourne les statistiques chiffrées du jour pour un checkpoint spécifique',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        in: 'query',
        name: 'checkpointId',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid'
        },
        description: 'ID du checkpoint',
        example: '123e4567-e89b-12d3-a456-426614174000'
      }
    ],
    responses: {
      200: {
        description: 'Statistiques journalières du checkpoint récupérées avec succès',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { 
                  type: 'boolean', 
                  example: true 
                },
                data: {
                  type: 'object',
                  properties: {
                    checkpointId: { 
                      type: 'string', 
                      format: 'uuid', 
                      example: '123e4567-e89b-12d3-a456-426614174000' 
                    },
                    checkpointName: { 
                      type: 'string', 
                      example: 'Point de contrôle principal' 
                    },
                    visitsInProgress: { 
                      type: 'integer', 
                      description: 'Nombre de visites en cours aujourd\'hui', 
                      example: 5 
                    },
                    visitsCompleted: { 
                      type: 'integer', 
                      description: 'Nombre de visites terminées aujourd\'hui', 
                      example: 15 
                    },
                    totalVisitorsToday: { 
                      type: 'integer', 
                      description: 'Total des visiteurs aujourd\'hui (toutes visites du jour)', 
                      example: 20 
                    },
                    incidentsCountToday: { 
                      type: 'integer', 
                      description: 'Total des incidents aujourd\'hui', 
                      example: 2 
                    },
                    date: { 
                      type: 'string', 
                      format: 'date', 
                      example: '2024-01-15' 
                    }
                  }
                }
              }
            }
          }
        }
      },
      400: { 
        description: 'Paramètre checkpointId manquant' 
      },
      401: { 
        description: 'Non autorisé - Token manquant ou invalide' 
      },
      404: { 
        description: 'Checkpoint non trouvé' 
      },
      500: { 
        description: 'Erreur serveur interne' 
      }
    }
  }
},

'/api/v1/dashboard/visitors-present': {
  get: {
    tags: ['Dashboard'],
    summary: 'Récupérer les visiteurs présents pour un checkpoint',
    description: 'Retourne la liste des visiteurs actuellement présents dans un checkpoint spécifique',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        in: 'query',
        name: 'checkpointId',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid'
        },
        description: 'ID du checkpoint',
        example: '123e4567-e89b-12d3-a456-426614174000'
      }
    ],
    responses: {
      200: {
        description: 'Liste des visiteurs présents récupérée avec succès',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { 
                  type: 'boolean', 
                  example: true 
                },
                data: {
                  type: 'object',
                  properties: {
                    count: { 
                      type: 'integer', 
                      description: 'Nombre de visiteurs présents',
                      example: 5 
                    },
                    visitors: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          visitId: { 
                            type: 'string', 
                            format: 'uuid',
                            example: '223e4567-e89b-12d3-a456-426614174001'
                          },
                          visitor: {
                            type: 'object',
                            properties: {
                              id: { 
                                type: 'string', 
                                format: 'uuid',
                                example: '323e4567-e89b-12d3-a456-426614174001'
                              },
                              firstName: { 
                                type: 'string',
                                example: 'Jean'
                              },
                              lastName: { 
                                type: 'string',
                                example: 'Dupont'
                              },
                              company: { 
                                type: 'string',
                                example: 'ABC Corp'
                              },
                              phone: { 
                                type: 'string',
                                example: '+33612345678'
                              },
                              email: { 
                                type: 'string',
                                example: 'jean.dupont@example.com'
                              }
                            }
                          },
                          visit: {
                            type: 'object',
                            properties: {
                              entryTime: { 
                                type: 'string', 
                                format: 'date-time',
                                example: '2024-01-15T09:30:00Z'
                              },
                              reason: { 
                                type: 'string',
                                example: 'Réunion'
                              },
                              service: { 
                                type: 'string',
                                example: 'Direction'
                              },
                              checkpoint: { 
                                type: 'string',
                                example: 'Entrée principale'
                              },
                              site: { 
                                type: 'string',
                                example: 'Siège social'
                              },
                              siteId: { 
                                type: 'string', 
                                format: 'uuid',
                                example: '423e4567-e89b-12d3-a456-426614174001'
                              },
                              status: { 
                                type: 'string',
                                example: 'active'
                              },
                              exitTime: { 
                                type: 'string', 
                                format: 'date-time',
                                example: null
                              }
                            }
                          }
                        }
                      }
                    },
                    checkpointId: { 
                      type: 'string', 
                      format: 'uuid',
                      example: '123e4567-e89b-12d3-a456-426614174000'
                    },
                    checkpointName: { 
                      type: 'string',
                      example: 'Point de contrôle principal'
                    },
                    siteId: { 
                      type: 'string', 
                      format: 'uuid',
                      example: '423e4567-e89b-12d3-a456-426614174001'
                    },
                    siteName: { 
                      type: 'string',
                      example: 'Siège social'
                    },
                    date: { 
                      type: 'string', 
                      format: 'date',
                      example: '2024-01-15'
                    }
                  }
                }
              }
            }
          }
        }
      },
      400: { 
        description: 'Paramètre checkpointId manquant' 
      },
      401: { 
        description: 'Non autorisé - Token manquant ou invalide' 
      },
      404: { 
        description: 'Checkpoint non trouvé' 
      },
      500: { 
        description: 'Erreur serveur interne' 
      }
    }
  }
},
  // ==================== STATS ENDPOINTS ====================
  '/api/v1/stats': {
    get: {
      tags: ['Statistics'],
      summary: '📊 Récupérer toutes les statistiques du système',
      description: 'Retourne l\'ensemble des statistiques disponibles pour tous les rôles.\n\n**Données incluses :**\n- 📈 **Statistiques globales** : Visiteurs, visites, visites du jour\n- 👑 **Stats Admin** : Sites, checkpoints, agents, santé système\n- 👨‍💼 **Stats Service** : Performance agents, rendez-vous, incidents\n- 🚨 **Stats Opérationnelles** : Checkpoints, SOS, blacklistages, trafic\n- 📊 **Graphiques** : Tendances, répartitions, catégories\n\n**Périodes :**\n- Tendances : 30 derniers jours\n- Blacklistages récents : 7 derniers jours\n- Trafic horaire : Aujourd\'hui (24h)',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: '✅ Statistiques récupérées avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      // --- GLOBAL ---
                      totalVisitors: { type: 'integer', example: 1250, description: 'Nombre total de visiteurs uniques' },
                      totalVisits: { type: 'integer', example: 3450, description: 'Nombre total de visites' },
                      visitsToday: { type: 'integer', example: 45, description: 'Nombre de visites aujourd\'hui' },
                      activeVisits: { type: 'integer', example: 12, description: 'Nombre de visites actives (non sorties)' },
                      
                      // --- ADMIN ---
                      adminStats: {
                        type: 'object',
                        properties: {
                          totalSites: { type: 'integer', example: 5, description: 'Nombre total de sites' },
                          totalCheckpoints: { type: 'integer', example: 23, description: 'Nombre total de checkpoints' },
                          totalAgents: { type: 'integer', example: 15, description: 'Nombre total d\'agents' },
                          systemHealth: { type: 'integer', example: 92, description: 'Santé du système en pourcentage' },
                          sitesStatus: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                name: { type: 'string', example: 'Siège Principal', description: 'Nom du site' },
                                status: { type: 'string', enum: ['OK', 'WARNING', 'ERROR'], example: 'OK', description: 'Statut du site' },
                                load: { type: 'integer', example: 75, description: 'Charge du site en pourcentage' }
                              }
                            },
                            description: 'Statut de chaque site'
                          },
                          recentBlacklistHits: { type: 'integer', example: 3, description: 'Nombre de blacklistages récents (7 derniers jours)' },
                          totalSosAlerts: { type: 'integer', example: 7, description: 'Nombre total d\'alertes SOS' }
                        }
                      },
                      
                      // --- SERVICE ---
                      serviceStats: {
                        type: 'object',
                        properties: {
                          myAgentsTotal: { type: 'integer', example: 15, description: 'Nombre total d\'agents' },
                          myAgentsActive: { type: 'integer', example: 12, description: 'Nombre d\'agents actifs' },
                          myServiceAppointmentsToday: { type: 'integer', example: 8, description: 'Nombre de rendez-vous aujourd\'hui' },
                          myServicePendingAppointments: { type: 'integer', example: 3, description: 'Nombre de rendez-vous en attente' },
                          incidentsInMyService: { type: 'integer', example: 2, description: 'Nombre d\'incidents dans le service' },
                          topVisitors: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                name: { type: 'string', example: 'Jean Dupont', description: 'Nom du visiteur' },
                                count: { type: 'integer', example: 15, description: 'Nombre de visites' }
                              }
                            },
                            description: 'Top des visiteurs les plus fréquents'
                          },
                          agentPerformance: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                name: { type: 'string', example: 'Marie Martin', description: 'Nom de l\'agent' },
                                visitsHandled: { type: 'integer', example: 45, description: 'Visites traitées' }
                              }
                            },
                            description: 'Performance des agents (visites traitées)'
                          }
                        }
                      },
                      
                      // --- OPERATIONAL ---
                      operationalStats: {
                        type: 'object',
                        properties: {
                          checkpointsOnline: { type: 'integer', example: 20, description: 'Nombre de checkpoints en ligne' },
                          checkpointsTotal: { type: 'integer', example: 23, description: 'Nombre total de checkpoints' },
                          busyCheckpoints: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                name: { type: 'string', example: 'Entrée Principale - Siège', description: 'Nom du checkpoint' },
                                queue: { type: 'integer', example: 5, description: 'Nombre de personnes en attente' }
                              }
                            },
                            description: 'Checkpoints les plus occupés'
                          },
                          sosActive: { type: 'integer', example: 2, description: 'Nombre d\'alertes SOS actives' },
                          blacklistAttemptsToday: { type: 'integer', example: 4, description: 'Tentatives de blacklistage aujourd\'hui' },
                          hourlyTraffic: {
                            type: 'array',
                            items: { type: 'integer' },
                            description: 'Trafic horaire sur 24 heures',
                            example: [12, 8, 15, 25, 35, 45, 38, 42, 55, 48, 52, 61, 58, 63, 71, 68, 75, 82, 78, 65, 58, 45, 32, 18]
                          },
                          peakHour: { type: 'string', example: '17:00', description: 'Heure de pointe' }
                        }
                      },
                      
                      // --- GRAPHIQUES ---
                      visitsTrend: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            date: { type: 'string', format: 'date', example: '2024-11-28', description: 'Date' },
                            value: { type: 'integer', example: 45, description: 'Nombre de visites' }
                          }
                        },
                        description: 'Tendance des visites sur 30 jours'
                      },
                      appointmentsTrend: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            date: { type: 'string', format: 'date', example: '2024-11-28', description: 'Date' },
                            value: { type: 'integer', example: 8, description: 'Nombre de rendez-vous' }
                          }
                        },
                        description: 'Tendance des rendez-vous sur 30 jours'
                      },
                      visitsByType: {
                        type: 'object',
                        additionalProperties: { type: 'integer' },
                        example: {
                          "VISITEUR": 120,
                          "LIVRAISON": 35,
                          "MAINTENANCE": 15
                        },
                        description: 'Visites par type'
                      },
                      appointmentsByStatus: {
                        type: 'object',
                        additionalProperties: { type: 'integer' },
                        example: {
                          "CONFIRMED": 25,
                          "PENDING": 8,
                          "CANCELLED": 3
                        },
                        description: 'Rendez-vous par statut'
                      },
                      incidentsByCategory: {
                        type: 'object',
                        additionalProperties: { type: 'integer' },
                        example: {
                          "ACCIDENT": 2,
                          "REFUS": 5,
                          "AUTRE": 3
                        },
                        description: 'Incidents par catégorie'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: { 
          description: '❌ Non authentifié',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Token non valide ou expiré' }
                }
              }
            }
          }
        },
        403: { 
          description: '❌ Accès refusé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Permissions insuffisantes' }
                }
              }
            }
          }
        },
        500: { 
          description: '❌ Erreur serveur',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Erreur lors de la récupération des statistiques' }
                }
              }
            }
          }
        }
      }
    }
  },
  
  // ==================== STATISTICS ENDPOINTS ====================
  '/api/v1/stats/agent-stats': {
    get: {
      tags: ['Statistics'],
      summary: '👥 Statistiques des agents',
      description: 'Retourne les statistiques complètes des agents du système',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: '✅ Statistiques des agents récupérées',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      totalAgents: { type: 'integer', example: 15 },
                      activeAgents: { type: 'integer', example: 12 },
                      inactiveAgents: { type: 'integer', example: 3 },
                      agentsByRole: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            role: { type: 'string', example: 'AGENT_CONTROLE' },
                            count: { type: 'integer', example: 8 }
                          }
                        }
                      },
                      activePercentage: { type: 'integer', example: 80 },
                      inactivePercentage: { type: 'integer', example: 20 }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  '/api/v1/stats/recent-connections': {
    get: {
      tags: ['Statistics'],
      summary: '🔌 Connexions récentes des agents',
      description: 'Retourne la liste des connexions récentes des agents avec statistiques',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, minimum: 1, maximum: 50 }, description: 'Nombre maximum de connexions' }
      ],
      responses: {
        200: {
          description: '✅ Connexions récentes récupérées',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      connections: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
                            user: { $ref: '#/components/schemas/User' },
                            connectedAt: { type: 'string', format: 'date-time' },
                            expiresAt: { type: 'string', format: 'date-time' },
                            isCurrentlyActive: { type: 'boolean' },
                            connectionType: { type: 'string', example: 'API' }
                          }
                        }
                      },
                      stats: {
                        type: 'object',
                        properties: {
                          totalConnections: { type: 'integer' },
                          todayConnections: { type: 'integer' },
                          weekConnections: { type: 'integer' },
                          activeConnections: { type: 'integer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  '/api/v1/stats/agent-activity': {
    get: {
      tags: ['Statistics'],
      summary: '📋 Activité récente des agents',
      description: 'Retourne l\'activité récente des agents avec logs d\'audit',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 }, description: 'Nombre maximum d\'activités' },
        { name: 'agentId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filtrer par un agent spécifique' }
      ],
      responses: {
        200: {
          description: '✅ Activité des agents récupérée',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      activities: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            user: { $ref: '#/components/schemas/User' },
                            action: { type: 'string', example: 'CREATE_VISIT' },
                            entity: { type: 'string', example: 'visit' },
                            entityId: { type: 'string' },
                            timestamp: { type: 'string', format: 'date-time' },
                            ipAddress: { type: 'string' },
                            userAgent: { type: 'string' }
                          }
                        }
                      },
                      stats: {
                        type: 'object',
                        properties: {
                          totalActivities: { type: 'integer' },
                          todayActivities: { type: 'integer' },
                          uniqueAgents: { type: 'integer' },
                          topActions: { type: 'object', additionalProperties: { type: 'integer' } }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
// ==================== NOTIFICATIONS ENDPOINTS ====================

'/api/v1/notifications': {
  get: {
    tags: ['Notifications'],
    summary: 'Récupérer les notifications',
    description: 'Récupère toutes les notifications (personnelles + globales)',
    security: [{ bearerAuth: [] }],
    parameters: [
      { 
        name: 'limit', 
        in: 'query', 
        schema: { type: 'integer', default: 50 }, 
        description: 'Limite de résultats' 
      },
      { 
        name: 'unreadOnly', 
        in: 'query', 
        schema: { type: 'boolean', default: false }, 
        description: 'Notifications non lues seulement' 
      }
    ],
    responses: {
      200: {
        description: 'Liste des notifications',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Notification' }
                },
                count: { type: 'integer', example: 15 }
              }
            }
          }
        }
      },
      401: { description: 'Non authentifié' },
      500: { description: 'Erreur serveur' }
    }
  }
},

'/api/v1/notifications/stats': {
  get: {
    tags: ['Notifications'],
    summary: 'Statistiques des notifications',
    description: 'Récupère les statistiques des notifications',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Statistiques récupérées',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer', example: 25 },
                    unread: { type: 'integer', example: 5 },
                    read: { type: 'integer', example: 20 }
                  }
                }
              }
            }
          }
        }
      },
      401: { description: 'Non authentifié' },
      500: { description: 'Erreur serveur' }
    }
  }
},

'/api/v1/notifications/{id}/read': {
  put: {
    tags: ['Notifications'],
    summary: 'Marquer une notification comme lue',
    description: 'Marque une notification spécifique comme lue',
    security: [{ bearerAuth: [] }],
    parameters: [
      { 
        name: 'id', 
        in: 'path', 
        required: true, 
        schema: { type: 'string', format: 'uuid' },
        description: 'ID de la notification' 
      }
    ],
    responses: {
      200: {
        description: 'Notification marquée comme lue',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Notification marquée comme lue' }
              }
            }
          }
        }
      },
      404: { description: 'Notification non trouvée' },
      401: { description: 'Non authentifié' },
      500: { description: 'Erreur serveur' }
    }
  }
},

'/api/v1/notifications/read-all': {
  put: {
    tags: ['Notifications'],
    summary: 'Marquer toutes les notifications comme lues',
    description: 'Marque toutes les notifications de l\'utilisateur comme lues',
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Toutes les notifications marquées comme lues',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: '10 notification(s) marquée(s) comme lue(s)' },
                count: { type: 'integer', example: 10 }
              }
            }
          }
        }
      },
      401: { description: 'Non authentifié' },
      500: { description: 'Erreur serveur' }
    }
  }
},

'/api/v1/notifications/user/all': {
  get: {
    tags: ['Notifications'],
    summary: 'Récupérer toutes les notifications non lues d\'un utilisateur',
    description: 'Récupère toutes les notifications non lues (SOS, incidents, indésirables) d\'un utilisateur avec statistiques',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'userId',
        in: 'query',
        schema: { 
          type: 'string',
          format: 'uuid'
        },
        required: true,
        description: 'ID de l\'utilisateur',
        example: '6985b877-c56b-11f0-aa39-0242ac140013'
      },
      {
        name: 'limit',
        in: 'query',
        schema: { 
          type: 'integer', 
          default: 50,
          minimum: 1,
          maximum: 100
        },
        description: 'Nombre maximum total de notifications à récupérer',
        example: 50
      }
    ],
    responses: {
      200: {
        description: 'Toutes les notifications non lues groupées avec statistiques',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { 
                  type: 'boolean', 
                  example: true 
                },
                count: { 
                  type: 'integer', 
                  example: 12,
                  description: 'Nombre total de notifications non lues'
                },
                data: {
                  type: 'object',
                  properties: {
                    sos: {
                      type: 'array',
                      description: 'Notifications SOS non lues',
                      items: { 
                        $ref: '#/components/schemas/Notification' 
                      }
                    },
                    incidents: {
                      type: 'array',
                      description: 'Notifications d\'incidents non lues',
                      items: { 
                        $ref: '#/components/schemas/Notification' 
                      }
                    },
                    undesirables: {
                      type: 'array',
                      description: 'Notifications d\'indésirables non lues',
                      items: { 
                        $ref: '#/components/schemas/Notification' 
                      }
                    },
                    others: {
                      type: 'array',
                      description: 'Autres notifications non lues',
                      items: { 
                        $ref: '#/components/schemas/Notification' 
                      }
                    }
                  }
                },
                statistics: {
                  type: 'object',
                  properties: {
                    total: { 
                      type: 'integer', 
                      example: 45,
                      description: 'Nombre total de notifications (tous statuts) accessibles'
                    },
                    unread: { 
                      type: 'integer', 
                      example: 12,
                      description: 'Nombre de notifications non lues'
                    },
                    read: { 
                      type: 'integer', 
                      example: 33,
                      description: 'Nombre de notifications lues'
                    },
                    byType: {
                      type: 'object',
                      properties: {
                        sos: {
                          type: 'object',
                          properties: {
                            total: { type: 'integer', example: 8 },
                            unread: { type: 'integer', example: 3 }
                          }
                        },
                        incidents: {
                          type: 'object',
                          properties: {
                            total: { type: 'integer', example: 15 },
                            unread: { type: 'integer', example: 5 }
                          }
                        },
                        undesirables: {
                          type: 'object',
                          properties: {
                            total: { type: 'integer', example: 10 },
                            unread: { type: 'integer', example: 2 }
                          }
                        },
                        others: {
                          type: 'object',
                          properties: {
                            total: { type: 'integer', example: 12 },
                            unread: { type: 'integer', example: 2 }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      400: { 
        description: 'Paramètres invalides',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { 
                  type: 'boolean', 
                  example: false 
                },
                message: { 
                  type: 'string',
                  example: 'userId est requis'
                }
              }
            }
          }
        }
      },
      401: { 
        description: 'Non authentifié',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { 
                  type: 'boolean', 
                  example: false 
                },
                message: { 
                  type: 'string',
                  example: 'Token d\'authentification invalide'
                }
              }
            }
          }
        }
      },
      500: { 
        description: 'Erreur serveur',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { 
                  type: 'boolean', 
                  example: false 
                },
                message: { 
                  type: 'string',
                  example: 'Erreur interne du serveur'
                }
              }
            }
          }
        }
      }
    }
  }
}
// ==================== FIN NOTIFICATIONS ENDPOINTS ====================

};

module.exports = swaggerPathsFinal;