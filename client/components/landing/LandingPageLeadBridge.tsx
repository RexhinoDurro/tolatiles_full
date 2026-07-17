'use client';

import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { extractPhoneDigits } from '@/lib/phoneUtils';

declare global {
  interface Window {
    TolaLeads?: {
      submit: (data: { name: string; phone: string; project_type?: string }) => Promise<void>;
    };
  }
}

interface LandingPageLeadBridgeProps {
  landingPageId: number;
}

/** Exposes window.TolaLeads.submit(...) so a Custom Code section's own <script> can deliver a lead into the CRM. */
export default function LandingPageLeadBridge({ landingPageId }: LandingPageLeadBridgeProps) {
  const mountTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    mountTimeRef.current = Date.now();

    window.TolaLeads = {
      submit: async ({ name, phone, project_type }) => {
        const [firstName, ...rest] = name.trim().split(/\s+/);
        const lastName = rest.join(' ') || firstName;
        const phoneDigits = extractPhoneDigits(phone);
        const fillTime = Math.floor((Date.now() - mountTimeRef.current) / 1000);

        await api.submitContactForm({
          first_name: firstName || 'Lead',
          last_name: lastName,
          phone: phoneDigits ? `+1${phoneDigits}` : undefined,
          project_type: project_type || 'other',
          honeypot: '',
          form_fill_time: fillTime,
          landing_page_id: landingPageId,
        });

        if (typeof window !== 'undefined' && window.fbq) {
          window.fbq('track', 'Lead');
        }
      },
    };

    return () => {
      delete window.TolaLeads;
    };
  }, [landingPageId]);

  return null;
}
