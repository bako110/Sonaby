// Dernière partie de la documentation Swagger
const swaggerPathsFinal = {
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
      summary: 'Déclencher une alerte SOS générale pour tous les checkpoints d\'un site',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['siteId'],
              properties: {
                siteId: {
                  type: 'string',
                  format: 'uuid',
                  description: 'ID du site pour lequel déclencher l\'alerte générale',
                  example: '14ce1162-ca00-11f0-aa39-0242ac140013'
                },
                message: {
                  type: 'string',
                  description: 'Message décrivant la situation d\'urgence (optionnel)',
                  example: 'Alerte générale - Urgence sécurité sur tout le site'
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Alerte SOS générale déclenchée',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' }, data: { type: 'object', properties: { message: { type: 'string' }, site: { type: 'object' }, checkpointsAffected: { type: 'number' }, sosAlerts: { type: 'array', items: { $ref: '#/components/schemas/SosAlert' } } } } } } } }
        },
        400: {
          description: 'Site non trouvé ou SOS déjà actif'
        },
        403: {
          description: 'Permissions insuffisantes'
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
  '/api/v1/dashboard/stats': {
    get: {
      tags: ['Dashboard'],
      summary: '📊 Statistiques complètes du Dashboard SONABHY - Gestion des flux',
      description: 'Récupère toutes les statistiques en temps réel du dashboard : visiteurs enregistrés, visites en cours, visites terminées, incidents signalés, liste détaillée des visiteurs présents, et statistiques des visites par état',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: '✅ Statistiques complètes du dashboard récupérées avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      // --- STATISTIQUES PRINCIPALES ---
                      visitorsRegistered: { 
                        type: 'integer', 
                        example: 8,
                        description: 'Nombre total de visiteurs enregistrés (non blacklistés)'
                      },
                      visitsInProgress: { 
                        type: 'integer', 
                        example: 3,
                        description: 'Nombre de visites actuellement en cours (status: active, exitTime: null)'
                      },
                      visitsCompleted: { 
                        type: 'integer', 
                        example: 5,
                        description: 'Nombre de visites terminées (status: finished)'
                      },
                      incidentsReported: { 
                        type: 'integer', 
                        example: 1,
                        description: 'Nombre total d\'incidents signalés'
                      },
                      
                      // --- STATISTIQUES PAR ÉTAT DES VISITES ---
                      visitStats: {
                        type: 'object',
                        description: 'Statistiques détaillées des visites par état',
                        properties: {
                          totalVisits: { 
                            type: 'integer', 
                            example: 15,
                            description: 'Nombre total de toutes les visites'
                          },
                          activeVisits: { 
                            type: 'integer', 
                            example: 3,
                            description: 'Visites actives (personnes encore sur site)'
                          },
                          finishedVisits: { 
                            type: 'integer', 
                            example: 10,
                            description: 'Visites terminées (sortie enregistrée)'
                          },
                          cancelledVisits: { 
                            type: 'integer', 
                            example: 2,
                            description: 'Visites annulées'
                          },
                          visitsToday: { 
                            type: 'integer', 
                            example: 7,
                            description: 'Visites du jour (entrées aujourd\'hui)'
                          },
                          visitsThisWeek: { 
                            type: 'integer', 
                            example: 28,
                            description: 'Visites de la semaine'
                          },
                          visitsThisMonth: { 
                            type: 'integer', 
                            example: 95,
                            description: 'Visites du mois'
                          },
                          averageVisitDuration: { 
                            type: 'string', 
                            example: '45 minutes',
                            description: 'Durée moyenne des visites'
                          },
                          peakHour: { 
                            type: 'string', 
                            example: '10:00',
                            description: 'Heure de pointe pour les entrées'
                          }
                        }
                      },
                      
                      // --- VISITEURS PRÉSENTS ---
                      visitorsPresent: {
                        type: 'array',
                        description: 'Liste des visiteurs actuellement sur site',
                        items: {
                          type: 'object',
                          properties: {
                            siteId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID du site filtré' },
                            date: { type: 'string', example: '2025-11-28', description: 'Date du filtrage (YYYY-MM-DD)' },
                            checkpointsFound: { type: 'integer', example: 3, description: 'Nombre de checkpoints trouvés pour ce site' },
                            checkpointIds: { 
                              type: 'array', 
                              items: { type: 'string' },
                              example: ['cbebf952-cc3f-11f0-aa39-0242ac140013', 'cbebf953-cc3f-11f0-aa39-0242ac140014'],
                              description: 'Liste des IDs des checkpoints du site'
                            },
                            company: { type: 'string', example: 'Entreprise KABORE & Fils' },
                            phone: { type: 'string', example: '+226 70 11 22 33' },
                            service: { type: 'string', example: 'Direction Générale' },
                            entryTime: { type: 'string', format: 'date-time', example: '2024-11-24T08:45:00.000Z' },
                            reason: { type: 'string', example: 'Réunion direction générale' },
                            checkpoint: { type: 'string', example: 'Entrée Principale' },
                            site: { type: 'string', example: 'Siège Principal' }
                          }
                        }
                      },
                      
                      // --- RÉSUMÉ ---
                      summary: {
                        type: 'object',
                        properties: {
                          totalVisitorsToday: { type: 'integer', example: 8 },
                          hasVisitorsPresent: { type: 'boolean', example: true },
                          presentCount: { type: 'integer', example: 3 },
                          totalVisitorsInDb: { type: 'integer', example: 8 },
                          occupancyRate: { type: 'string', example: '37.5%', description: 'Taux d\'occupation actuel' },
                          securityLevel: { type: 'string', example: 'NORMAL', description: 'Niveau de sécurité basé sur les incidents' }
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
        500: { $ref: '#/components/responses/InternalServerError' }
      }
    }
  },
  '/api/v1/dashboard/visitors-present': {
    get: {
      tags: ['Dashboard'],
      summary: '👥 Visiteurs Présents du Jour - Par Site',
      description: 'Récupère la liste des visiteurs présents du jour pour un site spécifique. Retourne uniquement les visiteurs entrés aujourd\'hui et encore présents (pas de sortie enregistrée) pour le site spécifié.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'siteId',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid'
          },
          description: 'ID du site pour lequel récupérer les visiteurs présents',
          example: '550e8400-e29b-41d4-a716-446655440000'
        }
      ],
      responses: {
        200: {
          description: '✅ Liste des visiteurs présents du jour pour le site récupérée avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      count: { type: 'integer', example: 2, description: 'Nombre de visiteurs présents' },
                      visitors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            visitId: { type: 'string', example: 'aa0e8400-e29b-41d4-a716-446655440001', description: 'ID de la visite' },
                            visitor: {
                              type: 'object',
                              properties: {
                                id: { type: 'string', example: '880e8400-e29b-41d4-a716-446655440001' },
                                firstName: { type: 'string', example: 'BAKO' },
                                lastName: { type: 'string', example: 'SIDONIE' },
                                company: { type: 'string', example: 'Entreprise KABORE & Fils', nullable: true },
                                phone: { type: 'string', example: '+22657443692', nullable: true },
                                email: { type: 'string', example: 'bako.sidonie@email.com', nullable: true }
                              }
                            },
                            visit: {
                              type: 'object',
                              properties: {
                                entryTime: { type: 'string', format: 'date-time', example: '2025-11-28T08:45:00.000Z', description: 'Heure d\'entrée' },
                                reason: { type: 'string', example: 'Réunion direction générale', description: 'Raison de la visite' },
                                service: { type: 'string', example: 'Direction Générale', nullable: true, description: 'Service visité' },
                                checkpoint: { type: 'string', example: 'Entrée Principale', description: 'Point de contrôle utilisé' },
                                site: { type: 'string', example: 'Siège Social', description: 'Nom du site' },
                                siteId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID du site' }
                              }
                            }
                          }
                        }
                      },
                      siteId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID du site filtré' },
                      date: { type: 'string', example: '2025-11-28', description: 'Date du filtrage (YYYY-MM-DD)' },
                      checkpointsFound: { type: 'integer', example: 3, description: 'Nombre de checkpoints trouvés pour ce site' },
                      checkpointIds: { 
                        type: 'array', 
                        items: { type: 'string' },
                        example: ['cbebf952-cc3f-11f0-aa39-0242ac140013', 'cbebf953-cc3f-11f0-aa39-0242ac140014'],
                        description: 'Liste des IDs des checkpoints du site'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: '❌ Requête invalide - siteId manquant',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'siteId est requis dans les paramètres de requête' }
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
  }
};

module.exports = swaggerPathsFinal;
