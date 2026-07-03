'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import type { LandingPageSection, LandingPageSectionType } from '@/types/api';
import HeroSectionForm from './sections/HeroSectionForm';
import HeadlineSectionForm from './sections/HeadlineSectionForm';
import CTASectionForm from './sections/CTASectionForm';
import LeadFormSectionForm from './sections/LeadFormSectionForm';
import ReviewsSectionForm from './sections/ReviewsSectionForm';
import GallerySectionForm from './sections/GallerySectionForm';
import CustomCodeSectionForm from './sections/CustomCodeSectionForm';

interface SectionsEditorProps {
  landingPageId: number;
  sections: LandingPageSection[];
  onSectionsChange: (sections: LandingPageSection[]) => void;
}

const SECTION_TYPE_LABELS: Record<LandingPageSectionType, string> = {
  hero: 'Hero',
  headline: 'Headline',
  cta: 'Call to Action',
  lead_form: 'Lead Form',
  reviews: 'Reviews',
  gallery: 'Gallery',
  custom_code: 'Custom Code',
};

const SECTION_TYPES: LandingPageSectionType[] = ['hero', 'headline', 'cta', 'lead_form', 'reviews', 'gallery', 'custom_code'];

export default function SectionsEditor({ landingPageId, sections, onSectionsChange }: SectionsEditorProps) {
  const [addingType, setAddingType] = useState<LandingPageSectionType>('hero');
  const [savingId, setSavingId] = useState<number | null>(null);

  const ordered = [...sections].sort((a, b) => a.order - b.order);

  const persistOrder = async (next: LandingPageSection[]) => {
    onSectionsChange(next);
    await api.reorderLandingPageSections(landingPageId, next.map((s) => s.id));
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= ordered.length) return;
    const next = [...ordered];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    const reindexed = next.map((s, i) => ({ ...s, order: i }));
    persistOrder(reindexed);
  };

  const toggleEnabled = async (section: LandingPageSection) => {
    setSavingId(section.id);
    try {
      const updated = await api.updateLandingPageSection(section.id, { is_enabled: !section.is_enabled });
      onSectionsChange(sections.map((s) => (s.id === section.id ? updated : s)));
    } finally {
      setSavingId(null);
    }
  };

  const updateConfig = async (section: LandingPageSection, config: Record<string, any>) => {
    onSectionsChange(sections.map((s) => (s.id === section.id ? { ...s, config } : s)));
    setSavingId(section.id);
    try {
      await api.updateLandingPageSection(section.id, { config });
    } finally {
      setSavingId(null);
    }
  };

  const removeSection = async (section: LandingPageSection) => {
    if (!confirm(`Remove the ${SECTION_TYPE_LABELS[section.section_type]} section?`)) return;
    await api.deleteLandingPageSection(section.id);
    onSectionsChange(sections.filter((s) => s.id !== section.id));
  };

  const addSection = async () => {
    const newSection = await api.createLandingPageSection({
      landing_page: landingPageId,
      section_type: addingType,
      order: sections.length,
      is_enabled: true,
      config: {},
    });
    onSectionsChange([...sections, newSection]);
  };

  const renderConfigForm = (section: LandingPageSection) => {
    const onChange = (config: Record<string, any>) => updateConfig(section, config);
    switch (section.section_type) {
      case 'hero':
        return <HeroSectionForm config={section.config} onChange={onChange} />;
      case 'headline':
        return <HeadlineSectionForm config={section.config} onChange={onChange} />;
      case 'cta':
        return <CTASectionForm config={section.config} onChange={onChange} />;
      case 'lead_form':
        return <LeadFormSectionForm config={section.config} onChange={onChange} />;
      case 'reviews':
        return <ReviewsSectionForm config={section.config} onChange={onChange} />;
      case 'gallery':
        return <GallerySectionForm config={section.config} onChange={onChange} />;
      case 'custom_code':
        return <CustomCodeSectionForm config={section.config} onChange={onChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select
          value={addingType}
          onChange={(e) => setAddingType(e.target.value as LandingPageSectionType)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {SECTION_TYPES.map((type) => (
            <option key={type} value={type}>{SECTION_TYPE_LABELS[type]}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={addSection}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>

      {ordered.length === 0 && (
        <p className="text-gray-500 text-sm py-8 text-center border border-dashed border-gray-300 rounded-lg">
          No sections yet. Add one above — Hero and Lead Form are a good starting point.
        </p>
      )}

      <div className="space-y-3">
        {ordered.map((section, index) => (
          <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{SECTION_TYPE_LABELS[section.section_type]}</span>
                {savingId === section.id && <span className="text-xs text-gray-400">saving...</span>}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveSection(index, -1)}
                  disabled={index === 0}
                  className="p-1.5 text-gray-500 hover:bg-gray-200 rounded disabled:opacity-30"
                  title="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(index, 1)}
                  disabled={index === ordered.length - 1}
                  className="p-1.5 text-gray-500 hover:bg-gray-200 rounded disabled:opacity-30"
                  title="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleEnabled(section)}
                  className="p-1.5 text-gray-500 hover:bg-gray-200 rounded"
                  title={section.is_enabled ? 'Disable section' : 'Enable section'}
                >
                  {section.is_enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => removeSection(section)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                  title="Remove section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">{renderConfigForm(section)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
