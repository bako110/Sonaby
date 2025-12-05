// Dernière partie de la documentation Swagger
const swaggerPathsFinal = {
  // ==================== SITES ENDPOINTS ====================
  "/api/v1/sites/filter": {
    get: {
      tags: ["Sites"],
      summary:
        "Récupérer les sites avec filtres avancés et options automatiques",
      description:
        "Récupère les sites filtrés avec options de filtre dynamiques pour une expérience utilisateur automatique",
      security: [{ bearerAuth: [] }],
      parameters: [
        // Filtres de base
        {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description:
            "Recherche textuelle (nom, code, ville, région, manager, adresse)",
        },
        {
          name: "code",
          in: "query",
          schema: { type: "string" },
          description: "Filtrer par code de site",
        },
        {
          name: "city",
          in: "query",
          schema: { type: "string" },
          description: "Filtrer par ville",
        },
        {
          name: "region",
          in: "query",
          schema: { type: "string" },
          description: "Filtrer par région",
        },
        {
          name: "country",
          in: "query",
          schema: { type: "string" },
          description: "Filtrer par pays",
        },

        // Filtres catégoriels
        {
          name: "status",
          in: "query",
          schema: {
            type: "string",
            enum: [
              "ACTIVE",
              "INACTIVE",
              "UNDER_CONSTRUCTION",
              "MAINTENANCE",
              "CLOSED",
              "PLANNED",
              "SUSPENDED",
            ],
          },
          description: "Statut du site",
        },
        {
          name: "activityType",
          in: "query",
          schema: { type: "string" },
          description:
            "Type d'activité (pas d'enum fixe, utilise les valeurs de la base)",
        },
        {
          name: "manager",
          in: "query",
          schema: { type: "string" },
          description: "Filtrer par nom du manager",
        },

        // Filtres numériques (plages)
        {
          name: "minEmployeeCount",
          in: "query",
          schema: { type: "integer", minimum: 0 },
          description: "Nombre minimum d'employés",
        },
        {
          name: "maxEmployeeCount",
          in: "query",
          schema: { type: "integer", minimum: 0 },
          description: "Nombre maximum d'employés",
        },
        {
          name: "minArea",
          in: "query",
          schema: { type: "number", minimum: 0 },
          description: "Surface minimum en m²",
        },
        {
          name: "maxArea",
          in: "query",
          schema: { type: "number", minimum: 0 },
          description: "Surface maximum en m²",
        },

        // Filtres booléens
        {
          name: "wheelchairAccessible",
          in: "query",
          schema: { type: "string", enum: ["true", "false"] },
          description: "Filtrer sites accessibles fauteuil roulant",
        },
        {
          name: "parkingAvailable",
          in: "query",
          schema: { type: "string", enum: ["true", "false"] },
          description: "Filtrer sites avec parking",
        },
        {
          name: "securitySystem",
          in: "query",
          schema: { type: "string", enum: ["true", "false"] },
          description: "Filtrer sites avec système de sécurité",
        },
        {
          name: "securityGuard",
          in: "query",
          schema: { type: "string", enum: ["true", "false"] },
          description: "Filtrer sites avec gardien de sécurité",
        },

        // Filtres par dates (RENOMMÉS pour correspondre au frontend)
        {
          name: "creationDateStart",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Date de création (début)",
        },
        {
          name: "creationDateEnd",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Date de création (fin)",
        },

        // Tri
        {
          name: "sortBy",
          in: "query",
          schema: {
            type: "string",
            enum: [
              "name",
              "city",
              "creationDate",
              "employeeCount",
              "area",
              "code",
            ],
          },
          description: "Champ de tri (par défaut: creationDate)",
        },
        {
          name: "sortOrder",
          in: "query",
          schema: {
            type: "string",
            enum: ["asc", "desc"],
          },
          description: "Ordre de tri (par défaut: desc)",
        },

        // Pagination
        {
          name: "page",
          in: "query",
          schema: { type: "integer", default: 1, minimum: 1 },
          description: "Numéro de page",
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 10, minimum: 1, maximum: 100 },
          description: "Nombre d'éléments par page",
        },
      ],
      responses: {
        200: {
          description: "Sites filtrés récupérés avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Sites filtrés récupérés avec succès",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Site" },
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      page: { type: "integer", example: 1 },
                      limit: { type: "integer", example: 10 },
                      total: { type: "integer", example: 156 },
                      totalPages: { type: "integer", example: 16 },
                      hasNext: { type: "boolean", example: true },
                      hasPrev: { type: "boolean", example: false },
                    },
                  },
                  filterOptions: {
                    $ref: "#/components/schemas/SiteFilterOptionsSchema",
                  },
                  filters: {
                    type: "object",
                    description: "Filtres appliqués",
                  },
                },
              },
            },
          },
        },
        400: { description: "Requête invalide" },
        403: { description: "Accès refusé" },
        500: { description: "Erreur serveur" },
      },
    },
  },
  "/api/v1/sites/agent/{userId}/sites": {
    get: {
      tags: ["Sites"],
      summary: "Récupérer tous les sites assignés à un agent",
      description:
        "Récupère la liste complète des sites assignés à un agent spécifique avec leurs checkpoints",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "ID de l'agent",
        },
      ],
      responses: {
        200: {
          description: "Liste des sites de l'agent récupérée avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          format: "uuid",
                          description: "ID du site",
                        },
                        name: { type: "string", description: "Nom du site" },
                        address: {
                          type: "string",
                          description: "Adresse du site",
                        },
                        city: { type: "string", description: "Ville du site" },
                        status: {
                          type: "string",
                          description: "Statut du site",
                        },
                        checkpoints: {
                          type: "array",
                          description: "Checkpoints du site",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string", format: "uuid" },
                              name: { type: "string" },
                              status: { type: "string" },
                              checkpointType: { type: "string" },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: "Identifiant de l'agent manquant ou invalide" },
        401: { description: "Non authentifié ou token invalide" },
        403: { description: "Rôle non autorisé" },
        500: { description: "Erreur serveur" },
      },
    },
  },
