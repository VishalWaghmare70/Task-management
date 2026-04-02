import { DndContext, pointerWithin } from '@dnd-kit/core';
import { twMerge } from 'tailwind-merge';
import KanbanColumn from './KanbanColumn';
import DraggableTask from './DraggableTask';

export default function KanbanBoard({ tasks, activeFilter, onDragEnd, taskProps }) {
  const allColumns = ['Pending', 'In Progress', 'Completed'];
  
  // If activeFilter matches a status exactly (after capitalization), only show that column
  // Otherwise, if it's 'all' or 'overdue', show all columns.
  const displayColumns = allColumns.filter(status => {
    if (!activeFilter || activeFilter === 'all' || activeFilter === 'overdue') return true;
    return status.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <DndContext collisionDetection={pointerWithin} onDragEnd={onDragEnd}>
      <div className={`grid gap-6 items-start mt-2 ${
        displayColumns.length === 1 
          ? 'grid-cols-1' 
          : displayColumns.length === 2 
            ? 'grid-cols-1 lg:grid-cols-2' 
            : 'grid-cols-1 xl:grid-cols-3'
      }`}>
        {displayColumns.map(status => {
          const colTasks = tasks.filter(t => t.status === status);
          return (
            <KanbanColumn key={status} id={status} title={status} count={colTasks.length}>
              {colTasks.length === 0 ? (
                <div className="h-24 w-full border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-sm font-medium text-slate-400">
                  No {status.toLowerCase()} tasks found
                </div>
              ) : (
                <div className={twMerge(
                  "grid gap-4 w-full",
                  displayColumns.length === 1 ? "grid-cols-1 md:grid-cols-2 2xl:grid-cols-3" : "grid-cols-1"
                )}>
                  {colTasks.map((task) => (
                    <DraggableTask 
                      key={task._id} 
                      task={task} 
                      {...taskProps} 
                    />
                  ))}
                </div>
              )}
            </KanbanColumn>
          );
        })}
      </div>
    </DndContext>
  );
}
