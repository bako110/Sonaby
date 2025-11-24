// =====================================================================================
// SWAGGER SCHEMAS - SYSTÈME DE GESTION DES VISITES MULTI-SITES
// =====================================================================================
// Version: 2.0
// Date: 2024-11-24
// Description: Schémas Swagger adaptés à la nouvelle structure de base de données
// =====================================================================================

const { z } = require("zod");

// Import des schémas d'authentification
const { registerSchema, loginSchema, refreshTokenSchema } = require("../modules/auth/auth.schema");

// Import des schémas utilisateurs
const { updateUserSchema, createUserSchema, updatePasswordSchema, updateAuthSettingsSchema } = require("../modules/user/user.schema");

// =====================================================================================
// SCHÉMAS DE QUERY POUR SWAGGER
// =====================================================================================

const baseQuerySchema = z.object({
  page: z.string().optional().describe("Page number"),
  limit: z.string().optional().describe("Items per page"),
  search: z.string().optional().describe("Search term")
});

const siteQuerySchema = baseQuerySchema.extend({
  city: z.string().optional().describe("City filter"),
  status: z.string().optional().describe("Status filter"),
  activityType: z.string().optional().describe("Activity type filter")
});

const checkpointQuerySchema = baseQuerySchema.extend({
  siteId: z.string().optional().describe("Site ID filter"),
  status: z.enum(['active', 'inactive', 'maintenance', 'error']).optional().describe("Status filter"),
  checkpointType: z.enum(['entry', 'exit', 'internal', 'emergency', 'patrol']).optional().describe("Type filter"),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional().describe("Priority filter")
});

const visitorQuerySchema = baseQuerySchema.extend({
  company: z.string().optional().describe("Company filter"),
  isBlacklisted: z.string().optional().describe("Blacklist status filter (true/false)"),
  idType: z.enum(['CNIB', 'PASSEPORT', 'PERMIS_CONDUITE']).optional().describe("ID type filter")
});

const blacklistQuerySchema = baseQuerySchema.extend({
  severityLevel: z.string().optional().describe("Severity level filter (1-4)"),
  nationality: z.string().optional().describe("Nationality filter"),
  incidentDate: z.string().optional().describe("Incident date filter")
});

const visitQuerySchema = baseQuerySchema.extend({
  visitorId: z.string().optional().describe("Visitor ID filter"),
  checkpointId: z.string().optional().describe("Checkpoint ID filter"),
  serviceId: z.string().optional().describe("Service ID filter"),
  status: z.enum(['active', 'finished', 'refused']).optional().describe("Visit status filter")
});

const rendezvousQuerySchema = baseQuerySchema.extend({
  organizerId: z.string().optional().describe("Organizer ID filter"),
  visitorId: z.string().optional().describe("Visitor ID filter"),
  serviceId: z.string().optional().describe("Service ID filter"),
  status: z.enum(['pending', 'validated', 'cancelled']).optional().describe("Status filter"),
  visitDate: z.string().optional().describe("Visit date filter (YYYY-MM-DD)")
});

const incidentQuerySchema = baseQuerySchema.extend({
  visitId: z.string().optional().describe("Visit ID filter"),
  reportedBy: z.string().optional().describe("Reporter ID filter"),
  severityLevel: z.string().optional().describe("Severity level filter (1-3)"),
  isResolved: z.string().optional().describe("Resolution status filter (true/false)")
});

const sosQuerySchema = baseQuerySchema.extend({
  checkpointId: z.string().optional().describe("Checkpoint ID filter"),
  triggeredBy: z.string().optional().describe("Triggered by user ID filter"),
  isResolved: z.string().optional().describe("Resolution status filter (true/false)")
});

// =====================================================================================
// SCHÉMAS D'ENTRÉE CONVERTIS POUR SWAGGER
// =====================================================================================

// Auth
const RegisterInput = z.toJSONSchema(registerSchema);
const LoginInput = z.toJSONSchema(loginSchema);
const RefreshTokenInput = z.toJSONSchema(refreshTokenSchema);

// User
const CreateUserInput = z.toJSONSchema(createUserSchema);
const UpdateUserInput = z.toJSONSchema(updateUserSchema);
const UpdatePasswordInput = z.toJSONSchema(updatePasswordSchema);
const UpdateAuthSettingsInput = z.toJSONSchema(updateAuthSettingsSchema);

