const { z } = require('zod');

const createAppointmentSchema = z.object({
  organizerId: z.string().uuid('ID d\'organisateur invalide'),
  siteId: z.string().uuid('ID de site invalide'),
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  office: z.string().min(1, 'Le bureau est requis'),
  serviceName: z.string().min(1, 'Le nom du service est requis'),
  reason: z.string().min(1, 'La raison est requise'),
  visitDate: z.string().min(1, 'La date de visite est requise'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.string().optional().default('PENDING'),
  notes: z.string().optional()
});

const updateAppointmentSchema = z.object({
  organizerId: z.string().uuid().optional(),
  siteId: z.string().uuid().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  office: z.string().min(1).optional(),
  serviceName: z.string().min(1).optional(),
  reason: z.string().min(1).optional(),
  visitDate: z.string().min(1).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional()
});

const appointmentIdSchema = z.object({
  id: z.string().uuid('ID de rendez-vous invalide')
});

const appointmentQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
  organizerId: z.string().uuid().optional(),
  siteId: z.string().uuid().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  serviceName: z.string().optional(),
  status: z.string().optional()
});

module.exports = {
  createAppointmentSchema,
  updateAppointmentSchema,
  appointmentIdSchema,
  appointmentQuerySchema
};
