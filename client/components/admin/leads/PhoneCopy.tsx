'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { displayPhoneNumber } from '@/lib/phoneUtils';

interface PhoneCopyProps {
  phone: string;
}

export default function PhoneCopy({ phone }: PhoneCopyProps) {
  const [copied, setCopied] = useState(false);

  if (!phone) {
    return <span className="text-sm text-gray-400">Not provided</span>;
  }

  const formatted = displayPhoneNumber(phone);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <a
        href={`tel:${phone}`}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        {formatted}
      </a>
      <button
        onClick={handleCopy}
        className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
        title="Copy phone number"
        type="button"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </span>
  );
}
