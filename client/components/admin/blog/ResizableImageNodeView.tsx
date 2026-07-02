'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useRef, useCallback } from 'react';
import { GripVertical } from 'lucide-react';

/**
 * In-editor rendering for images. Adds:
 *  - a drag handle (data-drag-handle) so the image can be dragged/dropped
 *    to a new position within the content (DnD placement)
 *  - corner/edge resize handles that update the `width` attribute live
 *  - a selection ring and alignment via the wrapper
 *
 * The saved/public HTML is produced by the extension's renderHTML (inline
 * styles), NOT by this node view — this only controls the editing experience.
 */
export default function ResizableImageNodeView({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
  const { src, alt, title, width, align } = node.attrs as {
    src: string;
    alt: string | null;
    title: string | null;
    width: string | null;
    align: string;
  };

  const imgRef = useRef<HTMLImageElement>(null);

  const justify =
    align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';

  const startResize = useCallback(
    (e: React.PointerEvent, side: 'left' | 'right') => {
      e.preventDefault();
      e.stopPropagation();
      const img = imgRef.current;
      if (!img) return;

      const startX = e.clientX;
      const startWidth = img.offsetWidth;
      // Constrain to the editor column width.
      const maxWidth =
        img.closest('.ProseMirror')?.clientWidth || startWidth * 3;

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const delta = side === 'left' ? -dx : dx;
        const next = Math.round(
          Math.max(60, Math.min(startWidth + delta, maxWidth))
        );
        updateAttributes({ width: `${next}px` });
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [updateAttributes]
  );

  const handleClass =
    'absolute z-20 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow';

  return (
    <NodeViewWrapper
      className="resizable-image"
      style={{ display: 'flex', justifyContent: justify, margin: '0.75rem 0' }}
      data-align={align}
    >
      <div
        className="relative inline-block group"
        style={{ width: width || 'auto', maxWidth: '100%', lineHeight: 0 }}
      >
        {/* Drag handle — repositions the image within the content */}
        <div
          data-drag-handle
          contentEditable={false}
          title="Drag to move image"
          className="absolute top-1 left-1 z-20 cursor-grab active:cursor-grabbing rounded bg-black/55 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <img
          ref={imgRef}
          src={src}
          alt={alt || ''}
          title={title || undefined}
          draggable={false}
          className={`block h-auto w-full rounded-lg ${
            selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
          }`}
        />

        {/* Resize handles — only when the image is selected */}
        {selected && (
          <>
            <span
              onPointerDown={(e) => startResize(e, 'right')}
              className={`${handleClass} -right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize`}
            />
            <span
              onPointerDown={(e) => startResize(e, 'left')}
              className={`${handleClass} -left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize`}
            />
            <span
              onPointerDown={(e) => startResize(e, 'right')}
              className={`${handleClass} -right-1.5 -bottom-1.5 cursor-nwse-resize`}
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}
