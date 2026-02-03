'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Image as ImageIcon, Users, TrendingUp, TrendingDown, Clock, ArrowRight, Loader2, MousePointer, Eye, BarChart3 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { api, SearchConsolePerformance } from '@/lib/api';
import type { ContactLead, Category } from '@/types/api';

interface DashboardStats {
  totalImages: number;
  totalLeads: number;
  newLeads: number;
  categories: number;
}

interface SearchStats {
  isConnected: boolean;
  clicks: number;
  impressions: number;
  clicksChange: number;
  impressionsChange: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalImages: 0,
    totalLeads: 0,
    newLeads: 0,
    categories: 0,
  });
  const [recentLeads, setRecentLeads] = useState<ContactLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchStats, setSearchStats] = useState<SearchStats>({
    isConnected: false,
    clicks: 0,
    impressions: 0,
    clicksChange: 0,
    impressionsChange: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories for image count
        const categories = await api.getCategories();
        const totalImages = categories.reduce((sum, cat) => sum + cat.image_count, 0);

        // Fetch leads
        const leads = await api.getLeads();
        const newLeads = leads.filter((lead) => lead.status === 'new').length;

        setStats({
          totalImages,
          totalLeads: leads.length,
          newLeads,
          categories: categories.length,
        });

        // Get recent leads (last 5)
        setRecentLeads(leads.slice(0, 5));

        // Fetch Search Console data
        try {
          const scStatus = await api.getSearchConsoleStatus();
          if (scStatus.is_connected) {
            const sitesData = await api.getSearchConsoleSites();
            const tolaSite = sitesData.sites?.find((s) => s.siteUrl.includes('tolatiles.com'));
            if (tolaSite) {
              const perfData = await api.getSearchConsolePerformance({
                site_url: tolaSite.siteUrl,
                type: 'summary',
              });
              setSearchStats({
                isConnected: true,
                clicks: perfData.totals?.clicks || 0,
                impressions: perfData.totals?.impressions || 0,
                clicksChange: perfData.comparison?.clicks_change || 0,
                impressionsChange: perfData.comparison?.impressions_change || 0,
              });
            }
          }
        } catch (scErr) {
          console.error('Failed to fetch Search Console data:', scErr);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Images',
      value: stats.totalImages,
      icon: ImageIcon,
      color: 'bg-blue-500',
      href: '/admin/gallery',
    },
    {
      title: 'Categories',
      value: stats.categories,
      icon: TrendingUp,
      color: 'bg-green-500',
      href: '/admin/gallery',
    },
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: Users,
      color: 'bg-purple-500',
      href: '/admin/leads',
    },
    {
      title: 'New Leads',
      value: stats.newLeads,
      icon: Clock,
      color: 'bg-orange-500',
      href: '/admin/leads?status=new',
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-yellow-100 text-yellow-700',
      qualified: 'bg-purple-100 text-purple-700',
      converted: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700',
    };
    return styles[status] || styles.new;
  };

  return (
    <AdminLayout title="Dashboard">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.title}
                  href={stat.href}
                  className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md active:bg-gray-50 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="order-2 sm:order-1">
                      <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">{stat.title}</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-2 sm:p-3 rounded-lg sm:rounded-xl order-1 sm:order-2 self-start`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Search Console Quick Stats */}
          {searchStats.isConnected ? (
            <Link
              href="/admin/stats"
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-4 sm:p-6 text-white hover:from-indigo-700 hover:to-indigo-800 transition-all block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  <h3 className="font-semibold">Search Performance (28 days)</h3>
                </div>
                <ArrowRight className="w-5 h-5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <MousePointer className="w-4 h-4 text-indigo-200" />
                    <span className="text-sm text-indigo-200">Clicks</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">
                    {searchStats.clicks >= 1000
                      ? (searchStats.clicks / 1000).toFixed(1) + 'K'
                      : searchStats.clicks}
                  </p>
                  <div className={`flex items-center gap-1 text-sm mt-0.5 ${searchStats.clicksChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {searchStats.clicksChange >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{Math.abs(searchStats.clicksChange)}%</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-200" />
                    <span className="text-sm text-indigo-200">Impressions</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">
                    {searchStats.impressions >= 1000
                      ? (searchStats.impressions / 1000).toFixed(1) + 'K'
                      : searchStats.impressions}
                  </p>
                  <div className={`flex items-center gap-1 text-sm mt-0.5 ${searchStats.impressionsChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {searchStats.impressionsChange >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{Math.abs(searchStats.impressionsChange)}%</span>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <Link
              href="/admin/stats"
              className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Search Console</h3>
                  <p className="text-sm text-gray-500">Connect to view search analytics</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>
          )}

          {/* Recent Leads */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Leads</h2>
              <Link
                href="/admin/leads"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 py-2 px-2 -mr-2 min-h-[44px]"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentLeads.length === 0 ? (
                <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
                  No leads yet. Contact form submissions will appear here.
                </div>
              ) : (
                recentLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    href="/admin/leads"
                    className="block px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start sm:items-center justify-between gap-2 flex-col sm:flex-row">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{lead.full_name}</p>
                        <p className="text-sm text-gray-500 truncate">{lead.email}</p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-center">
                        <span className="text-xs sm:text-sm text-gray-500">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusBadge(
                            lead.status
                          )}`}
                        >
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 sm:mt-2 line-clamp-1">{lead.message}</p>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            <Link
              href="/admin/gallery"
              className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 sm:p-6 text-white hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 transition-all"
            >
              <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-4" />
              <h3 className="text-base sm:text-xl font-semibold mb-1 sm:mb-2">Gallery</h3>
              <p className="text-blue-100 text-xs sm:text-base hidden sm:block">Add, edit, or remove gallery images</p>
            </Link>
            <Link
              href="/admin/leads"
              className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-4 sm:p-6 text-white hover:from-purple-700 hover:to-purple-800 active:from-purple-800 active:to-purple-900 transition-all"
            >
              <Users className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-4" />
              <h3 className="text-base sm:text-xl font-semibold mb-1 sm:mb-2">Leads</h3>
              <p className="text-purple-100 text-xs sm:text-base hidden sm:block">Review and manage contact submissions</p>
            </Link>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
