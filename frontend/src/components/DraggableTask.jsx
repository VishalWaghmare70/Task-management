import { useDraggable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

export default function DraggableTask({ task, ...props }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 'auto',
    cursor: isDragging ? 'grabbing' : 'grab',
    position: 'relative'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* We need a drag handle so users can still click the buttons inside TaskCard */}
      <div 
        {...listeners} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '24px',
          cursor: 'grab',
          zIndex: 10
        }}
      />
      <div style={{ pointerEvents: isDragging ? 'none' : 'auto' }}>
        <TaskCard task={task} {...props} />
      </div>
    </div>
  );
}
