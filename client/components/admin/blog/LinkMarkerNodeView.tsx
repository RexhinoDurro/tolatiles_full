'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Link2, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { useSuggestedLinkEntry } from './MediaPlanContext';

/**
 * In-editor stand-in for a suggested internal cross-link. Saved/public HTML
 * is an invisible <span data-link-marker="N" style="display:none"> -- this
 * chip is only visible while editing/reviewing.
 */
export default function LinkMarkerNodeView({ node, selected }: NodeViewProps) {
  const linkId = node.attrs.linkId;
  const entry = useSuggestedLinkEntry(linkId);

  const statusIcon =
    entry?.status === 'accepted' ? (
      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
    ) : entry?.status === 'rejected' ? (
      <XCircle className="w-3.5 h-3.5 text-gray-400" />
    ) : (
      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
    );

  return (
    <NodeViewWrapper as="span" contentEditable={false} className="inline-flex">
      <span
        className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs align-middle ${
          selected ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
        }`}
        title={entry ? `Suggested link to: ${entry.target_title}` : 'No suggested_links entry found'}
      >
        <Link2 className="w-3 h-3 text-gray-500" />
        {statusIcon}
        <span className="text-gray-600">{entry?.target_title || `Link #${String(linkId)}`}</span>
      </span>
    </NodeViewWrapper>
  );
}
