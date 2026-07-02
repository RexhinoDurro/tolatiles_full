'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Loader2, Save } from 'lucide-react';
import { api } from '@/lib/api';
import type { LandingPage, LandingPageSection } from '@/types/api';
import SEOFields from '@/components/admin/blog/SEOFields';
import SubdomainField from './SubdomainField';
import TrackingFields from './TrackingFields';
import SectionsEditor from './SectionsEditor';

interface LandingPageEditorProps {
  landingPage?: LandingPage;
}

type Tab = 'content' | 'seo' | 'tracking' | 'sections' | 'publish';

export default function LandingPageEditor({ landingPage: initial }: LandingPageEditorProps) {
  const router = useRouter();
  const isNew = !initial;

  const [id, setId] = useState<number | undefined>(initial?.id);
  const [name, setName] = useState(initial?.name || '');
  const [subdomain, setSubdomain] = useState(initial?.subdomain || '');
  const [pageTitle, setPageTitle] = useState(initial?.page_title || '');
  const [phoneNumber, setPhoneNumber] = useState(initial?.phone_number || '+19048661738');
  const [status, setStatus] = useState<'draft' | 'published'>(initial?.status || 'draft');

  const [metaTitle, setMetaTitle] = useState(initial?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(initial?.meta_description || '');
  const [canonicalUrl, setCanonicalUrl] = useState(initial?.canonical_url || '');
  const [isIndexed, setIsIndexed] = useState(initial?.is_indexed ?? false);

  const [metaPixelId, setMetaPixelId] = useState(initial?.meta_pixel_id || '');
  const [gtmContainerId, setGtmContainerId] = useState(initial?.gtm_container_id || '');
  const [gaMeasurementId, setGaMeasurementId] = useState(initial?.ga_measurement_id || '');
  const [customHeadScripts, setCustomHeadScripts] = useState(initial?.custom_head_scripts || '');
  const [customBodyScripts, setCustomBodyScripts] = useState(initial?.custom_body_scripts || '');

  const [sections, setSections] = useState<LandingPageSection[]>(initial?.sections || []);

  const [activeTab, setActiveTab] = useState<Tab>('content');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (isNew && !pageTitle && name) {
      setPageTitle(`${name} | Tola Tiles`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const buildPayload = () => ({
    name,
    subdomain,
    page_title: pageTitle,
    phone_number: phoneNumber,
    status,
    meta_title: metaTitle,
    meta_description: metaDescription,
    canonical_url: canonicalUrl,
    is_indexed: isIndexed,
    meta_pixel_id: metaPixelId,
    gtm_container_id: gtmContainerId,
    ga_measurement_id: gaMeasurementId,
    custom_head_scripts: customHeadScripts,
    custom_body_scripts: customBodyScripts,
  });

  const handleSave = async () => {
    setError('');
    if (!name.trim() || !subdomain.trim() || !pageTitle.trim()) {
      setError('Name, subdomain, and page title are required.');
      setActiveTab('content');
      return;
    }

    setIsSaving(true);
    try {
      if (id) {
        await api.updateLandingPage(id, buildPayload());
      } else {
        const created = await api.createLandingPage(buildPayload());
        setId(created.id);
        router.replace(`/admin/landing-pages/${created.id}`);
      }
      setSavedAt(new Date());
    } catch (err) {
      console.error('Failed to save landing page:', err);
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs: { id: Tab; label: string; disabled?: boolean }[] = [
    { id: 'content', label: 'Content' },
    { id: 'seo', label: 'SEO' },
    { id: 'tracking', label: 'Tracking' },
    { id: 'sections', label: 'Sections', disabled: !id },
    { id: 'publish', label: 'Publish' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {isNew ? 'New Landing Page' : name || 'Edit Landing Page'}
        </h1>
        <div className="flex items-center gap-2">
          {status === 'published' && subdomain && (
            <a
              href={`https://${subdomain}.tolatiles.com/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Preview
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}
      {savedAt && !error && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Saved at {savedAt.toLocaleTimeString()}
        </div>
      )}

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`py-3 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : tab.disabled
                    ? 'border-transparent text-gray-300 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              title={tab.disabled ? 'Save the page first to manage sections' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === 'content' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Internal Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bathroom Remodel - Meta Ads"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">For your reference only — not shown on the page.</p>
            </div>

            <SubdomainField value={subdomain} onChange={setSubdomain} excludeId={id} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Page Title *</label>
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="Bathroom Remodel Free Estimate | Tola Tiles"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+19048661738"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Click-to-call target shared by the Hero and CTA sections.</p>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <SEOFields
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            slug={subdomain}
            canonicalUrl={canonicalUrl}
            isIndexed={isIndexed}
            onMetaTitleChange={setMetaTitle}
            onMetaDescriptionChange={setMetaDescription}
            onSlugChange={() => {}}
            onCanonicalUrlChange={setCanonicalUrl}
            onIsIndexedChange={setIsIndexed}
            title={pageTitle}
            previewUrlPrefix={`${subdomain || 'your-page'}.tolatiles.com`}
            showSlugField={false}
          />
        )}

        {activeTab === 'tracking' && (
          <TrackingFields
            metaPixelId={metaPixelId}
            gtmContainerId={gtmContainerId}
            gaMeasurementId={gaMeasurementId}
            customHeadScripts={customHeadScripts}
            customBodyScripts={customBodyScripts}
            onMetaPixelIdChange={setMetaPixelId}
            onGtmContainerIdChange={setGtmContainerId}
            onGaMeasurementIdChange={setGaMeasurementId}
            onCustomHeadScriptsChange={setCustomHeadScripts}
            onCustomBodyScriptsChange={setCustomBodyScripts}
          />
        )}

        {activeTab === 'sections' && id && (
          <SectionsEditor landingPageId={id} sections={sections} onSectionsChange={setSections} />
        )}

        {activeTab === 'publish' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setStatus(status === 'published' ? 'draft' : 'published')}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  status === 'published' ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    status === 'published' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <div>
                <p className="font-medium text-gray-900">
                  {status === 'published' ? 'Published' : 'Draft'}
                </p>
                <p className="text-sm text-gray-500">
                  {status === 'published'
                    ? `Live at https://${subdomain || '{subdomain}'}.tolatiles.com/`
                    : 'Not visible to the public. Publish, then Save, to go live.'}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Remember to click Save after changing this toggle.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
