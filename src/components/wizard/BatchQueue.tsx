import React from 'react';
import { useBatchStore, BatchAction } from '@/src/store/useBatchStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Trash2, GripVertical } from 'lucide-react';
import { Badge } from '../ui/badge';
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
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ action, onRemove }: { action: BatchAction; onRemove: (id: string) => void; key?: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getSummary = (a: BatchAction) => {
    switch (a.type) {
      case 'send': return `Send ${a.amount || '0'} to ${a.recipient || '...'}`;
      case 'swap': return `Swap ${a.amountIn || '0'} ${a.tokenIn || '...'} for ${a.tokenOut || '...'}`;
      case 'mint': return `Mint ${a.quantity || '1'} from ${a.contractAddress || '...'}`;
      case 'call': return `Call ${a.rawCalldata ? 'Raw Calldata' : (a.functionName || '...')} on ${a.contractAddress || '...'}`;
      case 'approve': return `Approve ${a.amount || '0'} for ${a.spender || '...'}`;
      default: return 'Unknown Action';
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg shadow-sm mb-2 group">
      <div {...attributes} {...listeners} className="cursor-grab text-slate-500 hover:text-slate-400">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="uppercase text-[10px] tracking-wider">{action.type}</Badge>
          <span className="font-medium text-sm text-slate-100">{getSummary(action)}</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onRemove(action.id)}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function BatchQueue() {
  const { actions, removeAction, reorderActions } = useBatchStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = actions.findIndex((a) => a.id === active.id);
      const newIndex = actions.findIndex((a) => a.id === over.id);
      reorderActions(oldIndex, newIndex);
    }
  };

  if (actions.length === 0) {
    return (
      <Card className="h-full bg-slate-900/50 border-dashed border-slate-800">
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
          <p>Your batch queue is empty.</p>
          <p className="text-sm mt-2">Add actions to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-slate-900 border-slate-800">
      <CardHeader className="pb-3 border-b border-slate-800">
        <CardTitle className="flex justify-between items-center">
          <span>Batch Queue</span>
          <Badge variant="secondary">{actions.length} actions</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={actions.map(a => a.id)}
            strategy={verticalListSortingStrategy}
          >
            {actions.map((action) => (
              <SortableItem key={action.id} action={action} onRemove={removeAction} />
            ))}
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
