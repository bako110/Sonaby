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

// =====================================================================================
// SCHÉMAS POUR LES OPTIONS DE FILTRE AUTOMATIQUES
// =====================================================================================

const FilterOptionSchema = {
  type: "object",
  properties: {
    value: { type: "string", description: "Valeur de l'option" },
    label: { type: "string", description: "Libellé affiché pour l'option" },
    count: { type: "integer", description: "Nombre d'éléments disponibles pour cette option" }
  },
  required: ["value", "label", "count"],
  example: {
    value: "Paris",
    label: "Paris",
    count: 15
  }
};

const SiteFilterOptionSchema = {
  type: "object",
  properties: {
    value: { type: "string", format: "uuid", description: "ID du site" },
    label: { type: "string", description: "Libellé du site avec code" },
    count: { type: "integer", description: "Nombre de checkpoints sur ce site" },
    city: { type: "string", description: "Ville du site" }
  },
  required: ["value", "label", "count"],
  example: {
    value: "550e8400-e29b-41d4-a716-446655440001",
    label: "Siège Social (PAR001)",
    count: 5,
    city: "Paris"
  }
};

const AgentFilterOptionSchema = {
  type: "object",
  properties: {
    value: { type: "string", format: "uuid", description: "ID de l'agent" },
    label: { type: "string", description: "Nom complet de l'agent" },
    count: { type: "integer", description: "Nombre de checkpoints assignés à cet agent" },
    email: { type: "string", format: "email", description: "Email de l'agent" }
  },
  required: ["value", "label", "count"],
  example: {
    value: "660e8400-e29b-41d4-a716-446655440002",
    label: "Jean Dupont",
    count: 3,
    email: "jean.dupont@example.com"
  }
};

const SiteFilterOptionsSchema = {
  type: "object",
  properties: {
    cities: {
      type: "array",
      items: FilterOptionSchema,
      description: "Liste des villes disponibles avec leurs compteurs"
    },
    managers: {
      type: "array",
      items: FilterOptionSchema,
      description: "Liste des managers disponibles avec leurs compteurs"
    },
    activityTypes: {
      type: "array",
      items: FilterOptionSchema,
      description: "Liste des types d'activité disponibles avec leurs compteurs"
    },
    statuses: {
      type: "array",
      items: FilterOptionSchema,
      description: "Liste des statuts disponibles avec leurs compteurs"
    }
  },
  required: ["cities", "managers", "activityTypes", "statuses"],
  example: {
    cities: [
      { value: "Paris", label: "Paris", count: 15 },
      { value: "Lyon", label: "Lyon", count: 8 }
    ],
    managers: [
      { value: "Jean Dupont", label: "Jean Dupont", count: 5 },
      { value: "Marie Martin", label: "Marie Martin", count: 3 }
    ],
    activityTypes: [
      { value: "headquarters", label: "headquarters", count: 4 },
      { value: "branch", label: "branch", count: 12 }
    ],
    statuses: [
      { value: "active", label: "active", count: 18 },
      { value: "inactive", label: "inactive", count: 2 }
    ]
  }
};

const CheckpointFilterOptionsSchema = {
  type: "object",
  properties: {
    zones: {
      type: "array",
      items: FilterOptionSchema,
      description: "Liste des zones disponibles avec leurs compteurs"
    },
    checkpointTypes: {
      type: "array",
      items: FilterOptionSchema,
      description: "Liste des types de checkpoints disponibles avec leurs compteurs"
    },
    statuses: {
      type: "array",
      items: FilterOptionSchema,
      description: "Liste des statuts disponibles avec leurs compteurs"
    },
    priorities: {
      type: "array",
      items: FilterOptionSchema,
      description: "Liste des priorités disponibles avec leurs compteurs"
    },
    sites: {
      type: "array",
      items: SiteFilterOptionSchema,
      description: "Liste des sites disponibles avec leurs compteurs de checkpoints"
    },
    agents: {
      type: "array",
      items: AgentFilterOptionSchema,
      description: "Liste des agents disponibles avec leurs compteurs de checkpoints"
    }
  },
  required: ["zones", "checkpointTypes", "statuses", "priorities", "sites", "agents"],
  example: {
    zones: [
      { value: "Zone A", label: "Zone A", count: 8 },
      { value: "Zone B", label: "Zone B", count: 12 }
    ],
    checkpointTypes: [
      { value: "internal", label: "internal", count: 15 },
      { value: "external", label: "external", count: 5 }
    ],
    statuses: [
      { value: "active", label: "active", count: 18 },
      { value: "maintenance", label: "maintenance", count: 2 }
    ],
    priorities: [
      { value: "medium", label: "medium", count: 12 },
      { value: "high", label: "high", count: 6 }
    ],
    sites: [
      {
        value: "550e8400-e29b-41d4-a716-446655440001",
        label: "Siège Social (PAR001)",
        count: 5,
        city: "Paris"
      }
    ],
    agents: [
      {
        value: "660e8400-e29b-41d4-a716-446655440002",
        label: "Jean Dupont",
        count: 3,
        email: "jean.dupont@example.com"
      }
    ]
  }
};

// =====================================================================================
// SCHÉMAS POUR LES VISITES ET VISITEURS
// =====================================================================================

const VisitFilterOptionsSchema = {
  type: "object",
  properties: {
    statuses: {
      type: "array",
      items: FilterOptionSchema,
      description: "Liste des statuts de visites disponibles avec leurs compteurs"
    },
    origins: {
      type: "array",
      items: FilterOptionSchema,
      description: "Liste des origines de visites disponibles avec leurs compteurs"
    },
    reasons: {
      type: "array",
      items: FilterOptionSchema,
      description: "Liste des raisons de visites disponibles avec leurs compteurs"
    },
    sites: {
      type: "array",
      items: SiteFilterOptionSchema,
      description: "Liste des sites visités avec leurs compteurs de visites"
    },
    services: {
      type: "array",
      items: {
        type: "object",
        properties: {
          value: { type: "string", format: "uuid", description: "ID du service" },
          label: { type: "string", description: "Libellé du service avec type" },
          count: { type: "integer", description: "Nombre de visites pour ce service" },
          type: { type: "string", description: "Type du service" }
        },
        required: ["value", "label", "count", "type"],
        example: {
          value: "550e8400-e29b-41d4-a716-446655440003",
          label: "IT Support (technical)",
          count: 5,
          type: "technical"
        }
      },
      description: "Liste des services visités avec leurs compteurs"
    },
    checkpoints: {
      type: "array",
      items: {
        type: "object",
        properties: {
          value: { type: "string", format: "uuid", description: "ID du checkpoint" },
          label: { type: "string", description: "Libellé du checkpoint avec zone" },
          count: { type: "integer", description: "Nombre de visites pour ce checkpoint" },
          zone: { type: "string", description: "Zone du checkpoint" },
          checkpointType: { type: "string", description: "Type du checkpoint" },
          site: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
              code: { type: "string" }
            }
          }
        },
        required: ["value", "label", "count", "zone", "checkpointType"],
        example: {
          value: "660e8400-e29b-41d4-a716-446655440004",
          label: "Portail Principal (Zone A)",
          count: 8,
          zone: "Zone A",
          checkpointType: "entry",
          site: {
            id: "550e8400-e29b-41d4-a716-446655440001",
            name: "Siège Social",
            code: "PAR001"
          }
        }
      },
      description: "Liste des checkpoints visités avec leurs compteurs"
    }
  },
  required: ["statuses", "origins", "reasons", "sites", "services", "checkpoints"],
  example: {
    statuses: [
      { value: "present", label: "present", count: 25 },
      { value: "left", label: "left", count: 45 }
    ],
    origins: [
      { value: "Entreprise", label: "Entreprise", count: 15 },
      { value: "Personnel", label: "Personnel", count: 8 }
    ],
    reasons: [
      { value: "Réunion", label: "Réunion", count: 12 },
      { value: "Livraison", label: "Livraison", count: 6 }
    ],
    sites: [
      {
        value: "550e8400-e29b-41d4-a716-446655440001",
        label: "Siège Social (PAR001)",
        count: 20,
        city: "Paris"
      }
    ],
    services: [
      {
        value: "550e8400-e29b-41d4-a716-446655440003",
        label: "IT Support (technical)",
        count: 5,
        type: "technical"
      }
    ],
    checkpoints: [
      {
        value: "660e8400-e29b-41d4-a716-446655440004",
        label: "Portail Principal (Zone A)",
        count: 8,
        zone: "Zone A",
        checkpointType: "entry",
        site: {
          id: "550e8400-e29b-41d4-a716-446655440001",
          name: "Siège Social",
          code: "PAR001"
        }
      }
    ]
  }
};

