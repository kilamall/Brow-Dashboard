import { ReactNode } from 'react';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DraggableServiceItem {
  id: string;
  content: ReactNode;
}

interface SortableServiceProps {
  id: string;
  children: ReactNode;
  className?: string;
}

function SortableService({ id, children, className = '' }: SortableServiceProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-move group relative ${className}`}
    >
      {children}
      {/* Drag indicator - more visible */}
      <div className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 opacity-60 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 3h2v2H9V3zm4 0h2v2h-2V3zM9 7h2v2H9V7zm4 0h2v2h-2V7zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2z"/>
        </svg>
      </div>
    </div>
  );
}

interface DraggableServicesGridProps {
  items: DraggableServiceItem[];
  onReorder: (items: DraggableServiceItem[]) => void;
  className?: string;
}

export default function DraggableServicesGrid({ items, onReorder, className = '' }: DraggableServicesGridProps): JSX.Element {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const reorderedItems = arrayMove(items, oldIndex, newIndex);
      onReorder(reorderedItems);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
        <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
          {items.map((item) => (
            <SortableService key={item.id} id={item.id}>
              {item.content}
            </SortableService>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
