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
  contact_result_reason: ContactResultReason | '';
  address: string;
  notes: string;
  lead_source: string;
  landing_page: number | null;
  landing_page_name: string | null;
  created_at: string;
  updated_at: string;
}

export type LeadStatus = 'new' | 'contacted' | 'failed_contact' | 'qualified' | 'failed_qualified' | 'converted' | 'closed';
export type ContactResultReason = 'no_answer' | 'phone_off' | 'wrong_number' | 'not_interested' | 'other';

export interface ContactFormData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  project_type: string;
  message?: string;
  honeypot?: string;
  form_fill_time?: number;
  cf_turnstile_response?: string;
  landing_page_id?: number;
  event_id?: string;
}

export interface LeadStats {
  total: number;
  by_status: Record<LeadStatus, number>;
  by_landing_page: Record<string, number>;
}

// Landing Page Types (admin-managed marketing pages on their own subdomain)
export type LandingPageStatus = 'draft' | 'published';
export type LandingPageSectionType = 'hero' | 'headline' | 'cta' | 'lead_form' | 'reviews' | 'gallery' | 'custom_code';

export interface LandingPageSection {
  id: number;
  landing_page: number;
  section_type: LandingPageSectionType;
  order: number;
  is_enabled: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface LandingPageListItem {
  id: number;
  name: string;
  subdomain: string;
  status: LandingPageStatus;
  updated_at: string;
  created_at: string;
  lead_count: number;
}

export interface LandingPage {
  id: number;
  name: string;
  subdomain: string;
  status: LandingPageStatus;
  published_at: string | null;
  page_title: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  is_indexed: boolean;
  og_image: string | null;
  meta_pixel_id: string;
  gtm_container_id: string;
  ga_measurement_id: string;
  custom_head_scripts: string;
  custom_body_scripts: string;
  phone_number: string;
  effective_meta_title: string;
  effective_meta_description: string;
  sections: LandingPageSection[];
  created_at: string;
  updated_at: string;
}

export type LandingPageCreate = Partial<Omit<LandingPage, 'id' | 'sections' | 'created_at' | 'updated_at' | 'published_at' | 'effective_meta_title' | 'effective_meta_description'>> & {
  name: string;
  subdomain: string;
  page_title: string;
};

export interface LandingPagePublic extends Omit<LandingPage, 'meta_title' | 'meta_description' | 'sections' | 'published_at' | 'status'> {
  sections: (LandingPageSection & { config: Record<string, any> & { images?: GalleryImage[] } })[];
}

export interface SubdomainCheckResponse {
  available: boolean;
  reason: string | null;
}

// Website Lead Admin Create (for manually adding leads)
export interface WebsiteLeadCreate {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  project_type: string;
  message?: string;
  status?: LeadStatus;
  notes?: string;
}

// Local Ads Lead Types (Google LSA)
export type LocalAdsLeadStatus = 'new' | 'contacted' | 'closed';
export type LocalAdsLeadType = 'phone' | 'message';
export type LocalAdsChargeStatus = 'charged' | 'not_charged';

export interface LocalAdsLead {
  id: number;
  customer_phone: string;
  customer_name?: string;
  job_type: string;
  location: string;
  lead_type: LocalAdsLeadType;
  charge_status: LocalAdsChargeStatus;
  lead_received: string;
  last_activity: string;
  status: LocalAdsLeadStatus;
  message?: string;
  call_duration?: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface LocalAdsLeadsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: LocalAdsLead[];
}

export interface LocalAdsLeadsFilters {
  page?: number;
  page_size?: number;
  status?: LocalAdsLeadStatus | '';
  charge_status?: LocalAdsChargeStatus | '';
  date_from?: string;
  date_to?: string;
}

// Local Ads Lead Create (for manually adding leads)
export interface LocalAdsLeadCreate {
  customer_phone: string;
  customer_name?: string;
  job_type: string;
  location?: string;
  lead_type: LocalAdsLeadType;
  charge_status?: LocalAdsChargeStatus;
  lead_received?: string;
  message?: string;
  call_duration?: number;
  status?: LocalAdsLeadStatus;
  notes?: string;
}

// Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff?: boolean;
  is_quotes_manager?: boolean;
}

export interface PortalUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_quotes_manager: true;
  is_active?: boolean;
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
  is_archived: boolean;
  archived_at: string | null;
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

export type DiscountType = 'percent' | 'fixed';

// Quote Types
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'expired';