const VisitorFilterOptionsSchema = {
  type: "object",
  properties: {
    idTypes: {
      type: "array",
      items: FilterOptionSchema,
      description: "Liste des types d'ID disponibles avec leurs compteurs"
    },
    companies: {
      type: "array",
      items: FilterOptionSchema,
      description: "Liste des entreprises disponibles avec leurs compteurs"
    },
    sites: {
      type: "array",
      items: SiteFilterOptionSchema,
      description: "Liste des sites visités avec leurs compteurs de visiteurs"
    },
    checkpoints: {
      type: "array",
      items: {
        type: "object",
        properties: {
          value: { type: "string", format: "uuid", description: "ID du checkpoint" },
          label: { type: "string", description: "Libellé du checkpoint avec zone" },
          count: { type: "integer", description: "Nombre de visiteurs pour ce checkpoint" },
          zone: { type: "string", description: "Zone du checkpoint" },
          checkpointType: { type: "string", description: "Type du checkpoint" },
          site: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
              code: { type: "string" }
            }
          }
        },
        required: ["value", "label", "count", "zone", "checkpointType"],
        example: {
          value: "660e8400-e29b-41d4-a716-446655440004",
          label: "Portail Principal (Zone A)",
          count: 5,
          zone: "Zone A",
          checkpointType: "entry",
          site: {
            id: "550e8400-e29b-41d4-a716-446655440001",
            name: "Siège Social",
            code: "PAR001"
          }
        }
      },
      description: "Liste des checkpoints visités avec leurs compteurs de visiteurs"
    },
    blacklistOptions: {
      type: "array",
      items: FilterOptionSchema,
      description: "Options pour le statut blacklist"
    },
    badgeOptions: {
      type: "array",
      items: FilterOptionSchema,
      description: "Options pour la présence de badge"
    },
    incidentOptions: {
      type: "array",
      items: FilterOptionSchema,
      description: "Options pour la présence d'incidents"
    }
  },
  required: ["idTypes", "companies", "sites", "checkpoints", "blacklistOptions", "badgeOptions", "incidentOptions"],
  example: {
    idTypes: [
      { value: "CNIB", label: "CNIB", count: 45 },
      { value: "PASSEPORT", label: "PASSEPORT", count: 12 }
    ],
    companies: [
      { value: "TechCorp", label: "TechCorp", count: 8 },
      { value: "ServicePlus", label: "ServicePlus", count: 5 }
    ],
    sites: [
      {
        value: "550e8400-e29b-41d4-a716-446655440001",
        label: "Siège Social (PAR001)",
        count: 15,
        city: "Paris"
      }
    ],
    checkpoints: [
      {
        value: "660e8400-e29b-41d4-a716-446655440004",
        label: "Portail Principal (Zone A)",
        count: 5,
        zone: "Zone A",
        checkpointType: "entry",
        site: {
          id: "550e8400-e29b-41d4-a716-446655440001",
          name: "Siège Social",
          code: "PAR001"
        }
      }
    ],
    blacklistOptions: [
      { value: "true", label: "Oui", count: 3 },
      { value: "false", label: "Non", count: 52 }
    ],
    badgeOptions: [
      { value: "true", label: "Avec badge", count: 25 },
      { value: "false", label: "Sans badge", count: 30 }
    ],
    incidentOptions: [
      { value: "true", label: "Avec incidents", count: 4 },
      { value: "false", label: "Sans incidents", count: 51 }
    ]
  }
};

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
  checkpointId: z.string().uuid().optional().describe("Filtre par ID du checkpoint"),
  agentId: z.string().uuid().optional().describe("Filtre par ID de l'agent déclencheur"),
  userId: z.string().uuid().optional().describe("Filtre par ID utilisateur (déclencheur ou résolveur)"),
  isResolved: z.string().optional().describe("Statut de résolution (true/false)"),
  searchTerm: z.string().optional().describe("Recherche textuelle dans message, checkpoint ou site"),
  statut: z.string().optional().describe("Statut du SOS (MEDIUM, HIGH, LOW, CRITICAL)"),
  priorite: z.string().optional().describe("Niveau de priorité du SOS"),
  typeIncident: z.string().optional().describe("Type d'incident SOS"),
  dateDebut: z.string().optional().describe("Date de début (format ISO 8601)"),
  dateFin: z.string().optional().describe("Date de fin (format ISO 8601)"),
  sortBy: z.string().optional().describe("Champ de tri (triggeredAt, isResolved, message)"),
  sortOrder: z.enum(['asc', 'desc']).optional().describe("Ordre de tri (asc/desc)"),
  // Backwards compatibility
  triggeredBy: z.string().uuid().optional().describe("[Obsolète] Utiliser agentId à la place"),
  active: z.string().optional().describe("[Obsolète] Utiliser isResolved à la place")
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

// Schéma de création de site
const CreateSiteInput = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1, maxLength: 255, description: "Nom du site", example: "Site Principal Paris" },
    address: { type: "string", minLength: 1, description: "Adresse complète", example: "123 Avenue des Champs-Élysées" },
    city: { type: "string", minLength: 1, maxLength: 100, description: "Ville", example: "Paris" },
    postalCode: { type: "string", minLength: 1, maxLength: 20, description: "Code postal", example: "75008" },
    country: { type: "string", minLength: 1, maxLength: 100, description: "Pays", example: "France" },
    activityType: { 
      type: "string", 
      enum: ["OFFICE", "PRODUCTION", "WAREHOUSE", "RETAIL", "RESEARCH", "DATACENTER", "LOGISTICS", "MANUFACTURING", "HEADQUARTERS", "OTHER"],
      description: "Type d'activité",
      example: "OFFICE"
    },
    status: { 
      type: "string", 
      enum: ["ACTIVE", "INACTIVE", "UNDER_CONSTRUCTION", "MAINTENANCE", "CLOSED", "PLANNED", "SUSPENDED"],
      description: "Statut du site",
      example: "ACTIVE"
    },
    code: { type: "string", maxLength: 50, description: "Code unique du site", example: "PAR001" },
    region: { type: "string", maxLength: 100, description: "Région", example: "Île-de-France" },
    phone: { type: "string", maxLength: 20, description: "Téléphone", example: "+33 1 42 96 12 34" },
    fax: { type: "string", maxLength: 20, description: "Fax", example: "+33 1 42 96 12 35" },
    email: { type: "string", format: "email", description: "Email", example: "contact@site.com" },
    website: { type: "string", format: "uri", description: "Site web", example: "https://www.site.com" },
    manager: { type: "string", maxLength: 255, description: "Responsable", example: "Jean Dupont" },
    managerEmail: { type: "string", format: "email", description: "Email responsable", example: "jean.dupont@entreprise.com" },
    managerPhone: { type: "string", maxLength: 20, description: "Téléphone responsable", example: "+33 6 12 34 56 78" },
    area: { type: "number", minimum: 0, description: "Surface totale (m²)", example: 1500.5 },
    usableArea: { type: "number", minimum: 0, description: "Surface utile (m²)", example: 1200.0 },
    employeeCount: { type: "integer", minimum: 0, description: "Nombre d'employés", example: 50 },
    maxEmployeeCapacity: { type: "integer", minimum: 0, description: "Capacité max employés", example: 100 },
    buildingCount: { type: "integer", minimum: 0, description: "Nombre de bâtiments", example: 2 },
    openingDate: { type: "string", format: "date-time", description: "Date d'ouverture", example: "2024-01-15T09:00:00Z" },
    closingDate: { type: "string", format: "date-time", description: "Date de fermeture", example: "2030-12-31T18:00:00Z" },
    coordinates: {
      type: "object",
      properties: {
        latitude: { type: "number", minimum: -90, maximum: 90, description: "Latitude", example: 48.8566 },
        longitude: { type: "number", minimum: -180, maximum: 180, description: "Longitude", example: 2.3522 }
      }
    },
    description: { type: "string", description: "Description", example: "Site principal de l'entreprise" },
    comments: { type: "string", description: "Commentaires", example: "Accès métro ligne 1" },
    monthlyCost: { type: "number", minimum: 0, description: "Coût mensuel (€)", example: 15000.00 },
    annualBudget: { type: "number", minimum: 0, description: "Budget annuel (€)", example: 200000.00 },
    certifications: { type: "array", items: { type: "string" }, description: "Certifications", example: ["ISO 9001", "ISO 14001"] },
    lastInspection: { type: "string", format: "date-time", description: "Dernière inspection", example: "2024-10-15T14:30:00Z" },
    nextInspection: { type: "string", format: "date-time", description: "Prochaine inspection", example: "2025-10-15T14:30:00Z" },
    equipment: { type: "array", items: { type: "string" }, description: "Équipements", example: ["Climatisation", "Vidéosurveillance"] },
    services: { type: "array", items: { type: "string" }, description: "Services", example: ["Restauration", "Parking"] },
    wheelchairAccessible: { type: "boolean", description: "Accessible PMR", example: true },
    parkingAvailable: { type: "boolean", description: "Parking disponible", example: true },
    parkingSpaces: { type: "integer", minimum: 0, description: "Places de parking", example: 50 },
    securitySystem: { type: "boolean", description: "Système de sécurité", example: true },
    securityGuard: { type: "boolean", description: "Agent de sécurité", example: false },
    environmentalCertification: { type: "string", maxLength: 255, description: "Certification environnementale", example: "HQE Excellent" },
    energyConsumption: { type: "number", minimum: 0, description: "Consommation énergétique (kWh/mois)", example: 12500.5 },
    createdBy: { type: "string", maxLength: 255, description: "Créé par", example: "admin@entreprise.com" },
    version: { type: "integer", minimum: 1, description: "Version", example: 1 }
  },
  required: ["name", "address", "city", "postalCode", "country", "activityType", "status"]
};