// Query Inputs
const SiteQueryInput = z.toJSONSchema(siteQuerySchema);
const CheckpointQueryInput = z.toJSONSchema(checkpointQuerySchema);
const VisitorQueryInput = z.toJSONSchema(visitorQuerySchema);
const BlacklistQueryInput = z.toJSONSchema(blacklistQuerySchema);
const VisitQueryInput = z.toJSONSchema(visitQuerySchema);
const RendezvousQueryInput = z.toJSONSchema(rendezvousQuerySchema);
const IncidentQueryInput = z.toJSONSchema(incidentQuerySchema);
const SosQueryInput = z.toJSONSchema(sosQuerySchema);

// =====================================================================================
// MODÈLES DE RÉPONSE SWAGGER - NOUVELLE STRUCTURE
// =====================================================================================

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
    
    // Basic information (required fields)
    name: { type: "string" },
    address: { type: "string" },
    city: { type: "string" },
    postalCode: { type: "string" },
    country: { type: "string" },
    activityType: { 
      type: "string", 
      enum: ["OFFICE", "PRODUCTION", "WAREHOUSE", "RETAIL", "RESEARCH", "DATACENTER", "LOGISTICS", "MANUFACTURING", "HEADQUARTERS", "OTHER"]
    },
    status: { 
      type: "string", 
      enum: ["ACTIVE", "INACTIVE", "UNDER_CONSTRUCTION", "MAINTENANCE", "CLOSED", "PLANNED", "SUSPENDED"]
    },
    
    // Optional basic information
    code: { type: "string", nullable: true },
    region: { type: "string", nullable: true },
    phone: { type: "string", nullable: true },
    fax: { type: "string", nullable: true },
    email: { type: "string", format: "email", nullable: true },
    website: { type: "string", format: "uri", nullable: true },
    
    // Management
    manager: { type: "string", nullable: true },
    managerEmail: { type: "string", format: "email", nullable: true },
    managerPhone: { type: "string", nullable: true },
    
    // Areas and capacity
    area: { type: "number", nullable: true, description: "Area in square meters" },
    usableArea: { type: "number", nullable: true, description: "Actual usable area in square meters" },
    employeeCount: { type: "integer", nullable: true },
    maxEmployeeCapacity: { type: "integer", nullable: true },
    buildingCount: { type: "integer", nullable: true },
    
    // Dates
    creationDate: { type: "string", format: "date-time" },
    modificationDate: { type: "string", format: "date-time", nullable: true },
    openingDate: { type: "string", format: "date-time", nullable: true },
    closingDate: { type: "string", format: "date-time", nullable: true },
    
    // Coordinates
    coordinates: {
      type: "object",
      nullable: true,
      properties: {
        latitude: { type: "number", minimum: -90, maximum: 90 },
        longitude: { type: "number", minimum: -180, maximum: 180 }
      }
    },
    
    // Descriptions
    description: { type: "string", nullable: true },
    comments: { type: "string", nullable: true },
    
    // Financial information
    monthlyCost: { type: "number", nullable: true },
    annualBudget: { type: "number", nullable: true },
    
    // Certifications and compliance
    certifications: { 
      type: "array", 
      items: { type: "string" }, 
      nullable: true,
      description: "ISO, HACCP, etc."
    },
    lastInspection: { type: "string", format: "date-time", nullable: true },
    nextInspection: { type: "string", format: "date-time", nullable: true },
    
    // Equipment and services
    equipment: { 
      type: "array", 
      items: { type: "string" }, 
      nullable: true 
    },
    services: { 
      type: "array", 
      items: { type: "string" }, 
      nullable: true 
    },
    
    // Accessibility
    wheelchairAccessible: { type: "boolean", nullable: true },
    parkingAvailable: { type: "boolean", nullable: true },
    parkingSpaces: { type: "integer", nullable: true },
    
    // Security
    securitySystem: { type: "boolean", nullable: true },
    securityGuard: { type: "boolean", nullable: true },
    
    // Environment
    environmentalCertification: { type: "string", nullable: true },
    energyConsumption: { type: "number", nullable: true, description: "kWh/month" },
    
    // Metadata
    createdBy: { type: "string", nullable: true },
    modifiedBy: { type: "string", nullable: true },
    version: { type: "integer", nullable: true }
  }
};

