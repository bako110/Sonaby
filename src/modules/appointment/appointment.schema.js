const { z } = require('zod');

const createAppointmentSchema = z.object({
  visitorId: z.string().cuid('ID de visiteur invalide'),
  serviceId: z.string().cuid('ID de service invalide'),
  personVisited: z.string().optional(),
  dateStart: z.string().datetime('Date de début invalide'),
  dateEnd: z.string().datetime('Date de fin invalide'),
  group: z.boolean().optional().default(false)
});

const updateAppointmentSchema = z.object({
  personVisited: z.string().optional(),
  dateStart: z.string().datetime('Date de début invalide').optional(),
  dateEnd: z.string().datetime('Date de fin invalide').optional(),
  group: z.boolean().optional()
});

const appointmentIdSchema = z.object({
  id: z.string().cuid('ID de rendez-vous invalide')
});

const appointmentQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  visitorId: z.string().cuid().optional(),
  serviceId: z.string().cuid().optional(),
  upcoming: z.string().optional().transform(val => val === 'true')
});

module.exports = {
  createAppointmentSchema,
  updateAppointmentSchema,
  appointmentIdSchema,
  appointmentQuerySchema
};
