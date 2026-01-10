// API Types for Tola Tiles

// Gallery Types
export interface Category {
  id: number;
  name: string;
  label: string;
  description: string;
  image_count: number;
  created_at: string;
}

export interface CategoryWithImages extends Category {
  images: GalleryImage[];
}

export interface GalleryImage {
  id: number;
  category: number;
  category_name: string;
  category_label: string;
  title: string;
  description: string;
  image: string;
  image_url: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryImageCreate {
  category: number;
  title: string;
  description: string;
  image: File;
  order?: number;
  is_active?: boolean;
}

// Contact Lead Types
export interface ContactLead {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  project_type: string;
  message: string;
  status: LeadStatus;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';

export interface ContactFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  project_type: string;
  message: string;
}

export interface LeadStats {
  total: number;
  by_status: Record<LeadStatus, number>;
}

// Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff?: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  error?: string;
  detail?: string;
  message?: string;
  [key: string]: string | string[] | undefined;
}

// Category name mapping (frontend to backend)
export const categoryNameMap: Record<string, string> = {
  backsplashes: 'backsplash',
  patios: 'patio',
  showers: 'shower',
  flooring: 'flooring',
  fireplaces: 'fireplace',
};

// Service to category mapping
export const serviceToCategoryMap: Record<string, string> = {
  'kitchen-backsplash': 'backsplash',
  bathroom: 'shower',
  flooring: 'flooring',
  patio: 'patio',
  fireplace: 'fireplace',
  shower: 'shower',
};
