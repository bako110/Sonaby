// Suite de la documentation Swagger pour tous les autres endpoints
const swaggerPathsExtended = {
  // ==================== CHECKPOINT ENDPOINTS ====================
  '/api/v1/checkpoints': {
    get: {
      tags: ['Checkpoints'],
      summary: 'Lister tous les checkpoints',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'string' } },
        { name: 'limit', in: 'query', schema: { type: 'string' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'siteId', in: 'query', schema: { type: 'string' }, description: 'Filtrer par site' }
      ],
      responses: {
        200: {
          description: 'Liste des checkpoints',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } }
        }
      }
    },
    post: {
      tags: ['Checkpoints'],
      summary: 'Créer un nouveau checkpoint',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCheckpointInput' } } }
      },
      responses: {
        201: {
          description: 'Checkpoint créé',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Checkpoint' } } } } }
        }
      }
    }
  },

  '/api/v1/checkpoints/{id}': {
    get: {
      tags: ['Checkpoints'],
      summary: 'Récupérer un checkpoint par ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Checkpoint trouvé',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Checkpoint' } } } } }
        }
      }
    },
    put: {
      tags: ['Checkpoints'],
      summary: 'Mettre à jour un checkpoint',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateCheckpointInput' } } }
      },
      responses: {
        200: {
          description: 'Checkpoint mis à jour',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Checkpoint' } } } } }
        }
      }
    },
    delete: {
      tags: ['Checkpoints'],
      summary: 'Supprimer un checkpoint',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Checkpoint supprimé',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
        }
      }
    }
  },

  '/api/v1/checkpoints/{id}/assign-agent': {
    post: {
      tags: ['Checkpoints'],
      summary: 'Assigner un agent à un checkpoint',
      description: 'Permet d\'assigner un agent de contrôle à un checkpoint spécifique. Nécessite les permissions ADMIN ou AGENT_GESTION.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { 
          name: 'id', 
          in: 'path', 
          required: true, 
          schema: { type: 'string', format: 'uuid' },
          description: 'ID du checkpoint'
        }
      ],
      requestBody: {
        required: true,
        description: 'Informations d\'assignation de l\'agent',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AssignAgentRequest' },
            examples: {
              assignAgent: {
                summary: 'Assigner un agent',
                value: {
                  agentId: 'e5c397cd-c586-11f0-aa39-0242ac140013'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Agent assigné avec succès',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AssignAgentResponse' },
              examples: {
                success: {
                  summary: 'Assignation réussie',
                  value: {
                    success: true,
                    message: 'Agent assigné avec succès',
                    data: {
                      id: 'e5c397cd-c586-11f0-aa39-0242ac140013',
                      firstName: 'Jean',
                      lastName: 'Dupont',
                      email: 'agent@controller.gmail.com',
                      checkpointId: '14ce1162-ca00-11f0-aa39-0242ac140014',
                      checkpoint: {
                        id: '14ce1162-ca00-11f0-aa39-0242ac140014',
                        name: 'Portail Principal',
                        site: {
                          id: '14ce1162-ca00-11f0-aa39-0242ac140013',
                          name: 'SITE Paul'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        403: {
          description: 'Accès refusé - ADMIN ou AGENT_GESTION requis',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
              examples: {
                forbidden: {
                  summary: 'Permissions insuffisantes',
                  value: {
                    success: false,
                    error: 'FORBIDDEN',
                    message: 'Accès refusé. Seuls les administrateurs et agents de gestion peuvent assigner des agents.',
                    timestamp: '2024-11-27T13:15:00.000Z'
                  }
                }
              }
            }
          }
        },
        404: {
          description: 'Checkpoint ou agent non trouvé',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
              examples: {
                checkpointNotFound: {
                  summary: 'Checkpoint non trouvé',
                  value: {
                    success: false,
                    error: 'NOT_FOUND',
                    message: 'Checkpoint non trouvé',
                    timestamp: '2024-11-27T13:15:00.000Z'
                  }
                },
                agentNotFound: {
                  summary: 'Agent non trouvé',
                  value: {
                    success: false,
                    error: 'NOT_FOUND',
                    message: 'Agent non trouvé',
                    timestamp: '2024-11-27T13:15:00.000Z'
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
              schema: { $ref: '#/components/schemas/ApiError' },
              examples: {
                serverError: {
                  summary: 'Erreur interne',
                  value: {
                    success: false,
                    error: 'InternalServerError',
                    message: 'Erreur lors de l\'assignation de l\'agent',
                    timestamp: '2024-11-27T13:15:00.000Z'
                  }
                }
              }
            }
          }
        }
      }
    },
  },

  '/api/v1/checkpoints/unassign/{id}': {
  delete: {
    tags: ['Checkpoints'],
    summary: 'Désaffecter un agent d’un checkpoint',
    description: 'Supprime l’affectation d’un agent à un checkpoint (ADMIN et AGENT_GESTION uniquement)',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'Identifiant du checkpoint'
      }
    ],
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              agentId: { type: 'string', format: 'uuid', description: "ID de l'agent à désaffecter" }
            },
            required: ['agentId']
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Agent désaffecté avec succès',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: { $ref: '#/components/schemas/Checkpoint' }
              }
            }
          }
        }
      },
      400: { $ref: '#/components/responses/BadRequest' },
      401: { $ref: '#/components/responses/Unauthorized' },
      403: { $ref: '#/components/responses/Forbidden' },
      404: {
        description: 'Checkpoint ou agent non trouvé',
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
      500: { $ref: '#/components/responses/InternalServerError' }
    }
  }
},
  // ==================== AGENT ENDPOINTS ====================
  '/api/v1/agents': {
    get: {
      tags: ['Agents'],
      summary: 'Lister tous les agents de contrôle',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'string' } },
        { name: 'limit', in: 'query', schema: { type: 'string' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'checkpointId', in: 'query', schema: { type: 'string' }, description: 'Filtrer par checkpoint' }
      ],
      responses: {
        200: {
          description: 'Liste des agents',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } }
        }
      }
    },
    post: {
      tags: ['Agents'],
      summary: 'Créer un nouvel agent',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateAgentInput' } } }
      },
      responses: {
        201: {
          description: 'Agent créé',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Agent' } } } } }
        }
      }
    }
  },

  '/api/v1/agents/{id}': {
    get: {
      tags: ['Agents'],
      summary: 'Récupérer un agent par ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Agent trouvé',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Agent' } } } } }
        }
      }
    },
    put: {
      tags: ['Agents'],
      summary: 'Mettre à jour un agent',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateAgentInput' } } }
      },
      responses: {
        200: {
          description: 'Agent mis à jour',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Agent' } } } } }
        }
      }
    },
    delete: {
      tags: ['Agents'],
      summary: 'Supprimer un agent',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Agent supprimé',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
        }
      }
    }
  },
