'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Plus, GripVertical, X, Loader2, Archive, RotateCcw, Star } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '@/lib/api';
import type { Deal, DealStage, DealCreate, Customer } from '@/types/api';

// ==================== STAGE CONFIG ====================

const STAGES: { id: DealStage; label: string; color: string; borderColor: string; headerColor: string }[] = [
  { id: 'new_deal',           label: 'New Deal',           color: 'border-gray-300',   borderColor: 'border-l-gray-400',   headerColor: 'text-gray-700' },
  { id: 'estimate_scheduled', label: 'Estimate Scheduled', color: 'border-blue-200',   borderColor: 'border-l-blue-400',   headerColor: 'text-blue-700' },
  { id: 'quote_sent',         label: 'Quote Sent',         color: 'border-indigo-200', borderColor: 'border-l-indigo-500', headerColor: 'text-indigo-700' },
  { id: 'job_scheduled',      label: 'Job Scheduled',      color: 'border-purple-200', borderColor: 'border-l-purple-500', headerColor: 'text-purple-700' },
  { id: 'job_completed',      label: 'Job Completed',      color: 'border-green-200',  borderColor: 'border-l-green-500',  headerColor: 'text-green-700' },
  { id: 'job_lost',           label: 'Job Lost',           color: 'border-red-200',    borderColor: 'border-l-red-400',    headerColor: 'text-red-700' },
];

const STAGE_DOT_COLORS: Record<DealStage, string> = {
  new_deal:           'bg-gray-400',
  estimate_scheduled: 'bg-blue-400',
  quote_sent:         'bg-indigo-500',
  job_scheduled:      'bg-purple-500',
  job_completed:      'bg-green-500',
  job_lost:           'bg-red-400',
};

// ==================== LABEL MAPS ====================

const leadSourceColorsList = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-orange-100 text-orange-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
];

function getLeadSourceColor(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = slug.charCodeAt(i) + hash * 31;
  return leadSourceColorsList[Math.abs(hash) % leadSourceColorsList.length];
}

// ==================== HELPERS ====================

function formatCurrency(v: number | null | undefined) {
  if (!v) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}

function daysInStage(updatedAt: string): number {
  return Math.floor((Date.now() - new Date(updatedAt).getTime()) / 86400000);
}

function daysBadge(days: number) {
  if (days < 7) return { label: `${days}d`, className: 'bg-green-100 text-green-700' };
  if (days < 14) return { label: `${days}d`, className: 'bg-yellow-100 text-yellow-700' };
  if (days < 30) return { label: `${days}d`, className: 'bg-orange-100 text-orange-700' };
  return { label: `${days}d`, className: 'bg-red-100 text-red-700' };
}

// ==================== DEAL CARD ====================

interface DealCardProps {
  deal: Deal;
  onDelete: (id: number) => void;
  onArchive?: (id: number) => Promise<void>;
  onReview?: (id: number) => Promise<void>;
  showReviewButton?: boolean;
}

