'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface SubdomainFieldProps {
  value: string;
  onChange: (value: string) => void;
  excludeId?: number;
}

export default function SubdomainField({ value, onChange, excludeId }: SubdomainFieldProps) {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ available: boolean; reason: string | null } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!value) {
      setResult(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setChecking(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.checkLandingPageSubdomain(value, excludeId);
        setResult(res);
      } catch {
        setResult(null);
      } finally {
        setChecking(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, excludeId]);

  const handleChange = (raw: string) => {
    onChange(raw.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain *</label>
      <div className="flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="bathroom"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <span className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-500 text-sm whitespace-nowrap">
          .tolatiles.com
        </span>
      </div>
      <div className="mt-1.5 h-5 flex items-center gap-1.5 text-sm">
        {checking && (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            <span className="text-gray-500">Checking availability...</span>
          </>
        )}
        {!checking && result && result.available && (
          <>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-600">
              {value}.tolatiles.com is available
            </span>
          </>
        )}
        {!checking && result && !result.available && (
          <>
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-600">{result.reason}</span>
          </>
        )}
      </div>
    </div>
  );
}
