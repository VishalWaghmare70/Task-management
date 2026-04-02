import { useDroppable } from '@dnd-kit/core';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function KanbanColumn({ id, title, count, children }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  // Decide colors based on Title
  let dotColor = 'bg-slate-400';
  let headerBg = 'bg-slate-100';
  if (title === 'Pending') {
    dotColor = 'bg-amber-500';
    headerBg = 'bg-amber-500/10';
  } else if (title === 'In Progress') {
    dotColor = 'bg-primary';
    headerBg = 'bg-primary/10';
  } else if (title === 'Completed') {
    dotColor = 'bg-emerald-500';
    headerBg = 'bg-emerald-500/10';
  }

  return (
    <div 
      className={twMerge(
        'flex flex-col bg-slate-50/50 rounded-2xl p-4 min-h-[500px] border border-slate-200 shadow-sm transition-colors',
        isOver && 'bg-slate-100 border-primary/30 shadow-md ring-1 ring-primary/20'
      )} 
      ref={setNodeRef}
    >
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2.5">
          <div className={twMerge('w-2.5 h-2.5 rounded-full', dotColor)} />
          <h3 className="font-semibold text-slate-800 tracking-tight">
            {title}
          </h3>
        </div>
        <div className={twMerge('text-xs font-bold px-2 py-1 rounded-md text-slate-600', headerBg)}>
          {count}
        </div>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
