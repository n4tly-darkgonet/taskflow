import { Draggable } from "@hello-pangea/dnd";

export default function TaskCard({ task, index, onDelete }) {
  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          className="task-card"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            boxShadow: snapshot.isDragging ? "0 4px 14px rgba(0,0,0,0.12)" : "none",
          }}
        >
          <div className="task-card-row">
            <span>{task.title}</span>
            <button className="task-delete" onClick={() => onDelete(task.id)} aria-label="Delete task">
              ✕
            </button>
          </div>
          {task.description && <p>{task.description}</p>}
        </div>
      )}
    </Draggable>
  );
}
