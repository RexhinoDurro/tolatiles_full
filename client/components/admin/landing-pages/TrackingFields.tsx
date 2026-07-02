'use client';

import { AlertTriangle } from 'lucide-react';

interface TrackingFieldsProps {
  metaPixelId: string;
  gtmContainerId: string;
  gaMeasurementId: string;
  customHeadScripts: string;
  customBodyScripts: string;
  onMetaPixelIdChange: (value: string) => void;
  onGtmContainerIdChange: (value: string) => void;
  onGaMeasurementIdChange: (value: string) => void;
  onCustomHeadScriptsChange: (value: string) => void;
  onCustomBodyScriptsChange: (value: string) => void;
}

export default function TrackingFields({
  metaPixelId,
  gtmContainerId,
  gaMeasurementId,
  customHeadScripts,
  customBodyScripts,
  onMetaPixelIdChange,
  onGtmContainerIdChange,
  onGaMeasurementIdChange,
  onCustomHeadScriptsChange,
  onCustomBodyScriptsChange,
}: TrackingFieldsProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Meta (Facebook) Pixel ID</label>
        <input
          type="text"
          value={metaPixelId}
          onChange={(e) => onMetaPixelIdChange(e.target.value)}
          placeholder="123456789012345"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">Fires PageView on load and Lead on form submit.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Google Tag Manager Container ID</label>
        <input
          type="text"
          value={gtmContainerId}
          onChange={(e) => onGtmContainerIdChange(e.target.value)}
          placeholder="GTM-XXXXXXX"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics Measurement ID</label>
        <input
          type="text"
          value={gaMeasurementId}
          onChange={(e) => onGaMeasurementIdChange(e.target.value)}
          placeholder="G-XXXXXXXXXX"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-start gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Custom scripts below execute as raw HTML on the live page. Only paste code from sources you trust —
            this is the same trust level as having admin access to the site.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Custom &lt;head&gt; Scripts</label>
          <textarea
            value={customHeadScripts}
            onChange={(e) => onCustomHeadScriptsChange(e.target.value)}
            rows={4}
            placeholder="<script>...</script>"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Custom Body Scripts</label>
          <textarea
            value={customBodyScripts}
            onChange={(e) => onCustomBodyScriptsChange(e.target.value)}
            rows={4}
            placeholder="<script>...</script>"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
