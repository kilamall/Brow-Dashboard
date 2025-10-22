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

interface KPIItem {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

interface SortableKPIProps extends KPIItem {
  colorAccessibility?: boolean;
}

function SortableKPI({ id, title, value, subtitle, children, className = '', onClick, colorAccessibility = false }: SortableKPIProps) {
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

  // Get icon and gradient based on title
  const getCardStyle = (title: string) => {
    const lowerTitle = title.toLowerCase();
    
    // If color accessibility is enabled, use grayscale
    if (colorAccessibility) {
      return {
        icon: '📊',
        gradient: 'from-gray-500 to-gray-600',
        bgGradient: 'from-gray-50 to-gray-100',
        textColor: 'text-gray-700',
        valueColor: 'text-gray-600',
        borderColor: 'border-gray-200'
      };
    }
    
    if (lowerTitle.includes('revenue') || lowerTitle.includes('profit')) {
      return {
        icon: '💰',
        gradient: 'from-green-500 to-emerald-600',
        bgGradient: 'from-green-50 to-emerald-50',
        textColor: 'text-green-700',
        valueColor: 'text-green-600',
        borderColor: 'border-green-200'
      };
    }
    if (lowerTitle.includes('appointment') || lowerTitle.includes('upcoming') || lowerTitle.includes('past')) {
      return {
        icon: '📅',
        gradient: 'from-blue-500 to-cyan-600',
        bgGradient: 'from-blue-50 to-cyan-50',
        textColor: 'text-blue-700',
        valueColor: 'text-blue-600',
        borderColor: 'border-blue-200'
      };
    }
    if (lowerTitle.includes('customer') || lowerTitle.includes('unique')) {
      return {
        icon: '👥',
        gradient: 'from-purple-500 to-pink-600',
        bgGradient: 'from-purple-50 to-pink-50',
        textColor: 'text-purple-700',
        valueColor: 'text-purple-600',
        borderColor: 'border-purple-200'
      };
    }
    if (lowerTitle.includes('target') || lowerTitle.includes('progress')) {
      return {
        icon: '🎯',
        gradient: 'from-orange-500 to-red-600',
        bgGradient: 'from-orange-50 to-red-50',
        textColor: 'text-orange-700',
        valueColor: 'text-orange-600',
        borderColor: 'border-orange-200'
      };
    }
    if (lowerTitle.includes('service') || lowerTitle.includes('top')) {
      return {
        icon: '⭐',
        gradient: 'from-yellow-500 to-amber-600',
        bgGradient: 'from-yellow-50 to-amber-50',
        textColor: 'text-yellow-700',
        valueColor: 'text-yellow-600',
        borderColor: 'border-yellow-200'
      };
    }
    if (lowerTitle.includes('breakdown') || lowerTitle.includes('detailed')) {
      return {
        icon: '📊',
        gradient: 'from-indigo-500 to-blue-600',
        bgGradient: 'from-indigo-50 to-blue-50',
        textColor: 'text-indigo-700',
        valueColor: 'text-indigo-600',
        borderColor: 'border-indigo-200'
      };
    }
    // Default style
    return {
      icon: '📈',
      gradient: 'from-slate-500 to-gray-600',
      bgGradient: 'from-slate-50 to-gray-50',
      textColor: 'text-slate-700',
      valueColor: 'text-slate-600',
      borderColor: 'border-slate-200'
    };
  };

  const cardStyle = getCardStyle(title);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative bg-gradient-to-br ${cardStyle.bgGradient} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border ${cardStyle.borderColor} ${className} cursor-move hover:scale-105`}
      onClick={onClick}
    >
      {/* Icon and gradient background */}
      <div className="absolute top-4 right-4 text-2xl opacity-20">
        {cardStyle.icon}
      </div>
      
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cardStyle.gradient} rounded-t-2xl`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className={`text-sm font-medium ${cardStyle.textColor} mb-2`}>{title}</div>
        <div className={`text-3xl font-bold ${cardStyle.valueColor} mb-1`}>{value}</div>
        {subtitle && <div className={`text-xs ${cardStyle.textColor} opacity-80`}>{subtitle}</div>}
        {children && <div className="mt-4">{children}</div>}
      </div>
      
      {/* Drag indicator */}
      <div className="absolute top-2 left-2 text-slate-400 hover:text-slate-600 opacity-60 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 3h2v2H9V3zm4 0h2v2h-2V3zM9 7h2v2H9V7zm4 0h2v2h-2V7zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2z"/>
        </svg>
      </div>
    </div>
  );
}

interface DraggableKPIGridProps {
  items: KPIItem[];
  onReorder: (items: KPIItem[]) => void;
  colorAccessibility?: boolean;
}

export default function DraggableKPIGrid({ items, onReorder, colorAccessibility = false }: DraggableKPIGridProps): JSX.Element {
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <SortableKPI key={item.id} {...item} colorAccessibility={colorAccessibility} />
        ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

