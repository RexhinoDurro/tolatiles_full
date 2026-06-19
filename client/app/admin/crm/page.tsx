'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ClipboardList, FileText, Receipt, DollarSign, Loader2, ArrowRight, CalendarDays } from 'lucide-react';
import CrmLayout from '@/components/admin/crm/CrmLayout';
import ScheduleFeed from '@/components/admin/crm/ScheduleFeed';
import { api } from '@/lib/api';
import type { LeadStats, QuoteStats, InvoiceStats, EstimateStats } from '@/types/api';

interface Stats {
  leads: LeadStats | null;
  quotes: QuoteStats | null;
  invoices: InvoiceStats | null;
  estimates: EstimateStats | null;
}

function StatCard({
  title,
  value,
  icon: Icon,
  href,
  color,
  sub,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  href: string;
  color: string;
  sub?: string;
}) {
  return (
    <Link href={href} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-600 mt-1">{title}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </Link>
  );
}

export default function CrmDashboardPage() {
  const [stats, setStats] = useState<Stats>({ leads: null, quotes: null, invoices: null, estimates: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [leadsData, quotesData, invoicesData, estimatesData] = await Promise.allSettled([
          api.getLeadStats(),
          api.getQuoteStats(),
          api.getInvoiceStats(),
          api.getEstimateStats(),
        ]);

        setStats({
          leads: leadsData.status === 'fulfilled' ? leadsData.value : null,
          quotes: quotesData.status === 'fulfilled' ? quotesData.value : null,
          invoices: invoicesData.status === 'fulfilled' ? invoicesData.value : null,
          estimates: estimatesData.status === 'fulfilled' ? estimatesData.value : null,
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <CrmLayout title="CRM">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
          <p className="text-gray-500 text-sm mt-1">Summary of your customer relationship activity</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Schedule Feed */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-semibold text-gray-900">Schedule</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <Link href="/admin/crm/calendar" className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700">
                  <CalendarDays className="w-4 h-4" />
                  Calendar
                </Link>
              </div>
              <ScheduleFeed />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Leads"
                value={stats.leads?.total ?? '—'}
                icon={Users}
                href="/admin/crm/leads"
                color="bg-blue-100 text-blue-600"
                sub={stats.leads ? `${stats.leads.by_status.new} new` : undefined}
              />
              <StatCard
                title="Estimates"
                value={stats.estimates?.total ?? '—'}
                icon={ClipboardList}
                href="/admin/crm/estimates"
                color="bg-purple-100 text-purple-600"
                sub={stats.estimates ? `${stats.estimates.pending} pending` : undefined}
              />
              <StatCard
                title="Quotes Sent"
                value={stats.quotes?.by_status.sent ?? '—'}
                icon={FileText}
                href="/admin/crm/quotes"
                color="bg-yellow-100 text-yellow-600"
                sub={stats.quotes ? `${stats.quotes.by_status.accepted} accepted` : undefined}
              />
              <StatCard
                title="Revenue"
                value={stats.invoices ? formatCurrency(stats.invoices.paid_value) : '—'}
                icon={DollarSign}
                href="/admin/crm/invoices"
                color="bg-green-100 text-green-600"
                sub={stats.invoices ? `${stats.invoices.by_status.paid} invoices paid` : undefined}
              />
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link
                  href="/admin/crm/leads"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors text-center"
                >
                  <Users className="w-6 h-6" />
                  <span className="text-sm font-medium">View Leads</span>
                </Link>
                <Link
                  href="/admin/crm/estimates/new"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 hover:bg-purple-50 hover:text-purple-700 transition-colors text-center"
                >
                  <ClipboardList className="w-6 h-6" />
                  <span className="text-sm font-medium">New Estimate</span>
                </Link>
                <Link
                  href="/admin/crm/quotes/new"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 hover:bg-yellow-50 hover:text-yellow-700 transition-colors text-center"
                >
                  <FileText className="w-6 h-6" />
                  <span className="text-sm font-medium">New Quote</span>
                </Link>
                <Link
                  href="/admin/crm/pipeline"
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 hover:bg-green-50 hover:text-green-700 transition-colors text-center"
                >
                  <Receipt className="w-6 h-6" />
                  <span className="text-sm font-medium">Pipeline</span>
                </Link>
              </div>
            </div>

            {/* Invoices Summary */}
            {stats.invoices && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Invoices Summary</h3>
                  <Link href="/admin/crm/invoices" className="text-sm text-blue-600 hover:underline">
                    View all
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.entries(stats.invoices.by_status).map(([s, count]) => (
                    <div key={s} className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-xs text-gray-500 capitalize mt-1">{s}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Total Value</div>
                    <div className="font-semibold text-gray-900">{formatCurrency(stats.invoices.total_value)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Outstanding</div>
                    <div className="font-semibold text-orange-600">{formatCurrency(stats.invoices.outstanding)}</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </CrmLayout>
  );
}
