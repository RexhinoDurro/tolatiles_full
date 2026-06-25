'use client';

import type { Customer, CustomerCreate, QuoteListItem, Quote, QuoteCreate, PortalUser, PaginatedResponse } from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const ACCESS_KEY = 'tolatiles_portal_access_token';
const REFRESH_KEY = 'tolatiles_portal_refresh_token';
const USER_KEY = 'tolatiles_portal_user';

class PortalApiClient {
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_KEY);
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_KEY);
  }

  getStoredUser(): PortalUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refresh = this.getRefreshToken();
    if (!refresh) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) {
        this.clearTokens();
        return null;
      }
      const data = await res.json();
      localStorage.setItem(ACCESS_KEY, data.access);
      if (data.refresh) localStorage.setItem(REFRESH_KEY, data.refresh);
      return data.access;
    } catch {
      this.clearTokens();
      return null;
    }
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        res = await fetch(`${API_BASE}${path}`, { ...options, headers });
      }
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.error || `Request failed: ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  }

  async login(username: string, password: string): Promise<{ user: PortalUser }> {
    const res = await fetch(`${API_BASE}/auth/portal-login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem(ACCESS_KEY, data.access);
    localStorage.setItem(REFRESH_KEY, data.refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return { user: data.user };
  }

  async logout(): Promise<void> {
    const refresh = this.getRefreshToken();
    if (refresh) {
      const token = this.getAccessToken();
      await fetch(`${API_BASE}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ refresh }),
      }).catch(() => {});
    }
    this.clearTokens();
  }

  async getCurrentUser(): Promise<PortalUser> {
    return this.fetch<PortalUser>('/auth/me/');
  }

  async getQuotes(): Promise<QuoteListItem[]> {
    const response = await this.fetch<PaginatedResponse<QuoteListItem> | QuoteListItem[]>('/portal/quotes/');
    return Array.isArray(response) ? response : response.results;
  }

  async getQuote(id: number): Promise<Quote> {
    return this.fetch<Quote>(`/portal/quotes/${id}/`);
  }

  async createQuote(data: QuoteCreate): Promise<Quote> {
    return this.fetch<Quote>('/portal/quotes/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQuote(id: number, data: Partial<QuoteCreate>): Promise<Quote> {
    return this.fetch<Quote>(`/portal/quotes/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async generateQuotePdf(id: number): Promise<{ message: string; pdf_url?: string }> {
    return this.fetch<{ message: string; pdf_url?: string }>(`/portal/quotes/${id}/generate_pdf/`, {
      method: 'POST',
    });
  }

  async sendQuoteEmail(id: number): Promise<{ message: string }> {
    return this.fetch<{ message: string }>(`/portal/quotes/${id}/send_email/`, {
      method: 'POST',
    });
  }

  async createCustomer(data: CustomerCreate): Promise<Customer> {
    return this.fetch<Customer>('/portal/customers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async searchCustomers(q: string): Promise<Customer[]> {
    return this.fetch<Customer[]>(`/portal/customers/search/?q=${encodeURIComponent(q)}`);
  }

  async getDeals(): Promise<any[]> {
    const response = await this.fetch<PaginatedResponse<any> | any[]>('/deals/');
    return Array.isArray(response) ? response : response.results;
  }

  async getAllEstimateVisits(): Promise<any[]> {
    const response = await this.fetch<PaginatedResponse<any> | any[]>('/estimate-visits/');
    return Array.isArray(response) ? response : response.results;
  }

  async getAllAppointments(): Promise<any[]> {
    const response = await this.fetch<PaginatedResponse<any> | any[]>('/appointments/');
    return Array.isArray(response) ? response : response.results;
  }

  async createAppointmentDirect(data: any): Promise<any> {
    return this.fetch<any>('/appointments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const portalApi = new PortalApiClient();
