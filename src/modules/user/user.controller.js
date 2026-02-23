const userService = require('./user.service');
const { createUserSchema, updateUserSchema } = require('./user.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');

// Fonction utilitaire pour transformer les assignedSites
const normalizeAssignedSites = (assignedSites) => {
  if (!assignedSites || !Array.isArray(assignedSites)) {
    return [];
  }
  
  return assignedSites.map(site => {
    if (typeof site === 'string') {
      return site; // Déjà un UUID
    }
    if (typeof site === 'object' && site !== null) {
      // Gérer la structure imbriquée {site: {id: "...", name: "..."}}
      if (site.site && typeof site.site === 'object') {
        const nestedSite = site.site;
        if (nestedSite.id) return nestedSite.id;
        if (nestedSite.value) return nestedSite.value;
        if (nestedSite._id) return nestedSite._id;
        if (nestedSite.siteId) return nestedSite.siteId;
        if (nestedSite.uuid) return nestedSite.uuid;
      }
      
      // Essayer différentes propriétés communes pour l'ID au niveau racine
      if (site.id) return site.id;
      if (site.value) return site.value;
      if (site._id) return site._id;
      if (site.siteId) return site.siteId;
      if (site.uuid) return site.uuid;
      
      // Si aucune propriété d'ID trouvée, chercher la première valeur qui ressemble à un UUID
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      // Chercher dans l'objet imbriqué site
      if (site.site) {
        for (const key in site.site) {
          const value = site.site[key];
          if (typeof value === 'string' && uuidPattern.test(value)) {
            return value;
          }
        }
      }
      
      // Chercher dans l'objet racine
      for (const key in site) {
        const value = site[key];
        if (typeof value === 'string' && uuidPattern.test(value)) {
          return value;
        }
      }
    }
    throw new Error('Format de site invalide - impossible de trouver un UUID valide');
  });
};

class UserController {
  createUser = asyncHandler(async (req, res) => {
    const validated = createUserSchema.parse(req.body);
    // Normaliser les assignedSites
    if (validated.assignedSites) {
      validated.assignedSites = normalizeAssignedSites(validated.assignedSites);
    }
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
    // Normaliser les assignedSites
    if (validated.assignedSites) {
      validated.assignedSites = normalizeAssignedSites(validated.assignedSites);
    }
    const user = await userService.updateUser(req.params.id, validated);
    res.json(user);
  });

  deleteUser = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  });
}

module.exports = new UserController();