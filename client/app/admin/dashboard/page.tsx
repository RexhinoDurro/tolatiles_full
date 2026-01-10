'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Image as ImageIcon, Users, TrendingUp, Clock, ArrowRight, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { api } from '@/lib/api';
import type { ContactLead, Category } from '@/types/api';

interface DashboardStats {
  totalImages: number;
  totalLeads: number;
  newLeads: number;
  categories: number;
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
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.title}
                  href={stat.href}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-xl`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Recent Leads */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
              <Link
                href="/admin/leads"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentLeads.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No leads yet. Contact form submissions will appear here.
                </div>
              ) : (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{lead.full_name}</p>
                        <p className="text-sm text-gray-500">{lead.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                            lead.status
                          )}`}
                        >
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-1">{lead.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/admin/gallery"
              className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              <ImageIcon className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Manage Gallery</h3>
              <p className="text-blue-100">Add, edit, or remove gallery images</p>
            </Link>
            <Link
              href="/admin/leads"
              className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white hover:from-purple-700 hover:to-purple-800 transition-all"
            >
              <Users className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-semibold mb-2">View Leads</h3>
              <p className="text-purple-100">Review and manage contact submissions</p>
            </Link>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