const Checkpoint = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    description: { type: "string", nullable: true },
    siteId: { type: "string", format: "uuid" },
    
    // Location
    zone: { type: "string", nullable: true },
    building: { type: "string", nullable: true },
    floor: { type: "string", nullable: true },
    coordinatesLatitude: { type: "number", nullable: true },
    coordinatesLongitude: { type: "number", nullable: true },
    
    // SOS Configuration
    sosId: { type: "string" },
    sosConfiguration: { type: "object", nullable: true },
    
    // Agent Assignment
    agentId: { type: "string", format: "uuid", nullable: true },
    agentName: { type: "string", nullable: true },
    agentEmail: { type: "string", format: "email", nullable: true },
    agentPhone: { type: "string", nullable: true },
    assignmentDate: { type: "string", format: "date-time", nullable: true },
    
    // Status and State
    status: { 
      type: "string", 
      enum: ["active", "inactive", "maintenance", "error"],
      default: "active"
    },
    checkpointType: { 
      type: "string", 
      enum: ["entry", "exit", "internal", "emergency", "patrol"],
      default: "internal"
    },
    priority: { 
      type: "string", 
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },
    
    // Scheduling
    controlFrequency: { 
      type: "string", 
      enum: ["hourly", "daily", "weekly", "monthly", "on_demand"],
      nullable: true
    },
    nextControl: { type: "string", format: "date-time", nullable: true },
    lastControl: { type: "string", format: "date-time", nullable: true },
    
    // Equipment and Materials
    equipment: { type: "array", items: { type: "string" }, nullable: true },
    requiredMaterial: { type: "array", items: { type: "string" }, nullable: true },
    specialInstructions: { type: "string", nullable: true },
    
    // Metadata
    active: { type: "boolean", default: true },
    createdBy: { type: "string", nullable: true },
    modifiedBy: { type: "string", nullable: true },
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
      enum: ["CNIB", "PASSEPORT", "PERMIS_CONDUITE"] 
    },
    idNumber: { type: "string" },
    idScanUrl: { type: "string", nullable: true },
    photoUrl: { type: "string", nullable: true },
    isBlacklisted: { type: "boolean", default: false },
    blacklistReason: { type: "string", nullable: true },
    company: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

const BlacklistHistory = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    
    // Référence visiteur (optionnelle)
    visitorId: { type: "string", format: "uuid", nullable: true },
    
    // Informations d'identification (pour signalement national)
    firstName: { type: "string", nullable: true },
    lastName: { type: "string", nullable: true },
    idType: { 
      type: "string", 
      enum: ["CNIB", "PASSEPORT", "PERMIS_CONDUITE"],
      nullable: true 
    },
    idNumber: { type: "string", nullable: true },
    phone: { type: "string", nullable: true },
    email: { type: "string", format: "email", nullable: true },
    nationality: { type: "string", nullable: true },
    birthDate: { type: "string", format: "date", nullable: true },
    birthPlace: { type: "string", nullable: true },
    
    // Informations du signalement
    action: { 
      type: "string", 
      enum: ["added", "removed"] 
    },
    reason: { type: "string" },
    severityLevel: { 
      type: "integer", 
      minimum: 1, 
      maximum: 4, 
      default: 1,
      description: "1: Low, 2: Medium, 3: High, 4: Critical"
    },
    incidentDate: { type: "string", format: "date", nullable: true },
    incidentLocation: { type: "string", nullable: true },
    
    // Métadonnées
    createdBy: { type: "string", format: "uuid" },
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
    isGroup: { type: "boolean", default: false },
    groupCode: { type: "string", nullable: true },
    entryTime: { type: "string", format: "date-time" },
    exitTime: { type: "string", format: "date-time", nullable: true },
    createdBy: { type: "string", format: "uuid" },
    status: { 
      type: "string", 
      enum: ["active", "finished", "refused"],
      default: "active"
    },
    signatureUrl: { type: "string", nullable: true },
    notes: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" }
  }
};

const Service = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    description: { type: "string", nullable: true },
    chefId: { type: "string", format: "uuid", nullable: true },
    isActive: { type: "boolean", default: true },
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
    isResolved: { type: "boolean", default: false },
    resolvedAt: { type: "string", format: "date-time", nullable: true },
    resolvedBy: { type: "string", format: "uuid", nullable: true },
    resolutionNotes: { type: "string", nullable: true }
  }
};

const Rendezvous = {
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
      enum: ["pending", "validated", "cancelled"],
      default: "pending"
    },
    notes: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  }
};

