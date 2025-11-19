// Documentation complète des endpoints API pour Swagger
const swaggerPaths = {
  // ==================== AUTH ENDPOINTS ====================
  '/api/v1/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Inscription d\'un nouvel utilisateur',
      description: 'Créer un nouveau compte utilisateur avec email et mot de passe',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RegisterInput' }
          }
        }
      },
      responses: {
        201: {
          description: 'Utilisateur créé avec succès',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResponse' }
            }
          }
        },
        400: {
          description: 'Données invalides ou utilisateur existant',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' }
            }
          }
        }
      }
    }
  },

  '/api/v1/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Connexion utilisateur',
      description: 'Authentifier un utilisateur avec email et mot de passe',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LoginInput' }
          }
        }
      },
      responses: {
        200: {
          description: 'Connexion réussie',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResponse' }
            }
          }
        },
        401: {
          description: 'Identifiants invalides',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' }
            }
          }
        }
      }
    }
  },

  '/api/v1/auth/profile': {
    get: {
      tags: ['Auth'],
      summary: 'Récupérer le profil utilisateur',
      description: 'Obtenir les informations complètes de l\'utilisateur connecté',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Profil utilisateur récupéré',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProfileResponse' }
            }
          }
        },
        401: {
          description: 'Token invalide ou expiré',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' }
            }
          }
        }
      }
    }
  },

  '/api/v1/auth/refresh': {
    post: {
      tags: ['Auth'],
      summary: 'Renouveler le token d\'accès',
      description: 'Générer un nouveau token d\'accès avec le refresh token',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RefreshTokenInput' }
          }
        }
      },
      responses: {
        200: {
          description: 'Token renouvelé avec succès',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      accessToken: { type: 'string' },
                      refreshToken: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Refresh token invalide',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' }
            }
          }
        }
      }
    }
  },

  '/api/v1/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Déconnexion utilisateur',
      description: 'Déconnecter l\'utilisateur et invalider le refresh token',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                refreshToken: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Déconnexion réussie',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResponse' }
            }
          }
        }
      }
    }
  },

  // ==================== USER ENDPOINTS ====================
  '/api/v1/users': {
    get: {
      tags: ['Users'],
      summary: 'Lister tous les utilisateurs',
      description: 'Récupérer la liste paginée des utilisateurs',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'page',
          in: 'query',
          schema: { type: 'string' },
          description: 'Numéro de page'
        },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'string' },
          description: 'Nombre d\'éléments par page'
        },
        {
          name: 'search',
          in: 'query',
          schema: { type: 'string' },
          description: 'Terme de recherche'
        }
      ],
      responses: {
        200: {
          description: 'Liste des utilisateurs',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedResponse' }
            }
          }
        },
        401: { $ref: '#/components/responses/Unauthorized' }
      }
    },
    post: {
      tags: ['Users'],
      summary: 'Créer un nouvel utilisateur',
      description: 'Créer un nouvel utilisateur (ADMIN uniquement)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateUserInput' }
          }
        }
      },
      responses: {
        201: {
          description: 'Utilisateur créé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        },
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' }
      }
    }
  },

  '/api/v1/users/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Récupérer un utilisateur par ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'ID de l\'utilisateur'
        }
      ],
      responses: {
        200: {
          description: 'Utilisateur trouvé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        },
        404: { $ref: '#/components/responses/NotFound' }
      }
    },
    put: {
      tags: ['Users'],
      summary: 'Mettre à jour un utilisateur',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateUserInput' }
          }
        }
      },
      responses: {
        200: {
          description: 'Utilisateur mis à jour',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        },
        404: { $ref: '#/components/responses/NotFound' }
      }
    },
    delete: {
      tags: ['Users'],
      summary: 'Supprimer un utilisateur',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        200: {
          description: 'Utilisateur supprimé',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResponse' }
            }
          }
        },
        404: { $ref: '#/components/responses/NotFound' }
      }
    }
  },

  // ==================== SITE ENDPOINTS ====================
  '/api/v1/sites': {
    get: {
      tags: ['Sites'],
      summary: 'Lister tous les sites',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'page',
          in: 'query',
          schema: { type: 'string' },
          description: 'Numéro de page'
        },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'string' },
          description: 'Nombre d\'éléments par page'
        },
        {
          name: 'search',
          in: 'query',
          schema: { type: 'string' },
          description: 'Terme de recherche'
        }
      ],
      responses: {
        200: {
          description: 'Liste des sites',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedResponse' }
            }
          }
        }
      }
    },
    post: {
      tags: ['Sites'],
      summary: 'Créer un nouveau site',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateSiteInput' }
          }
        }
      },
      responses: {
        201: {
          description: 'Site créé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { $ref: '#/components/schemas/Site' }
                }
              }
            }
          }
        }
      }
    }
  },

  '/api/v1/sites/{id}': {
    get: {
      tags: ['Sites'],
      summary: 'Récupérer un site par ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        200: {
          description: 'Site trouvé',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { $ref: '#/components/schemas/Site' }
                }
              }
            }
          }
        }
      }
    },
    put: {
      tags: ['Sites'],
      summary: 'Mettre à jour un site',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateSiteInput' }
          }
        }
      },
      responses: {
        200: {
          description: 'Site mis à jour',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { $ref: '#/components/schemas/Site' }
                }
              }
            }
          }
        }
      }
    },
    delete: {
      tags: ['Sites'],
      summary: 'Supprimer un site',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        200: {
          description: 'Site supprimé',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiResponse' }
            }
          }
        }
      }
    }
  }
};

module.exports = swaggerPaths;
