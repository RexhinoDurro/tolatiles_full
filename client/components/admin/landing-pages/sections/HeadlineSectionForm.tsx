'use client';

interface HeadlineSectionFormProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export default function HeadlineSectionForm({ config, onChange }: HeadlineSectionFormProps) {
  const set = (key: string, value: any) => onChange({ ...config, [key]: value });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
        <input
          type="text"
          value={config.text || ''}
          onChange={(e) => set('text', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subtext</label>
        <input
          type="text"
          value={config.subtext || ''}
          onChange={(e) => set('subtext', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
}
