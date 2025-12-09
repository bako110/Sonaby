const userService = require('./user.service');
const { createUserSchema, updateUserSchema } = require('./user.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');

class UserController {
  createUser = asyncHandler(async (req, res) => {
    const validated = createUserSchema.parse(req.body);
    const user = await userService.createUser(validated);
    res.status(201).json(user);
  });

  getAllUsers = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers();
    res.json(users);
  });

  getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  });

  updateUser = asyncHandler(async (req, res) => {
    const validated = updateUserSchema.parse(req.body);
    const user = await userService.updateUser(req.params.id, validated);
    res.json(user);
  });

  deleteUser = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  });

  // Ajoute après la méthode getAllUsers dans user.controller.js

getFilteredUsers = asyncHandler(async (req, res) => {
  try {
    // Vérifier les permissions
    if (!['ADMIN', 'AGENT_GESTION', 'AGENT_CONTROLE', 'CHEF_SERVICE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes pour filtrer les utilisateurs.'
      });
    }

    // TODO: Décommenter quand tu auras ajouté le schéma
    // const validatedFilters = userFilterSchema.parse(req.query);
    // Pour l'instant, utiliser req.query directement
    const validatedFilters = req.query;

    // CORRECTION : Convertir page et limit en numbers
    if (validatedFilters.page) {
      validatedFilters.page = parseInt(validatedFilters.page, 10) || 1;
    }
    if (validatedFilters.limit) {
      validatedFilters.limit = parseInt(validatedFilters.limit, 10) || 10;
    }

    // Nettoyer les valeurs undefined
    const filtersForService = {};
    Object.keys(validatedFilters).forEach(key => {
      if (validatedFilters[key] !== undefined && validatedFilters[key] !== '') {
        filtersForService[key] = validatedFilters[key];
      }
    });

    console.log('=== DEBUG: Filtres envoyés au service ===');
    console.log(filtersForService);

    const result = await userService.getFilteredUsers(filtersForService);

    // Assurer que users est toujours un tableau
    const users = Array.isArray(result.users) ? result.users : [];
    
    // Assurer que pagination existe
    const pagination = result.pagination || {
      page: filtersForService.page || 1,
      limit: filtersForService.limit || 10,
      total: users.length,
      totalPages: Math.ceil(users.length / (filtersForService.limit || 10)),
      hasNext: false,
      hasPrev: false
    };
    
    // Assurer que filterOptions existe
    const filterOptions = result.filterOptions || {};

    res.status(200).json({
      success: true,
      message: `${users.length} utilisateur(s) trouvé(s)`,
      data: {
        users,
        pagination,
        filterOptions
      },
      filters: filtersForService
    });

  } catch (error) {
    console.error('❌ Erreur dans getFilteredUsers:', error);
    
    // Gestion des erreurs de validation
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Données de filtrage invalides',
        errors: error.errors.map(err => ({
          field: Array.isArray(err.path) ? err.path.join('.') : String(err.path),
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des utilisateurs filtrés',
      error: error.message
    });
  }
});
}

module.exports = new UserController();
