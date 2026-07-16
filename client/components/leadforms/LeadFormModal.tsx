'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Generic overlay shell for the modal counterparts of ServiceLeadForm/ServiceTypeForm.
 * Same fixed-backdrop pattern as the admin CreateLeadModal, restyled to match the
 * public brand system (rounded-2xl card, Outfit heading, #00a8e8 accents).
 */
export default function LeadFormModal({ isOpen, onClose, children }: LeadFormModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    // Navbar is z-50 — sit above it so the modal isn't hidden behind the fixed nav.
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/60 transition-opacity" onClick={onClose} aria-hidden="true" />

        <div
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl px-6 py-7 sm:px-8 sm:py-8 my-8"
          style={{ colorScheme: 'light' }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}