// Schéma de mise à jour (tous les champs optionnels)
const UpdateSiteInput = {
  type: "object",
  properties: {
    ...CreateSiteInput.properties
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
    devicesId: { type: "array", items: { type: "string" }, nullable: true, description: "Liste des IDs des dispositifs associés au checkpoint" },
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
    emergencyContactPhone: { type: "string", nullable: true, description: "Téléphone du contact d'urgence" },
    emergencyContactName: { type: "string", nullable: true, description: "Nom du contact d'urgence" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" }
  },
  example: {
    id: "880e8400-e29b-41d4-a716-446655440001",
    firstName: "Marie",
    lastName: "KABORE",
    phone: "+226 70 11 22 33",
    email: "marie.kabore@email.com",
    idType: "CNIB",
    idNumber: "C123456789",
    company: "Entreprise KABORE & Fils",
    emergencyContactPhone: "+226 76 99 88 77",
    emergencyContactName: "Jean KABORE",
    createdAt: "2024-11-24T10:30:00Z",
    updatedAt: "2024-11-24T10:30:00Z"
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
    id: { type: "string", format: "uuid", description: "ID unique de la visite" },
    visitorId: { type: "string", format: "uuid", description: "ID du visiteur" },
    checkpointId: { type: "string", format: "uuid", description: "ID du checkpoint d'entrée" },
    entryTime: { type: "string", format: "date-time", description: "Date et heure d'entrée" },
    exitTime: { type: "string", format: "date-time", nullable: true, description: "Date et heure de sortie" },
    entityVisited: { type: "string", description: "Entité visitée (service, personne, etc.)" },
    contactPerson: { type: "string", description: "Personne contactée" },
    origin: { type: "string", description: "Origine de la visite (entreprise, etc.)" },
    reason: { type: "string", description: "Raison de la visite" },
    notes: { type: "string", description: "Notes sur la visite" },
    status: { 
      type: "string", 
      enum: ["present", "left"],
      default: "present",
      description: "Statut de la visite"
    },
    createdAt: { type: "string", format: "date-time", description: "Date de création" },
    updatedAt: { type: "string", format: "date-time", description: "Date de mise à jour" },
    visitor: {
      type: "object",
      description: "Informations du visiteur",
      properties: {
        id: { type: "string", format: "uuid" },
        firstName: { type: "string", description: "Prénom du visiteur" },
        lastName: { type: "string", description: "Nom du visiteur" },
        phone: { type: "string", nullable: true, description: "Téléphone du visiteur" },
        email: { type: "string", format: "email", nullable: true, description: "Email du visiteur" },
        company: { type: "string", nullable: true, description: "Entreprise du visiteur" },
        emergencyContactPhone: { type: "string", nullable: true, description: "Contact d'urgence" },
        emergencyContactName: { type: "string", nullable: true, description: "Nom du contact d'urgence" }
      }
    },
    checkpoint: {
      type: "object",
      description: "Informations du checkpoint",
      properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string", description: "Nom du checkpoint" },
        site: {
          type: "object",
          description: "Site du checkpoint",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", description: "Nom du site" }
          }
        }
      }
    },
    incidents: {
      type: "array",
      description: "Incidents liés à la visite",
      items: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string", description: "Titre de l'incident" },
          description: { type: "string", description: "Description de l'incident" },
          severityLevel: { type: "integer", description: "Niveau de gravité (1-4)" },
          isResolved: { type: "boolean", description: "Incident résolu" },
          createdAt: { type: "string", format: "date-time" }
        }
      }
    }
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
    id: { 
      type: "string", 
      format: "uuid",
      description: "Identifiant unique de l'alerte SOS",
      example: "cc0e8400-e29b-41d4-a716-446655440001"
    },
    checkpointId: { 
      type: "string", 
      format: "uuid",
      description: "ID du checkpoint d'où provient l'alerte",
      example: "770e8400-e29b-41d4-a716-446655440002"
    },
    triggeredBy: { 
      type: "string", 
      format: "uuid",
      description: "ID de l'utilisateur qui a déclenché l'alerte",
      example: "a8969b03-c8e6-11f0-aa39-0242ac140013"
    },
    triggeredAt: { 
      type: "string", 
      format: "date-time",
      description: "Date et heure de déclenchement de l'alerte",
      example: "2024-11-23T16:45:00Z"
    },
    message: { 
      type: "string", 
      nullable: true,
      description: "Message décrivant la situation d'urgence",
      example: "Tentative d'effraction véhicule dans le parking"
    },
    isResolved: { 
      type: "boolean", 
      default: false,
      description: "L'alerte est-elle résolue ?",
      example: true
    },
    resolvedAt: { 
      type: "string", 
      format: "date-time", 
      nullable: true,
      description: "Date et heure de résolution de l'alerte",
      example: "2024-11-23T17:15:00Z"
    },
    resolvedBy: { 
      type: "string", 
      format: "uuid", 
      nullable: true,
      description: "ID de l'utilisateur qui a résolu l'alerte",
      example: "6985b877-c56b-11f0-aa39-0242ac140013"
    },
    resolutionNotes: { 
      type: "string", 
      nullable: true,
      description: "Notes sur la résolution de l'alerte",
      example: "Fausse alerte - Propriétaire qui avait perdu ses clés"
    },
    // Champs de filtrage optionnels
    statut: {
      type: "string",
      enum: ["MEDIUM", "HIGH", "LOW", "CRITICAL"],
      nullable: true,
      description: "Statut du SOS",
      example: "MEDIUM"
    },
    priorite: {
      type: "string",
      enum: ["NORMAL", "HIGH", "LOW", "URGENT"],
      nullable: true,
      description: "Niveau de priorité du SOS",
      example: "NORMAL"
    },
    typeIncident: {
      type: "string",
      enum: ["GENERAL", "SECURITY", "TECHNICAL", "EMERGENCY", "OTHER"],
      nullable: true, 
      description: "Type d'incident SOS",
      example: "GENERAL"
    },
    // Relations
    checkpoint: {
      $ref: "#/components/schemas/Checkpoint",
      description: "Checkpoint associé à l'alerte"
    },
    triggerer: {
      $ref: "#/components/schemas/User", 
      description: "Utilisateur ayant déclenché l'alerte"
    },
    resolver: {
      $ref: "#/components/schemas/User",
      nullable: true,
      description: "Utilisateur ayant résolu l'alerte"
    }
  },
  example: {
    id: "cc0e8400-e29b-41d4-a716-446655440001",
    checkpointId: "770e8400-e29b-41d4-a716-446655440002",
    triggeredBy: "a8969b03-c8e6-11f0-aa39-0242ac140013",
    triggeredAt: "2024-11-23T16:45:00Z",
    message: "Tentative d'effraction véhicule dans le parking",
    isResolved: true,
    resolvedAt: "2024-11-23T17:15:00Z",
    resolvedBy: "6985b877-c56b-11f0-aa39-0242ac140013",
    resolutionNotes: "Fausse alerte - Propriétaire qui avait perdu ses clés",
    statut: "EN_ATTENTE",
    priorite: "NORMAL", 
    typeIncident: "GENERAL",
    checkpoint: {
      id: "770e8400-e29b-41d4-a716-446655440002",
      name: "Entrée principale",
      site: {
        id: "site-123",
        name: "Site Sonabhy Central"
      }
    },
    triggerer: {
      id: "a8969b03-c8e6-11f0-aa39-0242ac140013",
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean.dupont@sonabhy.com"
    },
    resolver: {
      id: "6985b877-c56b-11f0-aa39-0242ac140013", 
      firstName: "Marie",
      lastName: "Laurent",
      email: "marie.laurent@sonabhy.com"
    }
  }
};

