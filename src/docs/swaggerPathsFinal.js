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
  },

  // ==================== NONDESIRABLES ENDPOINTS ====================
  '/api/v1/nondesirables': {
    get: {
      tags: ['Nondesirables'],
      summary: 'Lister tous les visiteurs indésirables',
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
      description: 'Ajouter un visiteur existant à la liste des indésirables. Cette action va automatiquement activer isBlacklisted=true sur le visiteur, ajouter la raison dans blacklistReason, créer un historique dans BlacklistHistory et une entrée dans NonDesirable.',
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

  '/api/v1/nondesirables/unknown': {
    post: {
      tags: ['Nondesirables'],
      summary: 'Ajouter un indésirable inconnu (ADMIN seulement)',
      description: 'Permet à l\'administrateur d\'ajouter une personne à la liste des indésirables même si elle n\'est pas enregistrée comme visiteur dans le système. Cette action crée directement un historique dans BlacklistHistory sans créer de visiteur.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateUnknownNondesirableInput' },
            example: {
              firstName: 'Jean',
              lastName: 'SUSPECT',
              birthDate: '15/06/1980',
              birthPlace: 'Ouagadougou',
              sexe: 'M',
              givingDate: '01/01/2020',
              expirationDate: '01/01/2030',
              phone: '+226 70 11 22 33',
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

  '/api/v1/nondesirables/visitor/{visitorId}': {
    delete: {
      tags: ['Nondesirables'],
      summary: 'Retirer un visiteur de la liste des indésirables (recommandé)',
      description: 'Retire complètement un visiteur de la liste des indésirables. Cette action va automatiquement désactiver isBlacklisted=false sur le visiteur, supprimer blacklistReason, créer un historique UNBLACKLIST dans BlacklistHistory et supprimer l\'entrée NonDesirable.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'visitorId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'ID du visiteur à retirer de la blacklist' }
      ],
      responses: {
        200: {
          description: 'Visiteur retiré de la liste des indésirables avec succès',
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

  // ==================== DASHBOARD ENDPOINTS ====================
  '/api/v1/dashboard/stats': {
    get: {
      tags: ['Dashboard'],
      summary: '📊 Statistiques du Dashboard SONABHY - Gestion des flux',
      description: 'Récupère toutes les statistiques en temps réel du dashboard comme affiché dans l\'application mobile : visiteurs enregistrés, visites en cours, visites terminées, incidents signalés, liste détaillée des visiteurs présents sur site',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: '✅ Statistiques du dashboard récupérées avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      visitorsRegistered: { type: 'integer', example: 8 },
                      visitsInProgress: { type: 'integer', example: 3 },
                      visitsCompleted: { type: 'integer', example: 5 },
                      incidentsReported: { type: 'integer', example: 1 },
                      visitorsPresent: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: '880e8400-e29b-41d4-a716-446655440001' },
                            name: { type: 'string', example: 'Marie KABORE' },
                            company: { type: 'string', example: 'Entreprise KABORE & Fils' },
                            phone: { type: 'string', example: '+226 70 11 22 33' },
                            service: { type: 'string', example: 'Direction Générale' },
                            entryTime: { type: 'string', format: 'date-time', example: '2024-11-24T08:45:00.000Z' },
                            reason: { type: 'string', example: 'Réunion direction générale' }
                          }
                        }
                      },
                      summary: {
                        type: 'object',
                        properties: {
                          totalVisitorsToday: { type: 'integer', example: 8 },
                          hasVisitorsPresent: { type: 'boolean', example: true },
                          presentCount: { type: 'integer', example: 3 }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' },
        500: { $ref: '#/components/responses/InternalServerError' }
      }
    }
  },

  '/api/v1/dashboard/visitors-present': {
    get: {
      tags: ['Dashboard'],
      summary: '👥 Visiteurs Présents - Détails complets',
      description: 'Récupère la liste détaillée de tous les visiteurs actuellement présents sur site. Correspond à la section "Visiteurs présents" de l\'application mobile.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: '✅ Liste des visiteurs présents récupérée avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      count: { type: 'integer', example: 2 },
                      visitors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            visitId: { type: 'string', example: 'aa0e8400-e29b-41d4-a716-446655440001' },
                            visitor: {
                              type: 'object',
                              properties: {
                                id: { type: 'string', example: '880e8400-e29b-41d4-a716-446655440001' },
                                name: { type: 'string', example: 'Marie KABORE' },
                                company: { type: 'string', example: 'Entreprise KABORE & Fils' },
                                phone: { type: 'string', example: '+226 70 11 22 33' },
                                email: { type: 'string', example: 'marie.kabore@email.com' }
                              }
                            },
                            visit: {
                              type: 'object',
                              properties: {
                                entryTime: { type: 'string', format: 'date-time', example: '2024-11-24T08:45:00.000Z' },
                                reason: { type: 'string', example: 'Réunion direction générale' },
                                service: { type: 'string', example: 'Direction Générale' },
                                checkpoint: { type: 'string', example: 'Entrée Principale Ouaga' },
                                site: { type: 'string', example: 'Site Principal Ouagadougou' }
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
        401: { $ref: '#/components/responses/Unauthorized' },
        500: { $ref: '#/components/responses/InternalServerError' }
      }
    }
  }
};

module.exports = swaggerPathsFinal;
