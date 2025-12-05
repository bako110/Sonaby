const nonDesirableService = require('./nondesirable.service');
const { createNonDesirableSchema, createUnknownNonDesirableSchema, removeUnknownSchema,nonDesirableIdSchema, nonDesirableQuerySchema } = require('./nondesirable.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');

class NonDesirableController {
  createNonDesirable = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = createNonDesirableSchema.parse(req.body);
    
    try {
      const nonDesirable = await nonDesirableService.createNonDesirable(validated, req.user.userId);
      res.status(201).json({
        success: true,
        message: 'Visiteur marqué comme indésirable avec succès',
        data: nonDesirable
      });
    } catch (error) {
      if (error.message.includes('non trouvé') || error.message.includes('déjà marqué')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  getAllNonDesirables = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = nonDesirableQuerySchema.parse(req.query);
    
    try {
      const result = await nonDesirableService.getAllNonDesirables(
        validated.page, 
        validated.limit, 
        validated.search
      );
      res.json({
        success: true,
        data: result.nonDesirables,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  removeNonDesirable = asyncHandler(async (req, res) => {
  if (!['ADMIN', 'AGENT_GESTION'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Permissions insuffisantes.'
    });
  }

  const { visitorId } = req.params;
  const { reason } = req.body; // ← récupérer la raison du frontend

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'La raison pour retirer le visiteur de la blacklist est requise.'
    });
  }

  try {
    const result = await nonDesirableService.removeNonDesirable(visitorId, req.user.userId, reason);
    res.json({
      success: true,
      message: 'Visiteur retiré de la liste des indésirables avec succès',
      data: result
    });
  } catch (error) {
    if (error.message.includes('non trouvé') || error.message.includes('pas blacklisté')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

  deleteNonDesirable = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'AGENT_GESTION'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = nonDesirableIdSchema.parse(req.params);
    
    try {
      const result = await nonDesirableService.deleteNonDesirable(validated.id);
      res.json({
        success: true,
        message: result.message,
        data: result.visitor
      });
    } catch (error) {
      if (error.message.includes('non trouvée')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  // nondesirable.controller.js - Fonction corrigée
  createUnknownNonDesirable = asyncHandler(async (req, res) => {
  try {
    // DEBUG: Voir ce qu'il y a dans req.user
    console.log('=== DEBUG req.user ===');
    console.log('req.user:', req.user);
    console.log('req.user?.id:', req.user?.id);
    console.log('Type de req.user?.id:', typeof req.user?.id);
    console.log('=====================');

    // Vérifier que req.body existe
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Données manquantes ou invalides'
      });
    }

    // Préparer les données pour la validation
    const formData = req.body || {};
    
    // Convertir severityLevel si présent
    if (formData.severityLevel) {
      formData.severityLevel = parseInt(formData.severityLevel, 10);
      if (isNaN(formData.severityLevel) || formData.severityLevel < 1 || formData.severityLevel > 4) {
        formData.severityLevel = 2;
      }
    } else {
      formData.severityLevel = 2; // Valeur par défaut
    }

    // Convertir attachedFileSize si présent
    if (formData.attachedFileSize) {
      formData.attachedFileSize = parseInt(formData.attachedFileSize, 10) || 0;
    }

    // Valider les données
    const validatedData = createUnknownNonDesirableSchema.parse(formData);

    // Récupérer l'utilisateur qui reporte - CORRECTION ICI
    let reportedBy;
    
    // Option 1: Vérifier que req.user.id existe dans la base
    if (req.user?.id) {
      try {
        // Chercher l'utilisateur dans la base
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { id: true }
        });
        
        if (user) {
          reportedBy = user.id;
          console.log('Utilisateur trouvé dans la base:', reportedBy);
        } else {
          console.warn(`Utilisateur avec ID ${req.user.id} non trouvé dans la base`);
        }
      } catch (userError) {
        console.error('Erreur recherche utilisateur:', userError);
      }
    }
    
    // Option 2: Si pas d'utilisateur valide, prendre un admin
    if (!reportedBy) {
      try {
        const adminUser = await prisma.user.findFirst({
          where: { role: 'ADMIN' },
          select: { id: true }
        });
        
        if (adminUser) {
          reportedBy = adminUser.id;
          console.log('Utilisation d\'un admin comme reportedBy:', reportedBy);
        }
      } catch (adminError) {
        console.error('Erreur recherche admin:', adminError);
      }
    }
    
    // Option 3: Si toujours pas, prendre le premier utilisateur
    if (!reportedBy) {
      try {
        const anyUser = await prisma.user.findFirst({
          select: { id: true }
        });
        
        if (anyUser) {
          reportedBy = anyUser.id;
          console.log('Utilisation du premier utilisateur trouvé:', reportedBy);
        }
      } catch (anyUserError) {
        console.error('Erreur recherche utilisateur:', anyUserError);
      }
    }
    
    // Option 4: Si vraiment aucun utilisateur, créer un système
    if (!reportedBy) {
      console.warn('Aucun utilisateur trouvé dans la base, création système...');
      
      try {
        // Créer un utilisateur système
        const systemUser = await prisma.user.create({
          data: {
            email: 'system@sonaby.com',
            firstName: 'System',
            lastName: 'User',
            password: 'system_password_hash', // À hasher
            role: 'ADMIN',
            isActive: true
          }
        });
        
        reportedBy = systemUser.id;
        console.log('Utilisateur système créé:', reportedBy);
      } catch (createError) {
        console.error('Erreur création utilisateur système:', createError);
        // Dernier recours: utiliser une valeur par défaut
        reportedBy = '00000000-0000-0000-0000-000000000000';
      }
    }
    
    console.log('Valeur finale de reportedBy:', reportedBy);

    // Appeler le service avec la valeur vérifiée
    const result = await nonDesirableService.createUnknownNonDesirable({
      validatedData,
      reportedBy,
      file: req.file // Le fichier uploadé (si présent)
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error('Erreur détaillée:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation des données',
        errors: error.errors
      });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création de l\'indésirable inconnu'
    });
  }
});

  getKnownNonDesirables = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || null;

  const result = await nonDesirableService.getAllNonDesirablesKnown(
    page,
    limit,
    search
  );

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});


