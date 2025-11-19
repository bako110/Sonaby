// swaggerSchemas.js
const { z } = require("zod");

// Import des schémas d'authentification
const { registerSchema, loginSchema, refreshTokenSchema } = require("../modules/auth/auth.schema");

// Import des schémas utilisateurs
const { updateUserSchema, createUserSchema, updatePasswordSchema, updateAuthSettingsSchema } = require("../modules/user/user.schema");

// Import des schémas sites
const { createSiteSchema, updateSiteSchema, siteIdSchema } = require("../modules/site/site.schema");

// Import des schémas checkpoints
const { createCheckpointSchema, updateCheckpointSchema, checkpointIdSchema } = require("../modules/checkpoint/checkpoint.schema");

// Import des schémas agents
const { createAgentSchema, updateAgentSchema, agentIdSchema } = require("../modules/agent/agent.schema");

// Import des schémas services
const { createServiceSchema, updateServiceSchema, serviceIdSchema } = require("../modules/service/service.schema");

// Import des schémas visiteurs
const { createVisitorSchema, updateVisitorSchema, visitorIdSchema, blacklistVisitorSchema } = require("../modules/visitor/visitor.schema");

// Import des schémas visites
const { createVisitSchema, updateVisitSchema, visitIdSchema, checkoutSchema } = require("../modules/visit/visit.schema");

// Import des schémas rendez-vous
const { createAppointmentSchema, updateAppointmentSchema, appointmentIdSchema } = require("../modules/appointment/appointment.schema");

// Import des schémas incidents
const { createIncidentSchema, incidentIdSchema } = require("../modules/incident/incident.schema");

// Import des schémas indésirables
const { createNonDesirableSchema, nonDesirableIdSchema } = require("../modules/nondesirable/nondesirable.schema");

// Import des schémas SOS
const { createSOSSchema, sosIdSchema } = require("../modules/sos/sos.schema");

// Schémas de query simplifiés pour Swagger (sans transformations)
const baseQuerySchema = z.object({
  page: z.string().optional().describe("Page number"),
  limit: z.string().optional().describe("Items per page"),
  search: z.string().optional().describe("Search term")
});

const siteQuerySwaggerSchema = baseQuerySchema;

const checkpointQuerySwaggerSchema = baseQuerySchema.extend({
  siteId: z.string().optional().describe("Site ID filter")
});

const agentQuerySwaggerSchema = baseQuerySchema.extend({
  checkpointId: z.string().optional().describe("Checkpoint ID filter")
});

const serviceQuerySwaggerSchema = baseQuerySchema;

const visitorQuerySwaggerSchema = baseQuerySchema.extend({
  company: z.string().optional().describe("Company filter"),
  isBlacklisted: z.string().optional().describe("Blacklist status filter (true/false)"),
  idType: z.enum(['CNI', 'PASSEPORT', 'PERMIS_CONDUITE', 'CARTE_SEJOUR', 'AUTRE']).optional().describe("ID type filter")
});

const visitQuerySwaggerSchema = baseQuerySchema.extend({
  visitorId: z.string().optional().describe("Visitor ID filter"),
  checkpointId: z.string().optional().describe("Checkpoint ID filter"),
  serviceId: z.string().optional().describe("Service ID filter"),
  status: z.enum(['active', 'finished', 'refused']).optional().describe("Visit status filter")
});

const appointmentQuerySwaggerSchema = baseQuerySchema.extend({
  visitorId: z.string().optional().describe("Visitor ID filter"),
  serviceId: z.string().optional().describe("Service ID filter"),
  upcoming: z.string().optional().describe("Upcoming appointments filter (true/false)")
});

const incidentQuerySwaggerSchema = baseQuerySchema.extend({
  visitorId: z.string().optional().describe("Visitor ID filter"),
  serviceId: z.string().optional().describe("Service ID filter"),
  resolved: z.string().optional().describe("Resolution status filter (true/false)")
});

const nondesirableQuerySwaggerSchema = baseQuerySchema;

const sosQuerySwaggerSchema = baseQuerySchema.extend({
  checkpointId: z.string().optional().describe("Checkpoint ID filter"),
  active: z.string().optional().describe("Active status filter (true/false)")
});

// Convertit Zod → JSON Schema

// Schémas Auth
const RegisterInput = z.toJSONSchema(registerSchema);
const LoginInput = z.toJSONSchema(loginSchema);
const RefreshTokenInput = z.toJSONSchema(refreshTokenSchema);

// Schémas User
const CreateUserInput = z.toJSONSchema(createUserSchema);
const UpdateUserInput = z.toJSONSchema(updateUserSchema);
const UpdatePasswordInput = z.toJSONSchema(updatePasswordSchema);
const UpdateAuthSettingsInput = z.toJSONSchema(updateAuthSettingsSchema);