export interface PdfVersionEntry {
  version: number;
  file: string;
  generated_at: string | null;
}

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
  discount_type: DiscountType;
  discount_amount: number;
  discount_percent: number;
  tax_rate: number;
  tax_amount: number;
  shipping_amount: number;
  total: number;
  payment_terms: string;
  line_items: LineItem[];
  pdf_file: string | null;
  pdf_url: string | null;
  pdf_generated_at: string | null;
  pdf_version: number;
  pdf_versions: PdfVersionEntry[];
  public_url: string;
  invoice_id: number | null;
  portal_contact_name: string;
}

export interface QuoteListItem {
  id: number;
  reference: string;
  title: string;
  customer: number;
  customer_name: string;
  customer_phone: string;
  deal: number | null;
  status: QuoteStatus;
  total: number;
  currency: string;
  created_at: string;
  expires_at: string;
  timeline: string;
  line_item_count: number;
  created_via_portal: boolean;
  edited_by_admin: boolean;
  admin_edited_at: string | null;
  portal_contact_name: string;
}

export interface QuoteCreate {
  title: string;
  customer_id?: number;
  deal_id?: number | null;
  portal_contact_name?: string;
  expires_at: string;
  timeline?: string;
  currency?: 'USD' | 'EUR';
  comments_text?: string;
  terms?: string[];
  discount_type?: DiscountType;
  discount_amount?: number;
  discount_percent?: number;
  tax_rate?: number;
  shipping_amount?: number;
  payment_terms?: string;
  line_items: LineItemCreate[];
}

export interface QuoteStats {
  total: number;
  by_status: Record<QuoteStatus, number>;
  total_value: number;
  accepted_value: number;
}

// Invoice Types
export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue';
export type InstallmentStatus = 'pending' | 'paid' | 'overdue';

export interface InvoiceLineItem {
  id?: number;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  order: number;
  line_total?: number;
}

export interface InvoiceLineItemCreate {
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  order?: number;
}

export interface InvoiceInstallment {
  id: number;
  title: string;
  order: number;
  start_date: string | null;
  due_date: string | null;
  paid_date: string | null;
  status: InstallmentStatus;
  notes: string;
  total: number;
  line_items: InvoiceLineItem[];
  receipt_pdf_file: string | null;
  receipt_url: string | null;
  receipt_generated_at: string | null;
}

export interface InvoiceInstallmentCreate {
  title?: string;
  order?: number;
  start_date?: string | null;
  due_date?: string | null;
  notes?: string;
  line_items: InvoiceLineItemCreate[];
}

export interface Invoice {
  id: number;
  reference: string;
  title: string;
  customer: Customer;
  deal: number | null;
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
  discount_type: DiscountType;
  discount_amount: number;
  discount_percent: number;
  tax_rate: number;
  tax_amount: number;
  shipping_amount: number;
  total: number;
  amount_paid: number;
  balance_due: number;
  installments: InvoiceInstallment[];
  pdf_file: string | null;
  pdf_url: string | null;
  pdf_generated_at: string | null;
  pdf_version: number;
  pdf_versions: PdfVersionEntry[];
  receipt_pdf_file: string | null;
  receipt_url: string | null;
  receipt_generated_at: string | null;
  public_url: string;
}

export interface InvoiceListItem {
  id: number;
  reference: string;
  title: string;
  customer: number;
  customer_name: string;
  deal: number | null;
  status: InvoiceStatus;
  total: number;
  balance_due: number;
  due_date: string;
  created_at: string;
}

export interface InvoiceCreate {
  title: string;
  customer_id: number;
  deal_id?: number | null;
  due_date: string;
  currency?: 'USD' | 'EUR';
  notes?: string;
  payment_terms?: string;
  discount_type?: DiscountType;
  discount_amount?: number;
  discount_percent?: number;
  tax_rate?: number;
  shipping_amount?: number;
  installments?: InvoiceInstallmentCreate[];
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
  portal_contact_name?: string;
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
  installments: InvoiceInstallment[];
  company: CompanySettings;
  pdf_file: string | null;
}

// ==================== ESTIMATE TYPES ====================

export type VisitStatus = 'not_scheduled' | 'scheduled' | 'in_progress' | 'completed';
export type EstimateFinancialStatus = 'draft' | 'sent' | 'approved' | 'rejected';

export interface EstimateLineItem {
  id?: number;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  order: number;
  line_total?: number;
}

