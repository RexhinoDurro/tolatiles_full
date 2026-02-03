'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { RefreshCw, AlertCircle, Plus, Loader2, Link2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import LeadsTabs, { type LeadTabType } from './LeadsTabs';
import WebsiteLeadsTable from './WebsiteLeadsTable';
import LocalAdsLeadsTable from './LocalAdsLeadsTable';
import LeadDetailModal from './LeadDetailModal';
import LocalAdsDetailDrawer from './LocalAdsDetailDrawer';
import CreateLeadModal from './CreateLeadModal';
import DeleteConfirmModal from '@/components/admin/gallery/DeleteConfirmModal';
import Pagination from './Pagination';
import { WebsiteLeadsFilters, LocalAdsLeadsFilters, type WebsiteLeadsFiltersState, type LocalAdsLeadsFiltersState } from './LeadsFilters';
import { api } from '@/lib/api';
import type { ContactLead, LeadStatus, LocalAdsLead, LocalAdsLeadStatus, LocalAdsLeadsResponse, WebsiteLeadCreate, LocalAdsLeadCreate } from '@/types/api';

const DEFAULT_PAGE_SIZE = 20;

// Skeleton loader component
function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="animate-pulse">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-full" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Cache for tab data
interface TabCache {
  website: {
    leads: ContactLead[];
    timestamp: number;
  } | null;
  local_ads: {
    data: LocalAdsLeadsResponse;
    filters: LocalAdsLeadsFiltersState;
    page: number;
    timestamp: number;
  } | null;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function AdminLeadsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get initial tab from URL
  const initialTab = (searchParams.get('tab') as LeadTabType) || 'website';
  const [activeTab, setActiveTab] = useState<LeadTabType>(initialTab);

  // Cache ref to persist across renders without triggering re-renders
  const cacheRef = useRef<TabCache>({ website: null, local_ads: null });

  // Website leads state
  const [websiteLeads, setWebsiteLeads] = useState<ContactLead[]>([]);
  const [websiteFilters, setWebsiteFilters] = useState<WebsiteLeadsFiltersState>({
    status: (searchParams.get('status') as LeadStatus) || 'all',
  });
  const [websiteLoading, setWebsiteLoading] = useState(true);
  const [websiteError, setWebsiteError] = useState<string | null>(null);

  // Local ads leads state
  const [localAdsData, setLocalAdsData] = useState<LocalAdsLeadsResponse | null>(null);
  const [localAdsFilters, setLocalAdsFilters] = useState<LocalAdsLeadsFiltersState>({
    status: '',
    charge_status: '',
    date_from: '',
    date_to: '',
  });
  const [localAdsPage, setLocalAdsPage] = useState(1);
  const [localAdsLoading, setLocalAdsLoading] = useState(false);
  const [localAdsError, setLocalAdsError] = useState<string | null>(null);

  // Common state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states - Website
  const [selectedWebsiteLead, setSelectedWebsiteLead] = useState<ContactLead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactLead | null>(null);

