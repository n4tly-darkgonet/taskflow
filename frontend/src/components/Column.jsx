import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard.jsx";

export default function Column({ column, onAddTask, onDeleteTask, onDeleteColumn }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await onAddTask(column.id, title.trim());
    setTitle("");
    setAdding(false);
  }

  return (
    <div className="column">
      <div className="column-header">
        <div className="column-title">
          {column.name}
          <span className="column-count">{column.tasks.length}</span>
        </div>
        <button className="btn-text" onClick={() => onDeleteColumn(column.id)} aria-label="Delete column">
          ✕
        </button>
      </div>

      <Droppable droppableId={String(column.id)}>
        {(provided) => (
          <div className="column-body" ref={provided.innerRef} {...provided.droppableProps}>
            {column.tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onDelete={onDeleteTask} />
            ))}
            {provided.placeholder}

            {adding ? (
              <form className="add-task-form" onSubmit={handleAdd}>
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => !title.trim() && setAdding(false)}
                  placeholder="Task title"
                />
              </form>
            ) : (
              <button className="add-task-trigger" onClick={() => setAdding(true)}>
                + Add a task
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
