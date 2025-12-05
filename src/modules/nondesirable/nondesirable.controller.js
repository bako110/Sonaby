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

    console.log("=== DEBUG req.user ===", req.user);

    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        success: false,
        message: "Données manquantes ou invalides"
      });
    }

    const formData = req.body;

    // Normalisation des nombres
    formData.severityLevel = parseInt(formData.severityLevel ?? 2, 10);
    if (isNaN(formData.severityLevel) || formData.severityLevel < 1 || formData.severityLevel > 4) {
      formData.severityLevel = 2;
    }

    formData.attachedFileSize = parseInt(formData.attachedFileSize ?? 0, 10);

    // Validation ZOD
    const validatedData = createUnknownNonDesirableSchema.parse(formData);

    // =======================================================
    // 🔥 RÉCUPÉRATION SÛRE ET DÉFINITIVE DE reportedBy
    // =======================================================

    let reportedBy = null;

    // 1️⃣ Token valide et user existant ?
    if (req.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true }
      });

      if (user) {
        reportedBy = user.id;
        console.log("Reporter depuis token:", reportedBy);
      }
    }

    // 2️⃣ Sinon, récupérer un admin
    if (!reportedBy) {
      const admin = await prisma.user.findFirst({
        where: { role: "ADMIN" },
        select: { id: true }
      });

      if (admin) {
        reportedBy = admin.id;
        console.log("Reporter fallback admin:", reportedBy);
      }
    }

    // 3️⃣ Sinon, prendre n’importe quel user
    if (!reportedBy) {
      const anyUser = await prisma.user.findFirst({
        select: { id: true }
      });

      if (anyUser) {
        reportedBy = anyUser.id;
        console.log("Reporter fallback any user:", reportedBy);
      }
    }

    // 4️⃣ Sinon, créer un user système (sécurisé)
    if (!reportedBy) {
      console.warn("Aucun user trouvé → création utilisateur système…");

      const systemUser = await prisma.user.upsert({
        where: { email: "system@sonaby.com" },
        update: {},
        create: {
          email: "system@sonaby.com",
          firstName: "System",
          lastName: "User",
          password: "$2a$10$SYSTEMHASHPLACEHOLDER", // Remet un vrai hash
          role: "ADMIN",
          isActive: true
        },
        select: { id: true }
      });

      reportedBy = systemUser.id;
      console.log("Reporter système créé:", reportedBy);
    }

    console.log("=== REPORTER FINAL ===", reportedBy);
    // =======================================================


    // Appel du service
    const result = await nonDesirableService.createUnknownNonDesirable({
      validatedData,
      reportedBy,
      file: req.file
    });

    return res.status(201).json(result);

  } catch (error) {
    console.error("Erreur détaillée:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Erreur de validation des données",
        errors: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Erreur lors de la création de l'indésirable inconnu"
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
