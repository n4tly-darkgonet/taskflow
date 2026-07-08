import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard.jsx";

export default function Column({ column, onAddTask, onDeleteTask, onDeleteColumn }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await onAddTask(column.id, title.trim(), dueDate || null);
    setTitle("");
    setDueDate("");
    setAdding(false);
  }

  // Only close the form if focus moved OUTSIDE it (e.g. clicking
  // elsewhere on the page) - not when moving between the title field
  // and the date field, which both live inside this same form.
  function handleFormBlur(e) {
    if (!e.currentTarget.contains(e.relatedTarget) && !title.trim()) {
      setAdding(false);
    }
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
              <form className="add-task-form" onSubmit={handleAdd} onBlur={handleFormBlur}>
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="due-date-input"
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