export interface EstimatePhoto {
  id: number;
  image: string;
  image_url: string;
  caption: string;
  uploaded_at: string;
}

export interface Estimate {
  id: number;
  reference: string;
  title: string;
  customer: Customer;
  scheduled_date: string | null;
  visit_status: VisitStatus;
  visit_notes: string;
  job_address: string;
  financial_status: EstimateFinancialStatus;
  subtotal: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  quote: number | null;
  pdf_file: string | null;
  pdf_url: string | null;
  pdf_generated_at: string | null;
  line_items: EstimateLineItem[];
  photos: EstimatePhoto[];
  created_at: string;
  updated_at: string;
}

export interface EstimateListItem {
  id: number;
  reference: string;
  title: string;
  customer: number;
  customer_name: string;
  customer_phone: string;
  scheduled_date: string | null;
  visit_status: VisitStatus;
  financial_status: EstimateFinancialStatus;
  total: number;
  created_at: string;
}

export interface EstimateCreate {
  title: string;
  customer_id: number;
  scheduled_date?: string | null;
  visit_status?: VisitStatus;
  visit_notes?: string;
  job_address?: string;
  financial_status?: EstimateFinancialStatus;
  discount_amount?: number;
  tax_rate?: number;
  line_items: Omit<EstimateLineItem, 'id' | 'line_total'>[];
}

export interface EstimateStats {
  total: number;
  pending: number;
  by_visit_status: Record<VisitStatus, number>;
  by_financial_status: Record<EstimateFinancialStatus, number>;
}

// ==================== DEAL (PIPELINE) TYPES ====================

export type DealStage =
  | 'new_deal'
  | 'estimate_scheduled'
  | 'quote_sent'
  | 'job_scheduled'
  | 'job_completed'
  | 'job_lost';

export interface CustomJobType {
  id: number;
  name: string;
  slug: string;
  order: number;
  is_active: boolean;
}

export interface CustomLeadSource {
  id: number;
  name: string;
  slug: string;
  order: number;
  is_active: boolean;
}

export interface Deal {
  id: number;
  customer: number;
  customer_name: string;
  customer_phone: string;
  stage: DealStage;
  value: number | null;
  address: string;
  job_type: string;
  estimated_sqft: number | null;
  lead_source: string;
  notes: string;
  reason: string;
  order: number;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  archived_at: string | null;
  is_reviewed: boolean;
  reviewed_at: string | null;
}

export interface DealCreate {
  customer_id: number;
  stage?: DealStage;
  value?: number | null;
  address?: string;
  job_type?: string;
  estimated_sqft?: number | null;
  lead_source?: string;
  notes?: string;
  reason?: string;
  order?: number;
}

// ==================== ESTIMATE VISIT TYPES ====================

export interface CustomerPhoto {
  id: number;
  image: string;
  image_url: string;
  caption: string;
  uploaded_at: string;
}

export type VisitStatusNew = 'scheduled' | 'in_progress' | 'completed';

export interface EstimateVisitPhoto {
  id: number;
  image: string;
  image_url: string;
  caption: string;
  uploaded_at: string;
}

export interface EstimateVisit {
  id: number;
  deal: number;
  title: string;
  scheduled_date: string;
  status: VisitStatusNew;
  notes: string;
  photos: EstimateVisitPhoto[];
  created_at: string;
  updated_at: string;
}

export interface EstimateVisitCreate {
  deal: number;
  title: string;
  scheduled_date: string;
  status?: VisitStatusNew;
  notes?: string;
}

// ==================== APPOINTMENT TYPES ====================

export type AppointmentType = 'consultation' | 'follow_up' | 'measurement' | 'other';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface AppointmentDay {
  id: number;
  appointment: number;
  date: string;
  start_time: string | null;
  end_time: string | null;
}

export interface Appointment {
  id: number;
  deal: number | null;
  title: string;
  scheduled_date: string | null;
  start_date: string | null;
  end_date: string | null;
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  notes: string;
  days: AppointmentDay[];
  created_at: string;
  updated_at: string;
}

export interface AppointmentCreate {
  deal?: number | null;
  title: string;
  scheduled_date?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  appointment_type?: AppointmentType;
  status?: AppointmentStatus;
  notes?: string;
  days?: { date: string; start_time?: string | null; end_time?: string | null }[];
}

// ==================== NOTIFICATION TYPES ====================

