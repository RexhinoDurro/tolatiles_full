'use client';

import { useState } from 'react';
import ChoiceStep, { type ChoiceOption } from './ChoiceStep';
import ZipCodeStep from './ZipCodeStep';
import ContactInfoStep from './ContactInfoStep';
import StepProgress from './StepProgress';
import { useLeadFormSubmit } from './useLeadFormSubmit';
import {
  BacksplashTileIcon,
  BathroomTileIcon,
  FlooringTileIcon,
  PatioTileIcon,
  FireplaceTileIcon,
  ShowerTileIcon,
} from './serviceIcons';

const SERVICE_OPTIONS: ChoiceOption[] = [
  { value: 'kitchen-backsplash', label: 'Kitchen Backsplash', icon: BacksplashTileIcon },
  { value: 'bathroom', label: 'Bathroom Tile', icon: BathroomTileIcon },
  { value: 'flooring', label: 'Flooring', icon: FlooringTileIcon },
  { value: 'patio', label: 'Patio & Outdoor', icon: PatioTileIcon },
  { value: 'fireplace', label: 'Fireplace', icon: FireplaceTileIcon },
  { value: 'shower', label: 'Shower Installation', icon: ShowerTileIcon },
];

interface ServiceLeadFormProps {
  heading?: string;
  id?: string;
  landingPageId?: number;
  successMessage?: string;
  /** 'modal' skips the outer card chrome — LeadFormModal already supplies it. */
  variant?: 'inline' | 'modal';
}

/**
 * General-purpose 3-step lead form: service type -> zip code -> contact info.
 * Use ServiceTypeForm instead on pages where the service is already known
 * (e.g. a specific service page) to skip the "which service" question.
 */
export default function ServiceLeadForm({
  heading = 'Get Your Free Quote',
  id,
  landingPageId,
  successMessage,
  variant = 'inline',
}: ServiceLeadFormProps) {
  const [step, setStep] = useState(1);
  const [projectType, setProjectType] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [name, setName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [customDetails, setCustomDetails] = useState('');

  const { isSubmitting, submitStatus, errorMessage, honeypot, setHoneypot, submit } =
    useLeadFormSubmit();

  const handleServiceSelect = (value: string) => {
    setProjectType(value);
    setStep(2);
  };

  const handleSubmit = async () => {
    const [firstName, ...rest] = name.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;

    await submit({
      first_name: firstName || 'Lead',
      last_name: lastName,
      phone: phoneDigits ? `+1${phoneDigits}` : undefined,
      project_type: projectType,
      zip_code: zipCode,
      custom_details: customDetails || undefined,
      landing_page_id: landingPageId,
    });
  };

  const content = (
    <div id={id}>
      <StepProgress current={step} total={3} />

      {step === 1 && (
        <ChoiceStep title={heading} subtitle="Select the service you need." options={SERVICE_OPTIONS} onSelect={handleServiceSelect} />
      )}

      {step === 2 && <ZipCodeStep value={zipCode} onChange={setZipCode} onBack={() => setStep(1)} onNext={() => setStep(3)} />}

      {step === 3 && (
        <ContactInfoStep
          name={name}
          onNameChange={setName}
          phoneDigits={phoneDigits}
          onPhoneChange={setPhoneDigits}
          customDetails={customDetails}
          onCustomDetailsChange={setCustomDetails}
          onBack={() => setStep(2)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitStatus={submitStatus}
          errorMessage={errorMessage}
          successMessage={successMessage ?? "Thank you! We'll call you shortly to discuss your project."}
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
