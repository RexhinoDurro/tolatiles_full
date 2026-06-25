'use client';

import { useState, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Package,
  Wrench,
  Check,
} from 'lucide-react';

export interface LineItemData {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  order: number;
  is_service?: boolean;
  detail_lines?: string[];
}

interface LineItemsEditorProps {
  items: LineItemData[];
  onChange: (items: LineItemData[]) => void;
  currency?: string;
  showServiceToggle?: boolean;
  className?: string;
}

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function lineTotal(item: LineItemData): number {
  if (item.is_service) return item.unit_price;
  return (item.quantity || 0) * (item.unit_price || 0);
}

// ── Type pill ────────────────────────────────────────────────────────────────

function TypePill({
  isService,
  onChange,
}: {
  isService: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="inline-flex rounded-lg overflow-hidden border border-gray-200 text-xs font-medium flex-shrink-0">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors ${
          isService
            ? 'bg-violet-600 text-white'
            : 'bg-white text-gray-500 hover:bg-gray-50'
        }`}
      >
        <Wrench size={11} />
        Service
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex items-center gap-1 px-2.5 py-1.5 border-l border-gray-200 transition-colors ${
          !isService
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-500 hover:bg-gray-50'
        }`}
      >
        <Package size={11} />
        Product
      </button>
    </div>
  );
}

// ── Sortable row (existing items) ─────────────────────────────────────────────