function DealCard({ deal, onDelete, onArchive, onReview, showReviewButton }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: deal.id });
  const [archiving, setArchiving] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const stageConfig = STAGES.find((s) => s.id === deal.stage);
  const borderColor = stageConfig?.borderColor ?? 'border-l-gray-400';

  const days = daysInStage(deal.updated_at);
  const badge = daysBadge(days);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onArchive) return;
    setArchiving(true);
    try {
      await onArchive(deal.id);
    } finally {
      setArchiving(false);
    }
  };

  const handleReview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onReview) return;
    setReviewing(true);
    try {
      await onReview(deal.id);
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border border-gray-200 border-l-4 ${borderColor} p-3 shadow-sm group relative`}
    >
      {/* Action buttons (top-right) */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {showReviewButton && onReview && (
          <button
            onClick={handleReview}
            disabled={reviewing}
            className="p-1 text-gray-300 hover:text-yellow-500"
            title="Mark as Customer Reviewed"
          >
            {reviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
          </button>
        )}
        {onArchive && (
          <button
            onClick={handleArchive}
            disabled={archiving}
            className="p-1 text-gray-300 hover:text-amber-500"
            title="Archive deal"
          >
            {archiving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      <div className="flex items-start gap-2 pr-14">
        <div className="flex items-start gap-2 flex-1 min-w-0 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
          <GripVertical className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <Link
              href={`/admin/crm/deals/${deal.id}`}
              className="font-semibold text-sm text-gray-900 hover:text-blue-600 block truncate"
            >
              {deal.customer_name}
            </Link>
            {deal.value && (
              <p className="text-xs font-semibold text-green-600 mt-0.5">{formatCurrency(deal.value)}</p>
            )}
            {(deal.job_type || deal.estimated_sqft) && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {[deal.job_type || null, deal.estimated_sqft ? `${deal.estimated_sqft} sqft` : null].filter(Boolean).join(' · ')}
              </p>
            )}

            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {/* Days in stage badge */}
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${badge.className}`}>
                {badge.label}
              </span>
              {/* Lead source pill */}
              {deal.lead_source && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${getLeadSourceColor(deal.lead_source)}`}>
                  {deal.lead_source}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Delete button (only on hover, no archive prop overlap) */}
        {!onArchive && !onReview && (
          <button
            onClick={() => onDelete(deal.id)}
            className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== NEW DEAL FORM ====================

interface NewDealFormProps {
  stage: DealStage;
  customers: Customer[];
  onSubmit: (data: DealCreate) => Promise<void>;
  onCancel: () => void;
}

function NewDealForm({ stage, customers, onSubmit, onCancel }: NewDealFormProps) {
  const [customerId, setCustomerId] = useState<number>(0);
  const [address, setAddress] = useState('');
  const [value, setValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !address) return;
    setIsSaving(true);
    try {
      await onSubmit({
        customer_id: customerId,
        address,
        stage,
        value: value ? Number(value) : null,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-blue-300 p-3 shadow-sm space-y-2">
      <select
        value={customerId}
        onChange={(e) => setCustomerId(Number(e.target.value))}
        className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
        autoFocus
      >
        <option value="">Select customer...</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Job address"
        className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Value ($) optional"
        min="0"
        className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={isSaving || !customerId || !address} className="flex-1 py-1.5 bg-blue-600 text-white rounded text-sm font-medium disabled:opacity-50">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Add'}
        </button>
        <button type="button" onClick={onCancel} className="px-3 py-1.5 border rounded text-sm text-gray-600 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ==================== REVIEWED SECTION ====================

interface ReviewedSectionProps {
  onRefresh: () => void;
  onArchive: (id: number) => Promise<void>;
  refreshKey?: number;
}

function ReviewedSection({ onRefresh, onArchive, refreshKey }: ReviewedSectionProps) {
  const [reviewedDeals, setReviewedDeals] = useState<Deal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const fetchReviewed = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getReviewedDeals();
      setReviewedDeals(data);
      setIsLoaded(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // When a deal is newly reviewed, refresh the list if open or reset so next open refetches
  useEffect(() => {
    if (!refreshKey) return;
    if (detailsRef.current?.open) {
      fetchReviewed();
    } else {
      setIsLoaded(false);
    }
  }, [refreshKey, fetchReviewed]);

  const handleToggle = useCallback(async (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    const open = (e.target as HTMLDetailsElement).open;
    if (open && !isLoaded) {
      await fetchReviewed();
    }
  }, [isLoaded, fetchReviewed]);

  const handleUnreview = async (id: number) => {
    await api.unreviewDeal(id);
    setReviewedDeals((prev) => prev.filter((d) => d.id !== id));
    onRefresh();
  };

  const handleArchiveReviewed = async (id: number) => {
    await onArchive(id);
    setReviewedDeals((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <details ref={detailsRef} className="mt-4 bg-white rounded-xl border border-yellow-200" onToggle={handleToggle}>
      <summary className="px-4 py-3 font-semibold text-gray-700 cursor-pointer select-none flex items-center gap-2">
        <Star className="w-4 h-4 text-yellow-500" />
        Customer Reviewed ({reviewedDeals.length > 0 ? reviewedDeals.length : '…'})
      </summary>

      <div className="p-4 border-t border-yellow-100">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
          </div>
        ) : reviewedDeals.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No customer-reviewed deals.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {reviewedDeals.map((deal) => {
              const stageConfig = STAGES.find((s) => s.id === deal.stage);
              return (
                <div
                  key={deal.id}
                  className={`bg-white rounded-lg border border-gray-200 border-l-4 ${stageConfig?.borderColor ?? 'border-l-gray-400'} p-3 shadow-sm`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{deal.customer_name}</p>
                      {deal.value && (
                        <p className="text-xs font-semibold text-green-600 mt-0.5">{formatCurrency(deal.value)}</p>
                      )}
                      {deal.job_type && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{deal.job_type}</p>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`w-2 h-2 rounded-full ${STAGE_DOT_COLORS[deal.stage]}`} />
                        <span className="text-xs text-gray-500">{stageConfig?.label}</span>
                      </div>
                      {deal.reviewed_at && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Reviewed {new Date(deal.reviewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleUnreview(deal.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100"
                        title="Remove review mark"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Unreview
                      </button>
                      <button
                        onClick={() => handleArchiveReviewed(deal.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100"
                        title="Archive"
                      >
                        <Archive className="w-3 h-3" />
                        Archive
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </details>
  );
}

// ==================== ARCHIVE SECTION ====================

interface ArchiveSectionProps {
  onRefresh: () => void;
}

function ArchiveSection({ onRefresh }: ArchiveSectionProps) {
  const [archivedDeals, setArchivedDeals] = useState<Deal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const handleToggle = useCallback(async (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    const open = (e.target as HTMLDetailsElement).open;
    if (open && !isLoaded) {
      setIsLoading(true);
      try {
        const data = await api.getArchivedDeals();
        setArchivedDeals(data);
        setIsLoaded(true);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isLoaded]);

  const handleUnarchive = async (id: number) => {
    await api.unarchiveDeal(id);
    setArchivedDeals((prev) => prev.filter((d) => d.id !== id));
    onRefresh();
  };

  const filtered = useMemo(() => {
    return archivedDeals.filter((d) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        d.customer_name.toLowerCase().includes(q) ||
        (d.job_type && d.job_type.toLowerCase().includes(q));

      const archivedDate = d.archived_at ? new Date(d.archived_at) : null;
      const matchesFrom = !dateFrom || (archivedDate && archivedDate >= new Date(dateFrom));
      const matchesTo = !dateTo || (archivedDate && archivedDate <= new Date(dateTo + 'T23:59:59'));

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [archivedDeals, searchQuery, dateFrom, dateTo]);

  return (
    <details ref={detailsRef} className="mt-6 bg-white rounded-xl border border-amber-200" onToggle={handleToggle}>
      <summary className="px-4 py-3 font-semibold text-gray-700 cursor-pointer select-none flex items-center gap-2">
        <Archive className="w-4 h-4 text-amber-500" />
        Archived Deals ({archivedDeals.length > 0 ? archivedDeals.length : '…'})
      </summary>

      <div className="p-4 border-t border-amber-100">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              <input
                type="text"
                placeholder="Search by customer or job type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-48 px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-500">From:</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div className="flex items-center gap-1">
                <label className="text-xs text-gray-500">To:</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                {archivedDeals.length === 0 ? 'No archived deals.' : 'No results match your filters.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {filtered.map((deal) => {
                  const stageConfig = STAGES.find((s) => s.id === deal.stage);
                  return (
                    <div
                      key={deal.id}
                      className={`bg-white rounded-lg border border-gray-200 border-l-4 ${stageConfig?.borderColor ?? 'border-l-gray-400'} p-3 shadow-sm`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{deal.customer_name}</p>
                          {deal.value && (
                            <p className="text-xs font-semibold text-green-600 mt-0.5">{formatCurrency(deal.value)}</p>
                          )}
                          {deal.job_type && (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{deal.job_type}</p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`w-2 h-2 rounded-full ${STAGE_DOT_COLORS[deal.stage]}`} />
                            <span className="text-xs text-gray-500">{stageConfig?.label}</span>
                          </div>
                          {deal.archived_at && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Archived {new Date(deal.archived_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleUnarchive(deal.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 flex-shrink-0"
                          title="Unarchive"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restore
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </details>
  );
}

// ==================== MAIN PIPELINE BOARD ====================

interface PipelineBoardProps {
  initialDeals: Deal[];
  customers: Customer[];
  onRefresh: () => void;
  onArchive?: (id: number) => Promise<void>;
}

export default function PipelineBoard({ initialDeals, customers, onRefresh, onArchive }: PipelineBoardProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [addingToStage, setAddingToStage] = useState<DealStage | null>(null);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  // Filter state
  const [filterJobType, setFilterJobType] = useState('');
  const [filterLeadSource, setFilterLeadSource] = useState('');
  const [filterMinValue, setFilterMinValue] = useState('');
  const [filterMaxValue, setFilterMaxValue] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  // Filtered deals
  const filteredDeals = useMemo(() => {
    return deals.filter((d) => {
      if (filterJobType && d.job_type !== filterJobType) return false;
      if (filterLeadSource && d.lead_source !== filterLeadSource) return false;
      if (filterMinValue && (d.value == null || d.value < Number(filterMinValue))) return false;
      if (filterMaxValue && (d.value == null || d.value > Number(filterMaxValue))) return false;
      return true;
    });
  }, [deals, filterJobType, filterLeadSource, filterMinValue, filterMaxValue]);

  // Unique job types and lead sources from current deals for filter options
  const uniqueJobTypes = useMemo(() => Array.from(new Set(deals.map((d) => d.job_type).filter(Boolean))), [deals]);
  const uniqueLeadSources = useMemo(() => Array.from(new Set(deals.map((d) => d.lead_source).filter(Boolean))), [deals]);

  // Stats (computed from all active deals, no filters)
  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const activeDeals = deals.filter((d) => d.stage !== 'job_completed' && d.stage !== 'job_lost');
    const totalActiveValue = activeDeals.reduce((sum, d) => sum + (parseFloat(String(d.value)) || 0), 0);

    const completedThisMonth = deals.filter((d) => {
      if (d.stage !== 'job_completed') return false;
      return new Date(d.updated_at) >= startOfMonth;
    });
    const completedThisMonthValue = completedThisMonth.reduce((sum, d) => sum + (parseFloat(String(d.value)) || 0), 0);

    return {
      totalActiveValue,
      completedThisMonthValue,
      activeCount: activeDeals.length,
      completedThisMonthCount: completedThisMonth.length,
    };
  }, [deals]);

  const getDealsByStage = (stage: DealStage) =>
    filteredDeals.filter((d) => d.stage === stage).sort((a, b) => a.order - b.order);

  const getStageTotalValue = (stage: DealStage) =>
    getDealsByStage(stage).reduce((sum, d) => sum + (parseFloat(String(d.value)) || 0), 0);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveDeal(deals.find((d) => d.id === active.id) ?? null);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveDeal(null);
    if (!over || active.id === over.id) return;

    const draggedDeal = deals.find((d) => d.id === active.id);
    if (!draggedDeal) return;

    let newStage: DealStage = draggedDeal.stage;
    const overDeal = deals.find((d) => d.id === over.id);
    if (overDeal) {
      newStage = overDeal.stage;
    } else {
      const stageId = String(over.id) as DealStage;
      if (STAGES.find((s) => s.id === stageId)) newStage = stageId;
    }

    if (newStage === draggedDeal.stage) return;

    setDeals((prev) => prev.map((d) => (d.id === draggedDeal.id ? { ...d, stage: newStage } : d)));

    try {
      await api.updateDealStage(draggedDeal.id, newStage);
    } catch {
      setDeals((prev) => prev.map((d) => (d.id === draggedDeal.id ? { ...d, stage: draggedDeal.stage } : d)));
    }
  };

  const handleAddDeal = async (data: DealCreate) => {
    const deal = await api.createDeal(data);
    setDeals((prev) => [...prev, deal]);
    setAddingToStage(null);
  };

  const handleDeleteDeal = async (id: number) => {
    if (!confirm('Delete this deal?')) return;
    setDeals((prev) => prev.filter((d) => d.id !== id));
    try {
      await api.deleteDeal(id);
    } catch {
      onRefresh();
    }
  };

  const handleArchiveDeal = async (id: number) => {
    if (onArchive) {
      await onArchive(id);
      setDeals((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const handleReviewDeal = async (id: number) => {
    // Optimistic update: remove from board immediately
    const deal = deals.find((d) => d.id === id);
    setDeals((prev) => prev.filter((d) => d.id !== id));
    try {
      await api.reviewDeal(id);
      setReviewRefreshKey((k) => k + 1);
    } catch {
      // Restore card if API failed
      if (deal) setDeals((prev) => [...prev, deal]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Total Active Value</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalActiveValue) ?? '$0'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Completed This Month</p>
          <p className="text-xl font-bold text-green-600 mt-1">{formatCurrency(stats.completedThisMonthValue) ?? '$0'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Active Deals</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{stats.activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Completed This Month</p>
          <p className="text-xl font-bold text-green-600 mt-1">{stats.completedThisMonthCount} deals</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
        <select
          value={filterJobType}
          onChange={(e) => setFilterJobType(e.target.value)}
          className="px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Job Types</option>
          {uniqueJobTypes.map((jt) => (
            <option key={jt} value={jt}>{jt}</option>
          ))}
        </select>
        <select
          value={filterLeadSource}
          onChange={(e) => setFilterLeadSource(e.target.value)}
          className="px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Lead Sources</option>
          {uniqueLeadSources.map((ls) => (
            <option key={ls} value={ls}>{ls}</option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">$</span>
          <input
            type="number"
            value={filterMinValue}
            onChange={(e) => setFilterMinValue(e.target.value)}
            placeholder="Min value"
            min="0"
            className="w-24 px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">–</span>
          <input
            type="number"
            value={filterMaxValue}
            onChange={(e) => setFilterMaxValue(e.target.value)}
            placeholder="Max value"
            min="0"
            className="w-24 px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {(filterJobType || filterLeadSource || filterMinValue || filterMaxValue) && (
          <button
            onClick={() => { setFilterJobType(''); setFilterLeadSource(''); setFilterMinValue(''); setFilterMaxValue(''); }}
            className="px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Pipeline columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-row overflow-x-auto gap-4 h-[calc(100vh-280px)]">
          {STAGES.map((stage) => {
            const stageDeals = getDealsByStage(stage.id);
            const stageTotal = getStageTotalValue(stage.id);
            const formattedTotal = stageTotal > 0 ? ` · ${formatCurrency(stageTotal)}` : '';

            return (
              <div
                key={stage.id}
                className={`flex-shrink-0 w-72 flex flex-col bg-white rounded-xl border ${stage.color} shadow-sm`}
              >
                {/* Column header */}
                <div className="px-3 py-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STAGE_DOT_COLORS[stage.id]}`} />
                      <h3 className={`font-semibold text-sm ${stage.headerColor} truncate`}>
                        {stage.label} ({stageDeals.length}){formattedTotal}
                      </h3>
                    </div>
                    <button
                      onClick={() => setAddingToStage(stage.id)}
                      className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
                      title="Add deal"
                    >
                      <Plus className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Cards area */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  <SortableContext items={stageDeals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                    {stageDeals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        onDelete={handleDeleteDeal}
                        onArchive={onArchive ? handleArchiveDeal : undefined}
                        onReview={handleReviewDeal}
                        showReviewButton={true}
                      />
                    ))}
                  </SortableContext>

                  {addingToStage === stage.id && (
                    <NewDealForm
                      stage={stage.id}
                      customers={customers}
                      onSubmit={handleAddDeal}
                      onCancel={() => setAddingToStage(null)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeDeal && (
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-lg opacity-90">
              <p className="font-semibold text-sm text-gray-900">{activeDeal.customer_name}</p>
              {activeDeal.job_type && (
                <p className="text-xs text-gray-500">{activeDeal.job_type}</p>
              )}
              {activeDeal.value && (
                <p className="text-xs font-semibold text-green-600">{formatCurrency(activeDeal.value)}</p>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Reviewed section */}
      {onArchive && <ReviewedSection onRefresh={onRefresh} onArchive={handleArchiveDeal} refreshKey={reviewRefreshKey} />}

      {/* Archive section */}
      <ArchiveSection onRefresh={onRefresh} />
    </div>
  );
}
