import { ReactNode } from 'react';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DraggableAppointmentCardProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export default function DraggableAppointmentCard({ id, children, className = '' }: DraggableAppointmentCardProps) {
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
      {/* Drag indicator - only show on hover */}
      <div className="absolute top-1 right-1 text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 3h2v2H9V3zm4 0h2v2h-2V3zM9 7h2v2H9V7zm4 0h2v2h-2V7zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2z"/>
        </svg>
      </div>
    </div>
  );
}
