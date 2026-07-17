import LeadCaptureForm from '../LeadCaptureForm';
import ServiceTypeForm from '@/components/leadforms/ServiceTypeForm';
import type { ServiceId } from '@/data/services';

interface LeadFormConfig {
  heading?: string;
  button_label?: string;
  success_message?: string;
  project_type?: string;
  /** 'service_type' renders the multi-step ServiceTypeForm (sub-type -> zip -> contact) instead of the simple name+phone form. */
  form_variant?: 'simple' | 'service_type';
  /** Required when form_variant is 'service_type'. */
  service_id?: ServiceId;
}

interface LeadFormSectionProps {
  config: LeadFormConfig;
  landingPageId: number;
}

export default function LeadFormSection({ config, landingPageId }: LeadFormSectionProps) {
  return (
    <section className="py-16 px-6 bg-gray-50">
      {config.form_variant === 'service_type' && config.service_id ? (
        <ServiceTypeForm
          id="lead-form"
          serviceId={config.service_id}
          heading={config.heading}
          landingPageId={landingPageId}
        />
      ) : (
        <LeadCaptureForm id="lead-form" config={config} landingPageId={landingPageId} />
      )}
    </section>
  );
}
