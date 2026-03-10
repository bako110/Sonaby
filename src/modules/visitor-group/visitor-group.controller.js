const visitorGroupService = require('./visitor-group.service');
const {
  createVisitorGroupSchema,
  visitorGroupIdSchema,
  visitorGroupQuerySchema
} = require('./visitor-group.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');
const { prisma } = require('../../config/prisma');

class VisitorGroupController {

  /**
   * Récupérer les visiteurs existants (pour choisir le responsable)
   * → nom + prénom uniquement
   */
  getAvailableVisitors = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {};

    const [total, visitors] = await Promise.all([
      prisma.visitor.count({ where: whereClause }),
      prisma.visitor.findMany({
        where: whereClause,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          firstName: true,
          lastName: true
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.status(200).json({
      success: true,
      message: 'Visiteurs récupérés',
      data: visitors,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  });

  /**
   * Créer un groupe de visiteurs
   */
  createVisitorGroup = asyncHandler(async (req, res) => {
    const validated = createVisitorGroupSchema.parse(req.body);

    const visitorGroup =
      await visitorGroupService.createVisitorGroup(validated);

    res.status(201).json({
      success: true,
      message: 'Groupe de visiteurs créé avec succès',
      data: visitorGroup
    });
  });

  /**
   * Récupérer un groupe par ID
   */
  getVisitorGroupById = asyncHandler(async (req, res) => {
    const { id } = visitorGroupIdSchema.parse({ id: req.params.id });

    const visitorGroup =
      await visitorGroupService.getVisitorGroupById(id);

    res.status(200).json({
      success: true,
      message: 'Groupe récupéré avec succès',
      data: {
        id: visitorGroup.id,
        responsibleVisitor: visitorGroup.responsibleVisitor,
        otherVisitors: visitorGroup.otherVisitors,
        expectedCount: visitorGroup.expectedCount,
        createdAt: visitorGroup.createdAt,
        updatedAt: visitorGroup.updatedAt
      }
    });
  });

  /**
   * Récupérer les groupes avec filtres et pagination
   */
  getFilteredVisitorGroups = asyncHandler(async (req, res) => {
    const filters = visitorGroupQuerySchema.parse(req.query);

    const result =
      await visitorGroupService.getFilteredVisitorGroups(filters);

    // On renvoie uniquement les champs essentiels
    const visitorGroups = result.visitorGroups.map(g => ({
      id: g.id,
      responsibleVisitor: g.responsibleVisitor,
      otherVisitors: g.otherVisitors,
      expectedCount: g.expectedCount,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt
    }));

    const response = {
      success: true,
      message: 'Groupes récupérés avec succès',
      data: visitorGroups,
      pagination: result.pagination
    };
    
    // Ajouter la période si présente
    if (result.periode) {
      response.periode = result.periode;
      response.date = new Date().toISOString().split('T')[0];
    }
    
    res.status(200).json(response);
  });
}

module.exports = new VisitorGroupController();
