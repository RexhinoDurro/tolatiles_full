import type {
  Category,
  CategoryWithImages,
  GalleryImage,
  ContactLead,
  ContactFormData,
  LoginCredentials,
  LoginResponse,
  User,
  PaginatedResponse,
  LeadStats,
  CompanySettings,
  Customer,
  CustomerCreate,
  Quote,
  QuoteListItem,
  QuoteCreate,
  QuoteStats,
  QuoteStatus,
  Invoice,
  InvoiceListItem,
  InvoiceCreate,
  InvoiceStats,
  InvoiceStatus,
  PublicQuote,
  PublicInvoice,
} from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'tolatiles_access_token';
const REFRESH_TOKEN_KEY = 'tolatiles_refresh_token';
const USER_KEY = 'tolatiles_user';

// Cache configuration (TTL in milliseconds)
const CACHE_TTL = {
  categories: 5 * 60 * 1000, // 5 minutes
  gallery: 2 * 60 * 1000, // 2 minutes
  default: 60 * 1000, // 1 minute
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private cache = new ApiCache();

  constructor() {
    // Initialize tokens from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    }
  }

  // Token management
  setTokens(access: string, refresh: string): void {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, access);
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    }
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Core fetch method with auth handling
  async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Add content type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Add auth header if token exists
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 - try refresh token
    if (response.status === 401 && !isRetry && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.fetch<T>(endpoint, options, true);
      }
      this.clearTokens();
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      // Handle different error formats from DRF
      let message = 'API request failed';
      if (error.error) {
        message = error.error;
      } else if (error.detail) {
        message = error.detail;
      } else if (typeof error === 'object') {
        // Handle DRF validation errors like {"field": ["error message"]}
        const messages: string[] = [];
        for (const [field, errors] of Object.entries(error)) {
          if (Array.isArray(errors)) {
            messages.push(...errors.map(e => String(e)));
          } else if (typeof errors === 'string') {
            messages.push(errors);
          }
        }
        if (messages.length > 0) {
          message = messages.join(' ');
        }
      }
      throw new Error(message);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) return {} as T;

    return JSON.parse(text);
  }

  async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      this.setTokens(data.access, data.refresh || this.refreshToken!);
      return true;
    } catch {
      return false;
    }
  }

  // ============ Authentication ============

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.fetch<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.setTokens(response.access, response.refresh);

    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      if (this.refreshToken) {
        await this.fetch('/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh: this.refreshToken }),
        });
      }
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    return this.fetch<User>('/auth/me/');
  }

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  // ============ Categories ============

  async getCategories(): Promise<Category[]> {
    const cacheKey = 'categories:list';
    const cached = this.cache.get<Category[]>(cacheKey);
    if (cached) return cached;

    const response = await this.fetch<PaginatedResponse<Category> | Category[]>('/categories/');
    const data = Array.isArray(response) ? response : response.results;
    this.cache.set(cacheKey, data, CACHE_TTL.categories);
    return data;
  }

  async getCategory(name: string): Promise<CategoryWithImages> {
    const cacheKey = `categories:${name}`;
    const cached = this.cache.get<CategoryWithImages>(cacheKey);
    if (cached) return cached;

    const data = await this.fetch<CategoryWithImages>(`/categories/${name}/`);
    this.cache.set(cacheKey, data, CACHE_TTL.categories);
    return data;
  }

  // ============ Gallery Images ============

  async getGalleryImages(category?: string): Promise<GalleryImage[]> {
    const cacheKey = `gallery:${category || 'all'}`;
    const cached = this.cache.get<GalleryImage[]>(cacheKey);
    if (cached) return cached;

    const params = category ? `?category=${category}` : '';
    const response = await this.fetch<PaginatedResponse<GalleryImage> | GalleryImage[]>(
      `/gallery/${params}`
    );
    const data = Array.isArray(response) ? response : response.results;
    this.cache.set(cacheKey, data, CACHE_TTL.gallery);
    return data;
  }

  async getAllGalleryImages(): Promise<GalleryImage[]> {
    const cacheKey = 'gallery:all_images';
    const cached = this.cache.get<GalleryImage[]>(cacheKey);
    if (cached) return cached;

    const data = await this.fetch<GalleryImage[]>('/gallery/all_images/');
    this.cache.set(cacheKey, data, CACHE_TTL.gallery);
    return data;
  }

  async getGalleryImage(id: number): Promise<GalleryImage> {
    return this.fetch<GalleryImage>(`/gallery/${id}/`);
  }

  async createGalleryImage(formData: FormData): Promise<GalleryImage> {
    const data = await this.fetch<GalleryImage>('/gallery/', {
      method: 'POST',
      body: formData,
    });
    this.cache.invalidate('gallery');
    this.cache.invalidate('categories');
    return data;
  }

  async updateGalleryImage(id: number, formData: FormData): Promise<GalleryImage> {
    const data = await this.fetch<GalleryImage>(`/gallery/${id}/`, {
      method: 'PATCH',
      body: formData,
    });
    this.cache.invalidate('gallery');
    this.cache.invalidate('categories');
    return data;
  }

  async deleteGalleryImage(id: number): Promise<void> {
    await this.fetch<void>(`/gallery/${id}/`, {
      method: 'DELETE',
    });
    this.cache.invalidate('gallery');
    this.cache.invalidate('categories');
  }

  async reorderGalleryImages(orders: { id: number; order: number }[]): Promise<void> {
    await this.fetch('/gallery/reorder/', {
      method: 'POST',
      body: JSON.stringify({ orders }),
    });
    this.cache.invalidate('gallery');
  }

  // ============ Contact Leads ============

  async submitContactForm(data: ContactFormData): Promise<{ message: string }> {
    return this.fetch<{ message: string }>('/leads/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLeads(): Promise<ContactLead[]> {
    const response = await this.fetch<PaginatedResponse<ContactLead> | ContactLead[]>('/leads/');
    return Array.isArray(response) ? response : response.results;
  }

  async getLead(id: number): Promise<ContactLead> {
    return this.fetch<ContactLead>(`/leads/${id}/`);
  }

  async updateLead(id: number, data: Partial<ContactLead>): Promise<ContactLead> {
    return this.fetch<ContactLead>(`/leads/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateLeadStatus(id: number, status: string): Promise<ContactLead> {
    return this.fetch<ContactLead>(`/leads/${id}/update_status/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  async deleteLead(id: number): Promise<void> {
    await this.fetch<void>(`/leads/${id}/`, {
      method: 'DELETE',
    });
  }

  async getLeadStats(): Promise<LeadStats> {
    return this.fetch<LeadStats>('/leads/stats/');
  }

  // ============ Company Settings ============

  async getCompanySettings(): Promise<CompanySettings> {
    return this.fetch<CompanySettings>('/company-settings/');
  }

  async updateCompanySettings(data: Partial<CompanySettings>): Promise<CompanySettings> {
    return this.fetch<CompanySettings>('/company-settings/', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateCompanySettingsWithLogo(formData: FormData): Promise<CompanySettings> {
    return this.fetch<CompanySettings>('/company-settings/', {
      method: 'PUT',
      body: formData,
    });
  }

  // ============ Customers ============

  async getCustomers(): Promise<Customer[]> {
    const response = await this.fetch<PaginatedResponse<Customer> | Customer[]>('/customers/');
    return Array.isArray(response) ? response : response.results;
  }

  async getCustomer(id: number): Promise<Customer> {
    return this.fetch<Customer>(`/customers/${id}/`);
  }

  async createCustomer(data: CustomerCreate): Promise<Customer> {
    return this.fetch<Customer>('/customers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCustomer(id: number, data: Partial<CustomerCreate>): Promise<Customer> {
    return this.fetch<Customer>(`/customers/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCustomer(id: number): Promise<void> {
    await this.fetch<void>(`/customers/${id}/`, {
      method: 'DELETE',
    });
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    if (query.length < 2) return [];
    return this.fetch<Customer[]>(`/customers/search/?q=${encodeURIComponent(query)}`);
  }

  // ============ Quotes ============

  async getQuotes(status?: QuoteStatus): Promise<QuoteListItem[]> {
    const params = status ? `?status=${status}` : '';
    const response = await this.fetch<PaginatedResponse<QuoteListItem> | QuoteListItem[]>(
      `/quotes/${params}`
    );
    return Array.isArray(response) ? response : response.results;
  }

  async getQuote(id: number): Promise<Quote> {
    return this.fetch<Quote>(`/quotes/${id}/`);
  }

  async createQuote(data: QuoteCreate): Promise<Quote> {
    return this.fetch<Quote>('/quotes/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQuote(id: number, data: Partial<QuoteCreate>): Promise<Quote> {
    return this.fetch<Quote>(`/quotes/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteQuote(id: number): Promise<void> {
    await this.fetch<void>(`/quotes/${id}/`, {
      method: 'DELETE',
    });
  }

  async updateQuoteStatus(id: number, status: QuoteStatus): Promise<Quote> {
    return this.fetch<Quote>(`/quotes/${id}/update_status/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  async generateQuotePdf(id: number): Promise<{ message: string }> {
    return this.fetch<{ message: string }>(`/quotes/${id}/generate_pdf/`, {
      method: 'POST',
    });
  }

  async sendQuoteEmail(id: number): Promise<{ message: string }> {
    return this.fetch<{ message: string }>(`/quotes/${id}/send_email/`, {
      method: 'POST',
    });
  }

  async duplicateQuote(id: number): Promise<Quote> {
    return this.fetch<Quote>(`/quotes/${id}/duplicate/`, {
      method: 'POST',
    });
  }

  async getQuoteStats(): Promise<QuoteStats> {
    return this.fetch<QuoteStats>('/quotes/stats/');
  }

  async getPublicQuote(reference: string): Promise<PublicQuote> {
    return this.fetch<PublicQuote>(`/quotes/public/${reference}/`);
  }

  async convertQuoteToInvoice(id: number, dueDate?: string): Promise<Invoice> {
    return this.fetch<Invoice>(`/quotes/${id}/convert_to_invoice/`, {
      method: 'POST',
      body: JSON.stringify({ due_date: dueDate }),
    });
  }

  // ============ Invoices ============

  async getInvoices(status?: InvoiceStatus): Promise<InvoiceListItem[]> {
    const params = status ? `?status=${status}` : '';
    const response = await this.fetch<PaginatedResponse<InvoiceListItem> | InvoiceListItem[]>(
      `/invoices/${params}`
    );
    return Array.isArray(response) ? response : response.results;
  }

  async getInvoice(id: number): Promise<Invoice> {
    return this.fetch<Invoice>(`/invoices/${id}/`);
  }

  async createInvoice(data: InvoiceCreate): Promise<Invoice> {
    return this.fetch<Invoice>('/invoices/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInvoice(id: number, data: Partial<InvoiceCreate>): Promise<Invoice> {
    return this.fetch<Invoice>(`/invoices/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteInvoice(id: number): Promise<void> {
    await this.fetch<void>(`/invoices/${id}/`, {
      method: 'DELETE',
    });
  }

  async updateInvoiceStatus(id: number, status: InvoiceStatus): Promise<Invoice> {
    return this.fetch<Invoice>(`/invoices/${id}/update_status/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  async markInvoicePaid(id: number): Promise<Invoice> {
    return this.fetch<Invoice>(`/invoices/${id}/mark_paid/`, {
      method: 'POST',
    });
  }

  async recordInvoicePayment(id: number, amount: number): Promise<Invoice> {
    return this.fetch<Invoice>(`/invoices/${id}/record_payment/`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async generateInvoicePdf(id: number): Promise<{ message: string }> {
    return this.fetch<{ message: string }>(`/invoices/${id}/generate_pdf/`, {
      method: 'POST',
    });
  }

  async sendInvoiceEmail(id: number): Promise<{ message: string }> {
    return this.fetch<{ message: string }>(`/invoices/${id}/send_email/`, {
      method: 'POST',
    });
  }

  async getInvoiceStats(): Promise<InvoiceStats> {
    return this.fetch<InvoiceStats>('/invoices/stats/');
  }

  async getPublicInvoice(reference: string): Promise<PublicInvoice> {
    return this.fetch<PublicInvoice>(`/invoices/public/${reference}/`);
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export class for testing
export { ApiClient };