export type NotificationType = 'new_lead' | 'lead_status' | 'quote_status' | 'invoice_paid' | 'system';
export type NotificationPriority = 'low' | 'normal' | 'high';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  related_object_type: string | null;
  related_object_type_name: string | null;
  related_object_id: number | null;
  is_read: boolean;
  read_at: string | null;
  delivered_via_websocket: boolean;
  delivered_via_push: boolean;
  data: Record<string, unknown>;
  created_at: string;
}

export interface NotificationPreferences {
  new_lead_enabled: boolean;
  lead_status_enabled: boolean;
  quote_status_enabled: boolean;
  invoice_paid_enabled: boolean;
  system_enabled: boolean;
  push_enabled: boolean;
  sound_enabled: boolean;
}

export interface PushSubscription {
  id: number;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  device_name: string;
  user_agent: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export interface PushSubscriptionCreate {
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  device_name?: string;
  user_agent?: string;
}

export interface DailyStats {
  date: string;
  new_leads_website: number;
  new_leads_local_ads: number;
  total_new_leads: number;
  leads_contacted: number;
  leads_converted: number;
  quotes_created: number;
  quotes_sent: number;
  quotes_accepted: number;
  quotes_total_value: number;
  invoices_created: number;
  invoices_paid: number;
  invoices_paid_value: number;
}

export interface DailyStatsResponse {
  days: DailyStats[];
  totals: {
    total_leads_website: number;
    total_leads_local_ads: number;
    total_leads: number;
    total_contacted: number;
    total_converted: number;
    total_quotes_created: number;
    total_quotes_sent: number;
    total_quotes_accepted: number;
    total_quotes_value: number;
    total_invoices_created: number;
    total_invoices_paid: number;
    total_invoices_paid_value: number;
  };
  period: {
    start: string;
    end: string;
    days: number;
  };
}

// ==================== BLOG TYPES ====================

export type BlogPostStatus = 'draft' | 'published' | 'scheduled';
export type BlogLocation = 'florida' | 'jacksonville' | 'st-augustine';

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  post_count?: number;
  created_at: string;
  updated_at: string;
}

export interface BlogCategoryMinimal {
  id: number;
  name: string;
  slug: string;
}

export interface BlogCategoryCreate {
  name: string;
  slug?: string;
  description?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_name: string;
  featured_image: string | null;
  featured_image_alt: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  is_indexed: boolean;
  has_faq_schema: boolean;
  faq_data: FAQItem[];
  categories: BlogCategoryMinimal[];
  location: BlogLocation;
  status: BlogPostStatus;
  publish_date: string | null;
  scheduled_publish_date: string | null;
  reading_time: number;
  effective_meta_title: string;
  effective_meta_description: string;
  created_at: string;
  last_updated: string;
}

export interface BlogPostListItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  author_name: string;
  featured_image: string | null;
  featured_image_alt: string;
  categories: BlogCategoryMinimal[];
  location: BlogLocation;
  status: BlogPostStatus;
  publish_date: string | null;
  reading_time: number;
  created_at: string;
  last_updated: string;
}

export interface BlogPostCreate {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author_name?: string;
  featured_image?: File | null;
  featured_image_alt?: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  is_indexed?: boolean;
  has_faq_schema?: boolean;
  faq_data?: FAQItem[];
  category_ids?: number[];
  location?: BlogLocation;
  status?: BlogPostStatus;
  scheduled_publish_date?: string;
}

export interface BlogPostUpdate {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  author_name?: string;
  featured_image?: File | null;
  featured_image_alt?: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  is_indexed?: boolean;
  has_faq_schema?: boolean;
  faq_data?: FAQItem[];
  category_ids?: number[];
  location?: BlogLocation;
  status?: BlogPostStatus;
  scheduled_publish_date?: string | null;
}

export interface BlogPostSitemapItem {
  slug: string;
  location: BlogLocation;
  last_updated: string;
  publish_date: string;
}

// AI Generation Types
export interface AIGeneratePostRequest {
  topic: string;
  keywords?: string[];
  tone?: 'professional' | 'friendly' | 'informative';
}

export interface AIGeneratePostResponse {
  title: string;
  content: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  faq_data: FAQItem[];
  error?: string;
  raw_response?: string;
}

export interface AIGenerateSectionRequest {
  section_type: 'intro' | 'body' | 'conclusion' | 'faq';
  context: string;
  existing_content?: string;
}

export interface AIGenerateSectionResponse {
  content?: string;
  faq_data?: FAQItem[];
  error?: string;
}