// Schémas Site
const CreateSiteInput = z.toJSONSchema(createSiteSchema);
const UpdateSiteInput = z.toJSONSchema(updateSiteSchema);
const SiteIdInput = z.toJSONSchema(siteIdSchema);
const SiteQueryInput = z.toJSONSchema(siteQuerySwaggerSchema);

// Schémas Checkpoint
const CreateCheckpointInput = z.toJSONSchema(createCheckpointSchema);
const UpdateCheckpointInput = z.toJSONSchema(updateCheckpointSchema);
const CheckpointIdInput = z.toJSONSchema(checkpointIdSchema);
const CheckpointQueryInput = z.toJSONSchema(checkpointQuerySwaggerSchema);

// Schémas Agent
const CreateAgentInput = z.toJSONSchema(createAgentSchema);
const UpdateAgentInput = z.toJSONSchema(updateAgentSchema);
const AgentIdInput = z.toJSONSchema(agentIdSchema);
const AgentQueryInput = z.toJSONSchema(agentQuerySwaggerSchema);

// Schémas Service
const CreateServiceInput = z.toJSONSchema(createServiceSchema);
const UpdateServiceInput = z.toJSONSchema(updateServiceSchema);
const ServiceIdInput = z.toJSONSchema(serviceIdSchema);
const ServiceQueryInput = z.toJSONSchema(serviceQuerySwaggerSchema);

// Schémas Visitor
const CreateVisitorInput = z.toJSONSchema(createVisitorSchema);
const UpdateVisitorInput = z.toJSONSchema(updateVisitorSchema);
const VisitorIdInput = z.toJSONSchema(visitorIdSchema);
const VisitorQueryInput = z.toJSONSchema(visitorQuerySwaggerSchema);
const BlacklistVisitorInput = z.toJSONSchema(blacklistVisitorSchema);

// Schémas Visit
const CreateVisitInput = z.toJSONSchema(createVisitSchema);
const UpdateVisitInput = z.toJSONSchema(updateVisitSchema);
const VisitIdInput = z.toJSONSchema(visitIdSchema);
const VisitQueryInput = z.toJSONSchema(visitQuerySwaggerSchema);
// Schéma de checkout simplifié pour Swagger
const checkoutSwaggerSchema = z.object({
  endAt: z.string().optional().describe("End time (ISO datetime)")
});
const CheckoutVisitInput = z.toJSONSchema(checkoutSwaggerSchema);

// Schémas Appointment (Rendez-vous)
const CreateAppointmentInput = z.toJSONSchema(createAppointmentSchema);
const UpdateAppointmentInput = z.toJSONSchema(updateAppointmentSchema);
const AppointmentIdInput = z.toJSONSchema(appointmentIdSchema);
const AppointmentQueryInput = z.toJSONSchema(appointmentQuerySwaggerSchema);

// Schémas Incident
const CreateIncidentInput = z.toJSONSchema(createIncidentSchema);
const IncidentIdInput = z.toJSONSchema(incidentIdSchema);
const IncidentQueryInput = z.toJSONSchema(incidentQuerySwaggerSchema);

// Schémas Nondesirable
const CreateNondesirableInput = z.toJSONSchema(createNonDesirableSchema);
const NondesirableIdInput = z.toJSONSchema(nonDesirableIdSchema);
const NondesirableQueryInput = z.toJSONSchema(nondesirableQuerySwaggerSchema);

// Schémas SOS
const CreateSosInput = z.toJSONSchema(createSOSSchema);
const SosIdInput = z.toJSONSchema(sosIdSchema);
const SosQueryInput = z.toJSONSchema(sosQuerySwaggerSchema);

// Schémas de réponse (modèles de données)
const User = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    email: { type: "string", format: "email" },
    firstName: { type: "string" },
    lastName: { type: "string" },
    role: { 
      type: "string", 
      enum: ["ADMIN", "AGENT_GESTION", "AGENT_CONTROLE", "CHEF_SERVICE"] 
    },
    isActive: { type: "boolean" },
    phone: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

const Site = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    address: { type: "string" },
    phone: { type: "string", nullable: true },
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

const Checkpoint = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    siteId: { type: "string", format: "uuid" },
    name: { type: "string" },
    sosCode: { type: "string" },
    locationDescription: { type: "string", nullable: true },
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