interface SortableRowProps {
  item: LineItemData;
  index: number;
  total: number;
  currency: string;
  showServiceToggle: boolean;
  onUpdate: (id: string, field: keyof LineItemData, value: unknown) => void;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

function SortableRow({
  item,
  index,
  total,
  currency,
  showServiceToggle,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const itemLineTotal = lineTotal(item);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden"
    >
      {/* Header bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100">
        {/* Drag handle — hidden on mobile */}
        <span
          className="hidden sm:flex text-gray-300 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={15} />
        </span>

        {/* Move buttons */}
        <div className="flex gap-0.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronUp size={13} />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={index === total - 1}
            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronDown size={13} />
          </button>
        </div>

        <span className="text-xs font-semibold text-gray-400 flex-1">
          #{index + 1}
        </span>

        {/* Type indicator */}
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
            item.is_service
              ? 'bg-violet-100 text-violet-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {item.is_service ? 'Service' : 'Product'}
        </span>

        {/* Line total */}
        <span className="text-sm font-bold text-gray-900 flex-shrink-0">
          {formatCurrency(itemLineTotal, currency)}
        </span>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2.5">
        {/* Name */}
        <input
          type="text"
          value={item.name}
          onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
          placeholder="Item name *"
          className="w-full px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
        />

        {/* Description */}
        <input
          type="text"
          value={item.description}
          onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
          placeholder="Description (optional)"
          className="w-full px-3 py-2 text-xs border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-600 bg-gray-50 placeholder:text-gray-400"
        />

        {/* Price row */}
        <div className="flex items-end gap-2">
          {/* Qty — only for products */}
          {!item.is_service && (
            <div className="w-20 flex-shrink-0">
              <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
              <input
                type="number"
                value={item.quantity}
                min="0"
                step="0.01"
                onChange={(e) => onUpdate(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              />
            </div>
          )}

          {/* Price */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {item.is_service ? 'Flat price' : 'Unit price'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">$</span>
              <input
                type="number"
                value={item.unit_price}
                min="0"
                step="0.01"
                onChange={(e) => onUpdate(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Type toggle */}
          {showServiceToggle && (
            <div className="flex-shrink-0 pb-0.5">
              <TypePill
                isService={!!item.is_service}
                onChange={(v) => onUpdate(item.id, 'is_service', v)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Add-item panel ────────────────────────────────────────────────────────────

interface AddItemPanelProps {
  currency: string;
  showServiceToggle: boolean;
  onAdd: (item: Omit<LineItemData, 'id' | 'order'>) => void;
}

function AddItemPanel({ currency, showServiceToggle, onAdd }: AddItemPanelProps) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [qty, setQty] = useState('1');
  const [price, setPrice] = useState('');
  const [isService, setIsService] = useState(true); // default: service
  const [added, setAdded] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const canAdd = name.trim().length > 0;
  const previewTotal = isService
    ? parseFloat(price) || 0
    : (parseFloat(qty) || 0) * (parseFloat(price) || 0);

  function submit() {
    if (!canAdd) return;
    onAdd({
      name: name.trim(),
      description: desc.trim(),
      quantity: isService ? 1 : parseFloat(qty) || 1,
      unit_price: parseFloat(price) || 0,
      is_service: showServiceToggle ? isService : undefined,
    });
    setName('');
    setDesc('');
    setQty('1');
    setPrice('');
    setIsService(true);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
    nameRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-blue-200 bg-gradient-to-b from-blue-50/60 to-white p-4 space-y-3">
      {/* Panel title + type selector */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
          Add item
        </p>
        {showServiceToggle && (
          <TypePill isService={isService} onChange={setIsService} />
        )}
      </div>

      {/* Name */}
      <input
        ref={nameRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={isService ? 'e.g. Floor tile installation' : 'e.g. 12×24 Porcelain tile'}
        className="w-full px-3 py-2.5 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-gray-400"
      />

      {/* Description */}
      <input
        type="text"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Description (optional)"
        className="w-full px-3 py-2 text-xs border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-600 bg-white placeholder:text-gray-400"
      />

      {/* Qty + Price in one clean row */}
      <div className="flex gap-2 items-end">
        {/* Qty — only for products */}
        {!isService && (
          <div className="w-20 flex-shrink-0">
            <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
            <input
              type="number"
              value={qty}
              min="0"
              step="0.01"
              onChange={(e) => setQty(e.target.value)}
              onKeyDown={onKeyDown}
              className="w-full px-2 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center bg-white"
            />
          </div>
        )}

        {/* Price */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {isService ? 'Flat price' : 'Unit price'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">$</span>
            <input
              type="number"
              value={price}
              min="0"
              step="0.01"
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Total pill */}
        <div className="flex-shrink-0 pb-0.5">
          <div className="px-3 py-2.5 text-sm font-bold text-gray-800 bg-gray-100 rounded-lg min-w-[72px] text-right tabular-nums">
            {formatCurrency(previewTotal, currency)}
          </div>
        </div>
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={submit}
        disabled={!canAdd}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
          added
            ? 'bg-green-500 text-white scale-[0.99]'
            : canAdd
            ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99]'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {added ? (
          <>
            <Check size={16} />
            Added!
          </>
        ) : (
          <>
            <Plus size={16} />
            Add Item
          </>
        )}
      </button>
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────────

export default function LineItemsEditor({
  items,
  onChange,
  currency = 'USD',
  showServiceToggle = false,
  className = '',
}: LineItemsEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        order: idx,
      }));
      onChange(reordered);
    }
  }

  function handleUpdate(id: string, field: keyof LineItemData, value: unknown) {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function handleRemove(id: string) {
    onChange(
      items.filter((item) => item.id !== id).map((item, idx) => ({ ...item, order: idx })),
    );
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    onChange(arrayMove(items, index, index - 1).map((item, idx) => ({ ...item, order: idx })));
  }

  function handleMoveDown(index: number) {
    if (index === items.length - 1) return;
    onChange(arrayMove(items, index, index + 1).map((item, idx) => ({ ...item, order: idx })));
  }

  function handleAdd(newItem: Omit<LineItemData, 'id' | 'order'>) {
    onChange([
      ...items,
      {
        ...newItem,
        id: `new-${Date.now()}-${Math.random()}`,
        order: items.length,
      },
    ]);
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Add-item panel — always at the top */}
      <AddItemPanel
        currency={currency}
        showServiceToggle={showServiceToggle}
        onAdd={handleAdd}
      />

      {/* Divider + count */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 pt-1">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs font-medium text-gray-400">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
      )}

      {/* Items list — below the add panel */}
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          No items yet — add one above.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item, index) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  index={index}
                  total={items.length}
                  currency={currency}
                  showServiceToggle={showServiceToggle}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
