'use client';

import { useState } from 'react';
import LeadFormModal from './LeadFormModal';
import ServiceLeadForm from './ServiceLeadForm';

interface ServiceLeadFormModalProps {
  triggerLabel?: string;
  triggerClassName?: string;
  heading?: string;
  landingPageId?: number;
  /** Render-prop for a fully custom trigger (e.g. an existing CTA button); receives the open() function. */
  children?: (open: () => void) => React.ReactNode;
}

/** Overlay counterpart of ServiceLeadForm — manages its own open/close state and a default trigger button. */
export default function ServiceLeadFormModal({
  triggerLabel = 'Get a Free Quote',
  triggerClassName,
  heading,
  landingPageId,
  children,
}: ServiceLeadFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);

  return (
    <>
      {children ? (
        children(open)
      ) : (
        <button
          type="button"
          onClick={open}
          className={
            triggerClassName ??
            'inline-flex items-center justify-center gap-2 bg-[#00a8e8] hover:bg-[#0097d2] text-white px-6 py-3.5 rounded-lg font-semibold transition-colors'
          }
        >
          {triggerLabel}
        </button>
      )}
      <LeadFormModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ServiceLeadForm variant="modal" heading={heading} landingPageId={landingPageId} />
      </LeadFormModal>
    </>
  );
}
