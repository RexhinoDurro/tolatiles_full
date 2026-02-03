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
  LocalAdsLead,
  LocalAdsLeadsResponse,
  LocalAdsLeadsFilters,
  LocalAdsLeadStatus,
  WebsiteLeadCreate,
  LocalAdsLeadCreate,
  Notification,
  NotificationPreferences,
  PushSubscriptionCreate,
  DailyStatsResponse,
  BlogCategory,
  BlogPost,
  BlogPostListItem,
  BlogPostCreate,
  BlogPostUpdate,
  BlogPostSitemapItem,
  BlogPostStatus,
  AIGeneratePostRequest,
  AIGeneratePostResponse,
  AIGenerateSectionRequest,
  AIGenerateSectionResponse,
  AIGenerateSEORequest,
  AIGenerateSEOResponse,
  BlogImageUploadResponse,
  AIEnhancePromptRequest,
  AIEnhancePromptResponse,
  AIGenerateImageRequest,
  AIGenerateImageResponse,
  AIImageOptionsResponse,
  CalendarBlogPost,
  QuickDraftCreate,
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
  private refreshPromise: Promise<boolean> | null = null;
  private tokenRefreshListeners: (() => void)[] = [];

  constructor() {
    // Initialize tokens from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    }
  }

  // Subscribe to token refresh events (for WebSocket reconnection)
  onTokenRefresh(callback: () => void): () => void {
    this.tokenRefreshListeners.push(callback);
    return () => {
      this.tokenRefreshListeners = this.tokenRefreshListeners.filter(cb => cb !== callback);
    };
  }

  private notifyTokenRefresh(): void {
    this.tokenRefreshListeners.forEach(cb => cb());
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
    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Start a new refresh
    this.refreshPromise = this.doRefreshToken();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async doRefreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      this.setTokens(data.access, data.refresh || this.refreshToken!);
      this.notifyTokenRefresh();
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

  async transformGalleryImage(
    id: number,
    type: 'rotate_left' | 'rotate_right' | 'flip_horizontal' | 'flip_vertical'
  ): Promise<GalleryImage> {
    const data = await this.fetch<GalleryImage>(`/gallery/${id}/transform/`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
    this.cache.invalidate('gallery');
    return data;
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

  async createWebsiteLead(data: WebsiteLeadCreate): Promise<ContactLead> {
    return this.fetch<ContactLead>('/leads/admin_create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============ Local Ads Leads (Google LSA) ============

  async getLocalAdsLeads(filters: LocalAdsLeadsFilters = {}): Promise<LocalAdsLeadsResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.page_size) params.set('page_size', filters.page_size.toString());
    if (filters.status) params.set('status', filters.status);
    if (filters.charge_status) params.set('charge_status', filters.charge_status);
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);

    const queryString = params.toString();
    const endpoint = `/admin/leads/local-ads/${queryString ? `?${queryString}` : ''}`;
    return this.fetch<LocalAdsLeadsResponse>(endpoint);
  }

  async getLocalAdsLead(id: number): Promise<LocalAdsLead> {
    return this.fetch<LocalAdsLead>(`/admin/leads/local-ads/${id}/`);
  }

  async updateLocalAdsLeadStatus(id: number, status: LocalAdsLeadStatus): Promise<LocalAdsLead> {
    return this.fetch<LocalAdsLead>(`/admin/leads/local-ads/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async createLocalAdsLead(data: LocalAdsLeadCreate): Promise<LocalAdsLead> {
    return this.fetch<LocalAdsLead>('/admin/leads/local-ads/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============ Google Ads Integration ============

  async getGoogleAdsStatus(): Promise<{
    is_connected: boolean;
    connected_email: string | null;
    connected_at: string | null;
    last_sync_at: string | null;
    last_sync_status: string | null;
    last_sync_count: number;
  }> {
    return this.fetch('/integrations/google-ads/status/');
  }

  async getGoogleAdsAuthUrl(): Promise<{ auth_url: string }> {
    return this.fetch('/integrations/google-ads/auth-url/');
  }

  async disconnectGoogleAds(): Promise<{ success: boolean; message: string }> {
    return this.fetch('/integrations/google-ads/disconnect/', {
      method: 'POST',
    });
  }

  async syncGoogleAdsLeads(days: number = 90): Promise<{
    success: boolean;
    message: string;
    stats: { created: number; updated: number; skipped: number; errors: number };
  }> {
    return this.fetch('/integrations/google-ads/sync-leads/', {
      method: 'POST',
      body: JSON.stringify({ days }),
    });
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

  // ============ Search Console Integration ============

  async getSearchConsoleStatus(): Promise<{
    is_connected: boolean;
    connected_email: string | null;
    connected_at: string | null;
  }> {
    return this.fetch('/integrations/search-console/status/');
  }

  async disconnectSearchConsole(): Promise<{ success: boolean; message: string }> {
    return this.fetch('/integrations/search-console/disconnect/', {
      method: 'POST',
    });
  }

  async getSearchConsoleSites(): Promise<{
    sites: Array<{ siteUrl: string; permissionLevel: string }>;
  }> {
    return this.fetch('/integrations/search-console/sites/');
  }

  async getSearchConsolePerformance(params: {
    site_url: string;
    type?: 'summary' | 'daily' | 'queries' | 'pages' | 'totals';
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<SearchConsolePerformance> {
    const queryParams = new URLSearchParams();
    queryParams.set('site_url', params.site_url);
    if (params.type) queryParams.set('type', params.type);
    if (params.start_date) queryParams.set('start_date', params.start_date);
    if (params.end_date) queryParams.set('end_date', params.end_date);
    if (params.limit) queryParams.set('limit', params.limit.toString());

    return this.fetch(`/integrations/search-console/performance/?${queryParams.toString()}`);
  }

  async getSearchConsoleAuthUrl(): Promise<{ auth_url: string }> {
    return this.fetch('/integrations/search-console/auth-url/');
  }

  // ============ Notifications ============

  async getNotifications(): Promise<Notification[]> {
    const response = await this.fetch<PaginatedResponse<Notification> | Notification[]>(
      '/notifications/notifications/'
    );
    return Array.isArray(response) ? response : response.results;
  }

  async markNotificationRead(id: number): Promise<{ status: string }> {
    return this.fetch<{ status: string }>(`/notifications/notifications/${id}/mark_read/`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead(): Promise<{ status: string; count: number }> {
    return this.fetch<{ status: string; count: number }>(
      '/notifications/notifications/mark_all_read/',
      { method: 'POST' }
    );
  }

  async getUnreadNotificationCount(): Promise<{ count: number }> {
    return this.fetch<{ count: number }>('/notifications/notifications/unread_count/');
  }

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    return this.fetch<NotificationPreferences>('/notifications/preferences/');
  }

  async updateNotificationPreferences(
    data: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    return this.fetch<NotificationPreferences>('/notifications/preferences/', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getVapidPublicKey(): Promise<{ public_key: string }> {
    return this.fetch<{ public_key: string }>('/notifications/vapid-key/');
  }

  async subscribeToPush(data: PushSubscriptionCreate): Promise<{ id: number }> {
    return this.fetch<{ id: number }>('/notifications/push-subscriptions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async unsubscribeFromPush(endpoint: string): Promise<{ status: string }> {
    return this.fetch<{ status: string }>('/notifications/push-subscriptions/unsubscribe/', {
      method: 'DELETE',
      body: JSON.stringify({ endpoint }),
    });
  }

  async getDailyStats(days: number = 30): Promise<DailyStatsResponse> {
    return this.fetch<DailyStatsResponse>(`/notifications/stats/daily/?days=${days}`);
  }

  // ============ Blog Categories ============

  async getBlogCategories(): Promise<BlogCategory[]> {
    const response = await this.fetch<PaginatedResponse<BlogCategory> | BlogCategory[]>(
      '/blog/categories/'
    );
    return Array.isArray(response) ? response : response.results;
  }

  async getBlogCategory(slug: string): Promise<BlogCategory> {
    return this.fetch<BlogCategory>(`/blog/categories/${slug}/`);
  }

  async createBlogCategory(data: { name: string; slug?: string; description?: string }): Promise<BlogCategory> {
    return this.fetch<BlogCategory>('/blog/categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBlogCategory(slug: string, data: Partial<BlogCategory>): Promise<BlogCategory> {
    return this.fetch<BlogCategory>(`/blog/categories/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBlogCategory(slug: string): Promise<void> {
    await this.fetch<void>(`/blog/categories/${slug}/`, {
      method: 'DELETE',
    });
  }

  // ============ Blog Posts ============

  async getBlogPosts(params?: {
    status?: BlogPostStatus;
    category?: string;
    search?: string;
    ordering?: string;
  }): Promise<BlogPostListItem[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set('status', params.status);
    if (params?.category) queryParams.set('category', params.category);
    if (params?.search) queryParams.set('search', params.search);
    if (params?.ordering) queryParams.set('ordering', params.ordering);

    const queryString = queryParams.toString();
    const endpoint = `/blog/posts/${queryString ? `?${queryString}` : ''}`;
    const response = await this.fetch<PaginatedResponse<BlogPostListItem> | BlogPostListItem[]>(endpoint);
    return Array.isArray(response) ? response : response.results;
  }

  async getBlogPost(slug: string): Promise<BlogPost> {
    return this.fetch<BlogPost>(`/blog/posts/${slug}/`);
  }

  async createBlogPost(data: BlogPostCreate): Promise<BlogPost> {
    // Handle file upload for featured_image
    if (data.featured_image instanceof File) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'featured_image' && value instanceof File) {
          formData.append(key, value);
        } else if (key === 'category_ids' && Array.isArray(value)) {
          value.forEach(id => formData.append('category_ids', id.toString()));
        } else if (key === 'faq_data' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      return this.fetch<BlogPost>('/blog/posts/', {
        method: 'POST',
        body: formData,
      });
    }

    // JSON request without file
    const { featured_image, ...jsonData } = data;
    return this.fetch<BlogPost>('/blog/posts/', {
      method: 'POST',
      body: JSON.stringify(jsonData),
    });
  }

  async updateBlogPost(slug: string, data: BlogPostUpdate): Promise<BlogPost> {
    // Handle file upload for featured_image
    if (data.featured_image instanceof File) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'featured_image' && value instanceof File) {
          formData.append(key, value);
        } else if (key === 'category_ids' && Array.isArray(value)) {
          value.forEach(id => formData.append('category_ids', id.toString()));
        } else if (key === 'faq_data' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      return this.fetch<BlogPost>(`/blog/posts/${slug}/`, {
        method: 'PATCH',
        body: formData,
      });
    }

    // JSON request without file
    const { featured_image, ...jsonData } = data;
    return this.fetch<BlogPost>(`/blog/posts/${slug}/`, {
      method: 'PATCH',
      body: JSON.stringify(jsonData),
    });
  }

  async deleteBlogPost(slug: string): Promise<void> {
    await this.fetch<void>(`/blog/posts/${slug}/`, {
      method: 'DELETE',
    });
  }

  async getBlogPostSitemapData(): Promise<BlogPostSitemapItem[]> {
    return this.fetch<BlogPostSitemapItem[]>('/blog/posts/sitemap_data/');
  }

  async getRelatedBlogPosts(slug: string): Promise<BlogPostListItem[]> {
    return this.fetch<BlogPostListItem[]>(`/blog/posts/${slug}/related/`);
  }

  // ============ Blog AI Generation ============

  async generateBlogPost(data: AIGeneratePostRequest): Promise<AIGeneratePostResponse> {
    return this.fetch<AIGeneratePostResponse>('/blog/posts/ai_generate_post/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateBlogSection(data: AIGenerateSectionRequest): Promise<AIGenerateSectionResponse> {
    return this.fetch<AIGenerateSectionResponse>('/blog/posts/ai_generate_section/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateBlogSEO(data: AIGenerateSEORequest): Promise<AIGenerateSEOResponse> {
    return this.fetch<AIGenerateSEOResponse>('/blog/posts/ai_generate_seo/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadBlogImage(image: File, altText?: string): Promise<BlogImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', image);
    if (altText) formData.append('alt_text', altText);

    return this.fetch<BlogImageUploadResponse>('/blog/posts/upload_image/', {
      method: 'POST',
      body: formData,
    });
  }

  // ============ AI Image Generation ============

  async enhanceImagePrompt(data: AIEnhancePromptRequest): Promise<AIEnhancePromptResponse> {
    return this.fetch<AIEnhancePromptResponse>('/blog/posts/ai_enhance_prompt/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateAIImage(data: AIGenerateImageRequest): Promise<AIGenerateImageResponse> {
    return this.fetch<AIGenerateImageResponse>('/blog/posts/ai_generate_image/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAIImageOptions(): Promise<AIImageOptionsResponse> {
    return this.fetch<AIImageOptionsResponse>('/blog/posts/ai_image_options/');
  }

  // ============ Blog Calendar ============

  async getBlogPostsCalendar(startDate: string, endDate: string): Promise<CalendarBlogPost[]> {
    const params = new URLSearchParams();
    params.set('start_date', startDate);
    params.set('end_date', endDate);
    return this.fetch<CalendarBlogPost[]>(`/blog/posts/calendar/?${params.toString()}`);
  }

  async rescheduleBlogPost(slug: string, scheduledDate: string): Promise<CalendarBlogPost> {
    return this.fetch<CalendarBlogPost>(`/blog/posts/${slug}/reschedule/`, {
      method: 'PATCH',
      body: JSON.stringify({ scheduled_publish_date: scheduledDate }),
    });
  }

  async createQuickDraft(data: QuickDraftCreate): Promise<CalendarBlogPost> {
    return this.fetch<CalendarBlogPost>('/blog/posts/quick_draft/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Search Console types
export interface SearchConsolePerformance {
  period?: {
    start_date: string;
    end_date: string;
    days: number;
  };
  totals?: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  comparison?: {
    clicks_change: number;
    impressions_change: number;
    ctr_change: number;
    position_change: number;
  };
  daily_trend?: Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  top_queries?: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  top_pages?: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

// Export singleton instance
export const api = new ApiClient();

// Export class for testing
export { ApiClient };
