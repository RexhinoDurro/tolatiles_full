'use client';

import type { ComponentType } from 'react';

/** Accepts lucide icons or the hand-drawn icons in serviceIcons.tsx — anything shaped like a simple SVG icon component. */
export type IconComponent = ComponentType<{ className?: string }>;

export interface ChoiceOption {
  value: string;
  label: string;
  icon?: IconComponent;
}

interface ChoiceStepProps {
  title: string;
  subtitle?: string;
  options: ChoiceOption[];
  onSelect: (value: string) => void;
}

export default function ChoiceStep({ title, subtitle, options, onSelect }: ChoiceStepProps) {
  return (
    <div>
      <h2
        className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-1.5"
        style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
      >
        {title}
      </h2>
      {subtitle && <p className="text-sm text-gray-500 text-center mb-4">{subtitle}</p>}
      <div className="space-y-2.5 mt-5">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left bg-white border border-gray-300 rounded-lg hover:border-[#00a8e8] hover:bg-blue-50/50 active:bg-blue-50 transition-colors"
            >
              {Icon && (
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#00a8e8]" />
                </span>
              )}
              <span className="text-base font-semibold text-gray-900">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
