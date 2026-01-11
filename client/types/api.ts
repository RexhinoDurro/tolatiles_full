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

// ==================== QUOTE & INVOICE TYPES ====================

// Company Settings
export interface CompanySettings {
  id: number;
  sender_name: string;
  title: string;
  email: string;
  phone: string;
  company_name: string;
  company_address: string;
  company_logo: string | null;
}

// Customer Types
export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  quote_count: number;
  invoice_count: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerCreate {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

// Line Item Types
export interface LineItem {
  id?: number;
  name: string;
  description: string;
  is_service: boolean;
  quantity: number;
  unit_price: number;
  detail_lines: string[];
  order: number;
  line_total?: number;
}

export interface LineItemCreate {
  name: string;
  description?: string;
  is_service?: boolean;
  quantity?: number;
  unit_price: number;
  detail_lines?: string[];
  order?: number;
}

// Quote Types
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'expired';

export interface Quote {
  id: number;
  reference: string;
  title: string;
  customer: Customer;
  created_at: string;
  updated_at: string;
  expires_at: string;
  timeline: string;
  status: QuoteStatus;
  currency: 'USD' | 'EUR';
  comments_text: string;
  terms: string[];
  subtotal: number;
  discount_amount: number;
  discount_percent: number;
  tax_rate: number;
  tax_amount: number;
  shipping_amount: number;
  total: number;
  line_items: LineItem[];
  pdf_file: string | null;
  pdf_url: string | null;
  pdf_generated_at: string | null;
  public_url: string;
}

export interface QuoteListItem {
  id: number;
  reference: string;
  title: string;
  customer: number;
  customer_name: string;
  customer_phone: string;
  status: QuoteStatus;
  total: number;
  currency: string;
  created_at: string;
  expires_at: string;
  timeline: string;
  line_item_count: number;
}

export interface QuoteCreate {
  title: string;
  customer_id: number;
  expires_at: string;
  timeline?: string;
  currency?: 'USD' | 'EUR';
  comments_text?: string;
  terms?: string[];
  discount_amount?: number;
  discount_percent?: number;
  tax_rate?: number;
  shipping_amount?: number;
  line_items: LineItemCreate[];
}

export interface QuoteStats {
  total: number;
  by_status: Record<QuoteStatus, number>;
  total_value: number;
  accepted_value: number;
}

// Invoice Types
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface InvoiceLineItem {
  id?: number;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  order: number;
  line_total?: number;
}

export interface Invoice {
  id: number;
  reference: string;
  title: string;
  customer: Customer;
  quote: number | null;
  created_at: string;
  updated_at: string;
  due_date: string;
  paid_at: string | null;
  status: InvoiceStatus;
  currency: string;
  notes: string;
  payment_terms: string;
  subtotal: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  shipping_amount: number;
  total: number;
  amount_paid: number;
  balance_due: number;
  line_items: InvoiceLineItem[];
  pdf_file: string | null;
  pdf_url: string | null;
  pdf_generated_at: string | null;
  public_url: string;
}

export interface InvoiceListItem {
  id: number;
  reference: string;
  title: string;
  customer: number;
  customer_name: string;
  status: InvoiceStatus;
  total: number;
  balance_due: number;
  due_date: string;
  created_at: string;
}

export interface InvoiceCreate {
  title: string;
  customer_id: number;
  due_date: string;
  currency?: 'USD' | 'EUR';
  notes?: string;
  payment_terms?: string;
  discount_amount?: number;
  tax_rate?: number;
  shipping_amount?: number;
  line_items: Omit<InvoiceLineItem, 'id' | 'line_total'>[];
}

export interface InvoiceStats {
  total: number;
  by_status: Record<InvoiceStatus, number>;
  total_value: number;
  paid_value: number;
  outstanding: number;
}

// Public quote/invoice view (for customers)
export interface PublicQuote {
  reference: string;
  title: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  created_at: string;
  expires_at: string;
  timeline: string;
  status: QuoteStatus;
  currency: string;
  comments_text: string;
  terms: string[];
  subtotal: number;
  discount_amount: number;
  discount_percent: number;
  tax_rate: number;
  tax_amount: number;
  shipping_amount: number;
  total: number;
  line_items: LineItem[];
  company: CompanySettings;
  pdf_url: string | null;
}

export interface PublicInvoice {
  reference: string;
  title: string;
  customer_name: string;
  customer: Customer;
  created_at: string;
  due_date: string;
  status: InvoiceStatus;
  currency: string;
  notes: string;
  payment_terms: string;
  subtotal: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  shipping_amount: number;
  total: number;
  amount_paid: number;
  balance_due: number;
  line_items: InvoiceLineItem[];
  company: CompanySettings;
  pdf_file: string | null;
}
