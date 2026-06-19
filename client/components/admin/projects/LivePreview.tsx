'use client';

import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import type { Project } from '@/types/api';
import LivePreviewCard from './LivePreviewCard';

interface LivePreviewProps {
  project: Partial<Project>;
}

export default function LivePreview({ project }: LivePreviewProps) {
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="h-full flex flex-col bg-gray-50 border-l border-gray-200">
      {/* Toggle bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <span className="text-sm font-semibold text-gray-700">Live Preview</span>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === 'desktop' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Desktop
          </button>
          <button
            onClick={() => setMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === 'mobile' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Mobile
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-y-auto p-4">
        {mode === 'desktop' ? (
          <LivePreviewCard project={project} />
        ) : (
          <div className="mx-auto w-[375px]">
            <div className="border-4 border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="bg-gray-800 h-6 flex items-center justify-center">
                <div className="w-16 h-1.5 bg-gray-600 rounded-full" />
              </div>
              <div className="bg-white overflow-y-auto max-h-[640px]">
                <LivePreviewCard project={project} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