// ==================== CONTROL AGENTS ENDPOINT ====================
'/api/v1/agents/controlAgents/{siteId}': {
  get: {
    tags: ['Agents'],
    summary: 'Lister les agents de contrôle d’un site',
    description: 'Récupérer la liste des agents de contrôle affectés à un site spécifique (ADMIN et CHEF_SERVICE uniquement)',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'Identifiant du site'
      }
    ],
    responses: {
      200: {
        description: 'Liste des agents de contrôle du site',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Agent' }
                }
              }
            }
          }
        }
      },
      401: { $ref: '#/components/responses/Unauthorized' },
      403: { $ref: '#/components/responses/Forbidden' },
      404: {
        description: 'Site non trouvé',
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
      }
    }
  }
},
  // ==================== SERVICE ENDPOINTS ====================

 '/api/v1/services/sites/{siteId}/assign/{userId}': {
  post: {
    tags: ['Services'],
    summary: 'Affecter un agent à un site',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'ID du site'
      },
      {
        name: 'userId',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'ID de l’agent'
      }
    ],
    responses: {
      200: {
        description: 'Agent affecté avec succès',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: {
                  type: 'object',
                  properties: {
                    siteId: { type: 'string' },
                    userId: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      },
      404: { description: 'Site ou utilisateur introuvable' }
    }
  }
},

