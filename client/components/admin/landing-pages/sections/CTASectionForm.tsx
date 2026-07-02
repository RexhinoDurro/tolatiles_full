'use client';

interface CTASectionFormProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export default function CTASectionForm({ config, onChange }: CTASectionFormProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
      <input
        type="text"
        value={config.label || ''}
        onChange={(e) => onChange({ ...config, label: e.target.value })}
        placeholder="Ready to get started?"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <p className="text-xs text-gray-500 mt-1">
        Shows a call-to-call button and a scroll-to-form button using the page's phone number.
      </p>
    </div>
  );
}
