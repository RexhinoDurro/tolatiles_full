'use client';

interface LeadFormSectionFormProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

const PROJECT_TYPES = [
  { value: 'bathroom', label: 'Bathroom Tiles' },
  { value: 'kitchen-backsplash', label: 'Kitchen Backsplash' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'patio', label: 'Patio/Outdoor' },
  { value: 'fireplace', label: 'Fireplace' },
  { value: 'commercial', label: 'Commercial Project' },
  { value: 'other', label: 'Other' },
];

export default function LeadFormSectionForm({ config, onChange }: LeadFormSectionFormProps) {
  const set = (key: string, value: any) => onChange({ ...config, [key]: value });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
        <input
          type="text"
          value={config.heading || ''}
          onChange={(e) => set('heading', e.target.value)}
          placeholder="Get Your Free Quote"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Button Label</label>
        <input
          type="text"
          value={config.button_label || ''}
          onChange={(e) => set('button_label', e.target.value)}
          placeholder="Get My Free Quote"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Success Message</label>
        <input
          type="text"
          value={config.success_message || ''}
          onChange={(e) => set('success_message', e.target.value)}
          placeholder="Thank you! We'll call you shortly."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">CRM Project Type</label>
        <select
          value={config.project_type || 'other'}
          onChange={(e) => set('project_type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {PROJECT_TYPES.map((pt) => (
            <option key={pt.value} value={pt.value}>{pt.label}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Leads only collect name + phone. This tags every submission with a project type for the CRM.
        </p>
      </div>
    </div>
  );
}