const Agent = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    firstname: { type: "string" },
    lastname: { type: "string" },
    email: { type: "string", format: "email" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

const Service = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    description: { type: "string", nullable: true },
    chefId: { type: "string", format: "uuid", nullable: true },
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

const Visitor = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    firstName: { type: "string" },
    lastName: { type: "string" },
    phone: { type: "string", nullable: true },
    email: { type: "string", format: "email", nullable: true },
    idType: { 
      type: "string", 
      enum: ["CNI", "PASSEPORT", "PERMIS_CONDUITE", "CARTE_SEJOUR", "AUTRE"] 
    },
    idNumber: { type: "string" },
    idScanUrl: { type: "string", nullable: true },
    photoUrl: { type: "string", nullable: true },
    isBlacklisted: { type: "boolean" },
    blacklistReason: { type: "string", nullable: true },
    company: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

const Visit = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    visitorId: { type: "string", format: "uuid" },
    checkpointId: { type: "string", format: "uuid" },
    serviceId: { type: "string", format: "uuid" },
    reason: { type: "string" },
    plannedId: { type: "string", format: "uuid", nullable: true },
    isGroup: { type: "boolean" },
    groupCode: { type: "string", nullable: true },
    entryTime: { type: "string", format: "date-time" },
    exitTime: { type: "string", format: "date-time", nullable: true },
    createdBy: { type: "string", format: "uuid" },
    status: { 
      type: "string", 
      enum: ["active", "finished", "refused"] 
    },
    signatureUrl: { type: "string", nullable: true },
    notes: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" }
  }
};

const Appointment = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    organizerId: { type: "string", format: "uuid" },
    visitorId: { type: "string", format: "uuid", nullable: true },
    groupCode: { type: "string", nullable: true },
    serviceId: { type: "string", format: "uuid" },
    reason: { type: "string" },
    visitDate: { type: "string", format: "date" },
    startTime: { type: "string", format: "time", nullable: true },
    endTime: { type: "string", format: "time", nullable: true },
    qrCode: { type: "string" },
    status: { 
      type: "string", 
      enum: ["pending", "validated", "cancelled"] 
    },
    notes: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

const Incident = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    visitId: { type: "string", format: "uuid" },
    reportedBy: { type: "string", format: "uuid" },
    title: { type: "string" },
    description: { type: "string" },
    severityLevel: { type: "integer" },
    isResolved: { type: "boolean" },
    resolvedAt: { type: "string", format: "date-time", nullable: true },
    resolvedBy: { type: "string", format: "uuid", nullable: true },
    resolutionNotes: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" }
  }
};

const Nondesirable = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    visitorId: { type: "string", format: "uuid" },
    reason: { type: "string" },
    addedBy: { type: "string", format: "uuid" },
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

const SosAlert = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    checkpointId: { type: "string", format: "uuid" },
    triggeredBy: { type: "string", format: "uuid" },
    triggeredAt: { type: "string", format: "date-time" },
    message: { type: "string", nullable: true },
    isResolved: { type: "boolean" },
    resolvedAt: { type: "string", format: "date-time", nullable: true },
    resolvedBy: { type: "string", format: "uuid", nullable: true },
    resolutionNotes: { type: "string", nullable: true }
  }
};

// Schémas de réponse API standardisés
const ApiResponse = {
  type: "object",
  properties: {
    success: { type: "boolean" },
    message: { type: "string" },
    data: { type: "object" }
  }
};

const ApiError = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    error: { type: "string" },
    stack: { type: "string" }
  }
};

const ErrorResponse = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    error: { type: "string" },
    message: { type: "string" },
    details: { type: "object", nullable: true }
  }
};

const PaginatedResponse = {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    data: {
      type: "object",
      properties: {
        items: { type: "array", items: { type: "object" } },
        pagination: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
            pages: { type: "integer" }
          }
        }
      }
    }
  }
};

module.exports = {
  // Auth
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  
  // User
  CreateUserInput,
  UpdateUserInput,
  UpdatePasswordInput,
  UpdateAuthSettingsInput,
  
  // Site
  CreateSiteInput,
  UpdateSiteInput,
  SiteIdInput,
  SiteQueryInput,
  
  // Checkpoint
  CreateCheckpointInput,
  UpdateCheckpointInput,
  CheckpointIdInput,
  CheckpointQueryInput,
  
  // Agent
  CreateAgentInput,
  UpdateAgentInput,
  AgentIdInput,
  AgentQueryInput,
  
  // Service
  CreateServiceInput,
  UpdateServiceInput,
  ServiceIdInput,
  ServiceQueryInput,
  
  // Visitor
  CreateVisitorInput,
  UpdateVisitorInput,
  VisitorIdInput,
  VisitorQueryInput,
  BlacklistVisitorInput,
  
  // Visit
  CreateVisitInput,
  UpdateVisitInput,
  VisitIdInput,
  VisitQueryInput,
  CheckoutVisitInput,
  
  // Appointment
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentIdInput,
  AppointmentQueryInput,
  
  // Incident
  CreateIncidentInput,
  IncidentIdInput,
  IncidentQueryInput,
  
  // Nondesirable
  CreateNondesirableInput,
  NondesirableIdInput,
  NondesirableQueryInput,
  
  // SOS
  CreateSosInput,
  SosIdInput,
  SosQueryInput,

  // Response Models
  User,
  Site,
  Checkpoint,
  Agent,
  Service,
  Visitor,
  Visit,
  Appointment,
  Incident,
  Nondesirable,
  SosAlert,

  // API Response Types
  ApiResponse,
  ApiError,
  ErrorResponse,
  PaginatedResponse
};
