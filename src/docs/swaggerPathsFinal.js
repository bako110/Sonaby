// Dernière partie de la documentation Swagger
const swaggerPathsFinal = {
  // ==================== VISIT ENDPOINTS ====================
  '/api/v1/visits': {
    get: {
      tags: ['Visits'],
      summary: 'Lister toutes les visites',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'string' } },
        { name: 'limit', in: 'query', schema: { type: 'string' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'visitorId', in: 'query', schema: { type: 'string' } },
        { name: 'checkpointId', in: 'query', schema: { type: 'string' } },
        { name: 'serviceId', in: 'query', schema: { type: 'string' } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'finished', 'refused'] } }
      ],
      responses: {
        200: {
          description: 'Liste des visites',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } }
        }
      }
    },
    post: {
      tags: ['Visits'],
      summary: 'Créer une nouvelle visite',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateVisitInput' } } }
      },
      responses: {
        201: {
          description: 'Visite créée',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Visit' } } } } }
        }
      }
    }
  },

  '/api/v1/visits/{id}': {
    get: {
      tags: ['Visits'],
      summary: 'Récupérer une visite par ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Visite trouvée',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Visit' } } } } }
        }
      }
    },
    put: {
      tags: ['Visits'],
      summary: 'Mettre à jour une visite',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateVisitInput' } } }
      },
      responses: {
        200: {
          description: 'Visite mise à jour',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Visit' } } } } }
        }
      }
    }
  },

  '/api/v1/visits/{id}/checkout': {
    post: {
      tags: ['Visits'],
      summary: 'Terminer une visite (checkout)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CheckoutVisitInput' } } }
      },
      responses: {
        200: {
          description: 'Visite terminée',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Visit' } } } } }
        }
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

  // ==================== INCIDENT ENDPOINTS ====================
  '/api/v1/incidents': {
    get: {
      tags: ['Incidents'],
      summary: 'Lister tous les incidents',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'string' } },
        { name: 'limit', in: 'query', schema: { type: 'string' } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'visitorId', in: 'query', schema: { type: 'string' } },
        { name: 'serviceId', in: 'query', schema: { type: 'string' } },
        { name: 'resolved', in: 'query', schema: { type: 'string' } }
      ],
      responses: {
        200: {
          description: 'Liste des incidents',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } }
        }
      }
    },
    post: {
      tags: ['Incidents'],
      summary: 'Créer un nouvel incident',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateIncidentInput' } } }
      },
      responses: {
        201: {
          description: 'Incident créé',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Incident' } } } } }
        }
      }
    }
  },

  '/api/v1/incidents/{id}': {
    get: {
      tags: ['Incidents'],
      summary: 'Récupérer un incident par ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Incident trouvé',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Incident' } } } } }
        }
      }
    }
  },

  // ==================== NONDESIRABLE ENDPOINTS ====================
  '/api/v1/nondesirables': {
    get: {
      tags: ['Nondesirables'],
      summary: 'Lister tous les indésirables',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'string' } },
        { name: 'limit', in: 'query', schema: { type: 'string' } },
        { name: 'search', in: 'query', schema: { type: 'string' } }
      ],
      responses: {
        200: {
          description: 'Liste des indésirables',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } }
        }
      }
    },
    post: {
      tags: ['Nondesirables'],
      summary: 'Ajouter un indésirable',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateNondesirableInput' } } }
      },
      responses: {
        201: {
          description: 'Indésirable ajouté',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Nondesirable' } } } } }
        }
      }
    }
  },

  '/api/v1/nondesirables/{id}': {
    delete: {
      tags: ['Nondesirables'],
      summary: 'Retirer un indésirable',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        200: {
          description: 'Indésirable retiré',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } }
        }
      }
    }
  },

  // ==================== SOS ENDPOINTS ====================
  '/api/v1/sos': {
    get: {
      tags: ['SOS'],
      summary: 'Lister toutes les alertes SOS',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'string' } },
        { name: 'limit', in: 'query', schema: { type: 'string' } },
        { name: 'checkpointId', in: 'query', schema: { type: 'string' } },
        { name: 'active', in: 'query', schema: { type: 'string' } }
      ],
      responses: {
        200: {
          description: 'Liste des alertes SOS',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } }
        }
      }
    },
    post: {
      tags: ['SOS'],
      summary: 'Déclencher une alerte SOS',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateSosInput' } } }
      },
      responses: {
        201: {
          description: 'Alerte SOS déclenchée',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/SosAlert' } } } } }
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
  }
};

module.exports = swaggerPathsFinal;
