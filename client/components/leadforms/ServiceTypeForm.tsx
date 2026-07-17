'use client';

import { useState } from 'react';
import ChoiceStep from './ChoiceStep';
import ZipCodeStep from './ZipCodeStep';
import ContactInfoStep from './ContactInfoStep';
import StepProgress from './StepProgress';
import { useLeadFormSubmit } from './useLeadFormSubmit';
import { services, type ServiceId } from '@/data/services';
import { serviceSubtypes } from '@/data/serviceSubtypes';

interface ServiceTypeFormProps {
  serviceId: ServiceId;
  heading?: string;
  id?: string;
  landingPageId?: number;
  /** 'modal' skips the outer card chrome — LeadFormModal already supplies it. */
  variant?: 'inline' | 'modal';
}

/**
 * Targeted lead form for a page where the service is already known (a service
 * page or a service-specific landing page) — never asks "which service", only
 * a service-specific sub-type question, then zip code, then contact info.
 * Falls back to a 2-step (zip -> contact) flow for any service without a
 * configured sub-type list.
 */
export default function ServiceTypeForm({ serviceId, heading, id, landingPageId, variant = 'inline' }: ServiceTypeFormProps) {
  const subtypeOptions = serviceSubtypes[serviceId] ?? [];
  const hasSubtypeStep = subtypeOptions.length > 0;
  const totalSteps = hasSubtypeStep ? 3 : 2;
  const zipStepNumber = hasSubtypeStep ? 2 : 1;
  const contactStepNumber = hasSubtypeStep ? 3 : 2;

  const [step, setStep] = useState(1);
  const [subtype, setSubtype] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [name, setName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');

  const { isSubmitting, submitStatus, errorMessage, honeypot, setHoneypot, submit } =
    useLeadFormSubmit();

  const serviceTitle = services.find((s) => s.id === serviceId)?.title ?? 'Your Project';
  const resolvedHeading = heading ?? `Get Your Free ${serviceTitle} Quote`;

  const handleSubtypeSelect = (value: string) => {
    setSubtype(value);
    setStep(zipStepNumber);
  };

  const handleSubmit = async () => {
    const [firstName, ...rest] = name.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;

    await submit({
      first_name: firstName || 'Lead',
      last_name: lastName,
      phone: phoneDigits ? `+1${phoneDigits}` : undefined,
      project_type: serviceId,
      service_subtype: subtype || undefined,
      zip_code: zipCode,
      landing_page_id: landingPageId,
    });
  };

  const content = (
    <div id={id}>
      <StepProgress current={step} total={totalSteps} />

      {hasSubtypeStep && step === 1 && (
        <ChoiceStep
          title={resolvedHeading}
          subtitle="What kind of project is this?"
          options={subtypeOptions}
          onSelect={handleSubtypeSelect}
        />
      )}

      {step === zipStepNumber && (
        <ZipCodeStep
          value={zipCode}
          onChange={setZipCode}
          onBack={() => setStep(1)}
          onNext={() => setStep(contactStepNumber)}
          showBack={hasSubtypeStep}
        />
      )}

      {step === contactStepNumber && (
        <ContactInfoStep
          name={name}
          onNameChange={setName}
          phoneDigits={phoneDigits}
          onPhoneChange={setPhoneDigits}
          onBack={() => setStep(zipStepNumber)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitStatus={submitStatus}
          errorMessage={errorMessage}
          successMessage="Thank you! We'll call you shortly to discuss your project."
          honeypot={honeypot}
          setHoneypot={setHoneypot}
        />
      )}
    </div>
  );

  if (variant === 'modal') {
    return content;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className="bg-white rounded-2xl shadow-lg border border-gray-200 px-6 py-7 sm:px-8 sm:py-8"
        style={{ colorScheme: 'light' }}
      >
        {content}
      </div>
    </div>
  );
}
