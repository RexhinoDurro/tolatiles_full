'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  MousePointer,
  Eye,
  Target,
  MapPin,
  Search,
  FileText,
  Loader2,
  ExternalLink,
  RefreshCw,
  Calendar,
  AlertCircle,
  Users,
  Receipt,
  DollarSign,
  Globe,
  Megaphone,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { api, SearchConsolePerformance } from '@/lib/api';
import type { DailyStatsResponse } from '@/types/api';

export default function StatsPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sites, setSites] = useState<Array<{ siteUrl: string; permissionLevel: string }>>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [performance, setPerformance] = useState<SearchConsolePerformance | null>(null);
  const [dateRange, setDateRange] = useState<'1' | '7' | '28' | '90'>('28');
  const [dailyStats, setDailyStats] = useState<DailyStatsResponse | null>(null);
  const [dailyStatsRange, setDailyStatsRange] = useState<'1' | '7' | '30' | '90'>('30');
  const [isLoadingDailyStats, setIsLoadingDailyStats] = useState(true);

  // Check connection status on load
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Fetch daily stats
  useEffect(() => {
    fetchDailyStats();
  }, [dailyStatsRange]);

  const fetchDailyStats = async () => {
    setIsLoadingDailyStats(true);
    try {
      const data = await api.getDailyStats(parseInt(dailyStatsRange));
      setDailyStats(data);
    } catch (err) {
      console.error('Failed to fetch daily stats:', err);
    } finally {
      setIsLoadingDailyStats(false);
    }
  };

  // Fetch data when site or date range changes
  useEffect(() => {
    if (selectedSite) {
      fetchPerformanceData();
    }
  }, [selectedSite, dateRange]);

  const checkConnectionStatus = async () => {
    try {
      const status = await api.getSearchConsoleStatus();
      setIsConnected(status.is_connected);
      setConnectedEmail(status.connected_email);

      if (status.is_connected) {
        const sitesData = await api.getSearchConsoleSites();
        setSites(sitesData.sites || []);

        // Auto-select tolatiles.com if available
        const tolaSite = sitesData.sites?.find(
          (s) => s.siteUrl.includes('tolatiles.com')
        );
        if (tolaSite) {
          setSelectedSite(tolaSite.siteUrl);
        } else if (sitesData.sites?.length > 0) {
          setSelectedSite(sitesData.sites[0].siteUrl);
        }
      }
    } catch (err) {
      console.error('Failed to check status:', err);
      setError('Failed to check connection status');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    if (!selectedSite) return;

    setIsRefreshing(true);
    setError(null);

    try {
      const days = parseInt(dateRange);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 2); // Data has 2-day delay
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - days);

      const data = await api.getSearchConsolePerformance({
        site_url: selectedSite,
        type: 'summary',
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      });

      setPerformance(data);
    } catch (err: unknown) {
      console.error('Failed to fetch performance:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch performance data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConnect = async () => {
    try {
      // Get the OAuth URL from the API (this also creates the state token)
      const { auth_url } = await api.getSearchConsoleAuthUrl();
      // Redirect to Google OAuth
      window.location.href = auth_url;
    } catch (err) {
      console.error('Failed to get auth URL:', err);
      setError('Failed to start connection. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Search Console?')) return;

    try {
      await api.disconnectSearchConsole();
      setIsConnected(false);
      setConnectedEmail(null);
      setSites([]);
      setSelectedSite('');
      setPerformance(null);
    } catch (err) {
      console.error('Failed to disconnect:', err);
      setError('Failed to disconnect');
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getChangeIcon = (change: number, invert = false) => {
    const isPositive = invert ? change < 0 : change > 0;
    if (change === 0) return null;
    return isPositive ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getChangeColor = (change: number, invert = false) => {
    const isPositive = invert ? change < 0 : change > 0;
    if (change === 0) return 'text-gray-500';
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  if (isLoading) {
    return (
      <AdminLayout title="Stats">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  // Not connected state
  if (!isConnected) {
    return (
      <AdminLayout title="Stats">
        <div className="space-y-4 sm:space-y-6">
          {/* Daily Performance Stats Section - Always visible */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Business Performance
              </h2>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {(['1', '7', '30', '90'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setDailyStatsRange(range)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      dailyStatsRange === range
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {range === '1' ? '24h' : `${range}d`}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingDailyStats ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : dailyStats ? (
              <BusinessPerformanceContent dailyStats={dailyStats} formatCurrency={formatCurrency} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No performance data available
              </div>
            )}
          </div>

          {/* Connect Google Search Console */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Connect Google Search Console
              </h2>
              <p className="text-gray-600 mb-6">
                Connect your Google Search Console to view search performance metrics,
                top queries, and page analytics for tolatiles.com.
              </p>
              <button
                onClick={handleConnect}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Stats">
      <div className="space-y-4 sm:space-y-6">
        {/* Daily Performance Stats Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Business Performance
            </h2>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {(['1', '7', '30', '90'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDailyStatsRange(range)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    dailyStatsRange === range
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range === '1' ? '24h' : `${range}d`}
                </button>
              ))}
            </div>
          </div>

          {isLoadingDailyStats ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : dailyStats ? (
            <BusinessPerformanceContent dailyStats={dailyStats} formatCurrency={formatCurrency} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No performance data available
            </div>
          )}
        </div>

        {/* Google Search Console Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-blue-600" />
            Google Search Console
          </h2>
        </div>

        {/* Header with controls */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Connected as</p>
              <p className="font-medium text-gray-900">{connectedEmail}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Site selector */}
              {sites.length > 1 && (
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {sites.map((site) => (
                    <option key={site.siteUrl} value={site.siteUrl}>
                      {site.siteUrl}
                    </option>
                  ))}
                </select>
              )}

              {/* Date range selector */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {(['1', '7', '28', '90'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      dateRange === range
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {range === '1' ? '24h' : `${range}d`}
                  </button>
                ))}
              </div>

              {/* Refresh button */}
              <button
                onClick={fetchPerformanceData}
                disabled={isRefreshing}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Disconnect button */}
              <button
                onClick={handleDisconnect}
                className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error loading data</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Loading state for data */}
        {isRefreshing && !performance && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Performance data */}
        {performance && (
          <>
            {/* Key metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Clicks */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointer className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-500">Total Clicks</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {formatNumber(performance.totals?.clicks || 0)}
                </p>
                {performance.comparison && (
                  <div className={`flex items-center gap-1 mt-1 text-sm ${getChangeColor(performance.comparison.clicks_change)}`}>
                    {getChangeIcon(performance.comparison.clicks_change)}
                    <span>{Math.abs(performance.comparison.clicks_change)}%</span>
                  </div>
                )}
              </div>

              {/* Impressions */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-500">Impressions</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {formatNumber(performance.totals?.impressions || 0)}
                </p>
                {performance.comparison && (
                  <div className={`flex items-center gap-1 mt-1 text-sm ${getChangeColor(performance.comparison.impressions_change)}`}>
                    {getChangeIcon(performance.comparison.impressions_change)}
                    <span>{Math.abs(performance.comparison.impressions_change)}%</span>
                  </div>
                )}
              </div>

              {/* CTR */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-500">Avg CTR</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {performance.totals?.ctr?.toFixed(1) || 0}%
                </p>
                {performance.comparison && (
                  <div className={`flex items-center gap-1 mt-1 text-sm ${getChangeColor(performance.comparison.ctr_change)}`}>
                    {getChangeIcon(performance.comparison.ctr_change)}
                    <span>{Math.abs(performance.comparison.ctr_change)}%</span>
                  </div>
                )}
              </div>

              {/* Position */}
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-gray-500">Avg Position</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {performance.totals?.position?.toFixed(1) || 0}
                </p>
                {performance.comparison && (
                  <div className={`flex items-center gap-1 mt-1 text-sm ${getChangeColor(performance.comparison.position_change, true)}`}>
                    {getChangeIcon(performance.comparison.position_change, true)}
                    <span>{Math.abs(performance.comparison.position_change)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Daily trend chart placeholder */}
            {performance.daily_trend && performance.daily_trend.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  Daily Performance
                </h3>
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    {/* Simple bar chart visualization */}
                    <div className="flex items-end gap-1 h-40">
                      {performance.daily_trend.map((day, i) => {
                        const maxClicks = Math.max(...performance.daily_trend!.map(d => d.clicks));
                        const height = maxClicks > 0 ? (day.clicks / maxClicks) * 100 : 0;
                        return (
                          <div
                            key={day.date}
                            className="flex-1 group relative h-full flex flex-col items-center justify-end"
                            title={`${day.date}: ${day.clicks} clicks`}
                          >
                            <div
                              className="bg-blue-500 hover:bg-blue-600 rounded-t transition-colors w-full"
                              style={{ height: `${Math.max(height, 4)}%` }}
                            />
                            {/* Value under bar */}
                            <span className="text-[10px] text-gray-500 mt-1 truncate w-full text-center">
                              {day.clicks}
                            </span>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                                <p>{day.clicks} clicks</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* X-axis labels */}
                    <div className="flex gap-1 mt-1">
                      {performance.daily_trend.filter((_, i) => i % Math.ceil(performance.daily_trend!.length / 7) === 0).map((day) => (
                        <div key={day.date} className="flex-1 text-xs text-gray-500 text-center">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top queries and pages */}
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Top Queries */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Search className="w-5 h-5 text-gray-500" />
                    Top Queries
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {performance.top_queries && performance.top_queries.length > 0 ? (
                    performance.top_queries.slice(0, 10).map((query, i) => (
                      <div key={i} className="px-4 sm:px-6 py-3 hover:bg-gray-50">
                        <p className="font-medium text-gray-900 truncate mb-1">{query.query}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{query.clicks} clicks</span>
                          <span>{formatNumber(query.impressions)} imp</span>
                          <span>{query.ctr.toFixed(1)}% CTR</span>
                          <span>Pos {query.position.toFixed(1)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
                      No query data available
                    </div>
                  )}
                </div>
              </div>

              {/* Top Pages */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    Top Pages
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {performance.top_pages && performance.top_pages.length > 0 ? (
                    performance.top_pages.slice(0, 10).map((page, i) => {
                      const pagePath = page.page.replace(/^https?:\/\/[^/]+/, '');
                      return (
                        <div key={i} className="px-4 sm:px-6 py-3 hover:bg-gray-50">
                          <a
                            href={page.page}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-700 truncate mb-1 flex items-center gap-1"
                          >
                            {pagePath || '/'}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{page.clicks} clicks</span>
                            <span>{formatNumber(page.impressions)} imp</span>
                            <span>{page.ctr.toFixed(1)}% CTR</span>
                            <span>Pos {page.position.toFixed(1)}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
                      No page data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

// Business Performance Content Component
function BusinessPerformanceContent({
  dailyStats,
  formatCurrency,
}: {
  dailyStats: DailyStatsResponse;
  formatCurrency: (num: number) => string;
}) {
  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Leads */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-700">New Leads</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{dailyStats.totals.total_leads}</p>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
              <Globe className="w-3 h-3" />
              {dailyStats.totals.total_leads_website} web
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
              <Megaphone className="w-3 h-3" />
              {dailyStats.totals.total_leads_local_ads} ads
            </span>
          </div>
        </div>

        {/* Converted */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-700">Converted</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{dailyStats.totals.total_converted}</p>
          <p className="text-xs text-green-600 mt-2">
            {dailyStats.totals.total_leads > 0
              ? `${((dailyStats.totals.total_converted / dailyStats.totals.total_leads) * 100).toFixed(1)}% conversion rate`
              : '0% conversion rate'}
          </p>
        </div>

        {/* Quotes */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-purple-700">Quotes</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{dailyStats.totals.total_quotes_created}</p>
          <p className="text-xs text-purple-600 mt-2">
            {formatCurrency(dailyStats.totals.total_quotes_value)} expected
          </p>
        </div>

        {/* Revenue */}
        <div className="bg-emerald-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span className="text-sm text-emerald-700">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-emerald-900">
            {formatCurrency(dailyStats.totals.total_invoices_paid_value)}
          </p>
          <p className="text-xs text-emerald-600 mt-2">
            {dailyStats.totals.total_invoices_paid} invoice{dailyStats.totals.total_invoices_paid !== 1 ? 's' : ''} paid
          </p>
        </div>
      </div>

    </>
  );
}
