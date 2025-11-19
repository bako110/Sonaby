const appointmentService = require('./appointment.service');
const { createAppointmentSchema, updateAppointmentSchema, appointmentIdSchema, appointmentQuerySchema } = require('./appointment.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');

class AppointmentController {
  createAppointment = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'CHEF_SERVICE', 'AGENT_GESTION'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = createAppointmentSchema.parse(req.body);
    
    try {
      const appointment = await appointmentService.createAppointment(validated);
      res.status(201).json({
        success: true,
        message: 'Rendez-vous créé avec succès',
        data: appointment
      });
    } catch (error) {
      if (error.message.includes('non trouvé')) {
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

  getAllAppointments = asyncHandler(async (req, res) => {
    const validated = appointmentQuerySchema.parse(req.query);
    
    try {
      const result = await appointmentService.getAllAppointments(
        validated.page, 
        validated.limit, 
        validated.search,
        validated.visitorId,
        validated.serviceId,
        validated.upcoming
      );
      res.json({
        success: true,
        data: result.appointments,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  getAppointmentById = asyncHandler(async (req, res) => {
    const validated = appointmentIdSchema.parse(req.params);
    
    try {
      const appointment = await appointmentService.getAppointmentById(validated.id);
      res.json({
        success: true,
        data: appointment
      });
    } catch (error) {
      if (error.message.includes('non trouvé')) {
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

  updateAppointment = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'CHEF_SERVICE', 'AGENT_GESTION'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const { id } = appointmentIdSchema.parse(req.params);
    const validated = updateAppointmentSchema.parse(req.body);
    
    try {
      const appointment = await appointmentService.updateAppointment(id, validated);
      res.json({
        success: true,
        message: 'Rendez-vous mis à jour avec succès',
        data: appointment
      });
    } catch (error) {
      if (error.message.includes('non trouvé')) {
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

  deleteAppointment = asyncHandler(async (req, res) => {
    if (!['ADMIN', 'CHEF_SERVICE', 'AGENT_GESTION'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    const validated = appointmentIdSchema.parse(req.params);
    
    try {
      const result = await appointmentService.deleteAppointment(validated.id);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      if (error.message.includes('non trouvé')) {
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

  generateQRCode = asyncHandler(async (req, res) => {
    const validated = appointmentIdSchema.parse(req.params);
    
    try {
      const qrData = await appointmentService.generateQRCode(validated.id);
      res.json({
        success: true,
        data: qrData
      });
    } catch (error) {
      if (error.message.includes('non trouvé')) {
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
}

module.exports = new AppointmentController();