const CreateCheckpointInput = {
  type: "object",
  required: ["name", "siteId", "sosId"],
  properties: {
    name: { 
      type: "string",
      description: "Nom du checkpoint",
      example: "Entrée principale"
    },
    description: { 
      type: "string",
      description: "Description du checkpoint",
      example: "Point de contrôle à l'entrée principale du bâtiment A"
    },
    siteId: { 
      type: "string", 
      format: "uuid",
      description: "ID du site",
      example: "770e8400-e29b-41d4-a716-446655440002"
    },
    zone: { 
      type: "string",
      description: "Zone du checkpoint",
      example: "Zone A"
    },
    building: { 
      type: "string",
      description: "Bâtiment",
      example: "Bâtiment A"
    },
    floor: { 
      type: "string",
      description: "Étage",
      example: "RDC"
    },
    sosId: { 
      type: "string",
      description: "Identifiant SOS unique",
      example: "SOS-001"
    },
    status: { 
      type: "string",
      enum: ["active", "inactive", "maintenance", "error"],
      default: "active",
      description: "Statut du checkpoint"
    },
    checkpointType: { 
      type: "string",
      enum: ["entry", "exit", "internal", "emergency", "patrol"],
      default: "internal",
      description: "Type de checkpoint"
    },
    priority: { 
      type: "string",
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      description: "Priorité"
    },
    controlFrequency: { 
      type: "string",
      enum: ["hourly", "daily", "weekly", "monthly", "on_demand"],
      description: "Fréquence de contrôle"
    },
    devicesId: {
      type: "array",
      items: { type: "string" },
      description: "Liste des IDs des dispositifs associés au checkpoint",
      example: ["device-001", "device-002", "device-003"]
    },
    specialInstructions: { 
      type: "string",
      description: "Instructions spéciales"
    },
    active: { 
      type: "boolean",
      default: true,
      description: "Checkpoint actif"
    }
  }
};

const UpdateCheckpointInput = {
  type: "object",
  properties: {
    ...CreateCheckpointInput.properties
  },
  description: "Schéma de mise à jour de checkpoint (tous les champs optionnels)"
};

const CreateVisitInput = {
  type: "object",
  required: ["visitorId", "checkpointId", "entityVisited", "contactPerson", "origin", "reason", "notes"],
  properties: {
    visitorId: { 
      type: "string", 
      format: "uuid",
      description: "ID du visiteur existant",
      example: "550e8400-e29b-41d4-a716-446655440000"
    },
    checkpointId: { 
      type: "string", 
      format: "uuid",
      description: "ID du checkpoint d'entrée",
      example: "770e8400-e29b-41d4-a716-446655440002"
    },
    entityVisited: { 
      type: "string",
      description: "Entité visitée (service, personne, etc.)",
      example: "Direction Générale"
    },
    contactPerson: { 
      type: "string",
      description: "Personne contactée",
      example: "Jean KABORE"
    },
    origin: { 
      type: "string",
      description: "Origine de la visite (entreprise, etc.)",
      example: "Entreprise ABC"
    },
    reason: { 
      type: "string",
      description: "Raison de la visite",
      example: "Réunion de suivi projet"
    },
    notes: { 
      type: "string",
      description: "Notes sur la visite",
      example: "Visiteur attendu à 14h00"
    },
    status: { 
      type: "string",
      enum: ["present", "left"],
      default: "present",
      description: "Statut de la visite (par défaut: present)"
    }
  }
};

const CreateIncidentInput = {
  type: "object",
  required: ["visitId", "title", "description"],
  properties: {
    visitId: { 
      type: "string", 
      format: "uuid",
      description: "ID de la visite concernée",
      example: "aa0e8400-e29b-41d4-a716-446655440001"
    },
    title: { 
      type: "string",
      description: "Titre court de l'incident",
      example: "Badge visiteur défaillant"
    },
    description: { 
      type: "string",
      description: "Description détaillée de l'incident",
      example: "Le badge temporaire du visiteur ne fonctionnait pas sur les lecteurs du 2ème étage"
    },
    severityLevel: { 
      type: "integer", 
      minimum: 1, 
      maximum: 3, 
      default: 1,
      description: "Niveau de gravité: 1=Faible, 2=Moyen, 3=Élevé",
      example: 1
    }
  },
  example: {
    visitId: "aa0e8400-e29b-41d4-a716-446655440001",
    title: "Badge visiteur défaillant",
    description: "Le badge temporaire du visiteur ne fonctionnait pas sur les lecteurs du 2ème étage",
    severityLevel: 1
  }
};

const CreateSosInput = {
  type: "object",
  required: ["checkpointId", "templateId"],
  properties: {
    checkpointId: { 
      type: "string", 
      format: "uuid",
      description: "ID du checkpoint d'où provient l'alerte",
      example: "770e8400-e29b-41d4-a716-446655440002"
    },
    templateId: {
      type: "integer",
      description: "ID du template prédéfini (table sos_templates)",
      example: 5
    },
    message: { 
      type: "string",
      description: "[Optionnel] Message personnalisé (sinon utilise le template)",
      example: "Situation particulière nécessitant attention immédiate"
    },
    statut: {
      type: "string",
      enum: ["MEDIUM", "HIGH", "LOW", "CRITICAL"],
      description: "[Optionnel] Statut du SOS",
      example: "MEDIUM"
    },
    priorite: {
      type: "string",
      enum: ["NORMAL", "HIGH", "LOW", "URGENT"],
      description: "[Optionnel] Niveau de priorité du SOS", 
      example: "NORMAL"
    },
    typeIncident: {
      type: "string",
      enum: ["GENERAL", "SECURITY", "TECHNICAL", "EMERGENCY", "OTHER"],
      description: "[Optionnel] Type d'incident SOS",
      example: "GENERAL"
    }
  },
  example: {
    checkpointId: "770e8400-e29b-41d4-a716-446655440002",
    templateId: 5,
    statut: "MEDIUM",
    priorite: "NORMAL"
  }
};

