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
import { GripVertical, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react';

export interface LineItemData {
  id: string; // temp client-side id for dnd
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  order: number;
  is_service?: boolean; // only for quotes
  detail_lines?: string[]; // only for quotes
}

interface LineItemsEditorProps {
  items: LineItemData[];
  onChange: (items: LineItemData[]) => void;
  currency?: string;
  showServiceToggle?: boolean; // quotes only
  className?: string;
}

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function lineTotal(item: LineItemData): number {
  if (item.is_service) return item.unit_price;
  return (item.quantity || 0) * (item.unit_price || 0);
}

// ── Sortable row ──────────────────────────────────────────────────────────────

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
  item, index, total, currency, showServiceToggle, onUpdate, onRemove, onMoveUp, onMoveDown,
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-200 rounded-lg p-3 bg-white cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        {/* Drag indicator — visual only */}
        <span className="mt-2 text-gray-300 flex-shrink-0 pointer-events-none">
          <GripVertical size={16} />
        </span>

        {/* Up/Down arrows */}
        <div className="flex flex-col gap-0.5 mt-1 flex-shrink-0 cursor-default">
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={index === total - 1}
            className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Fields */}
        <div className="flex-1 grid grid-cols-12 gap-2 cursor-auto">
          {/* Name */}
          <div className={showServiceToggle ? 'col-span-4' : 'col-span-5'}>
            <input
              type="text"
              value={item.name}
              onChange={e => onUpdate(item.id, 'name', e.target.value)}
              placeholder="Item name"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Quantity (hidden for services) */}
          {!item.is_service && (
            <div className="col-span-2">
              <input
                type="number"
                value={item.quantity}
                min="0"
                step="0.01"
                onChange={e => onUpdate(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                placeholder="Qty"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
              />
            </div>
          )}

          {/* Unit price */}
          <div className={item.is_service ? 'col-span-4' : 'col-span-3'}>
            <input
              type="number"
              value={item.unit_price}
              min="0"
              step="0.01"
              onChange={e => onUpdate(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
              placeholder="Price"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
            />
          </div>

          {/* Line total */}
          <div className="col-span-2 flex items-center justify-end">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {formatCurrency(lineTotal(item), currency)}
            </span>
          </div>
        </div>

        {/* Remove */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="mt-1.5 flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Description */}
      <div className="mt-2 ml-12 cursor-auto">
        <input
          type="text"
          value={item.description}
          onChange={e => onUpdate(item.id, 'description', e.target.value)}
          placeholder="Description (optional)"
          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-600"
        />
      </div>

      {/* Service toggle */}
      {showServiceToggle && (
        <div className="mt-2 ml-12 flex items-center gap-2 cursor-auto">
          <input
            id={`service-${item.id}`}
            type="checkbox"
            checked={!!item.is_service}
            onChange={e => onUpdate(item.id, 'is_service', e.target.checked)}
            className="rounded"
          />
          <label htmlFor={`service-${item.id}`} className="text-xs text-gray-500 select-none cursor-pointer">
            Service (flat price, no quantity)
          </label>
        </div>
      )}
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
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState<string>('1');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newDesc, setNewDesc] = useState('');
  const [newIsService, setNewIsService] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        order: idx,
      }));
      onChange(reordered);
    }
  }

  function handleUpdate(id: string, field: keyof LineItemData, value: unknown) {
    onChange(items.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function handleRemove(id: string) {
    onChange(items.filter(item => item.id !== id).map((item, idx) => ({ ...item, order: idx })));
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    const next = arrayMove(items, index, index - 1).map((item, idx) => ({ ...item, order: idx }));
    onChange(next);
  }

  function handleMoveDown(index: number) {
    if (index === items.length - 1) return;
    const next = arrayMove(items, index, index + 1).map((item, idx) => ({ ...item, order: idx }));
    onChange(next);
  }

  function handleAdd() {
    if (!newName.trim()) return;
    const newItem: LineItemData = {
      id: `new-${Date.now()}-${Math.random()}`,
      name: newName.trim(),
      description: newDesc.trim(),
      quantity: newIsService ? 1 : parseFloat(newQty) || 1,
      unit_price: parseFloat(newPrice) || 0,
      order: items.length,
      is_service: showServiceToggle ? newIsService : undefined,
    };
    onChange([...items, newItem]);
    setNewName('');
    setNewQty('1');
    setNewPrice('');
    setNewDesc('');
    setNewIsService(false);
    nameRef.current?.focus();
  }

  function handleAddKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  }

  const newTotal = newIsService
    ? parseFloat(newPrice) || 0
    : (parseFloat(newQty) || 0) * (parseFloat(newPrice) || 0);

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Scrollable items list */}
      <div className="overflow-y-auto max-h-[420px] space-y-2 pr-1 pb-2">
        {items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">No items yet. Add one below.</p>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
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
          </SortableContext>
        </DndContext>
      </div>

      {/* Sticky add-item form */}
      <div className="sticky bottom-0 bg-white border-t-2 border-blue-100 pt-3 mt-1">
        <div className="flex items-end gap-2">
          {/* Name */}
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Item name *</label>
            <input
              ref={nameRef}
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={handleAddKeyDown}
              placeholder="e.g. Floor tile installation"
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Qty (hidden for service) */}
          {!newIsService && (
            <div className="w-20">
              <label className="block text-xs text-gray-500 mb-1">Qty</label>
              <input
                type="number"
                value={newQty}
                min="0"
                step="0.01"
                onChange={e => setNewQty(e.target.value)}
                onKeyDown={handleAddKeyDown}
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              />
            </div>
          )}

          {/* Price */}
          <div className="w-28">
            <label className="block text-xs text-gray-500 mb-1">
              {newIsService ? 'Flat price' : 'Unit price'}
            </label>
            <input
              type="number"
              value={newPrice}
              min="0"
              step="0.01"
              onChange={e => setNewPrice(e.target.value)}
              onKeyDown={handleAddKeyDown}
              placeholder="0.00"
              className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            />
          </div>

          {/* Total preview */}
          <div className="w-24 pb-0.5 text-right">
            <div className="text-xs text-gray-400 mb-1">Total</div>
            <div className="text-sm font-medium text-gray-700">
              {formatCurrency(newTotal, currency)}
            </div>
          </div>

          {/* Add button */}
          <div className="pb-0.5">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={15} />
              Add
            </button>
          </div>
        </div>

        {/* Description + service toggle row */}
        <div className="flex items-center gap-3 mt-2">
          <input
            type="text"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            onKeyDown={handleAddKeyDown}
            placeholder="Description (optional)"
            className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-600"
          />
          {showServiceToggle && (
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none whitespace-nowrap">
              <input
                type="checkbox"
                checked={newIsService}
                onChange={e => setNewIsService(e.target.checked)}
                className="rounded"
              />
              Service (flat price)
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
