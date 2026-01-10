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
      throw new Error(error.error || error.detail || 'API request failed');
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
}

// Export singleton instance
export const api = new ApiClient();

// Export class for testing
export { ApiClient };