const CreateGeneralSOSInput = {
  type: "object",
  required: ["checkpointId"],
  properties: {
    checkpointId: { 
      type: "string", 
      format: "uuid",
      description: "ID du checkpoint pour l'alerte générale automatique",
      example: "770e8400-e29b-41d4-a716-446655440002"
    },
    triggeredBy: {
      type: "string",
      format: "uuid",
      description: "ID de l'utilisateur qui déclenche l'alerte (optionnel, auto-rempli si non fourni)",
      example: "550e8400-e29b-41d4-a716-446655440000"
    }
  },
  example: {
    checkpointId: "770e8400-e29b-41d4-a716-446655440002"
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

const Incident = {
  type: "object",
  properties: {
    id: { 
      type: "string", 
      format: "uuid",
      description: "Identifiant unique de l'incident",
      example: "bb0e8400-e29b-41d4-a716-446655440001"
    },
    titre: {
      type: "string",
      description: "Titre de l'incident",
      example: "Comportement suspect"
    },
    description: { 
      type: "string",
      description: "Description détaillée de l'incident",
      example: "Le visiteur a été vu dans une zone restreinte sans autorisation"
    },
    typeIncident: { 
      type: "string",
      enum: ["ACCIDENT", "REFUS", "FRAUDE", "VOL", "AGRESSION", "AUTRE"],
      default: "AUTRE",
      description: "Type d'incident",
      example: "AUTRE"
    },
    severite: { 
      type: "string",
      enum: ["FAIBLE", "MOYENNE", "ELEVEE", "CRITIQUE"],
      default: "MOYENNE",
      description: "Niveau de sévérité",
      example: "MOYENNE"
    },
    priorite: { 
      type: "string",
      enum: ["BASSE", "NORMALE", "HAUTE", "URGENTE"],
      default: "NORMALE",
      description: "Niveau de priorité",
      example: "NORMALE"
    },
    source: { 
      type: "string",
      enum: ["VISITEUR", "AGENT", "SYSTEME", "AUTRE"],
      default: "AGENT",
      description: "Source de l'incident",
      example: "AGENT"
    },
    dateIncident: { 
      type: "string", 
      format: "date",
      description: "Date de l'incident",
      example: "2024-11-24"
    },
    heureIncident: { 
      type: "string", 
      format: "date-time",
      description: "Heure de l'incident",
      example: "2024-11-24T14:30:00Z"
    },
    siteId: { 
      type: "string", 
      format: "uuid",
      description: "ID du site où l'incident s'est produit",
      example: "550e8400-e29b-41d4-a716-446655440001"
    },
    visitId: { 
      type: "string", 
      format: "uuid",
      nullable: true,
      description: "ID de la visite concernée",
      example: "aa0e8400-e29b-41d4-a716-446655440001"
    },
    visiteurId: { 
      type: "string", 
      format: "uuid",
      nullable: true,
      description: "ID du visiteur concerné",
      example: "aa0e8400-e29b-41d4-a716-446655440001"
    },
    actionsImmediates: { 
      type: "string", 
      nullable: true,
      description: "Actions immédiates prises",
      example: "Le visiteur a été raccompagné à la sortie"
    },
    temoinPresent: { 
      type: "boolean", 
      default: false,
      description: "Y avait-il des témoins ?",
      example: true
    },
    notifierAgents: { 
      type: "boolean", 
      default: false,
      description: "Agents notifiés ?",
      example: true
    },
    reportedBy: { 
      type: "string", 
      format: "uuid",
      description: "ID de l'agent qui a signalé l'incident",
      example: "e5c397cd-c586-11f0-aa39-0242ac140013"
    },
    createdAt: { 
      type: "string", 
      format: "date-time",
      description: "Date de création de l'incident",
      example: "2024-11-24T09:15:00Z"
    },
    updatedAt: { 
      type: "string", 
      format: "date-time",
      description: "Date de mise à jour de l'incident",
      example: "2024-11-24T09:15:00Z"
    },
    // Relations incluses
    site: {
      type: "object",
      description: "Informations du site",
      properties: {
        id: { type: "string", format: "uuid" },
        name: { type: "string", example: "Siège Principal" }
      }
    },
    visit: {
      type: "object",
      nullable: true,
      description: "Informations de la visite",
      properties: {
        id: { type: "string", format: "uuid" },
        entryTime: { type: "string", format: "date-time" },
        visitor: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            firstName: { type: "string", example: "Jean" },
            lastName: { type: "string", example: "Dupont" }
          }
        }
      }
    },
    visiteur: {
      type: "object",
      nullable: true,
      description: "Informations du visiteur",
      properties: {
        id: { type: "string", format: "uuid" },
        firstName: { type: "string", example: "Jean" },
        lastName: { type: "string", example: "Dupont" }
      }
    },
    reporter: {
      type: "object",
      description: "Informations de l'agent rapporteur",
      properties: {
        id: { type: "string", format: "uuid" },
        firstName: { type: "string", example: "Agent" },
        lastName: { type: "string", example: "Security" }
      }
    }
  },
  example: {
    id: "bb0e8400-e29b-41d4-a716-446655440001",
    titre: "Comportement suspect",
    description: "Le visiteur a été vu dans une zone restreinte sans autorisation",
    typeIncident: "AUTRE",
    severite: "MOYENNE",
    priorite: "NORMALE",
    source: "AGENT",
    dateIncident: "2024-11-24",
    heureIncident: "2024-11-24T14:30:00Z",
    siteId: "550e8400-e29b-41d4-a716-446655440001",
    visitId: "aa0e8400-e29b-41d4-a716-446655440001",
    visiteurId: "aa0e8400-e29b-41d4-a716-446655440001",
    actionsImmediates: "Le visiteur a été raccompagné à la sortie",
    temoinPresent: true,
    notifierAgents: true,
    reportedBy: "e5c397cd-c586-11f0-aa39-0242ac140013",
    createdAt: "2024-11-24T09:15:00Z",
    updatedAt: "2024-11-24T09:15:00Z",
    site: {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Siège Principal"
    },
    visit: {
      id: "aa0e8400-e29b-41d4-a716-446655440001",
      entryTime: "2024-11-24T09:00:00Z",
      visitor: {
        id: "aa0e8400-e29b-41d4-a716-446655440001",
        firstName: "Jean",
        lastName: "Dupont"
      }
    },
    reporter: {
      id: "e5c397cd-c586-11f0-aa39-0242ac140013",
      firstName: "Agent",
      lastName: "Security"
    }
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

// Schéma pour l'assignation d'agent à checkpoint
const AssignAgentRequest = {
  type: "object",
  required: ["agentId"],
  properties: {
    agentId: { 
      type: "string", 
      format: "uuid",
      description: "ID de l'agent à assigner",
      example: "e5c397cd-c586-11f0-aa39-0242ac140013"
    }
  }
};

// Schéma pour la réponse d'assignation
const AssignAgentResponse = {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    message: { type: "string", example: "Agent assigné avec succès" },
    data: {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        firstName: { type: "string", example: "Jean" },
        lastName: { type: "string", example: "Dupont" },
        email: { type: "string", format: "email", example: "agent@controller.gmail.com" },
        checkpointId: { type: "string", format: "uuid" },
        checkpoint: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Portail Principal" },
            site: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string", example: "SITE Paul" }
              }
            }
          }
        }
      }
    }
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