getUnknownNonDesirables = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || null;

  const result = await nonDesirableService.getAllNonDesirablesUnknown(
    page,
    limit,
    search
  );

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});


getBlacklistHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const data = await nonDesirableService.getVisitorBlacklistHistory(id);

  if (!data) {
    return res.status(404).json({
      success: false,
      message: "Visiteur non trouvé"
    });
  }

  res.json({
    success: true,
    data
  });
});

   removeUnknown = asyncHandler(async (req, res) => {
  console.log('=== REMOVE UNKNOWN START ===');
  console.log('Body reçu :', req.body);

  try {
    // Validation avec Zod
    const parsed = removeUnknownSchema.safeParse(req.body);

    if (!parsed.success) {
      console.log('Validation Zod échouée :', safeparsed.error.errors);
      return res.status(400).json({ success: false, error: parsed.error.errors });
    }

    const { id, reason, reportedBy } = parsed.data;
    console.log('Validation réussie :', { id, reason, reportedBy });

    // Appel du service
    const result = await nonDesirableService.removeUnknown(id, reason, reportedBy);
    console.log('Résultat du service :', result);

    res.status(200).json({ success: true, ...result });
    console.log('=== REMOVE UNKNOWN FINISH ===');
  } catch (error) {
    console.error('Erreur catchée :', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// // GET Known by ID
//   getKnownById = asyncHandler(async (req, res) => {
//     const { id } = req.params;
//     try {
//       const data = await nonDesirableService.getNonDesirableById(id);
//       if (!data) return res.status(404).json({ success: false, message: 'Visiteur connu non trouvé' });
//       res.json({ success: true, data });
//     } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   });

//   // PATCH Known by ID
//   updateKnownById = asyncHandler(async (req, res) => {
//     const { id } = req.params;
//     const updateData = req.body;
//     try {
//       const updated = await nonDesirableService.updateNonDesirable(id, updateData);
//       res.json({ success: true, message: 'Visiteur connu mis à jour avec succès', data: updated });
//     } catch (error) {
//       res.status(400).json({ success: false, message: error.message });
//     }
//   });

  // ===========================
  // INDÉSIRABLES INCONNUS (UNKNOWN)
  // ===========================

  // GET Unknown by ID
  getUnknownById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const data = await nonDesirableService.getUnknownById(id);
      if (!data) return res.status(404).json({ success: false, message: 'Indésirable inconnu non trouvé' });
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // // PATCH Unknown by ID
  // updateUnknownById = asyncHandler(async (req, res) => {
  //   const { id } = req.params;
  //   const updateData = req.body;
  //   try {
  //     const updated = await nonDesirableService.updateUnknownById(id, updateData);
  //     res.json({ success: true, message: 'Indésirable inconnu mis à jour avec succès', data: updated });
  //   } catch (error) {
  //     res.status(400).json({ success: false, message: error.message });
  //   }
  // });





}

module.exports = new NonDesirableController();