export interface AIGenerateSEORequest {
  title: string;
  content: string;
}

export interface AIGenerateSEOResponse {
  meta_title: string;
  meta_description: string;
  suggested_slug: string;
  error?: string;
}

export interface BlogImageUploadResponse {
  url: string;
  alt_text: string;
  filename: string;
}

// AI Image Generation Types
export interface AIEnhancePromptRequest {
  prompt: string;
  context?: string;
}

export interface AIEnhancePromptResponse {
  enhanced_prompt: string;
  error?: string;
}

export interface AIGenerateImageRequest {
  prompt: string;
  aspect_ratio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  enhanced?: boolean;
  context?: string;
}

export interface AIGenerateImageResponse {
  url: string;
  filename: string;
  aspect_ratio: string;
  error?: string;
}

export interface AspectRatioOption {
  value: string;
  label: string;
}

export interface AIImageOptionsResponse {
  aspect_ratios: AspectRatioOption[];
}

// Calendar Types
export interface CalendarBlogPost {
  id: number;
  title: string;
  slug: string;
  status: BlogPostStatus;
  location: BlogLocation;
  scheduled_publish_date: string | null;
  publish_date: string | null;
  created_at: string;
  categories: BlogCategoryMinimal[];
  display_date: string;
}

export interface QuickDraftCreate {
  title: string;
  slug: string;
  category_ids?: number[];
  scheduled_publish_date?: string;
  status?: BlogPostStatus;
}

export interface RescheduleRequest {
  scheduled_publish_date: string;
}

// ============================================================
// Projects Module Types
// ============================================================

export const SERVICE_TYPES = [
  { slug: 'kitchen-backsplash', name: 'Kitchen Backsplash' },
  { slug: 'bathroom-tile', name: 'Bathroom Tile' },
  { slug: 'floor-tile', name: 'Floor Tiling' },
  { slug: 'patio-tile', name: 'Patio & Outdoor' },
  { slug: 'fireplace-tile', name: 'Fireplace Tile' },
  { slug: 'shower-tile', name: 'Shower Installation' },
] as const;

export type ServiceTypeSlug = typeof SERVICE_TYPES[number]['slug'];
export type ProjectStatus = 'draft' | 'published';
export type WorkStatus = 'started' | 'in_progress' | 'completed';
export type MainVideoType = 'none' | 'video' | 'youtube';

export interface ProjectMedia {
  id: number;
  file: string | null;
  youtube_url: string;
  youtube_embed_url: string | null;
  youtube_thumbnail: string | null;
  media_type: 'image' | 'video' | 'youtube';
  order: number;
  alt_text: string;
  created_at: string;
}

export interface Phase {
  id: number;
  title: string;
  description: string;
  order: number;
  media: ProjectMedia[];
  created_at: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  status: ProjectStatus;
  work_status: WorkStatus;
  is_featured: boolean;
  job_types: ServiceTypeSlug[];
  main_video: string | null;
  main_video_url: string;
  main_video_type: MainVideoType;
  main_video_embed_url: string | null;
  main_video_thumbnail: string | null;
  phases: Phase[];
  created_at: string;
  updated_at: string;
}

export interface ProjectListItem {
  id: number;
  title: string;
  status: ProjectStatus;
  work_status: WorkStatus;
  is_featured: boolean;
  job_types: ServiceTypeSlug[];
  phase_count: number;
  main_video: string | null;
  main_video_type: MainVideoType;
  cover_image: string | null;
  cover_media_type: 'image' | 'video' | 'youtube';
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  title: string;
  description?: string;
  status?: ProjectStatus;
  work_status?: WorkStatus;
  is_featured?: boolean;
  job_types?: ServiceTypeSlug[];
}

export interface PhaseCreate {
  title: string;
  description?: string;
  order?: number;
}

// Site FAQ Types (standalone FAQ management, not blog inline FAQs)
export type FAQCategorySlug = 'general' | 'services' | 'pricing' | 'materials' | 'maintenance';

export interface SiteFAQ {
  id: number;
  question: string;
  answer: string;
  category: FAQCategorySlug;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteFAQCreate {
  question: string;
  answer: string;
  category: FAQCategorySlug;
  order?: number;
  is_active?: boolean;
}

export interface SiteFAQUpdate {
  question?: string;
  answer?: string;
  category?: FAQCategorySlug;
  order?: number;
  is_active?: boolean;
}