'/api/v1/services/sites/{siteId}/agents': {
  get: {
    tags: ['Services'],
    summary: 'Lister les agents affectés à un site',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'ID du site'
      }
    ],
    responses: {
      200: {
        description: 'Liste des agents du site',
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
                      id: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string' }
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

'/api/v1/services/sites/{siteId}/agent/{userId}': {
  delete: {
    tags: ['Services'],
    summary: 'Retirer un agent d’un site',
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: 'siteId',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'ID du site'
      },
      {
        name: 'userId',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'ID de l’agent'
      }
    ],
    responses: {
      200: {
        description: 'Agent retiré avec succès',
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
      404: { description: 'Agent ou site introuvable' }
    }
  }
},

  // ==================== VISITOR ENDPOINTS ====================
  '/api/v1/visitors': {
    get: {
      tags: ['Visitors'],
      summary: 'Lister tous les visiteurs',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'string' } },
        { name: 'limit', in: 'query', schema: { type: 'string' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'company', in: 'query', schema: { type: 'string' } },
        { name: 'isBlacklisted', in: 'query', schema: { type: 'string' } },
        { name: 'idType', in: 'query', schema: { type: 'string', enum: ['CNI', 'PASSEPORT', 'PERMIS_CONDUITE', 'CARTE_SEJOUR', 'AUTRE'] } }
      ],
      responses: {
        200: {
          description: 'Liste des visiteurs',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } }
        }
      }
    },
    post: {
      tags: ['Visitors'],
      summary: 'Créer un nouveau visiteur',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateVisitorInput' } } }
      },
      responses: {
        201: {
          description: 'Visiteur créé',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Visitor' } } } } }
        }
      }
    }
  },

  '/api/v1/visitors/week-planning/{siteId}': {
    get: {
      tags: ['Visitors'],
      summary: 'Récupérer le planning de la semaine automatique pour un site',
      description: 'Retourne automatiquement le planning de la semaine actuelle (lundi à dimanche) avec les visiteurs uniques et les visites organisées par jour',
      security: [{ bearerAuth: [] }],
      parameters: [
        { 
          name: 'siteId', 
          in: 'path', 
          required: true, 
          schema: { type: 'string', format: 'uuid' },
          description: 'ID du site concerné'
        }
      ],
      responses: {
        200: {
          description: 'Planning de la semaine récupéré avec succès',
          content: { 
            'application/json': { 
              schema: {
                type: 'object',
                properties: {
                  success: { 
                    type: 'boolean', 
                    example: true,
                    description: 'Statut de la requête'
                  },
                  message: { 
                    type: 'string', 
                    example: 'Planning de la semaine récupéré avec succès',
                    description: 'Message informatif'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      weekPeriod: {
                        type: 'object',
                        description: 'Période automatique (semaine actuelle: lundi à dimanche)',
                        properties: {
                          start: { 
                            type: 'string', 
                            format: 'date-time',
                            example: '2025-12-01T00:00:00.000Z',
                            description: 'Début automatique (lundi de la semaine actuelle)'
                          },
                          end: { 
                            type: 'string', 
                            format: 'date-time',
                            example: '2025-12-07T23:59:59.999Z',
                            description: 'Fin automatique (dimanche de la semaine actuelle)'
                          },
                          siteId: { 
                            type: 'string', 
                            format: 'uuid',
                            description: 'ID du site concerné'
                          }
                        }
                      },
                      stats: {
                        type: 'object',
                        description: 'Statistiques de la semaine',
                        properties: {
                          totalVisits: { 
                            type: 'integer', 
                            example: 15,
                            description: 'Nombre total de visites'
                          },
                          totalVisitors: { 
                            type: 'integer', 
                            example: 12,
                            description: 'Nombre de visiteurs uniques'
                          },
                          visitsByDay: { 
                            type: 'integer', 
                            example: 5,
                            description: 'Nombre de jours avec des visites'
                          },
                          averageVisitsPerDay: { 
                            type: 'string', 
                            example: '3.0',
                            description: 'Moyenne de visites par jour'
                          }
                        }
                      },
                      planning: {
                        type: 'object',
                        description: 'Visites organisées par jour (format: YYYY-MM-DD)',
                        example: {
                          '2025-12-01': [
                            {
                              id: 'visit-uuid-1',
                              visitDate: '2025-12-01T09:00:00.000Z',
                              exitDate: '2025-12-01T10:30:00.000Z',
                              purpose: 'Réunion commerciale',
                              status: 'COMPLETED',
                              visitorId: 'visitor-uuid-1',
                              agentId: 'agent-uuid-1',
                              visitor: {
                                id: 'visitor-uuid-1',
                                firstName: 'Jean',
                                lastName: 'Dupont'
                              },
                              agent: {
                                id: 'agent-uuid-1',
                                firstName: 'Marie',
                                lastName: 'Curie'
                              }
                            }
                          ]
                        }
                      },
                      visitors: {
                        type: 'array',
                        description: 'Liste des visiteurs uniques (sans duplication)',
                        items: {
                          type: 'object',
                          properties: {
                            id: { 
                              type: 'string', 
                              format: 'uuid',
                              description: 'ID du visiteur'
                            },
                            firstName: { 
                              type: 'string', 
                              example: 'Jean',
                              description: 'Prénom du visiteur'
                            },
                            lastName: { 
                              type: 'string', 
                              example: 'Dupont',
                              description: 'Nom du visiteur'
                            },
                            phone: { 
                              type: 'string', 
                              example: '+22612345678',
                              description: 'Téléphone du visiteur'
                            },
                            email: { 
                              type: 'string', 
                              format: 'email',
                              example: 'jean.dupont@example.com',
                              description: 'Email du visiteur'
                            },
                            company: { 
                              type: 'string', 
                              example: 'Société ABC',
                              description: 'Entreprise du visiteur'
                            },
                            photoUrl: { 
                              type: 'string', 
                              example: '/uploads/visitors/photo_jean_dupont.jpg',
                              description: 'URL de la photo du visiteur'
                            },
                            visitsCount: { 
                              type: 'integer', 
                              example: 2,
                              description: 'Nombre de visites ce visiteur a effectuées cette semaine'
                            }
                          }
                        }
                      },
                      visits: {
                        type: 'array',
                        description: 'Liste complète des visites (référence)',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', format: 'uuid' },
                            visitDate: { type: 'string', format: 'date-time' },
                            exitDate: { type: 'string', format: 'date-time' },
                            purpose: { type: 'string' },
                            status: { type: 'string' },
                            visitorId: { type: 'string', format: 'uuid' },
                            agentId: { type: 'string', format: 'uuid' }
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
        403: {
          description: 'Accès refusé - permissions insuffisantes',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Accès refusé. Permissions insuffisantes pour consulter le planning.' }
                }
              }
            }
          }
        },
        404: {
          description: 'Site non trouvé',
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
        },
        500: {
          description: 'Erreur serveur',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Erreur lors de la récupération du planning' }
                }
              }
            }
          }
        }
      }
    }
  },

  '/api/v1/visitors/{id}': {
    get: {
      tags: ['Visitors'],
      summary: 'Récupérer un visiteur par ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Visiteur trouvé',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Visitor' } } } } }
        }
      }
    },
    put: {
      tags: ['Visitors'],
      summary: 'Mettre à jour un visiteur',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateVisitorInput' } } }
      },
      responses: {
        200: {
          description: 'Visiteur mis à jour',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Visitor' } } } } }
        }
      }
    },
    delete: {
      tags: ['Visitors'],
      summary: 'Supprimer un visiteur',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Visiteur supprimé',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
        }
      }
    }
  },


  '/api/v1/visitors/site/{siteId}': {
    get: {
      tags: ['Visitors'],
      summary: 'Récupérer les visiteurs d\'un site spécifique',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'siteId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'ID du site' },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Numéro de page' },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Nombre d\'éléments par page' },
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Recherche par nom, prénom, email, téléphone ou entreprise' }
      ],
      responses: {
        200: {
          description: 'Liste des visiteurs du site',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/VisitorWithSiteCount' }
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      page: { type: 'integer' },
                      limit: { type: 'integer' },
                      total: { type: 'integer' },
                      totalPages: { type: 'integer' }
                    }
                  }
                }
              }
            }
          }
        },
        403: {
          description: 'Accès refusé'
        },
        404: {
          description: 'Site non trouvé'
        }
      }
    }
  },


  '/api/v1/visits/checkpoint/{checkpointId}/daily': {
    get: {
      tags: ['Visits'],
      summary: 'Récupérer les visiteurs d\'un checkpoint par jour',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'checkpointId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'ID du checkpoint' },
        { name: 'date', in: 'query', required: true, schema: { type: 'string', format: 'date' }, description: 'Date pour récupérer les visiteurs (format: YYYY-MM-DD)' }
      ],
      responses: {
        200: {
          description: 'Liste des visiteurs du checkpoint pour la date spécifiée',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      date: { type: 'string', example: '2024-11-24' },
                      checkpoint: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          name: { type: 'string' },
                          site: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', format: 'uuid' },
                              name: { type: 'string' }
                            }
                          }
                        }
                      },
                      visitors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', format: 'uuid' },
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            email: { type: 'string' },
                            phone: { type: 'string' },
                            company: { type: 'string' },
                            isBlacklisted: { type: 'boolean' },
                            visitInfo: {
                              type: 'object',
                              properties: {
                                visitId: { type: 'string', format: 'uuid' },
                                entryTime: { type: 'string', format: 'date-time' },
                                exitTime: { type: 'string', format: 'date-time' },
                                status: { type: 'string' },
                                reason: { type: 'string' }
                              }
                            }
                          }
                        }
                      },
                      stats: {
                        type: 'object',
                        properties: {
                          totalVisitors: { type: 'integer' },
                          blacklistedCount: { type: 'integer' },
                          uniqueCompanies: { type: 'integer' },
                          visitsByHour: {
                            type: 'object',
                            additionalProperties: { type: 'integer' }
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
          description: 'Date manquante ou invalide'
        },
        403: {
          description: 'Accès refusé'
        },
        404: {
          description: 'Checkpoint non trouvé'
        }
      }
    }
  }
};

module.exports = swaggerPathsExtended;
