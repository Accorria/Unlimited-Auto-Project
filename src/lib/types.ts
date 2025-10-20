// TypeScript types for Accorria × Unlimited Auto RBAC System

export type UserRole = 'super_admin' | 'dealer_admin' | 'sales_manager' | 'sales_rep';
export type LeadStatus = 'new' | 'set' | 'show' | 'close';
export type AngleCode = 'FDS' | 'FPS' | 'SDS' | 'SPS' | 'SRDS' | 'SRPS' | 'RDS' | 'R' | 'F' | 'INT' | 'INTB' | 'ENG' | 'TRK' | 'ODOM' | 'VIN';

// Database types
export interface Dealer {
  id: string;
  slug: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: Record<string, string>;
  social_media?: Record<string, string>;
  seo_settings?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  auth_user_id?: string;
  dealer_id: string;
  role: UserRole;
  email: string;
  name: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  dealer?: Dealer;
}

export interface Vehicle {
  id: string;
  dealer_id: string;
  vin?: string;
  year: number;
  make?: string;
  model?: string;
  model_code?: string;
  trim?: string;
  miles?: number;
  price?: number;
  cost?: number;
  title_status?: string;
  description?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  photos?: VehiclePhoto[];
  assigned_user?: User;
}

export interface VehiclePhoto {
  id: string;
  vehicle_id: string;
  angle: AngleCode;
  file_path: string;
  public_url: string;
  width?: number;
  height?: number;
  created_at: string;
}

export interface Lead {
  id: string;
  dealer_id: string;
  vehicle_id?: string;
  assigned_to?: string;
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  income?: string;
  net_monthly_income?: number;
  employer?: string;
  months_on_job?: number;
  dl_state?: string;
  down_payment?: number;
  source?: string;
  agent?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  gclid?: string;
  status: LeadStatus;
  notes?: string;
  consent: boolean;
  created_at: string;
  updated_at: string;
  status_updated_at: string;
  vehicle?: Vehicle;
  assigned_user?: User;
  status_history?: LeadStatusHistory[];
}

export interface LeadStatusHistory {
  id: string;
  lead_id: string;
  from_status?: LeadStatus;
  to_status: LeadStatus;
  changed_by?: string;
  notes?: string;
  created_at: string;
  changed_by_user?: User;
}

// Auth context types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  dealer_id: string;
  dealer_slug: string;
  dealer_name: string;
  is_active: boolean;
}

// Permission types
export interface Permission {
  action: string;
  resource: string;
  allowed: boolean;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  roles?: UserRole[];
  children?: NavItem[];
}

// Analytics types
export interface LeadAnalytics {
  total_leads: number;
  set_rate: number;
  show_rate: number;
  close_rate: number;
  leads_by_source: Record<string, number>;
  leads_by_agent: Record<string, number>;
  leads_by_status: Record<LeadStatus, number>;
  recent_leads: Lead[];
}

// Form types
export interface LeadFormData {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  vehicle_id?: string;
  source?: string;
  agent?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  gclid?: string;
  consent: boolean;
}

export interface UserFormData {
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
}

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// UTM tracking types
export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  gclid?: string;
  agent?: string;
}

// Model code mappings
export const MODEL_CODES: Record<string, string> = {
  'TB': 'Trailblazer',
  'CV': 'Civic',
  'CM': 'Camry',
  'NA': 'Altima',
  'AC': 'Accord',
  'CR': 'CR-V',
  'RA': 'RAV4',
  'PR': 'Prius',
  'CA': 'Camaro',
  'CO': 'Corvette',
  'SI': 'Silverado',
  'EQ': 'Equinox',
  'MA': 'Malibu',
  'IM': 'Impala',
  'SU': 'Suburban',
  'TA': 'Tahoe',
  'YU': 'Yukon',
  'ES': 'Escalade',
  'XT': 'XT5',
  'CT': 'CT6'
};

// Angle code display order and labels
export const ANGLE_ORDER: AngleCode[] = [
  'FDS', 'FPS', 'SDS', 'SPS', 'SRDS', 'SRPS', 'RDS', 'R', 'F', 
  'INT', 'INTB', 'ENG', 'TRK', 'ODOM', 'VIN'
];

export const ANGLE_LABELS: Record<AngleCode, string> = {
  'FDS': 'Front Driver Side',
  'FPS': 'Front Passenger Side',
  'SDS': 'Side Driver Side',
  'SPS': 'Side Passenger Side',
  'SRDS': 'Side Rear Driver Side',
  'SRPS': 'Side Rear Passenger Side',
  'RDS': 'Rear Driver Side',
  'R': 'Rear',
  'F': 'Front',
  'INT': 'Interior',
  'INTB': 'Interior Back',
  'ENG': 'Engine',
  'TRK': 'Trunk',
  'ODOM': 'Odometer',
  'VIN': 'VIN'
};
