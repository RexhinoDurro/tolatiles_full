import LeadCaptureForm from '../LeadCaptureForm';

interface LeadFormConfig {
  heading?: string;
  button_label?: string;
  success_message?: string;
  project_type?: string;
}

interface LeadFormSectionProps {
  config: LeadFormConfig;
  landingPageId: number;
}

export default function LeadFormSection({ config, landingPageId }: LeadFormSectionProps) {
  return (
    <section className="py-16 px-6 bg-gray-50">
      <LeadCaptureForm id="lead-form" config={config} landingPageId={landingPageId} />
    </section>
  );
}
