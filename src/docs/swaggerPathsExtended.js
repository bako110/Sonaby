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

  // ==================== AGENT ENDPOINTS ====================
  '/api/v1/agents': {
    get: {
      tags: ['Agents'],
      summary: 'Lister tous les agents',
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
  }
};

module.exports = swaggerPathsExtended;
