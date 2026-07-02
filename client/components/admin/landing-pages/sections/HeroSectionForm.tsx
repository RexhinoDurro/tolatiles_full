'use client';

interface HeroSectionFormProps {
  config: Record<string, any>;
  onChange: (config: Record<string, any>) => void;
}

export default function HeroSectionForm({ config, onChange }: HeroSectionFormProps) {
  const set = (key: string, value: any) => onChange({ ...config, [key]: value });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
        <input
          type="text"
          value={config.headline || ''}
          onChange={(e) => set('headline', e.target.value)}
          placeholder="Transform Your Bathroom"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subheadline</label>
        <input
          type="text"
          value={config.subheadline || ''}
          onChange={(e) => set('subheadline', e.target.value)}
          placeholder="Free estimates this week"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Background Media</label>
        <select
          value={config.media_type || 'image'}
          onChange={(e) => set('media_type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
        {config.media_type === 'video' ? (
          <input
            type="text"
            value={config.video_url || ''}
            onChange={(e) => set('video_url', e.target.value)}
            placeholder="https://.../hero-video.mp4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        ) : (
          <input
            type="text"
            value={config.image || ''}
            onChange={(e) => set('image', e.target.value)}
            placeholder="https://.../hero-image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )}
      </div>
    </div>
  );
}
