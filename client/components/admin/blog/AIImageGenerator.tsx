'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Sparkles, Wand2, Image as ImageIcon } from 'lucide-react';
import { api } from '@/lib/api';
import type { AspectRatioOption } from '@/types/api';

interface AIImageGeneratorProps {
  onClose: () => void;
  onImageGenerated: (imageUrl: string) => void;
  currentContent?: string;
  defaultAspectRatio?: string;
  insertButtonText?: string;
  showAspectRatioSelector?: boolean;
}

export default function AIImageGenerator({
  onClose,
  onImageGenerated,
  currentContent,
  defaultAspectRatio = '1:1',
  insertButtonText = 'Insert into Editor',
  showAspectRatioSelector = true,
}: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState(defaultAspectRatio);
  const [aspectRatios, setAspectRatios] = useState<AspectRatioOption[]>([
    { value: '1:1', label: 'Square (1:1)' },
    { value: '16:9', label: 'Landscape (16:9)' },
    { value: '4:3', label: 'Standard (4:3)' },
    { value: '3:4', label: 'Portrait (3:4)' },
    { value: '9:16', label: 'Tall (9:16)' },
  ]);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const options = await api.getAIImageOptions();
      if (options.aspect_ratios) {
        setAspectRatios(options.aspect_ratios);
      }
    } catch (err) {
      console.error('Failed to load image options:', err);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt first');
      return;
    }

    setEnhancing(true);
    setError(null);

    try {
      const response = await api.enhanceImagePrompt({
        prompt: prompt.trim(),
        context: currentContent?.substring(0, 500),
      });

      if (response.error) {
        setError(response.error);
        return;
      }

      setEnhancedPrompt(response.enhanced_prompt);
      setPrompt(response.enhanced_prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enhance prompt');
    } finally {
      setEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await api.generateAIImage({
        prompt: prompt.trim(),
        aspect_ratio: aspectRatio as '1:1' | '3:4' | '4:3' | '9:16' | '16:9',
      });

      if (response.error) {
        setError(response.error);
        return;
      }

      setGeneratedImage(response.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (generatedImage) {
      onImageGenerated(generatedImage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">AI Image Generator</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Describe the image you want to generate
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setEnhancedPrompt(null);
                }}
                placeholder="e.g., A modern kitchen with white subway tile backsplash and marble countertops, bright natural lighting"
                rows={3}
                maxLength={480}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
              <button
                onClick={handleEnhancePrompt}
                disabled={enhancing || !prompt.trim()}
                className="absolute right-2 top-2 flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                title="Enhance prompt with AI"
              >
                {enhancing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                Enhance
              </button>
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">
                {prompt.length}/480 characters
              </p>
              {enhancedPrompt && (
                <span className="text-xs text-purple-600 font-medium">
                  AI Enhanced
                </span>
              )}
            </div>
          </div>

          {/* Aspect Ratio */}
          {showAspectRatioSelector && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aspect Ratio
              </label>
              <div className="flex flex-wrap gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() => setAspectRatio(ratio.value)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      aspectRatio === ratio.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating image...
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5" />
                Generate Image
              </>
            )}
          </button>

          {/* Preview */}
          {generatedImage && (
            <div className="mt-4 space-y-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <img
                  src={generatedImage}
                  alt="AI Generated"
                  className="w-full h-auto"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors"
                >
                  Regenerate
                </button>
                <button
                  onClick={handleInsert}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  {insertButtonText}
                </button>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Tips for better results:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>- Be specific about materials, colors, and lighting</li>
              <li>- Use the &quot;Enhance&quot; button to improve your prompt</li>
              <li>- Mention the style (modern, traditional, minimalist, etc.)</li>
              <li>- Include context like &quot;kitchen&quot;, &quot;bathroom&quot;, &quot;outdoor patio&quot;</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
