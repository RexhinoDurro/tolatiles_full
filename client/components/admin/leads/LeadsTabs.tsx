'use client';

export type LeadTabType = 'website' | 'local_ads';

interface LeadsTabsProps {
  activeTab: LeadTabType;
  onTabChange: (tab: LeadTabType) => void;
  websiteCount?: number;
  localAdsCount?: number;
}

const tabs: { value: LeadTabType; label: string }[] = [
  { value: 'website', label: 'Website Leads' },
  { value: 'local_ads', label: 'Local Ads Leads' },
];

export default function LeadsTabs({
  activeTab,
  onTabChange,
  websiteCount,
  localAdsCount,
}: LeadsTabsProps) {
  const getCount = (tab: LeadTabType) => {
    if (tab === 'website') return websiteCount;
    if (tab === 'local_ads') return localAdsCount;
    return undefined;
  };

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex gap-4" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          const count = getCount(tab.value);

          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={`
                relative flex items-center gap-2 py-3 px-1 text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <span>{tab.label}</span>
              {count !== undefined && (
                <span
                  className={`
                    px-2 py-0.5 rounded-full text-xs font-medium
                    ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                  `}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
