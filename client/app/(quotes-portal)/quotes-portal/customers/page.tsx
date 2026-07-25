'use client';

import { useEffect, useState } from 'react';
import { portalApi } from '@/lib/portalApi';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import PortalProtectedRoute from '@/components/quotes-portal/PortalProtectedRoute';
import type { Customer } from '@/types/api';
import { LogOut, Users, Mail, Phone, MapPin } from 'lucide-react';

function PortalCustomersContent() {
  const { logout, user } = usePortalAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    portalApi
      .getCustomers()
      .then(setCustomers)
      .catch(() => setError('Failed to load customers'))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = search
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search) ||
          (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
      )
    : customers;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">TolaTiles Quotes Portal</h1>
            {user && (
              <p className="text-xs text-gray-500">
                {user.first_name || user.username}
              </p>
            )}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
        </div>

        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm mb-6 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <Users className="mx-auto mb-3 text-gray-300" size={40} />
            <p className="text-gray-500 text-sm">
              {customers.length === 0 ? 'No customers yet.' : 'No results found.'}
            </p>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Desktop table */}
            <table className="w-full hidden sm:table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.email || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filtered.map((c) => (
                <div key={c.id} className="p-4">
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  <div className="mt-1.5 space-y-1">
                    {c.phone && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Phone size={12} /> {c.phone}
                      </p>
                    )}
                    {c.email && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Mail size={12} /> {c.email}
                      </p>
                    )}
                    {c.address && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <MapPin size={12} /> {c.address}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortalCustomersPage() {
  return (
    <PortalProtectedRoute>
      <PortalCustomersContent />
    </PortalProtectedRoute>
  );
}