'/api/v1/sites/filter-options': {
  get: {
    tags: ['Sites'],
    summary: 'Récupérer les options de filtre dynamiques pour les sites',
    description: 'Récupère les options de filtre automatiques qui se mettent à jour selon les filtres sélectionnés',
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: 'city', in: 'query', schema: { type: 'string' }, description: 'Pré-filtrer les options par ville' },
      { name: 'region', in: 'query', schema: { type: 'string' }, description: 'Pré-filtrer les options par région' }, // NOUVEAU
      { name: 'country', in: 'query', schema: { type: 'string' }, description: 'Pré-filtrer les options par pays' }, // NOUVEAU
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
                data: { 
                  type: 'object',
                  properties: {
                    cities: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          value: { type: 'string' },
                          label: { type: 'string' },
                          count: { type: 'integer' }
                        }
                      }
                    },
                    countries: { // NOUVEAU
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          value: { type: 'string' },
                          label: { type: 'string' },
                          count: { type: 'integer' }
                        }
                      }
                    },
                    regions: { // NOUVEAU
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          value: { type: 'string' },
                          label: { type: 'string' },
                          count: { type: 'integer' }
                        }
                      }
                    },
                    activityTypes: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          value: { type: 'string' },
                          label: { type: 'string' },
                          count: { type: 'integer' }
                        }
                      }
                    },
                    statuses: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          value: { type: 'string' },
                          label: { type: 'string' },
                          count: { type: 'integer' }
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
      400: { description: 'Requête invalide' },
      403: { description: 'Accès refusé' },
      500: { description: 'Erreur serveur' }
    }
  }
},
  // ==================== CHECKPOINTS ENDPOINTS ====================
  "/api/v1/checkpoints/filter": {
    get: {
      tags: ["Checkpoints"],
      summary:
        "Récupérer les checkpoints avec filtres avancés et options automatiques",
      description:
        "Récupère les checkpoints filtrés avec options de filtre dynamiques pour une expérience utilisateur automatique",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description: "Recherche textuelle (nom, description, SOS ID)",
        },
        {
          name: "siteId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filtrer par site",
        },
        {
          name: "zone",
          in: "query",
          schema: { type: "string" },
          description: "Filtrer par zone",
        },
        {
          name: "checkpointType",
          in: "query",
          schema: { type: "string", enum: ["internal", "external", "virtual"] },
          description: "Type de checkpoint",
        },
        {
          name: "status",
          in: "query",
          schema: {
            type: "string",
            enum: ["active", "inactive", "maintenance"],
          },
          description: "Statut du checkpoint",
        },
        {
          name: "priority",
          in: "query",
          schema: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
          },
          description: "Priorité du checkpoint",
        },
        {
          name: "agentId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filtrer par agent assigné",
        },
        {
          name: "dateCreationDebut",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Date de création début",
        },
        {
          name: "dateCreationFin",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Date de création fin",
        },
        {
          name: "avecAgent",
          in: "query",
          schema: { type: "string", enum: ["true", "false"] },
          description: "Filtrer checkpoints avec/sans agent",
        },
        {
          name: "enAlerte",
          in: "query",
          schema: { type: "string", enum: ["true", "false"] },
          description: "Filtrer checkpoints en alerte SOS",
        },
        {
          name: "page",
          in: "query",
          schema: { type: "integer", default: 1 },
          description: "Numéro de page",
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 10 },
          description: "Nombre d'éléments par page",
        },
      ],
      responses: {
        200: {
          description: "Checkpoints filtrés récupérés avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Checkpoints filtrés récupérés avec succès",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Checkpoint" },
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      page: { type: "integer", example: 1 },
                      limit: { type: "integer", example: 10 },
                      total: { type: "integer", example: 45 },
                      totalPages: { type: "integer", example: 5 },
                      hasNext: { type: "boolean", example: true },
                      hasPrev: { type: "boolean", example: false },
                    },
                  },
                  filterOptions: {
                    $ref: "#/components/schemas/CheckpointFilterOptionsSchema",
                  },
                  filters: {
                    type: "object",
                    description: "Filtres appliqués",
                  },
                },
              },
            },
          },
        },
        400: { description: "Requête invalide" },
        403: { description: "Accès refusé" },
        500: { description: "Erreur serveur" },
      },
    },
  },
  "/api/v1/checkpoints/filter-options": {
    get: {
      tags: ["Checkpoints"],
      summary:
        "Récupérer les options de filtre dynamiques pour les checkpoints",
      description:
        "Récupère les options de filtre automatiques qui se mettent à jour selon les filtres sélectionnés",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "siteId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Pré-filtrer les options par site",
        },
        {
          name: "zone",
          in: "query",
          schema: { type: "string" },
          description: "Pré-filtrer les options par zone",
        },
        {
          name: "checkpointType",
          in: "query",
          schema: { type: "string" },
          description: "Pré-filtrer les options par type de checkpoint",
        },
        {
          name: "status",
          in: "query",
          schema: { type: "string" },
          description: "Pré-filtrer les options par statut",
        },
        {
          name: "priority",
          in: "query",
          schema: { type: "string" },
          description: "Pré-filtrer les options par priorité",
        },
        {
          name: "agentId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Pré-filtrer les options par agent",
        },
      ],
      responses: {
        200: {
          description: "Options de filtre récupérées avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Options de filtre récupérées avec succès",
                  },
                  data: {
                    $ref: "#/components/schemas/CheckpointFilterOptionsSchema",
                  },
                },
              },
            },
          },
        },
        400: { description: "Requête invalide" },
        403: { description: "Accès refusé" },
        500: { description: "Erreur serveur" },
      },
    },
  },
  // ==================== VISIT ENDPOINTS ====================
  "/api/v1/visits/filter": {
    get: {
      tags: ["Visits"],
      summary:
        "Récupérer les visites avec filtres avancés et options automatiques",
      description:
        "Récupère les visites filtrées avec options de filtre dynamiques pour une expérience utilisateur automatique",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description:
            "Recherche textuelle (entité visitée, contact, origine, raison, notes, visiteur)",
        },
        {
          name: "status",
          in: "query",
          schema: {
            type: "string",
            enum: ["present", "left", "refused", "cancelled"],
          },
          description: "Statut de la visite",
        },
        {
          name: "visitorId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filtrer par visiteur",
        },
        {
          name: "checkpointId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filtrer par checkpoint",
        },
        {
          name: "siteId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filtrer par site",
        },
        {
          name: "serviceId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filtrer par service",
        },
        {
          name: "dateFrom",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Date d'entrée début",
        },
        {
          name: "dateTo",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Date d'entrée fin",
        },
        {
          name: "dateCreationDebut",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Date de création début",
        },
        {
          name: "dateCreationFin",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Date de création fin",
        },
        {
          name: "withIncidents",
          in: "query",
          schema: { type: "string", enum: ["true", "false"] },
          description: "Filtrer visites avec/sans incidents",
        },
        {
          name: "overdue",
          in: "query",
          schema: { type: "string", enum: ["true", "false"] },
          description: "Filtrer visites en retard (plus de 8h)",
        },
        {
          name: "page",
          in: "query",
          schema: { type: "integer", default: 1 },
          description: "Numéro de page",
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 10 },
          description: "Nombre d'éléments par page",
        },
      ],
      responses: {
        200: {
          description: "Visites filtrées récupérées avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Visites filtrées récupérées avec succès",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Visit" },
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      page: { type: "integer", example: 1 },
                      limit: { type: "integer", example: 10 },
                      total: { type: "integer", example: 78 },
                      totalPages: { type: "integer", example: 8 },
                      hasNext: { type: "boolean", example: true },
                      hasPrev: { type: "boolean", example: false },
                    },
                  },
                  filterOptions: {
                    $ref: "#/components/schemas/VisitFilterOptionsSchema",
                  },
                  filters: {
                    type: "object",
                    description: "Filtres appliqués",
                  },
                },
              },
            },
          },
        },
        400: { description: "Requête invalide" },
        403: { description: "Accès refusé" },
        500: { description: "Erreur serveur" },
      },
    },
  },
  "/api/v1/visits/filter-options": {
    get: {
      tags: ["Visits"],
      summary: "Récupérer les options de filtre dynamiques pour les visites",
      description:
        "Récupère les options de filtre automatiques qui se mettent à jour selon les filtres sélectionnés",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "status",
          in: "query",
          schema: { type: "string" },
          description: "Pré-filtrer les options par statut",
        },
        {
          name: "siteId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Pré-filtrer les options par site",
        },
        {
          name: "checkpointId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Pré-filtrer les options par checkpoint",
        },
        {
          name: "serviceId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Pré-filtrer les options par service",
        },
      ],
      responses: {
        200: {
          description: "Options de filtre récupérées avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Options de filtre récupérées avec succès",
                  },
                  data: {
                    $ref: "#/components/schemas/VisitFilterOptionsSchema",
                  },
                },
              },
            },
          },
        },
        400: { description: "Requête invalide" },
        403: { description: "Accès refusé" },
        500: { description: "Erreur serveur" },
      },
    },
  },
  // ==================== VISITOR ENDPOINTS ====================
  "/api/v1/visitors/filter": {
    get: {
      tags: ["Visitors"],
      summary:
        "Récupérer les visiteurs avec filtres avancés et options automatiques",
      description:
        "Récupère les visiteurs filtrés avec options de filtre dynamiques pour une expérience utilisateur automatique",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description:
            "Recherche textuelle (nom, prénom, ID, entreprise, email, téléphone)",
        },
        {
          name: "isBlacklisted",
          in: "query",
          schema: { type: "string", enum: ["true", "false"] },
          description: "Filtrer visiteurs blacklistés ou non",
        },
        {
          name: "idType",
          in: "query",
          schema: {
            type: "string",
            enum: [
              "CNIB",
              "PASSEPORT",
              "PERMIS_CONDUITE",
              "CARTE_CONSULAIRE",
              "AUTRE",
            ],
          },
          description: "Type d'identifiant",
        },
        {
          name: "company",
          in: "query",
          schema: { type: "string" },
          description: "Filtrer par entreprise",
        },
        {
          name: "dateFrom",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Date de première visite début",
        },
        {
          name: "dateTo",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Date de première visite fin",
        },
        {
          name: "siteId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filtrer par site visité",
        },
        {
          name: "checkpointId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filtrer par checkpoint visité",
        },
        {
          name: "dateCreationDebut",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Date de création début",
        },
        {
          name: "dateCreationFin",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Date de création fin",
        },
        {
          name: "actif",
          in: "query",
          schema: { type: "string", enum: ["true", "false"] },
          description:
            "Filtrer visiteurs actifs (avec visites récentes - 30 jours)",
        },
        {
          name: "avecBadge",
          in: "query",
          schema: { type: "string", enum: ["true", "false"] },
          description: "Filtrer visiteurs avec/sans badge",
        },
        {
          name: "avecIncidents",
          in: "query",
          schema: { type: "string", enum: ["true", "false"] },
          description: "Filtrer visiteurs avec/sans incidents",
        },
        {
          name: "page",
          in: "query",
          schema: { type: "integer", default: 1 },
          description: "Numéro de page",
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 10 },
          description: "Nombre d'éléments par page",
        },
      ],
      responses: {
        200: {
          description: "Visiteurs filtrés récupérés avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Visiteurs filtrés récupérés avec succès",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Visitor" },
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      page: { type: "integer", example: 1 },
                      limit: { type: "integer", example: 10 },
                      total: { type: "integer", example: 156 },
                      totalPages: { type: "integer", example: 16 },
                      hasNext: { type: "boolean", example: true },
                      hasPrev: { type: "boolean", example: false },
                    },
                  },
                  filterOptions: {
                    $ref: "#/components/schemas/VisitorFilterOptionsSchema",
                  },
                  filters: {
                    type: "object",
                    description: "Filtres appliqués",
                  },
                },
              },
            },
          },
        },
        400: { description: "Requête invalide" },
        403: { description: "Accès refusé" },
        500: { description: "Erreur serveur" },
      },
    },
  },
  "/api/v1/visitors/filter-options": {
    get: {
      tags: ["Visitors"],
      summary: "Récupérer les options de filtre dynamiques pour les visiteurs",
      description:
        "Récupère les options de filtre automatiques qui se mettent à jour selon les filtres sélectionnés",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "idType",
          in: "query",
          schema: { type: "string" },
          description: "Pré-filtrer les options par type d'ID",
        },
        {
          name: "company",
          in: "query",
          schema: { type: "string" },
          description: "Pré-filtrer les options par entreprise",
        },
        {
          name: "siteId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Pré-filtrer les options par site",
        },
        {
          name: "checkpointId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Pré-filtrer les options par checkpoint",
        },
        {
          name: "isBlacklisted",
          in: "query",
          schema: { type: "string", enum: ["true", "false"] },
          description: "Pré-filtrer les options par statut blacklist",
        },
      ],
      responses: {
        200: {
          description: "Options de filtre récupérées avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Options de filtre récupérées avec succès",
                  },
                  data: {
                    $ref: "#/components/schemas/VisitorFilterOptionsSchema",
                  },
                },
              },
            },
          },
        },
        400: { description: "Requête invalide" },
        403: { description: "Accès refusé" },
        500: { description: "Erreur serveur" },
      },
    },
  },
  // ==================== VISIT ENDPOINTS ====================
  "/api/v1/visits": {
    get: {
      tags: ["Visits"],
      summary: "Lister toutes les visites",
      description:
        "Récupère la liste de toutes les visites avec pagination et filtres",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "page",
          in: "query",
          schema: { type: "string", default: "1" },
          description: "Numéro de page",
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "string", default: "10" },
          description: "Nombre d'éléments par page",
        },
        {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description:
            "Recherche par nom du visiteur, entité visitée ou contact",
        },
        {
          name: "visitorId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filtrer par ID de visiteur",
        },
        {
          name: "status",
          in: "query",
          schema: { type: "string", enum: ["present", "left"] },
          description: "Filtrer par statut de la visite",
        },
      ],
      responses: {
        200: {
          description: "Liste des visites récupérée avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Visit" },
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      page: { type: "number", example: 1 },
                      limit: { type: "number", example: 10 },
                      total: { type: "number", example: 45 },
                      totalPages: { type: "number", example: 5 },
                    },
                  },
                },
              },
            },
          },
        },
        403: { description: "Accès refusé - permissions insuffisantes" },
        500: { description: "Erreur serveur" },
      },
    },
    post: {
      tags: ["Visits"],
      summary: "Créer une nouvelle visite",
      description: "Crée une nouvelle visite pour un visiteur existant",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateVisitInput" },
            examples: {
              "Exemple standard": {
                value: {
                  visitorId: "550e8400-e29b-41d4-a716-446655440000",
                  checkpointId: "770e8400-e29b-41d4-a716-446655440002",
                  entityVisited: "Direction Générale",
                  contactPerson: "Jean KABORE",
                  origin: "Entreprise ABC",
                  reason: "Réunion de suivi projet",
                  notes: "Visiteur attendu à 14h00",
                  status: "present",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Visite créée avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Visite créée avec succès",
                  },
                  data: { $ref: "#/components/schemas/Visit" },
                },
              },
            },
          },
        },
        400: { description: "Données invalides" },
        403: { description: "Accès refusé - permissions insuffisantes" },
        500: { description: "Erreur serveur" },
      },
    },
  },
  "/api/v1/visits/{id}": {
    get: {
      tags: ["Visits"],
      summary: "Récupérer une visite par ID",
      description: "Récupère les détails complets d'une visite spécifique",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "ID de la visite",
        },
      ],
      responses: {
        200: {
          description: "Visite trouvée",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Visit" },
                },
              },
            },
          },
        },
        404: { description: "Visite non trouvée" },
        403: { description: "Accès refusé - permissions insuffisantes" },
        500: { description: "Erreur serveur" },
      },
    },
    delete: {
      tags: ["Visits"],
      summary: "Supprimer une visite",
      description: "Supprime définitivement une visite",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "ID de la visite",
        },
      ],
      responses: {
        200: {
          description: "Visite supprimée avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Visite supprimée avec succès",
                  },
                },
              },
            },
          },
        },
        404: { description: "Visite non trouvée" },
        403: { description: "Accès refusé - permissions insuffisantes" },
        500: { description: "Erreur serveur" },
      },
    },
  },
  "/api/v1/visits/{id}/checkout": {
    patch: {
      tags: ["Visits"],
      summary: "Terminer une visite (checkout)",
      description: "Marque une visite comme terminée avec une heure de sortie",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "ID de la visite",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CheckoutVisitInput" },
            examples: {
              "Sortie maintenant": {
                value: { endAt: "2024-11-24T18:00:00Z" },
              },
              "Sortie avec heure spécifique": {
                value: { endAt: "2024-11-24T17:30:00Z" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Visite terminée avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Visite terminée avec succès",
                  },
                  data: { $ref: "#/components/schemas/Visit" },
                },
              },
            },
          },
        },
        400: { description: "Visite déjà terminée ou données invalides" },
        404: { description: "Visite non trouvée" },
        403: { description: "Accès refusé - permissions insuffisantes" },
        500: { description: "Erreur serveur" },
      },
    },
  },
  "/api/v1/visits/stats": {
    get: {
      tags: ["Visits"],
      summary: "Statistiques des visites",
      description: "Récupère les statistiques générales des visites",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Statistiques récupérées avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      total: {
                        type: "number",
                        example: 150,
                        description: "Nombre total de visites",
                      },
                      present: {
                        type: "number",
                        example: 12,
                        description: "Visites en cours (present)",
                      },
                      left: {
                        type: "number",
                        example: 138,
                        description: "Visites terminées (left)",
                      },
                      today: {
                        type: "number",
                        example: 8,
                        description: "Visites du jour",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        403: { description: "Accès refusé - permissions insuffisantes" },
        500: { description: "Erreur serveur" },
      },
    },
  },
  "/api/v1/visits/active": {
    get: {
      tags: ["Visits"],
      summary: "Liste des visites actives",
      description: "Récupère la liste des visiteurs actuellement présents",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Visites actives récupérées avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Visit" },
                  },
                  count: { type: "number", example: 12 },
                },
              },
            },
          },
        },
        403: { description: "Accès refusé - permissions insuffisantes" },
        500: { description: "Erreur serveur" },
      },
    },
  },
  // ==================== APPOINTMENT ENDPOINTS ====================
  "/api/v1/appointments": {
    get: {
      tags: ["Appointments"],
      summary: "Lister tous les rendez-vous",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "page", in: "query", schema: { type: "string" } },
        { name: "limit", in: "query", schema: { type: "string" } },
        { name: "search", in: "query", schema: { type: "string" } },
        { name: "visitorId", in: "query", schema: { type: "string" } },
        { name: "serviceId", in: "query", schema: { type: "string" } },
        { name: "upcoming", in: "query", schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Liste des rendez-vous",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedResponse" },
            },
          },
        },
      },
    },
    post: {
      tags: ["Appointments"],
      summary: "Créer un nouveau rendez-vous",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateAppointmentInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Rendez-vous créé",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  data: { $ref: "#/components/schemas/Appointment" },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/appointments/{id}": {
    get: {
      tags: ["Appointments"],
      summary: "Récupérer un rendez-vous par ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Rendez-vous trouvé",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  data: { $ref: "#/components/schemas/Appointment" },
                },
              },
            },
          },
        },
      },
    },
    put: {
      tags: ["Appointments"],
      summary: "Mettre à jour un rendez-vous",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateAppointmentInput" },
          },
        },
      },
      responses: {
        200: {
          description: "Rendez-vous mis à jour",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  data: { $ref: "#/components/schemas/Appointment" },
                },
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ["Appointments"],
      summary: "Supprimer un rendez-vous",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Rendez-vous supprimé",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },
  // ==================== INCIDENT ENDPOINTS ====================
  "/api/v1/incidents": {
    get: {
      tags: ["Incidents"],
      summary: "Lister tous les incidents",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "page",
          in: "query",
          schema: { type: "integer", default: 1 },
          description: "Numéro de page",
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 10 },
          description: "Nombre d'éléments par page",
        },
        {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description: "Recherche textuelle",
        },
        {
          name: "visitId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filtrer par visite",
        },
        {
          name: "siteId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filtrer par site",
        },
        {
          name: "resolved",
          in: "query",
          schema: { type: "boolean" },
          description: "Filtrer incidents résolus",
        },
      ],
      responses: {
        200: {
          description: "✅ Liste des incidents récupérée",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Incidents récupérés avec succès",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Incident" },
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      page: { type: "integer", example: 1 },
                      limit: { type: "integer", example: 10 },
                      total: { type: "integer", example: 25 },
                      totalPages: { type: "integer", example: 3 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Incidents"],
      summary: "🚨 Créer un nouvel incident",
      description: "Crée un nouvel incident lié à une visite ou à un visiteur",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateIncidentInput" },
          },
        },
      },
      responses: {
        201: {
          description: "✅ Incident créé avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Incident créé avec succès",
                  },
                  data: { $ref: "#/components/schemas/Incident" },
                },
              },
            },
          },
        },
        400: {
          description: "❌ Données invalides",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: {
                    type: "string",
                    example: "Titre, description et siteId sont requis",
                  },
                },
              },
            },
          },
        },
        404: {
          description: "❌ Ressource non trouvée",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: { type: "string", example: "Site non trouvé" },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/incidents/{id}": {
    get: {
      tags: ["Incidents"],
      summary: "🔍 Récupérer un incident par ID",
      description:
        "Récupère les détails complets d'un incident avec ses relations",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "ID de l'incident",
        },
      ],
      responses: {
        200: {
          description: "✅ Incident trouvé",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Incident trouvé avec succès",
                  },
                  data: { $ref: "#/components/schemas/Incident" },
                },
              },
            },
          },
        },
        404: {
          description: "❌ Incident non trouvé",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: { type: "string", example: "Incident non trouvé" },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/incidents/visitor/{visitorId}": {
    get: {
      tags: ["Incidents"],
      summary: "👤 Récupérer les incidents d'un visiteur",
      description:
        "Récupère tous les incidents liés aux visites d'un visiteur spécifique",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "visitorId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "ID du visiteur",
        },
        {
          name: "siteId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filtrer par site",
        },
        {
          name: "isResolved",
          in: "query",
          schema: { type: "boolean" },
          description: "Filtrer incidents résolus",
        },
        {
          name: "severite",
          in: "query",
          schema: {
            type: "string",
            enum: ["FAIBLE", "MOYENNE", "ELEVEE", "CRITIQUE"],
          },
          description: "Filtrer par sévérité",
        },
        {
          name: "dateDebut",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Date de début (YYYY-MM-DD)",
        },
        {
          name: "dateFin",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Date de fin (YYYY-MM-DD)",
        },
      ],
      responses: {
        200: {
          description: "✅ Incidents du visiteur récupérés",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "3 incident(s) trouvé(s) pour ce visiteur",
                  },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Incident" },
                  },
                  total: { type: "integer", example: 3 },
                },
              },
            },
          },
        },
        404: {
          description: "❌ Aucune visite trouvée pour ce visiteur",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Aucune visite trouvée pour ce visiteur",
                  },
                  data: { type: "array", items: {} },
                  total: { type: "integer", example: 0 },
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/nondesirables": {
    get: {
      tags: ["Nondesirables"],
      summary: "Lister tous les visiteurs indésirables (connus + inconnus)",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "page",
          in: "query",
          schema: { type: "integer", default: 1 },
          description: "Numéro de page",
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 10 },
          description: "Nombre d'éléments par page",
        },
        {
          name: "search",
          in: "query",
          schema: { type: "string" },
          description: "Terme de recherche",
        },
      ],
      responses: {
        200: {
          description: "Liste des visiteurs indésirables",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  data: {
                    type: "object",
                    properties: {
                      nondesirables: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Nondesirable" },
                      },
                      pagination: { type: "object" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Nondesirables"],
      summary: "Ajouter un visiteur à la liste des indésirables",
      description:
        "Ajouter un visiteur existant à la liste des indésirables. Cette action active isBlacklisted=true, ajoute la raison, crée un historique dans BlacklistHistory et une entrée dans NonDesirable.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateNondesirableInput" },
            example: {
              visitorId: "880e8400-e29b-41d4-a716-446655440001",
              reason: "Comportement inapproprié lors de la dernière visite",
            },
          },
        },
      },
      responses: {
        201: {
          description:
            "Visiteur ajouté à la liste des indésirables avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/Nondesirable" },
                },
              },
            },
          },
        },
        400: {
          description: "Erreur de validation ou visiteur déjà dans la liste",
        },
        404: { description: "Visiteur non trouvé" },
      },
    },
  },

  "/api/v1/nondesirables/known": {
    get: {
      tags: ["Nondesirables"],
      summary: "Lister uniquement les visiteurs indésirables connus",
      description:
        "Retourne les visiteurs enregistrés dans la base et marqués comme indésirables.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Liste des indésirables connus",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Nondesirable" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/nondesirables/unknown/list": {
    get: {
      tags: ["Nondesirables"],
      summary: "Lister uniquement les visiteurs indésirables inconnus",
      description:
        "Individus sans fiche visiteur mais inscrits comme indésirables.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Liste des indésirables inconnus",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/UnknownNondesirable" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/nondesirables/unknown": {
    post: {
      tags: ["Nondesirables"],
      summary: "Ajouter un indésirable inconnu (ADMIN seulement)",
      description:
        "Ajoute un indésirable non enregistré comme visiteur. Crée un historique dans BlacklistHistory.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateUnknownNondesirableInput",
            },
            example: {
              firstName: "Jean",
              lastName: "SUSPECT",
              birthDate: "1980-06-15",
              birthPlace: "Ouagadougou",
              sexe: "M",
              givingDate: "2020-01-01",
              expirationDate: "2030-01-01",
              phone: "+22670112233",
              email: "suspect@example.com",
              idType: "CNI",
              idNumber: "B1234567890",
              idScanUrl: "https://example.com/scans/suspect123.jpg",
              photoUrl: "https://example.com/photos/suspect123.jpg",
              company: "Entreprise Suspecte SARL",
              nationality: "Burkinabé",
              reason: "Comportement suspect signalé par les autorités",
              incidentDate: "2024-11-20",
              incidentLocation: "Entrée principale",
              severityLevel: 3,
            },
          },
        },
      },
      responses: {
        201: {
          description: "Indésirable inconnu ajouté avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/UnknownNondesirable" },
                },
              },
            },
          },
        },
        400: { description: "Personne déjà dans la liste" },
        403: { description: "Accès refusé - ADMIN requis" },
      },
    },
  },
  "/api/v1/nondesirables/unknown": {
    post: {
      tags: ["Nondesirables"],
      summary:
        "Ajouter un indésirable inconnu (ADMIN seulement) - FormData avec fichier",
      description:
        "Ajoute un indésirable non enregistré comme visiteur. Accepte FormData avec un fichier optionnel (image ou PDF).",
      security: [{ bearerAuth: [] }],
      consumes: ["multipart/form-data"],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["firstName", "lastName", "reason"],
              properties: {
                // CHAMPS TEXTE
                firstName: { type: "string", example: "Jean" },
                lastName: { type: "string", example: "SUSPECT" },
                birthDate: { type: "string", example: "1980-06-15" },
                birthPlace: { type: "string", example: "Ouagadougou" },
                sexe: { type: "string", example: "M" },
                givingDate: { type: "string", example: "2020-01-01" },
                expirationDate: { type: "string", example: "2030-01-01" },
                phone: { type: "string", example: "+22670112233" },
                email: { type: "string", example: "suspect@example.com" },
                idType: { type: "string", example: "CNI" },
                idNumber: { type: "string", example: "B1234567890" },
                company: {
                  type: "string",
                  example: "Entreprise Suspecte SARL",
                },
                nationality: { type: "string", example: "Burkinabé" },
                reason: {
                  type: "string",
                  example: "Comportement suspect signalé",
                },
                incidentDate: { type: "string", example: "2024-11-20" },
                incidentLocation: {
                  type: "string",
                  example: "Entrée principale",
                },
                severityLevel: { type: "integer", example: 3 },

                // UN SEUL FICHIER (optionnel)
                photo: {
                  type: "string",
                  format: "binary",
                  description:
                    "Fichier image (JPEG, PNG, JPG, WEBP) ou PDF (max 10MB)",
                },
              },
            },
            encoding: {
              photo: {
                contentType:
                  "image/jpeg, image/png, image/jpg, image/webp, application/pdf",
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Indésirable inconnu ajouté avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/UnknownNondesirable" },
                },
              },
            },
          },
        },
        400: {
          description: "Données invalides ou fichier trop volumineux",
        },
        403: {
          description: "Accès refusé - ADMIN requis",
        },
        413: {
          description: "Fichier trop volumineux (max 10MB)",
        },
        415: {
          description: "Type de fichier non supporté",
        },
      },
    },
  },
  "/api/v1/nondesirables/visitor/{visitorId}": {
    delete: {
      tags: ["Nondesirables"],
      summary: "Retirer un visiteur de la liste des indésirables",
      description:
        "Désactive isBlacklisted, nettoie la raison, crée un historique UNBLACKLIST et supprime l'entrée NonDesirable.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "visitorId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "ID du visiteur à retirer",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["reason"],
              properties: {
                reason: {
                  type: "string",
                  description:
                    "La raison pour laquelle le visiteur est retiré de la blacklist",
                  example:
                    "Comportement corrigé et approuvé par l'administration",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Visiteur retiré avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        400: { description: "Visiteur non trouvé ou pas blacklisté" },
      },
    },
  },

  "/api/v1/nondesirables/visitor/{id}/blacklist-history": {
    get: {
      tags: ["Nondesirables"],
      summary: "Obtenir l’historique de blacklist d’un visiteur",
      description:
        "Retourne tous les événements de blacklist associés à un visiteur donné.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "ID du visiteur",
        },
      ],
      responses: {
        200: {
          description: "Historique de blacklist du visiteur",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/BlacklistHistory" },
                  },
                },
              },
            },
          },
        },
        404: { description: "Visiteur non trouvé" },
        500: { description: "Erreur serveur" },
      },
    },
  },

  "/api/v1/nondesirables/unknown/user": {
    delete: {
      tags: ["Nondesirables"],
      summary: "Retirer un indésirable inconnu",
      description:
        "Supprime un indésirable inconnu en se basant sur son ID et ajoute une raison dans l’historique.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["id", "reason", "reportedBy"],
              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                  description: "ID de l’indésirable inconnu à retirer",
                },
                reason: {
                  type: "string",
                  description:
                    "La raison pour laquelle l’indésirable est retiré",
                  example: "Erreur de signalement ou comportement corrigé",
                },
                reportedBy: {
                  type: "string",
                  format: "uuid",
                  description:
                    "ID de l’utilisateur qui effectue la suppression",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Indésirable inconnu retiré avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        400: {
          description: "Indésirable non trouvé ou déjà supprimé",
        },
        500: {
          description: "Erreur serveur",
        },
      },
    },

    "/api/v1/nondesirables/unknown/{id}": {
      get: {
        tags: ["Nondesirables"],
        summary: "Récupérer un indésirable inconnu par ID",
        description: "Retourne les détails d’un indésirable inconnu.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "ID de l’indésirable inconnu",
          },
        ],
        responses: {
          200: {
            description: "Détails récupérés avec succès",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/UnknownNondesirable" },
                  },
                },
              },
            },
          },
          404: { description: "Indésirable non trouvé" },
          500: { description: "Erreur serveur" },
        },
      },
    },
  },

  // =================== SOS ENDPOINTS ====================
  "/api/v1/sos": {
    get: {
      tags: ["SOS"],
      summary: "Lister toutes les alertes SOS",
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "page", in: "query", schema: { type: "string" } },
        { name: "limit", in: "query", schema: { type: "string" } },
        { name: "checkpointId", in: "query", schema: { type: "string" } },
        { name: "active", in: "query", schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Liste des alertes SOS",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaginatedResponse" },
            },
          },
        },
      },
    },
    post: {
      tags: ["SOS"],
      summary: "Déclencher une alerte SOS",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateSosInput" },
          },
        },
      },
      responses: {
        201: {
          description: "Alerte SOS déclenchée",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  data: { $ref: "#/components/schemas/SosAlert" },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/sos/{id}": {
    get: {
      tags: ["SOS"],
      summary: "Récupérer une alerte SOS par ID",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Alerte SOS trouvée",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  data: { $ref: "#/components/schemas/SosAlert" },
                },
              },
            },
          },
        },
      },
    },
    patch: {
      tags: ["SOS"],
      summary: "Résoudre une alerte SOS",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "SOS résolu avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  message: { type: "string" },
                  data: { $ref: "#/components/schemas/SosAlert" },
                },
              },
            },
          },
        },
        404: {
          description: "SOS non trouvé",
        },
        400: {
          description: "SOS déjà résolu",
        },
      },
    },
  },
  "/api/v1/sos/active": {
    get: {
      tags: ["SOS"],
      summary: "Lister toutes les alertes SOS actives (non résolues)",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Liste des alertes SOS actives",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/SosAlert" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/sos/stats": {
    get: {
      tags: ["SOS"],
      summary: "Statistiques des alertes SOS",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Statistiques SOS",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  data: {
                    type: "object",
                    properties: {
                      total: { type: "number" },
                      active: { type: "number" },
                      resolved: { type: "number" },
                      today: { type: "number" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/sos/general": {
    post: {
      tags: ["SOS"],
      summary:
        "Déclencher une alerte SOS générale automatique pour un checkpoint",
      description:
        'Déclenche automatiquement une alerte SOS générale avec un message prédéfini. Un seul paramètre requis : checkpointId. Le message est généré automatiquement au format "ALERTE GÉNÉRALE - [Nom du checkpoint]"',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateGeneralSOSInput",
            },
            example: {
              checkpointId: "770e8400-e29b-41d4-a716-446655440002",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Alerte SOS générale déclenchée automatiquement",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  message: {
                    type: "string",
                    example: "SOS général déclenché automatiquement",
                  },
                  data: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        format: "uuid",
                        description: "ID de l'alerte SOS créée",
                      },
                      checkpointId: {
                        type: "string",
                        format: "uuid",
                        description: "ID du checkpoint concerné",
                      },
                      message: {
                        type: "string",
                        example: "ALERTE GÉNÉRALE - Portail Principal",
                        description: "Message généré automatiquement",
                      },
                      triggeredBy: {
                        type: "string",
                        format: "uuid",
                        description:
                          "ID de l'utilisateur qui a déclenché l'alerte",
                      },
                      isResolved: {
                        type: "boolean",
                        example: false,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Checkpoint non trouvé",
        },
        403: {
          description: "Accès refusé",
        },
        500: {
          description: "Erreur serveur",
        },
      },
    },
  },
  // ==================== FILE ENDPOINTS ====================
  "/api/v1/files/upload": {
    post: {
      tags: ["Files"],
      summary: "Upload d'un fichier unique",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                file: {
                  type: "string",
                  format: "binary",
                  description: "Fichier à uploader",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Fichier uploadé avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  data: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      filename: { type: "string" },
                      originalName: { type: "string" },
                      mimeType: { type: "string" },
                      size: { type: "integer" },
                      path: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/files/upload-multiple": {
    post: {
      tags: ["Files"],
      summary: "Upload de fichiers multiples",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                files: {
                  type: "array",
                  items: {
                    type: "string",
                    format: "binary",
                  },
                  description: "Fichiers à uploader (max 5)",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Fichiers uploadés avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        filename: { type: "string" },
                        originalName: { type: "string" },
                        mimeType: { type: "string" },
                        size: { type: "integer" },
                        path: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/files/{id}": {
    get: {
      tags: ["Files"],
      summary: "Récupérer les métadonnées d'un fichier",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Métadonnées du fichier",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  data: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      filename: { type: "string" },
                      originalName: { type: "string" },
                      mimeType: { type: "string" },
                      size: { type: "integer" },
                      path: { type: "string" },
                      createdAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ["Files"],
      summary: "Supprimer un fichier",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Fichier supprimé",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ApiResponse" },
            },
          },
        },
      },
    },
  },
  "/api/v1/files/{id}/download": {
    get: {
      tags: ["Files"],
      summary: "Télécharger un fichier",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Fichier téléchargé",
          content: {
            "application/octet-stream": {
              schema: {
                type: "string",
                format: "binary",
              },
            },
          },
        },
      },
    },
  },
  "/api/v1/files/{id}/view": {
    get: {
      tags: ["Files"],
      summary: "Visualiser un fichier",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Fichier affiché",
          content: {
            "image/*": {
              schema: {
                type: "string",
                format: "binary",
              },
            },
            "application/pdf": {
              schema: {
                type: "string",
                format: "binary",
              },
            },
          },
        },
      },
    },
  },
  // ==================== HEALTH CHECK ====================
  "/api/v1/health": {
    get: {
      tags: ["System"],
      summary: "Vérification de l'état de l'API",
      description:
        "Endpoint de santé pour vérifier que l'API fonctionne correctement",
      responses: {
        200: {
          description: "API en bonne santé",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "OK" },
                  message: { type: "string", example: "API is healthy" },
                  timestamp: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
      },
    },
  },
  // ==================== DASHBOARD ENDPOINTS ====================
  "/api/v1/dashboard/stats": {
    get: {
      tags: ["Dashboard"],
      summary:
        "📊 Statistiques complètes du Dashboard SONABHY - Gestion des flux",
      description:
        "Récupère toutes les statistiques en temps réel du dashboard : visiteurs enregistrés, visites en cours, visites terminées, incidents signalés, liste détaillée des visiteurs présents, et statistiques des visites par état",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description:
            "✅ Statistiques complètes du dashboard récupérées avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      // --- STATISTIQUES PRINCIPALES ---
                      visitorsRegistered: {
                        type: "integer",
                        example: 8,
                        description:
                          "Nombre total de visiteurs enregistrés (non blacklistés)",
                      },
                      visitsInProgress: {
                        type: "integer",
                        example: 3,
                        description:
                          "Nombre de visites actuellement en cours (status: active, exitTime: null)",
                      },
                      visitsCompleted: {
                        type: "integer",
                        example: 5,
                        description:
                          "Nombre de visites terminées (status: finished)",
                      },
                      incidentsReported: {
                        type: "integer",
                        example: 1,
                        description: "Nombre total d'incidents signalés",
                      },

                      // --- STATISTIQUES PAR ÉTAT DES VISITES ---
                      visitStats: {
                        type: "object",
                        description:
                          "Statistiques détaillées des visites par état",
                        properties: {
                          totalVisits: {
                            type: "integer",
                            example: 15,
                            description: "Nombre total de toutes les visites",
                          },
                          activeVisits: {
                            type: "integer",
                            example: 3,
                            description:
                              "Visites actives (personnes encore sur site)",
                          },
                          finishedVisits: {
                            type: "integer",
                            example: 10,
                            description:
                              "Visites terminées (sortie enregistrée)",
                          },
                          cancelledVisits: {
                            type: "integer",
                            example: 2,
                            description: "Visites annulées",
                          },
                          visitsToday: {
                            type: "integer",
                            example: 7,
                            description:
                              "Visites du jour (entrées aujourd'hui)",
                          },
                          visitsThisWeek: {
                            type: "integer",
                            example: 28,
                            description: "Visites de la semaine",
                          },
                          visitsThisMonth: {
                            type: "integer",
                            example: 95,
                            description: "Visites du mois",
                          },
                          averageVisitDuration: {
                            type: "string",
                            example: "45 minutes",
                            description: "Durée moyenne des visites",
                          },
                          peakHour: {
                            type: "string",
                            example: "10:00",
                            description: "Heure de pointe pour les entrées",
                          },
                        },
                      },

                      // --- VISITEURS PRÉSENTS ---
                      visitorsPresent: {
                        type: "array",
                        description:
                          "Liste des visiteurs actuellement sur site",
                        items: {
                          type: "object",
                          properties: {
                            siteId: {
                              type: "string",
                              example: "550e8400-e29b-41d4-a716-446655440000",
                              description: "ID du site filtré",
                            },
                            date: {
                              type: "string",
                              example: "2025-11-28",
                              description: "Date du filtrage (YYYY-MM-DD)",
                            },
                            checkpointsFound: {
                              type: "integer",
                              example: 3,
                              description:
                                "Nombre de checkpoints trouvés pour ce site",
                            },
                            checkpointIds: {
                              type: "array",
                              items: { type: "string" },
                              example: [
                                "cbebf952-cc3f-11f0-aa39-0242ac140013",
                                "cbebf953-cc3f-11f0-aa39-0242ac140014",
                              ],
                              description:
                                "Liste des IDs des checkpoints du site",
                            },
                            company: {
                              type: "string",
                              example: "Entreprise KABORE & Fils",
                            },
                            phone: {
                              type: "string",
                              example: "+226 70 11 22 33",
                            },
                            service: {
                              type: "string",
                              example: "Direction Générale",
                            },
                            entryTime: {
                              type: "string",
                              format: "date-time",
                              example: "2024-11-24T08:45:00.000Z",
                            },
                            reason: {
                              type: "string",
                              example: "Réunion direction générale",
                            },
                            checkpoint: {
                              type: "string",
                              example: "Entrée Principale",
                            },
                            site: {
                              type: "string",
                              example: "Siège Principal",
                            },
                          },
                        },
                      },

                      // --- RÉSUMÉ ---
                      summary: {
                        type: "object",
                        properties: {
                          totalVisitorsToday: { type: "integer", example: 8 },
                          hasVisitorsPresent: {
                            type: "boolean",
                            example: true,
                          },
                          presentCount: { type: "integer", example: 3 },
                          totalVisitorsInDb: { type: "integer", example: 8 },
                          occupancyRate: {
                            type: "string",
                            example: "37.5%",
                            description: "Taux d'occupation actuel",
                          },
                          securityLevel: {
                            type: "string",
                            example: "NORMAL",
                            description:
                              "Niveau de sécurité basé sur les incidents",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: {
          description: "❌ Accès refusé",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: {
                    type: "string",
                    example: "Accès refusé. Permissions insuffisantes.",
                  },
                },
              },
            },
          },
        },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },
  "/api/v1/dashboard/visitors-present": {
    get: {
      tags: ["Dashboard"],
      summary: "👥 Visiteurs Présents du Jour - Par Site",
      description:
        "Récupère la liste des visiteurs présents du jour pour un site spécifique. Retourne uniquement les visiteurs entrés aujourd'hui et encore présents (pas de sortie enregistrée) pour le site spécifié.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "siteId",
          required: true,
          schema: {
            type: "string",
            format: "uuid",
          },
          description:
            "ID du site pour lequel récupérer les visiteurs présents",
          example: "550e8400-e29b-41d4-a716-446655440000",
        },
      ],
      responses: {
        200: {
          description:
            "✅ Liste des visiteurs présents du jour pour le site récupérée avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      count: {
                        type: "integer",
                        example: 2,
                        description: "Nombre de visiteurs présents",
                      },
                      visitors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            visitId: {
                              type: "string",
                              example: "aa0e8400-e29b-41d4-a716-446655440001",
                              description: "ID de la visite",
                            },
                            visitor: {
                              type: "object",
                              properties: {
                                id: {
                                  type: "string",
                                  example:
                                    "880e8400-e29b-41d4-a716-446655440001",
                                },
                                firstName: { type: "string", example: "BAKO" },
                                lastName: {
                                  type: "string",
                                  example: "SIDONIE",
                                },
                                company: {
                                  type: "string",
                                  example: "Entreprise KABORE & Fils",
                                  nullable: true,
                                },
                                phone: {
                                  type: "string",
                                  example: "+22657443692",
                                  nullable: true,
                                },
                                email: {
                                  type: "string",
                                  example: "bako.sidonie@email.com",
                                  nullable: true,
                                },
                              },
                            },
                            visit: {
                              type: "object",
                              properties: {
                                entryTime: {
                                  type: "string",
                                  format: "date-time",
                                  example: "2025-11-28T08:45:00.000Z",
                                  description: "Heure d'entrée",
                                },
                                reason: {
                                  type: "string",
                                  example: "Réunion direction générale",
                                  description: "Raison de la visite",
                                },
                                service: {
                                  type: "string",
                                  example: "Direction Générale",
                                  nullable: true,
                                  description: "Service visité",
                                },
                                checkpoint: {
                                  type: "string",
                                  example: "Entrée Principale",
                                  description: "Point de contrôle utilisé",
                                },
                                site: {
                                  type: "string",
                                  example: "Siège Social",
                                  description: "Nom du site",
                                },
                                siteId: {
                                  type: "string",
                                  example:
                                    "550e8400-e29b-41d4-a716-446655440000",
                                  description: "ID du site",
                                },
                              },
                            },
                          },
                        },
                      },
                      siteId: {
                        type: "string",
                        example: "550e8400-e29b-41d4-a716-446655440000",
                        description: "ID du site filtré",
                      },
                      date: {
                        type: "string",
                        example: "2025-11-28",
                        description: "Date du filtrage (YYYY-MM-DD)",
                      },
                      checkpointsFound: {
                        type: "integer",
                        example: 3,
                        description:
                          "Nombre de checkpoints trouvés pour ce site",
                      },
                      checkpointIds: {
                        type: "array",
                        items: { type: "string" },
                        example: [
                          "cbebf952-cc3f-11f0-aa39-0242ac140013",
                          "cbebf953-cc3f-11f0-aa39-0242ac140014",
                        ],
                        description: "Liste des IDs des checkpoints du site",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "❌ Requête invalide - siteId manquant",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: {
                    type: "string",
                    example: "siteId est requis dans les paramètres de requête",
                  },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },

  // ==================== STATS ENDPOINTS ====================
  "/api/v1/stats": {
    get: {
      tags: ["Statistics"],
      summary: "📊 Récupérer toutes les statistiques du système",
      description:
        "Retourne l'ensemble des statistiques disponibles pour tous les rôles.\n\n**Données incluses :**\n- 📈 **Statistiques globales** : Visiteurs, visites, visites du jour\n- 👑 **Stats Admin** : Sites, checkpoints, agents, santé système\n- 👨‍💼 **Stats Service** : Performance agents, rendez-vous, incidents\n- 🚨 **Stats Opérationnelles** : Checkpoints, SOS, blacklistages, trafic\n- 📊 **Graphiques** : Tendances, répartitions, catégories\n\n**Périodes :**\n- Tendances : 30 derniers jours\n- Blacklistages récents : 7 derniers jours\n- Trafic horaire : Aujourd'hui (24h)",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "✅ Statistiques récupérées avec succès",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      // --- GLOBAL ---
                      totalVisitors: {
                        type: "integer",
                        example: 1250,
                        description: "Nombre total de visiteurs uniques",
                      },
                      totalVisits: {
                        type: "integer",
                        example: 3450,
                        description: "Nombre total de visites",
                      },
                      visitsToday: {
                        type: "integer",
                        example: 45,
                        description: "Nombre de visites aujourd'hui",
                      },
                      activeVisits: {
                        type: "integer",
                        example: 12,
                        description: "Nombre de visites actives (non sorties)",
                      },

                      // --- ADMIN ---
                      adminStats: {
                        type: "object",
                        properties: {
                          totalSites: {
                            type: "integer",
                            example: 5,
                            description: "Nombre total de sites",
                          },
                          totalCheckpoints: {
                            type: "integer",
                            example: 23,
                            description: "Nombre total de checkpoints",
                          },
                          totalAgents: {
                            type: "integer",
                            example: 15,
                            description: "Nombre total d'agents",
                          },
                          systemHealth: {
                            type: "integer",
                            example: 92,
                            description: "Santé du système en pourcentage",
                          },
                          sitesStatus: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                name: {
                                  type: "string",
                                  example: "Siège Principal",
                                  description: "Nom du site",
                                },
                                status: {
                                  type: "string",
                                  enum: ["OK", "WARNING", "ERROR"],
                                  example: "OK",
                                  description: "Statut du site",
                                },
                                load: {
                                  type: "integer",
                                  example: 75,
                                  description: "Charge du site en pourcentage",
                                },
                              },
                            },
                            description: "Statut de chaque site",
                          },
                          recentBlacklistHits: {
                            type: "integer",
                            example: 3,
                            description:
                              "Nombre de blacklistages récents (7 derniers jours)",
                          },
                          totalSosAlerts: {
                            type: "integer",
                            example: 7,
                            description: "Nombre total d'alertes SOS",
                          },
                        },
                      },

                      // --- SERVICE ---
                      serviceStats: {
                        type: "object",
                        properties: {
                          myAgentsTotal: {
                            type: "integer",
                            example: 15,
                            description: "Nombre total d'agents",
                          },
                          myAgentsActive: {
                            type: "integer",
                            example: 12,
                            description: "Nombre d'agents actifs",
                          },
                          myServiceAppointmentsToday: {
                            type: "integer",
                            example: 8,
                            description: "Nombre de rendez-vous aujourd'hui",
                          },
                          myServicePendingAppointments: {
                            type: "integer",
                            example: 3,
                            description: "Nombre de rendez-vous en attente",
                          },
                          incidentsInMyService: {
                            type: "integer",
                            example: 2,
                            description: "Nombre d'incidents dans le service",
                          },
                          topVisitors: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                name: {
                                  type: "string",
                                  example: "Jean Dupont",
                                  description: "Nom du visiteur",
                                },
                                count: {
                                  type: "integer",
                                  example: 15,
                                  description: "Nombre de visites",
                                },
                              },
                            },
                            description: "Top des visiteurs les plus fréquents",
                          },
                          agentPerformance: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                name: {
                                  type: "string",
                                  example: "Marie Martin",
                                  description: "Nom de l'agent",
                                },
                                visitsHandled: {
                                  type: "integer",
                                  example: 45,
                                  description: "Visites traitées",
                                },
                              },
                            },
                            description:
                              "Performance des agents (visites traitées)",
                          },
                        },
                      },

                      // --- OPERATIONAL ---
                      operationalStats: {
                        type: "object",
                        properties: {
                          checkpointsOnline: {
                            type: "integer",
                            example: 20,
                            description: "Nombre de checkpoints en ligne",
                          },
                          checkpointsTotal: {
                            type: "integer",
                            example: 23,
                            description: "Nombre total de checkpoints",
                          },
                          busyCheckpoints: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                name: {
                                  type: "string",
                                  example: "Entrée Principale - Siège",
                                  description: "Nom du checkpoint",
                                },
                                queue: {
                                  type: "integer",
                                  example: 5,
                                  description: "Nombre de personnes en attente",
                                },
                              },
                            },
                            description: "Checkpoints les plus occupés",
                          },
                          sosActive: {
                            type: "integer",
                            example: 2,
                            description: "Nombre d'alertes SOS actives",
                          },
                          blacklistAttemptsToday: {
                            type: "integer",
                            example: 4,
                            description:
                              "Tentatives de blacklistage aujourd'hui",
                          },
                          hourlyTraffic: {
                            type: "array",
                            items: { type: "integer" },
                            description: "Trafic horaire sur 24 heures",
                            example: [
                              12, 8, 15, 25, 35, 45, 38, 42, 55, 48, 52, 61, 58,
                              63, 71, 68, 75, 82, 78, 65, 58, 45, 32, 18,
                            ],
                          },
                          peakHour: {
                            type: "string",
                            example: "17:00",
                            description: "Heure de pointe",
                          },
                        },
                      },

                      // --- GRAPHIQUES ---
                      visitsTrend: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            date: {
                              type: "string",
                              format: "date",
                              example: "2024-11-28",
                              description: "Date",
                            },
                            value: {
                              type: "integer",
                              example: 45,
                              description: "Nombre de visites",
                            },
                          },
                        },
                        description: "Tendance des visites sur 30 jours",
                      },
                      appointmentsTrend: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            date: {
                              type: "string",
                              format: "date",
                              example: "2024-11-28",
                              description: "Date",
                            },
                            value: {
                              type: "integer",
                              example: 8,
                              description: "Nombre de rendez-vous",
                            },
                          },
                        },
                        description: "Tendance des rendez-vous sur 30 jours",
                      },
                      visitsByType: {
                        type: "object",
                        additionalProperties: { type: "integer" },
                        example: {
                          VISITEUR: 120,
                          LIVRAISON: 35,
                          MAINTENANCE: 15,
                        },
                        description: "Visites par type",
                      },
                      appointmentsByStatus: {
                        type: "object",
                        additionalProperties: { type: "integer" },
                        example: {
                          CONFIRMED: 25,
                          PENDING: 8,
                          CANCELLED: 3,
                        },
                        description: "Rendez-vous par statut",
                      },
                      incidentsByCategory: {
                        type: "object",
                        additionalProperties: { type: "integer" },
                        example: {
                          ACCIDENT: 2,
                          REFUS: 5,
                          AUTRE: 3,
                        },
                        description: "Incidents par catégorie",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "❌ Non authentifié",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: {
                    type: "string",
                    example: "Token non valide ou expiré",
                  },
                },
              },
            },
          },
        },
        403: {
          description: "❌ Accès refusé",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: {
                    type: "string",
                    example: "Permissions insuffisantes",
                  },
                },
              },
            },
          },
        },
        500: {
          description: "❌ Erreur serveur",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: {
                    type: "string",
                    example: "Erreur lors de la récupération des statistiques",
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  // ==================== STATISTICS ENDPOINTS ====================
  "/api/v1/stats/agent-stats": {
    get: {
      tags: ["Statistics"],
      summary: "👥 Statistiques des agents",
      description: "Retourne les statistiques complètes des agents du système",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "✅ Statistiques des agents récupérées",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      totalAgents: { type: "integer", example: 15 },
                      activeAgents: { type: "integer", example: 12 },
                      inactiveAgents: { type: "integer", example: 3 },
                      agentsByRole: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            role: { type: "string", example: "AGENT_CONTROLE" },
                            count: { type: "integer", example: 8 },
                          },
                        },
                      },
                      activePercentage: { type: "integer", example: 80 },
                      inactivePercentage: { type: "integer", example: 20 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/stats/recent-connections": {
    get: {
      tags: ["Statistics"],
      summary: "🔌 Connexions récentes des agents",
      description:
        "Retourne la liste des connexions récentes des agents avec statistiques",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 10, minimum: 1, maximum: 50 },
          description: "Nombre maximum de connexions",
        },
      ],
      responses: {
        200: {
          description: "✅ Connexions récentes récupérées",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      connections: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: {
                              type: "string",
                              example: "550e8400-e29b-41d4-a716-446655440000",
                            },
                            user: { $ref: "#/components/schemas/User" },
                            connectedAt: {
                              type: "string",
                              format: "date-time",
                            },
                            expiresAt: { type: "string", format: "date-time" },
                            isCurrentlyActive: { type: "boolean" },
                            connectionType: { type: "string", example: "API" },
                          },
                        },
                      },
                      stats: {
                        type: "object",
                        properties: {
                          totalConnections: { type: "integer" },
                          todayConnections: { type: "integer" },
                          weekConnections: { type: "integer" },
                          activeConnections: { type: "integer" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/stats/agent-activity": {
    get: {
      tags: ["Statistics"],
      summary: "📋 Activité récente des agents",
      description: "Retourne l'activité récente des agents avec logs d'audit",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 20, minimum: 1, maximum: 100 },
          description: "Nombre maximum d'activités",
        },
        {
          name: "agentId",
          in: "query",
          schema: { type: "string", format: "uuid" },
          description: "Filtrer par un agent spécifique",
        },
      ],
      responses: {
        200: {
          description: "✅ Activité des agents récupérée",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      activities: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            user: { $ref: "#/components/schemas/User" },
                            action: { type: "string", example: "CREATE_VISIT" },
                            entity: { type: "string", example: "visit" },
                            entityId: { type: "string" },
                            timestamp: { type: "string", format: "date-time" },
                            ipAddress: { type: "string" },
                            userAgent: { type: "string" },
                          },
                        },
                      },
                      stats: {
                        type: "object",
                        properties: {
                          totalActivities: { type: "integer" },
                          todayActivities: { type: "integer" },
                          uniqueAgents: { type: "integer" },
                          topActions: {
                            type: "object",
                            additionalProperties: { type: "integer" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = swaggerPathsFinal;
