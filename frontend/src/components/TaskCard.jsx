import { Draggable } from "@hello-pangea/dnd";

// Turns "2026-07-15" into something friendlier like "Jul 15", and tells
// us whether that date has already passed (so we can highlight it).
function formatDueDate(dueDate) {
  if (!dueDate) return null;
  const [year, month, day] = dueDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const label = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const isOverdue = date < today;
  return { label, isOverdue };
}

export default function TaskCard({ task, index, onDelete }) {
  const due = formatDueDate(task.due_date);

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
          {due && (
            <span className={due.isOverdue ? "due-badge due-badge-overdue" : "due-badge"}>
              {due.isOverdue ? "Overdue · " : ""}{due.label}
            </span>
          )}
        </div>
      )}
    </Draggable>
  );
}