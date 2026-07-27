'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { ImageIcon, Video, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { useMediaPlanEntry } from './MediaPlanContext';

/**
 * In-editor stand-in for a media placeholder. The saved/public HTML is just
 * an invisible <span data-media-marker="N" style="display:none"> (produced
 * by the mediaMarker extension's renderHTML) -- this badge exists purely so
 * an editor can see and click on a pending placeholder while drafting.
 */
export default function MediaMarkerNodeView({ node, selected }: NodeViewProps) {
  const mediaId = node.attrs.mediaId;
  const entry = useMediaPlanEntry(mediaId);

  const statusIcon =
    entry?.status === 'resolved' ? (
      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
    ) : entry?.status === 'skipped' ? (
      <XCircle className="w-4 h-4 text-gray-400 shrink-0" />
    ) : (
      <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
    );

  return (
    <NodeViewWrapper as="div" contentEditable={false} className="my-2">
      <div
        className={`flex items-center gap-2 rounded-lg border-2 border-dashed px-3 py-2 text-sm ${
          selected ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
        }`}
      >
        {entry?.type === 'video' ? (
          <Video className="w-4 h-4 text-gray-500 shrink-0" />
        ) : (
          <ImageIcon className="w-4 h-4 text-gray-500 shrink-0" />
        )}
        <span className="font-medium text-gray-700 shrink-0">
          {entry?.type === 'video' ? 'Video' : 'Image'} placeholder #{String(mediaId)}
        </span>
        {statusIcon}
        {entry?.prompt && (
          <span className="truncate text-gray-500 italic">&quot;{entry.prompt}&quot;</span>
        )}
        {!entry && (
          <span className="text-red-500">No media_plan entry found for id {String(mediaId)}</span>
        )}
      </div>
    </NodeViewWrapper>
  );
}
