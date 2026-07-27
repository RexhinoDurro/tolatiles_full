'use client';

import { useState } from 'react';
import { Link2, Check, X, RefreshCw, Loader2 } from 'lucide-react';
import type { BlogPost } from '@/types/api';
import { api } from '@/lib/api';

interface SuggestedLinksPanelProps {
  post: BlogPost;
  onPostUpdated: (updated: BlogPost) => void;
}

export default function SuggestedLinksPanel({ post, onPostUpdated }: SuggestedLinksPanelProps) {
  const [busyId, setBusyId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const links = post.suggested_links || [];
  const pending = links.filter((l) => l.status === 'suggested');
  const resolved = links.filter((l) => l.status !== 'suggested');

  const handleResolve = async (linkId: number, linkAction: 'accept' | 'reject') => {
    setBusyId(linkId);
    setError(null);
    try {
      const updated = await api.resolveInternalLink(post.slug, { link_id: linkId, action: linkAction });
      onPostUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve link suggestion');
    } finally {
      setBusyId(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const updated = await api.refreshInternalLinkSuggestions(post.slug);
      onPostUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh suggestions');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Auto-suggested links to other Tola Tiles posts. External citation links are written
          directly into the article body during drafting and don&apos;t appear here.
        </p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 shrink-0"
        >
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      {links.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-sm">No internal link suggestions yet.</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-2">
              {pending.map((link) => (
                <div key={link.id} className="flex items-center gap-3 border border-amber-200 bg-amber-50 rounded-lg p-3">
                  <Link2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{link.target_title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      near: &quot;{link.anchor_text_hint}&quot; · score {link.score}
                    </p>
                  </div>
                  <button
                    onClick={() => handleResolve(link.id, 'accept')}
                    disabled={busyId === link.id}
                    className="p-1.5 text-green-600 hover:bg-green-100 rounded disabled:opacity-50"
                    title="Accept"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleResolve(link.id, 'reject')}
                    disabled={busyId === link.id}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded disabled:opacity-50"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {resolved.length > 0 && (
            <div className="space-y-1 pt-2">
              <p className="text-xs font-medium text-gray-400 uppercase">Resolved</p>
              {resolved.map((link) => (
                <div key={link.id} className="flex items-center gap-2 text-sm text-gray-500 py-1">
                  {link.status === 'accepted' ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  )}
                  <span className="truncate">{link.target_title}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