  // Modal states - Local Ads
  const [selectedLocalAdsLead, setSelectedLocalAdsLead] = useState<LocalAdsLead | null>(null);
  const [updatingLeadId, setUpdatingLeadId] = useState<number | null>(null);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Google Ads connection state
  const [googleAdsConnected, setGoogleAdsConnected] = useState(false);
  const [googleAdsEmail, setGoogleAdsEmail] = useState<string | null>(null);
  const [googleAdsLoading, setGoogleAdsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Check Google Ads connection status
  useEffect(() => {
    const checkGoogleAdsStatus = async () => {
      try {
        const status = await api.getGoogleAdsStatus();
        setGoogleAdsConnected(status.is_connected);
        setGoogleAdsEmail(status.connected_email);
      } catch (err) {
        console.error('Failed to check Google Ads status:', err);
      } finally {
        setGoogleAdsLoading(false);
      }
    };
    checkGoogleAdsStatus();
  }, []);

  // Handle Google Ads connect
  const handleGoogleAdsConnect = async () => {
    try {
      const { auth_url } = await api.getGoogleAdsAuthUrl();
      window.location.href = auth_url;
    } catch (err) {
      console.error('Failed to get auth URL:', err);
      setLocalAdsError('Failed to start connection. Please try again.');
    }
  };

  // Handle Google Ads disconnect
  const handleGoogleAdsDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Ads?')) return;
    try {
      await api.disconnectGoogleAds();
      setGoogleAdsConnected(false);
      setGoogleAdsEmail(null);
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  };

  // Handle sync leads
  const handleSyncLeads = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const result = await api.syncGoogleAdsLeads(90);
      setSyncMessage(`Synced! Created: ${result.stats.created}, Updated: ${result.stats.updated}`);
      // Refresh the leads list
      await fetchLocalAdsLeads(true);
    } catch (err) {
      setSyncMessage('Failed to sync leads. Please try again.');
      console.error('Failed to sync leads:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Update URL when tab changes
  const updateUrl = useCallback((tab: LeadTabType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Tab change handler
  const handleTabChange = (tab: LeadTabType) => {
    setActiveTab(tab);
    updateUrl(tab);
  };

  // Fetch website leads
  const fetchWebsiteLeads = useCallback(async (force = false) => {
    // Check cache
    const cached = cacheRef.current.website;
    if (!force && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setWebsiteLeads(cached.leads);
      setWebsiteLoading(false);
      return;
    }

    setWebsiteLoading(true);
    setWebsiteError(null);

    try {
      const data = await api.getLeads();
      setWebsiteLeads(data);
      cacheRef.current.website = { leads: data, timestamp: Date.now() };
    } catch (err) {
      console.error('Failed to fetch website leads:', err);
      setWebsiteError('Failed to load website leads. Please try again.');
    } finally {
      setWebsiteLoading(false);
    }
  }, []);

  // Fetch local ads leads
  const fetchLocalAdsLeads = useCallback(async (force = false) => {
    // Check cache - only use if filters and page match
    const cached = cacheRef.current.local_ads;
    if (
      !force &&
      cached &&
      Date.now() - cached.timestamp < CACHE_TTL &&
      cached.page === localAdsPage &&
      JSON.stringify(cached.filters) === JSON.stringify(localAdsFilters)
    ) {
      setLocalAdsData(cached.data);
      setLocalAdsLoading(false);
      return;
    }

    setLocalAdsLoading(true);
    setLocalAdsError(null);

    try {
      const data = await api.getLocalAdsLeads({
        page: localAdsPage,
        page_size: DEFAULT_PAGE_SIZE,
        status: localAdsFilters.status || undefined,
        charge_status: localAdsFilters.charge_status || undefined,
        date_from: localAdsFilters.date_from || undefined,
        date_to: localAdsFilters.date_to || undefined,
      });
      setLocalAdsData(data);
      cacheRef.current.local_ads = {
        data,
        filters: localAdsFilters,
        page: localAdsPage,
        timestamp: Date.now(),
      };
    } catch (err) {
      console.error('Failed to fetch local ads leads:', err);
      setLocalAdsError('Failed to load Local Ads leads. Please try again.');
    } finally {
      setLocalAdsLoading(false);
    }
  }, [localAdsFilters, localAdsPage]);

  // Initial fetch for active tab
  useEffect(() => {
    if (activeTab === 'website') {
      fetchWebsiteLeads();
    } else {
      fetchLocalAdsLeads();
    }
  }, [activeTab, fetchWebsiteLeads, fetchLocalAdsLeads]);

  // Refetch local ads when filters or page change
  useEffect(() => {
    if (activeTab === 'local_ads') {
      fetchLocalAdsLeads();
    }
  }, [localAdsFilters, localAdsPage, activeTab, fetchLocalAdsLeads]);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (activeTab === 'website') {
      await fetchWebsiteLeads(true);
    } else {
      await fetchLocalAdsLeads(true);
    }
    setIsRefreshing(false);
  };

  // Website lead handlers
  const handleWebsiteLeadUpdate = async (id: number, data: { status?: LeadStatus; notes?: string }) => {
    await api.updateLead(id, data);

    setWebsiteLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, ...data } : lead))
    );