const VisitIncident = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    visitId: { type: "string", format: "uuid" },
    reportedBy: { type: "string", format: "uuid" },
    title: { type: "string" },
    description: { type: "string" },
    severityLevel: { 
      type: "integer", 
      minimum: 1, 
      maximum: 3, 
      default: 1,
      description: "1: Low, 2: Medium, 3: High"
    },
    isResolved: { type: "boolean", default: false },
    resolvedAt: { type: "string", format: "date-time", nullable: true },
    resolutionNotes: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" }
  }
};

const AgentCheckpointAssignment = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid" },
    checkpointId: { type: "string", format: "uuid" },
    startDate: { type: "string", format: "date-time" },
    endDate: { type: "string", format: "date-time", nullable: true },
    createdAt: { type: "string", format: "date-time" }
  }
};

const VisitorGroup = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    groupCode: { type: "string" },
    organizerId: { type: "string", format: "uuid" },
    serviceId: { type: "string", format: "uuid" },
    reason: { type: "string" },
    visitDate: { type: "string", format: "date" },
    expectedCount: { type: "integer", default: 1 },
    notes: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" }
  }
};

const GroupVisitor = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    groupId: { type: "string", format: "uuid" },
    visitorId: { type: "string", format: "uuid" },
    createdAt: { type: "string", format: "date-time" }
  }
};

const AuditLog = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    userId: { type: "string", format: "uuid", nullable: true },
    action: { type: "string" },
    entity: { type: "string" },
    entityId: { type: "string", format: "uuid", nullable: true },
    oldValues: { type: "object", nullable: true },
    newValues: { type: "object", nullable: true },
    ipAddress: { type: "string", nullable: true },
    userAgent: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" }
  }
};

const RefreshToken = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    token: { type: "string" },
    userId: { type: "string", format: "uuid" },
    expiresAt: { type: "string", format: "date-time" },
    createdAt: { type: "string", format: "date-time" }
  }
};

// =====================================================================================
// MODÈLES D'ÉNUMÉRATION
// =====================================================================================

const UserRole = {
  type: "object",
  properties: {
    roleName: { 
      type: "string", 
      enum: ["ADMIN", "AGENT_GESTION", "AGENT_CONTROLE", "CHEF_SERVICE"] 
    }
  }
};

const IdType = {
  type: "object",
  properties: {
    typeName: { 
      type: "string", 
      enum: ["CNIB", "PASSEPORT", "PERMIS_CONDUITE"] 
    }
  }
};

const CheckpointStatus = {
  type: "object",
  properties: {
    statusName: { 
      type: "string", 
      enum: ["active", "inactive", "maintenance", "error"] 
    }
  }
};

const CheckpointType = {
  type: "object",
  properties: {
    typeName: { 
      type: "string", 
      enum: ["entry", "exit", "internal", "emergency", "patrol"] 
    }
  }
};

const CheckpointPriority = {
  type: "object",
  properties: {
    priorityName: { 
      type: "string", 
      enum: ["low", "medium", "high", "critical"] 
    }
  }
};

const ControlFrequency = {
  type: "object",
  properties: {
    frequencyName: { 
      type: "string", 
      enum: ["hourly", "daily", "weekly", "monthly", "on_demand"] 
    }
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

// =====================================================================================
// EXPORTS - SCHÉMAS SWAGGER ADAPTÉS
// =====================================================================================

module.exports = {
  // ===== SCHÉMAS D'ENTRÉE =====
  
  // Auth
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  
  // User
  CreateUserInput,
  UpdateUserInput,
  UpdatePasswordInput,
  UpdateAuthSettingsInput,
  
  // Query Inputs
  SiteQueryInput,
  CheckpointQueryInput,
  VisitorQueryInput,
  BlacklistQueryInput,
  VisitQueryInput,
  RendezvousQueryInput,
  IncidentQueryInput,
  SosQueryInput,

  // ===== MODÈLES DE RÉPONSE PRINCIPAUX =====
  
  // Core Models
  User,
  Site,
  Checkpoint,
  Visitor,
  Service,
  Visit,
  Rendezvous,
  
  // Management & Assignment
  AgentCheckpointAssignment,
  VisitorGroup,
  GroupVisitor,
  
  // Security & Incidents
  BlacklistHistory,
  SosAlert,
  VisitIncident,
  
  // System & Audit
  AuditLog,
  RefreshToken,

  // ===== MODÈLES D'ÉNUMÉRATION =====
  UserRole,
  IdType,
  CheckpointStatus,
  CheckpointType,
  CheckpointPriority,
  ControlFrequency,

  // ===== TYPES DE RÉPONSE API =====
  ApiResponse,
  ApiError,
  ErrorResponse,
  PaginatedResponse
};
