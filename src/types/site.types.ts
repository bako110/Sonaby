// =====================================================================================
// TYPES TYPESCRIPT POUR LE MODÈLE SITE
// =====================================================================================
// Version: 2.0
// Date: 2024-11-24
// Description: Types TypeScript correspondant exactement à l'interface Site fournie
// =====================================================================================

export type ActivityType = 
  | 'OFFICE' 
  | 'PRODUCTION' 
  | 'WAREHOUSE' 
  | 'RETAIL' 
  | 'RESEARCH' 
  | 'DATACENTER' 
  | 'LOGISTICS' 
  | 'MANUFACTURING' 
  | 'HEADQUARTERS' 
  | 'OTHER';

export type SiteStatus = 
  | 'ACTIVE' 
  | 'INACTIVE' 
  | 'UNDER_CONSTRUCTION' 
  | 'MAINTENANCE' 
  | 'CLOSED' 
  | 'PLANNED' 
  | 'SUSPENDED';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Site {
  id?: string; // Changed from number to string to match UUID
  name: string;
  code?: string; // Unique site code (e.g., PAR001, LYO002)
  address: string;
  city: string;
  postalCode: string;
  country: string;
  region?: string; // Administrative region
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  manager?: string;
  managerEmail?: string;
  managerPhone?: string;
  activityType: ActivityType;
  status: SiteStatus;
  area?: number; // in square meters
  usableArea?: number; // Actual usable area
  employeeCount?: number;
  maxEmployeeCapacity?: number;
  buildingCount?: number;
  creationDate: Date;
  modificationDate?: Date;
  openingDate?: Date;
  closingDate?: Date;
  coordinates?: Coordinates;
  description?: string;
  comments?: string;
  // Financial information
  monthlyCost?: number;
  annualBudget?: number;
  // Certifications and compliance
  certifications?: string[]; // ISO, HACCP, etc.
  lastInspection?: Date;
  nextInspection?: Date;
  // Equipment and services
  equipment?: string[];
  services?: string[];
  // Accessibility
  wheelchairAccessible?: boolean;
  parkingAvailable?: boolean;
  parkingSpaces?: number;
  // Security
  securitySystem?: boolean;
  securityGuard?: boolean;
  // Environment
  environmentalCertification?: string;
  energyConsumption?: number; // kWh/month
  // Metadata
  createdBy?: string;
  modifiedBy?: string;
  version?: number;
}

// DTO Types for API operations
export interface CreateSiteDto extends Omit<Site, 'id' | 'creationDate' | 'modificationDate'> {
  creationDate?: Date;
}

export interface UpdateSiteDto extends Partial<Omit<Site, 'id' | 'creationDate'>> {}

export interface SiteQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  status?: SiteStatus;
  activityType?: ActivityType;
  country?: string;
  region?: string;
  manager?: string;
  wheelchairAccessible?: boolean;
  parkingAvailable?: boolean;
  securitySystem?: boolean;
  minEmployeeCount?: number;
  maxEmployeeCount?: number;
}

// Response types
export interface SiteResponse {
  success: boolean;
  data: Site;
  message?: string;
}

export interface SitesResponse {
  success: boolean;
  data: {
    items: Site[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}
