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

  // ==================== SERVICE ENDPOINTS ====================
  '/api/v1/services': {
    get: {
      tags: ['Services'],
      summary: 'Lister tous les services',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'string' } },
        { name: 'limit', in: 'query', schema: { type: 'string' } },
        { name: 'search', in: 'query', schema: { type: 'string' } }
      ],
      responses: {
        200: {
          description: 'Liste des services',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } }
        }
      }
    },
    post: {
      tags: ['Services'],
      summary: 'Créer un nouveau service',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateServiceInput' } } }
      },
      responses: {
        201: {
          description: 'Service créé',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Service' } } } } }
        }
      }
    }
  },

  '/api/v1/services/{id}': {
    get: {
      tags: ['Services'],
      summary: 'Récupérer un service par ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Service trouvé',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Service' } } } } }
        }
      }
    },
    put: {
      tags: ['Services'],
      summary: 'Mettre à jour un service',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateServiceInput' } } }
      },
      responses: {
        200: {
          description: 'Service mis à jour',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Service' } } } } }
        }
      }
    },
    delete: {
      tags: ['Services'],
      summary: 'Supprimer un service',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Service supprimé',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
        }
      }
    }
  },

  '/api/v1/services/{id}/stats': {
    get: {
      tags: ['Services'],
      summary: 'Statistiques d\'un service',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Statistiques du service',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      totalVisits: { type: 'integer' },
                      activeVisits: { type: 'integer' },
                      totalAppointments: { type: 'integer' },
                      totalIncidents: { type: 'integer' }
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

  '/api/v1/visitors/{id}/blacklist': {
    post: {
      tags: ['Visitors'],
      summary: 'Ajouter un visiteur à la liste noire',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/BlacklistVisitorInput' } } }
      },
      responses: {
        200: {
          description: 'Visiteur ajouté à la liste noire',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
        }
      }
    },
    delete: {
      tags: ['Visitors'],
      summary: 'Retirer un visiteur de la liste noire',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Visiteur retiré de la liste noire',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
        }
      }
    }
  },

  // '/api/v1/visitors/site/{siteId}': {
  //   get: {
  //     tags: ['Visitors'],
  //     summary: 'Récupérer les visiteurs d\'un site spécifique',
  //     security: [{ bearerAuth: [] }],
  //     parameters: [
  //       { name: 'siteId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'ID du site' },
  //       { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Numéro de page' },
  //       { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Nombre d\'éléments par page' },
  //       { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Recherche par nom, prénom, email, téléphone ou entreprise' }
  //     ],
  //     responses: {
  //       200: {
  //         description: 'Liste des visiteurs du site',
  //         content: {
  //           'application/json': {
  //             schema: {
  //               type: 'object',
  //               properties: {
  //                 success: { type: 'boolean' },
  //                 data: {
  //                   type: 'array',
  //                   items: { $ref: '#/components/schemas/VisitorWithSiteCount' }
  //                 },
  //                 pagination: {
  //                   type: 'object',
  //                   properties: {
  //                     page: { type: 'integer' },
  //                     limit: { type: 'integer' },
  //                     total: { type: 'integer' },
  //                     totalPages: { type: 'integer' }
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       },
  //       403: {
  //         description: 'Accès refusé'
  //       },
  //       404: {
  //         description: 'Site non trouvé'
  //       }
  //     }
  //   }
  // },

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