// Déclaration du schéma VisitorWithSiteCount
const VisitorWithSiteCount = {
  type: "object",
  properties: {
    id: {
      type: "string",
      format: "uuid",
      description: "Identifiant unique du visiteur",
      example: "550e8400-e29b-41d4-a716-446655440000"
    },
    firstName: {
      type: "string",
      description: "Prénom du visiteur",
      example: "BAKO"
    },
    lastName: {
      type: "string",
      description: "Nom du visiteur",
      example: "ROBERT"
    },
    email: {
      type: "string",
      format: "email",
      nullable: true,
      description: "Email du visiteur",
      example: "bako.robert@example.com"
    },
    phone: {
      type: "string",
      nullable: true,
      description: "Téléphone du visiteur",
      example: "+22657443692"
    },
    company: {
      type: "string",
      nullable: true,
      description: "Entreprise du visiteur",
      example: "Société Générale"
    },
    idType: {
      type: "string",
      description: "Type d'identité",
      example: "CNI"
    },
    idNumber: {
      type: "string",
      description: "Numéro d'identité",
      example: "15673612322367890"
    },
    isBlacklisted: {
      type: "boolean",
      description: "Statut de blacklist",
      example: false
    },
    blacklistReason: {
      type: "string",
      nullable: true,
      description: "Raison du blacklist",
      example: null
    },
    createdAt: {
      type: "string",
      format: "date-time",
      description: "Date de création",
      example: "2024-11-24T10:30:00.000Z"
    },
    siteVisitCount: {
      type: "integer",
      description: "Nombre de visites sur ce site",
      example: 3
    }
  }
};

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
  
  // Site
  CreateSiteInput,
  UpdateSiteInput,
  
  // Checkpoint
  CreateCheckpointInput,
  UpdateCheckpointInput,
  
  // Visit
  CreateVisitInput,
  
  // Incident & SOS
  CreateIncidentInput,
  CreateSosInput,
  CreateGeneralSOSInput,
  
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
  VisitorWithSiteCount,
  Service,
  Visit,
  Rendezvous,
  
  // Management & Assignment
  AgentCheckpointAssignment,
  VisitorGroup,
  GroupVisitor,
  
  // Agent Schemas
  Agent: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid", description: "ID unique de l'agent", example: "990e8400-e29b-41d4-a716-446655440001" },
      firstName: { type: "string", description: "Prénom de l'agent", example: "Amadou" },
      lastName: { type: "string", description: "Nom de l'agent", example: "TRAORE" },
      email: { type: "string", format: "email", description: "Email de l'agent", example: "amadou.traore@sonabhy.bf" },
      phone: { type: "string", description: "Téléphone de l'agent", example: "+226 70 11 22 33" },
      role: { type: "string", enum: ["AGENT_CONTROLE"], description: "Rôle de l'agent (toujours AGENT_CONTROLE)", example: "AGENT_CONTROLE" },
      isActive: { type: "boolean", description: "Agent actif", example: true },
      assignedCheckpoints: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            site: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
                city: { type: "string" }
              }
            }
          }
        },
        description: "Checkpoints assignés à l'agent"
      },
      createdAt: { type: "string", format: "date-time", description: "Date de création", example: "2024-01-15T08:00:00.000Z" },
      updatedAt: { type: "string", format: "date-time", description: "Date de mise à jour", example: "2024-11-24T17:20:00.000Z" }
    }
  },
  
  CreateAgentInput: {
    type: "object",
    required: ["firstName", "lastName", "email", "password", "role"],
    properties: {
      firstName: { type: "string", maxLength: 100, description: "Prénom de l'agent", example: "Amadou" },
      lastName: { type: "string", maxLength: 100, description: "Nom de l'agent", example: "TRAORE" },
      email: { type: "string", format: "email", maxLength: 255, description: "Email de l'agent", example: "amadou.traore@sonabhy.bf" },
      password: { type: "string", minLength: 8, description: "Mot de passe de l'agent", example: "MotDePasse123!" },
      phone: { type: "string", maxLength: 20, description: "Téléphone de l'agent", example: "+226 70 11 22 33" },
      role: { type: "string", enum: ["AGENT_CONTROLE"], description: "Rôle de l'agent (automatiquement défini à AGENT_CONTROLE)", example: "AGENT_CONTROLE" },
      isActive: { type: "boolean", description: "Agent actif", example: true }
    },
    example: {
      firstName: "Amadou",
      lastName: "TRAORE",
      email: "amadou.traore@sonabhy.bf",
      password: "MotDePasse123!",
      phone: "+226 70 11 22 33",
      role: "AGENT_CONTROLE",
      isActive: true
    }
  },
  
  UpdateAgentInput: {
    type: "object",
    description: "Données pour mettre à jour un agent (tous les champs sont optionnels)",
    properties: {
      firstName: { type: "string", maxLength: 100, description: "Prénom de l'agent", example: "Amadou" },
      lastName: { type: "string", maxLength: 100, description: "Nom de l'agent", example: "TRAORE" },
      email: { type: "string", format: "email", maxLength: 255, description: "Email de l'agent", example: "amadou.traore@sonabhy.bf" },
      phone: { type: "string", maxLength: 20, description: "Téléphone de l'agent", example: "+226 70 11 22 33" },
      isActive: { type: "boolean", description: "Agent actif", example: false }
    },
    example: {
      firstName: "Amadou",
      phone: "+226 70 11 22 44",
      isActive: false
    }
  },
  
  CreateServiceInput: {
    type: "object",
    required: ["name", "description"],
    properties: {
      name: { type: "string", maxLength: 100, description: "Nom du service", example: "Ressources Humaines" },
      description: { type: "string", maxLength: 500, description: "Description du service", example: "Gestion du personnel et des ressources humaines" },
      manager: { type: "string", maxLength: 255, description: "Responsable du service", example: "Marie OUEDRAOGO" },
      managerEmail: { type: "string", format: "email", maxLength: 255, description: "Email du responsable", example: "marie.ouedraogo@sonabhy.bf" },
      phone: { type: "string", maxLength: 20, description: "Téléphone du service", example: "+226 25 30 40 60" },
      email: { type: "string", format: "email", maxLength: 255, description: "Email du service", example: "rh@sonabhy.bf" },
      location: { type: "string", maxLength: 255, description: "Localisation du service", example: "Bâtiment A, 2ème étage" },
      isActive: { type: "boolean", description: "Service actif", example: true }
    },
    example: {
      name: "Ressources Humaines",
      description: "Gestion du personnel et des ressources humaines",
      manager: "Marie OUEDRAOGO",
      managerEmail: "marie.ouedraogo@sonabhy.bf",
      phone: "+226 25 30 40 60",
      email: "rh@sonabhy.bf",
      location: "Bâtiment A, 2ème étage",
      isActive: true
    }
  },
  
  // Security & Incidents
  BlacklistHistory,
  SosAlert,
  CreateSosInput,
  CreateGeneralSOSInput,
  Incident,
  CreateIncidentInput,
  
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

  // ===== NONDESIRABLE SCHEMAS =====
  CreateNondesirableInput: {
    type: "object",
    required: ["visitorId", "reason"],
    properties: {
      visitorId: {
        type: "string",
        format: "uuid",
        description: "ID du visiteur à ajouter à la liste des indésirables",
        example: "880e8400-e29b-41d4-a716-446655440001"
      },
      reason: {
        type: "string",
        minLength: 1,
        maxLength: 500,
        description: "Raison de l'ajout à la liste des indésirables",
        example: "Comportement inapproprié lors de la dernière visite"
      }
    },
    description: "Cette action va automatiquement activer isBlacklisted=true sur le visiteur, ajouter la raison dans blacklistReason, créer un historique dans BlacklistHistory et une entrée dans NonDesirable."
  },

  CreateUnknownNondesirableInput: {
    type: "object",
    required: ["firstName", "lastName", "idType", "idNumber", "reason"],
    properties: {
      firstName: {
        type: "string",
        minLength: 1,
        maxLength: 100,
        description: "Prénom de la personne",
        example: "Inconnu"
      },
      lastName: {
        type: "string",
        minLength: 1,
        maxLength: 100,
        description: "Nom de la personne",
        example: "SUSPECT"
      },
      idType: {
        type: "string",
        enum: ["CNI", "PASSEPORT", "PERMIS_CONDUITE"],
        description: "Type de pièce d'identité",
        example: "CNI"
      },
      idNumber: {
        type: "string",
        minLength: 1,
        maxLength: 255,
        description: "Numéro de la pièce d'identité",
        example: "X9999999999"
      },
      birthDate: {
        type: "string",
        description: "Date de naissance (format libre)",
        example: "15/06/1980"
      },
      birthPlace: {
        type: "string",
        maxLength: 255,
        description: "Lieu de naissance",
        example: "Ouagadougou"
      },
      sexe: {
        type: "string",
        enum: ["M", "F", "HOMME", "FEMME"],
        description: "Sexe de la personne",
        example: "M"
      },
      givingDate: {
        type: "string",
        description: "Date de délivrance du document (format libre)",
        example: "01/01/2020"
      },
      expirationDate: {
        type: "string",
        description: "Date d'expiration du document (format libre)",
        example: "01/01/2030"
      },
      phone: {
        type: "string",
        maxLength: 20,
        description: "Numéro de téléphone",
        example: "+226 70 11 22 33"
      },
      email: {
        type: "string",
        format: "email",
        description: "Adresse email",
        example: "inconnu@example.com"
      },
      company: {
        type: "string",
        maxLength: 255,
        description: "Entreprise",
        example: "Entreprise Suspecte SARL"
      },
      nationality: {
        type: "string",
        maxLength: 100,
        description: "Nationalité",
        example: "Burkinabé"
      },
      idScanUrl: {
        type: "string",
        format: "uri",
        description: "URL du scan de la pièce d'identité",
        example: "https://example.com/scans/suspect123.jpg"
      },
      photoUrl: {
        type: "string",
        format: "uri",
        description: "URL de la photo de la personne",
        example: "https://example.com/photos/suspect123.jpg"
      },
      reason: {
        type: "string",
        minLength: 1,
        maxLength: 500,
        description: "Raison de l'ajout à la liste des indésirables",
        example: "Signalement des autorités - comportement suspect"
      },
      incidentDate: {
        type: "string",
        format: "date",
        description: "Date de l'incident",
        example: "2024-11-20"
      },
      incidentLocation: {
        type: "string",
        maxLength: 255,
        description: "Lieu de l'incident",
        example: "Entrée principale"
      },
      severityLevel: {
        type: "integer",
        minimum: 1,
        maximum: 4,
        description: "Niveau de gravité (1=Faible, 2=Moyen, 3=Élevé, 4=Critique)",
        example: 3
      }
    },
    description: "Créer un indésirable sans visiteur existant. Seuls les administrateurs peuvent utiliser cette fonctionnalité."
  },

  UnknownNondesirable: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Identifiant unique de l'entrée",
        example: "550e8400-e29b-41d4-a716-446655440001"
      },
      firstName: {
        type: "string",
        example: "Inconnu"
      },
      lastName: {
        type: "string",
        example: "SUSPECT"
      },
      idType: {
        type: "string",
        example: "CNI"
      },
      idNumber: {
        type: "string",
        example: "X9999999999"
      },
      phone: {
        type: "string",
        example: "+226 XX XX XX XX"
      },
      email: {
        type: "string",
        format: "email",
        example: "inconnu@example.com"
      },
      nationality: {
        type: "string",
        example: "Burkinabé"
      },
      birthDate: {
        type: "string",
        example: "15/06/1980"
      },
      birthPlace: {
        type: "string",
        example: "Ouagadougou"
      },
      sexe: {
        type: "string",
        example: "M"
      },
      givingDate: {
        type: "string",
        example: "01/01/2020"
      },
      expirationDate: {
        type: "string",
        example: "01/01/2030"
      },
      company: {
        type: "string",
        example: "Entreprise Suspecte SARL"
      },
      idScanUrl: {
        type: "string",
        format: "uri",
        example: "https://example.com/scans/suspect123.jpg"
      },
      photoUrl: {
        type: "string",
        format: "uri",
        example: "https://example.com/photos/suspect123.jpg"
      },
      isBlacklisted: {
        type: "boolean",
        description: "Toujours true pour un indésirable",
        example: true
      },
      blacklistReason: {
        type: "string",
        description: "Raison de la blacklist (même que reason)",
        example: "Signalement des autorités - comportement suspect"
      },
      reason: {
        type: "string",
        example: "Signalement des autorités - comportement suspect"
      },
      severityLevel: {
        type: "integer",
        example: 3
      },
      incidentDate: {
        type: "string",
        format: "date",
        example: "2024-11-20"
      },
      incidentLocation: {
        type: "string",
        example: "Entrée principale"
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Date de création",
        example: "2024-11-24T10:30:00.000Z"
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Date de mise à jour",
        example: "2024-11-24T10:30:00.000Z"
      },
      reporter: {
        type: "object",
        description: "Administrateur qui a ajouté l'indésirable",
        properties: {
          id: {
            type: "string",
            format: "uuid"
          },
          firstName: {
            type: "string"
          },
          lastName: {
            type: "string"
          },
          email: {
            type: "string",
            format: "email"
          }
        }
      }
    }
  },
  
  Nondesirable: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Identifiant unique de l'entrée indésirable",
        example: "550e8400-e29b-41d4-a716-446655440001"
      },
      visitorId: {
        type: "string",
        format: "uuid",
        description: "ID du visiteur indésirable",
        example: "550e8400-e29b-41d4-a716-446655440000"
      },
      reason: {
        type: "string",
        description: "Raison de l'ajout à la liste noire",
        example: "Comportement inapproprié lors de la dernière visite"
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Date de création de l'entrée",
        example: "2024-11-24T10:30:00.000Z"
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Date de dernière mise à jour",
        example: "2024-11-24T10:30:00.000Z"
      },
      visitor: {
        type: "object",
        description: "Informations du visiteur indésirable",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "880e8400-e29b-41d4-a716-446655440001"
          },
          firstName: {
            type: "string",
            example: "Marie"
          },
          lastName: {
            type: "string",
            example: "KABORE"
          },
          phone: {
            type: "string",
            example: "+226 70 11 22 33"
          },
          email: {
            type: "string",
            format: "email",
            example: "marie.kabore@email.com"
          },
          company: {
            type: "string",
            example: "Entreprise KABORE & Fils"
          },
          idType: {
            type: "string",
            example: "CNI"
          },
          idNumber: {
            type: "string",
            example: "B1234567890"
          },
          isBlacklisted: {
            type: "boolean",
            description: "Statut blacklist du visiteur (automatiquement mis à true)",
            example: true
          },
          blacklistReason: {
            type: "string",
            description: "Raison de la blacklist (automatiquement ajoutée)",
            example: "Comportement inapproprié lors de la dernière visite"
          }
        }
      },
      reporter: {
        type: "object",
        description: "Informations de l'utilisateur qui a ajouté l'indésirable",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "6985b877-c56b-11f0-aa39-0242ac140013"
          },
          firstName: {
            type: "string",
            example: "Admin"
          },
          lastName: {
            type: "string",
            example: "System"
          },
          email: {
            type: "string",
            format: "email",
            example: "admin@sonabhy.bf"
          }
        }
      }
    }
  },

  // ===== VISITOR SCHEMAS =====
  Visitor: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "Identifiant unique du visiteur",
        example: "550e8400-e29b-41d4-a716-446655440000"
      },
      firstName: {
        type: "string",
        description: "Prénom du visiteur",
        example: "BAKO"
      },
      lastName: {
        type: "string",
        description: "Nom du visiteur",
        example: "ROBERT"
      },
      birthDate: {
        type: "string",
        description: "Date de naissance",
        example: "15/06/1985"
      },
      birthPlace: {
        type: "string",
        description: "Lieu de naissance",
        example: "Ouagadougou"
      },
      residence: {
        type: "string",
        description: "Résidence du visiteur",
        example: "Koulouba"
      },
      sexe: {
        type: "string",
        enum: ["M", "F", "HOMME", "FEMME"],
        description: "Sexe du visiteur",
        example: "M"
      },
      givingDate: {
        type: "string",
        description: "Date de délivrance du document",
        example: "15/01/2020"
      },
      expirationDate: {
        type: "string",
        description: "Date d'expiration du document",
        example: "15/01/2030"
      },
      phone: {
        type: "string",
        description: "Numéro de téléphone",
        example: "+22657443692"
      },
      email: {
        type: "string",
        format: "email",
        description: "Adresse email",
        example: null
      },
      idType: {
        type: "string",
        description: "Type de document d'identité",
        example: "CNI"
      },
      idNumber: {
        type: "string",
        description: "Numéro du document d'identité",
        example: "15673612322367890"
      },
      idScanUrl: {
        type: "string",
        format: "uri",
        description: "URL du scan du document",
        example: null
      },
      photoUrl: {
        type: "string",
        format: "uri",
        description: "URL de la photo du visiteur",
        example: null
      },
      isBlacklisted: {
        type: "boolean",
        description: "Indique si le visiteur est blacklisté",
        example: false
      },
      blacklistReason: {
        type: "string",
        description: "Raison de la blacklist (si applicable)",
        example: null
      },
      company: {
        type: "string",
        description: "Entreprise du visiteur",
        example: null
      },
      emergencyContactPhone: {
        type: "string",
        description: "Téléphone du contact d'urgence",
        example: "+22676102577"
      },
      emergencyContactName: {
        type: "string",
        description: "Nom du contact d'urgence",
        example: "Jean KABORE"
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Date de création",
        example: "2024-11-24T10:30:00.000Z"
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Date de dernière mise à jour",
        example: "2024-11-24T10:30:00.000Z"
      },
      checkpointId: {
        type: "string",
        format: "uuid",
        nullable: true,
        description: "ID du checkpoint par défaut du visiteur",
        example: "550e8400-e29b-41d4-a716-446655440000"
      },
      checkpoint: {
        type: "object",
        nullable: true,
        description: "Informations du checkpoint par défaut",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            description: "ID du checkpoint",
            example: "550e8400-e29b-41d4-a716-446655440000"
          },
          name: {
            type: "string",
            description: "Nom du checkpoint",
            example: "Portail Principal"
          },
          site: {
            type: "object",
            description: "Informations du site",
            properties: {
              id: {
                type: "string",
                format: "uuid",
                description: "ID du site",
                example: "0734a724-cb77-11f0-aa39-0242ac140013"
              },
              name: {
                type: "string",
                description: "Nom du site",
                example: "Siège Social"
              }
            }
          }
        }
      }
    }
  },

  CreateVisitorInput: {
    type: "object",
    required: ["firstName", "lastName", "idType", "idNumber"],
    properties: {
      firstName: {
        type: "string",
        minLength: 1,
        maxLength: 100,
        description: "Prénom du visiteur (requis)",
        example: "Jean"
      },
      lastName: {
        type: "string",
        minLength: 1,
        maxLength: 100,
        description: "Nom du visiteur (requis)",
        example: "Dupont"
      },
      birthDate: {
        type: "string",
        nullable: true,
        description: "Date de naissance (optionnel, null accepté)",
        example: "15/06/1985"
      },
      birthPlace: {
        type: "string",
        maxLength: 255,
        nullable: true,
        description: "Lieu de naissance (optionnel, null accepté)",
        example: "Ouagadougou"
      },
      residence: {
        type: "string",
        maxLength: 255,
        nullable: true,
        description: "Résidence du visiteur (optionnel, null accepté)",
        example: "Koulouba"
      },
      sexe: {
        type: "string",
        enum: ["M", "F", "HOMME", "FEMME"],
        nullable: true,
        description: "Sexe du visiteur (optionnel, null accepté)",
        example: "M"
      },
      givingDate: {
        type: "string",
        nullable: true,
        description: "Date de délivrance du document (optionnel, null accepté)",
        example: "15/01/2020"
      },
      expirationDate: {
        type: "string",
        nullable: true,
        description: "Date d'expiration du document (optionnel, null accepté)",
        example: "15/01/2030"
      },
      phone: {
        type: "string",
        maxLength: 20,
        nullable: true,
        description: "Numéro de téléphone (optionnel, null accepté)",
        example: "+22657443692"
      },
      email: {
        type: "string",
        format: "email",
        nullable: true,
        description: "Adresse email (optionnel, null accepté)",
        example: null
      },
      idType: {
        type: "string",
        enum: ["CNI", "PASSEPORT", "PERMIS_CONDUITE"],
        description: "Type d'identité (requis)",
        example: "CNI"
      },
      idNumber: {
        type: "string",
        minLength: 1,
        maxLength: 255,
        description: "Numéro d'identité (requis)",
        example: "15673612322367890"
      },
      idScanUrl: {
        type: "string",
        format: "uri",
        nullable: true,
        description: "URL du scan de l'identité (optionnel, null accepté)",
        example: null
      },
      photoUrl: {
        type: "string",
        format: "uri",
        nullable: true,
        description: "URL de la photo (optionnel, null accepté)",
        example: null
      },
      isBlacklisted: {
        type: "boolean",
        description: "Statut de blacklistage (optionnel)",
        example: false
      },
      blacklistReason: {
        type: "string",
        nullable: true,
        description: "Raison du blacklistage (optionnel, null accepté)",
        example: null
      },
      company: {
        type: "string",
        maxLength: 255,
        nullable: true,
        description: "Entreprise du visiteur (optionnel, null accepté)",
        example: null
      },
      emergencyContactPhone: {
        type: "string",
        maxLength: 20,
        nullable: true,
        description: "Téléphone du contact d'urgence (optionnel, null accepté)",
        example: "+22676102577"
      },
      emergencyContactName: {
        type: "string",
        maxLength: 255,
        nullable: true,
        description: "Nom du contact d'urgence (optionnel, null accepté)",
        example: "Jean KABORE"
      }
    },
    example: {
      firstName: "BAKO",
      lastName: "ROBERT",
      birthDate: "15/06/1985",
      birthPlace: "Ouagadougou",
      residence: "Koulouba",
      sexe: "M",
      givingDate: "15/01/2020",
      expirationDate: "15/01/2030",
      phone: "+22657443692",
      email: null,
      idType: "CNI",
      idNumber: "15673612322367890",
      idScanUrl: null,
      photoUrl: null,
      isBlacklisted: false,
      blacklistReason: null,
      company: null,
      emergencyContactPhone: "+22676102577",
      emergencyContactName: "Jean KABORE"
    }
  },

  // ===== SCHÉMAS D'ASSIGNATION AGENTS =====
  AssignAgentRequest,
  AssignAgentResponse,

  // ===== SCHÉMAS APPOINTMENT (RENDEZ-VOUS) =====
  CreateAppointmentInput: {
    type: "object",
    required: ["organizerId", "siteId", "firstName", "lastName", "office", "serviceName", "reason", "visitDate"],
    properties: {
      organizerId: {
        type: "string",
        format: "uuid",
        description: "ID de l'organisateur",
        example: "0734a724-cb77-11f0-aa39-0242ac140013"
      },
      siteId: {
        type: "string", 
        format: "uuid",
        description: "ID du site",
        example: "14ce1162-ca00-11f0-aa39-0242ac140013"
      },
      firstName: {
        type: "string",
        description: "Prénom de la personne",
        example: "Jean"
      },
      lastName: {
        type: "string",
        description: "Nom de la personne",
        example: "Dupont"
      },
      office: {
        type: "string",
        description: "Bureau de la personne",
        example: "Bureau 101"
      },
      serviceName: {
        type: "string",
        description: "Nom du service",
        example: "Service Client"
      },
      reason: {
        type: "string",
        description: "Raison du rendez-vous",
        example: "Rendez-vous d'affaires"
      },
      visitDate: {
        type: "string",
        description: "Date de visite",
        example: "2024-01-15"
      },
      startTime: {
        type: "string",
        description: "Heure de début",
        example: "09:00:00"
      },
      endTime: {
        type: "string",
        description: "Heure de fin",
        example: "10:00:00"
      },
      status: {
        type: "string",
        description: "Statut du rendez-vous",
        example: "PENDING"
      },
      notes: {
        type: "string",
        description: "Notes additionnelles",
        example: "Notes importantes"
      }
    }
  },

  UpdateAppointmentInput: {
    type: "object",
    properties: {
      organizerId: {
        type: "string",
        format: "uuid",
        description: "ID de l'organisateur",
        example: "0734a724-cb77-11f0-aa39-0242ac140013"
      },
      siteId: {
        type: "string", 
        format: "uuid",
        description: "ID du site",
        example: "14ce1162-ca00-11f0-aa39-0242ac140013"
      },
      firstName: {
        type: "string",
        description: "Prénom de la personne",
        example: "Jean"
      },
      lastName: {
        type: "string",
        description: "Nom de la personne",
        example: "Dupont"
      },
      office: {
        type: "string",
        description: "Bureau de la personne",
        example: "Bureau 101"
      },
      serviceName: {
        type: "string",
        description: "Nom du service",
        example: "Service Client"
      },
      reason: {
        type: "string",
        description: "Raison du rendez-vous",
        example: "Rendez-vous d'affaires"
      },
      visitDate: {
        type: "string",
        description: "Date de visite",
        example: "2024-01-15"
      },
      startTime: {
        type: "string",
        description: "Heure de début",
        example: "09:00:00"
      },
      endTime: {
        type: "string",
        description: "Heure de fin",
        example: "10:00:00"
      },
      status: {
        type: "string",
        description: "Statut du rendez-vous",
        example: "PENDING"
      },
      notes: {
        type: "string",
        description: "Notes additionnelles",
        example: "Notes importantes"
      }
    }
  },

  Appointment: {
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        description: "ID unique du rendez-vous",
        example: "550e8400-e29b-41d4-a716-446655440003"
      },
      organizerId: {
        type: "string",
        format: "uuid",
        description: "ID de l'organisateur",
        example: "0734a724-cb77-11f0-aa39-0242ac140013"
      },
      siteId: {
        type: "string",
        format: "uuid", 
        description: "ID du site",
        example: "14ce1162-ca00-11f0-aa39-0242ac140013"
      },
      firstName: {
        type: "string",
        description: "Prénom de la personne",
        example: "Jean"
      },
      lastName: {
        type: "string",
        description: "Nom de la personne",
        example: "Dupont"
      },
      office: {
        type: "string",
        description: "Bureau de la personne",
        example: "Bureau 101"
      },
      serviceName: {
        type: "string",
        description: "Nom du service",
        example: "Service Client"
      },
      reason: {
        type: "string",
        description: "Raison du rendez-vous",
        example: "Rendez-vous d'affaires"
      },
      visitDate: {
        type: "string",
        description: "Date de visite",
        example: "2024-01-15"
      },
      startTime: {
        type: "string",
        description: "Heure de début",
        example: "09:00:00"
      },
      endTime: {
        type: "string",
        description: "Heure de fin",
        example: "10:00:00"
      },
      status: {
        type: "string",
        description: "Statut du rendez-vous",
        example: "PENDING"
      },
      notes: {
        type: "string",
        description: "Notes additionnelles",
        example: "Notes importantes"
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Date de création",
        example: "2024-01-15T08:00:00Z"
      },
      updatedAt: {
        type: "string",
        format: "date-time", 
        description: "Date de mise à jour",
        example: "2024-01-15T08:00:00Z"
      },
      organizer: {
        type: "object",
        description: "Informations de l'organisateur",
        properties: {
          id: { type: "string", format: "uuid" },
          firstName: { type: "string", example: "Admin" },
          lastName: { type: "string", example: "User" },
          email: { type: "string", example: "admin@example.com" },
          role: { type: "string", example: "ADMIN" }
        }
      },
      site: {
        type: "object", 
        description: "Informations du site",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Siège Social" },
          address: { type: "string", example: "123 Rue Principale" },
          city: { type: "string", example: "Abidjan" },
          country: { type: "string", example: "Côte d'Ivoire" }
        }
      }
    }
  },

  // ===== SCHÉMAS POUR LES OPTIONS DE FILTRE AUTOMATIQUES =====
  FilterOptionSchema,
  SiteFilterOptionSchema,
  AgentFilterOptionSchema,
  SiteFilterOptionsSchema,
  CheckpointFilterOptionsSchema,
  VisitFilterOptionsSchema,
  VisitorFilterOptionsSchema,

  // ===== TYPES DE RÉPONSE API =====
  ApiResponse,
  ApiError,
  ErrorResponse,
  PaginatedResponse
};