    // Update cache
    if (cacheRef.current.website) {
      cacheRef.current.website.leads = cacheRef.current.website.leads.map((lead) =>
        lead.id === id ? { ...lead, ...data } : lead
      );
    }

    if (selectedWebsiteLead?.id === id) {
      setSelectedWebsiteLead((prev) => (prev ? { ...prev, ...data } : null));
    }
  };

  const handleWebsiteLeadDelete = async () => {
    if (!deleteTarget) return;
    await api.deleteLead(deleteTarget.id);
    setWebsiteLeads((prev) => prev.filter((lead) => lead.id !== deleteTarget.id));

    // Update cache
    if (cacheRef.current.website) {
      cacheRef.current.website.leads = cacheRef.current.website.leads.filter(
        (lead) => lead.id !== deleteTarget.id
      );
    }

    setDeleteTarget(null);
  };

  // Create lead handlers
  const handleCreateLead = async (data: WebsiteLeadCreate | LocalAdsLeadCreate) => {
    if (activeTab === 'website') {
      const newLead = await api.createWebsiteLead(data as WebsiteLeadCreate);
      setWebsiteLeads((prev) => [newLead, ...prev]);
      // Update cache
      if (cacheRef.current.website) {
        cacheRef.current.website.leads = [newLead, ...cacheRef.current.website.leads];
      }
    } else {
      const newLead = await api.createLocalAdsLead(data as LocalAdsLeadCreate);
      // Refetch to get updated list
      await fetchLocalAdsLeads(true);
    }
  };

  // Local ads lead handlers
  const handleLocalAdsStatusChange = async (leadId: number, status: LocalAdsLeadStatus) => {
    setUpdatingLeadId(leadId);
    try {
      await api.updateLocalAdsLeadStatus(leadId, status);

      // Update local state
      if (localAdsData) {
        const updatedResults = localAdsData.results.map((lead) =>
          lead.id === leadId ? { ...lead, status } : lead
        );
        setLocalAdsData({ ...localAdsData, results: updatedResults });

        // Update cache
        if (cacheRef.current.local_ads) {
          cacheRef.current.local_ads.data.results = updatedResults;
        }
      }

      // Update selected lead if open
      if (selectedLocalAdsLead?.id === leadId) {
        setSelectedLocalAdsLead((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      console.error('Failed to update lead status:', err);
    } finally {
      setUpdatingLeadId(null);
    }
  };

  // Filter website leads
  const filteredWebsiteLeads =
    websiteFilters.status === 'all'
      ? websiteLeads
      : websiteLeads.filter((lead) => lead.status === websiteFilters.status);

  // Get status counts for website leads
  const getWebsiteStatusCounts = () => {
    const counts: Record<LeadStatus | 'all', number> = {
      all: websiteLeads.length,
      new: 0,
      contacted: 0,
      qualified: 0,
      converted: 0,
      closed: 0,
    };

    websiteLeads.forEach((lead) => {
      if (lead.status in counts) {
        counts[lead.status]++;
      }
    });

    return counts;
  };

  // Calculate local ads pagination
  const localAdsTotalPages = localAdsData
    ? Math.ceil(localAdsData.count / DEFAULT_PAGE_SIZE)
    : 1;

  return (
    <AdminLayout title="Leads Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-gray-600">
              Manage leads from your website and Local Services Ads
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Lead</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <LeadsTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          websiteCount={websiteLeads.length}
          localAdsCount={localAdsData?.count}
        />

        {/* Website Leads Tab */}
        {activeTab === 'website' && (
          <div className="space-y-4">
            {/* Filters */}
            <WebsiteLeadsFilters
              filters={websiteFilters}
              onFiltersChange={setWebsiteFilters}
              statusCounts={getWebsiteStatusCounts()}
            />

            {/* Error State */}
            {websiteError && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{websiteError}</span>
                <button
                  onClick={() => fetchWebsiteLeads(true)}
                  className="ml-auto underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Loading State */}
            {websiteLoading ? (
              <TableSkeleton />
            ) : (
              <>
                {/* Table */}
                <WebsiteLeadsTable
                  leads={filteredWebsiteLeads}
                  onView={setSelectedWebsiteLead}
                  onDelete={setDeleteTarget}
                />

                {/* Count */}
                {filteredWebsiteLeads.length > 0 && (
                  <div className="text-center text-sm text-gray-500">
                    Showing {filteredWebsiteLeads.length} of {websiteLeads.length} lead
                    {websiteLeads.length !== 1 ? 's' : ''}
                    {websiteFilters.status !== 'all' && ` with status "${websiteFilters.status}"`}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Local Ads Leads Tab */}
        {activeTab === 'local_ads' && (
          <div className="space-y-4">
            {/* Loading connection status */}
            {googleAdsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              </div>
            ) : !googleAdsConnected ? (
              /* Not connected - show connect card */
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Link2 className="w-8 h-8 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Connect Google Ads
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Connect your Google Ads account to sync Local Services Ads leads
                    and manage them alongside your website leads.
                  </p>
                  <button
                    onClick={handleGoogleAdsConnect}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Connect with Google
                  </button>
                </div>
              </div>
            ) : (
              /* Connected - show leads */
              <>
                {/* Connection status bar */}
                <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-600">
                      Connected as <span className="font-medium text-gray-900">{googleAdsEmail || 'Google Ads'}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSyncLeads}
                      disabled={isSyncing}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isSyncing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Sync Leads
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleGoogleAdsDisconnect}
                      className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>

                {/* Sync message */}
                {syncMessage && (
                  <div className={`p-3 rounded-lg text-sm ${syncMessage.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {syncMessage}
                  </div>
                )}

                {/* Filters */}
                <LocalAdsLeadsFilters
                  filters={localAdsFilters}
                  onFiltersChange={(newFilters) => {
                    setLocalAdsFilters(newFilters);
                    setLocalAdsPage(1);
                  }}
                  debounceMs={400}
                />

                {/* Error State */}
                {localAdsError && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{localAdsError}</span>
                    <button
                      onClick={() => fetchLocalAdsLeads(true)}
                      className="ml-auto underline hover:no-underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {/* Loading State */}
                {localAdsLoading ? (
                  <TableSkeleton />
                ) : localAdsData ? (
                  <>
                    {/* Table */}
                    <LocalAdsLeadsTable
                      leads={localAdsData.results}
                      onViewDetails={setSelectedLocalAdsLead}
                      onStatusChange={handleLocalAdsStatusChange}
                      isUpdating={updatingLeadId}
                    />

                    {/* Pagination */}
                    {localAdsData.count > 0 && (
                      <Pagination
                        currentPage={localAdsPage}
                        totalPages={localAdsTotalPages}
                        totalItems={localAdsData.count}
                        pageSize={DEFAULT_PAGE_SIZE}
                        onPageChange={setLocalAdsPage}
                        isLoading={localAdsLoading}
                      />
                    )}
                  </>
                ) : null}
              </>
            )}
          </div>
        )}
      </div>

      {/* Website Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedWebsiteLead}
        isOpen={!!selectedWebsiteLead}
        onClose={() => setSelectedWebsiteLead(null)}
        onUpdate={handleWebsiteLeadUpdate}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Lead"
        message={`Are you sure you want to delete the lead from "${deleteTarget?.full_name}"? This action cannot be undone.`}
        onConfirm={handleWebsiteLeadDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Local Ads Lead Detail Drawer */}
      <LocalAdsDetailDrawer
        lead={selectedLocalAdsLead}
        isOpen={!!selectedLocalAdsLead}
        onClose={() => setSelectedLocalAdsLead(null)}
        onStatusChange={handleLocalAdsStatusChange}
        isUpdating={updatingLeadId === selectedLocalAdsLead?.id}
      />

      {/* Create Lead Modal */}
      <CreateLeadModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateLead}
        type={activeTab}
      />
    </AdminLayout>
  );
}
