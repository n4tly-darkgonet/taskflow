import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Column from "../components/Column.jsx";

export default function Board() {
  const { boardId } = useParams();
  const { auth } = useAuth();
  const [board, setBoard] = useState(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  useEffect(() => {
    api.getBoard(auth.token, boardId).then(setBoard);
  }, [auth.token, boardId]);

 async function handleAddTask(columnId, title, dueDate) {
    const task = await api.createTask(auth.token, columnId, title, dueDate);
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === columnId ? { ...col, tasks: [...col.tasks, task] } : col
      ),
    }));
  }

  async function handleDeleteTask(taskId) {
    await api.deleteTask(auth.token, taskId);
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((t) => t.id !== taskId),
      })),
    }));
  }

  async function handleDeleteColumn(columnId) {
    await api.deleteColumn(auth.token, columnId);
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.filter((c) => c.id !== columnId),
    }));
  }

  async function handleAddColumn(e) {
    e.preventDefault();
    if (!newColumnName.trim()) return;
    const column = await api.createColumn(auth.token, boardId, newColumnName.trim());
    setBoard((prev) => ({ ...prev, columns: [...prev.columns, column] }));
    setNewColumnName("");
    setAddingColumn(false);
  }

  // This is the heart of drag-and-drop: it fires once when the user
  // releases a dragged card. We update the UI immediately (so it feels
  // instant), then tell the backend about the move.
  async function handleDragEnd(result) {
    const { source, destination, draggableId } = result;
    if (!destination) return; // dropped outside any column

    const sourceColId = Number(source.droppableId);
    const destColId = Number(destination.droppableId);
    const taskId = Number(draggableId);

    if (sourceColId === destColId && source.index === destination.index) return;

    setBoard((prev) => {
      const columns = prev.columns.map((c) => ({ ...c, tasks: [...c.tasks] }));
      const sourceCol = columns.find((c) => c.id === sourceColId);
      const destCol = columns.find((c) => c.id === destColId);

      const [movedTask] = sourceCol.tasks.splice(source.index, 1);
      destCol.tasks.splice(destination.index, 0, movedTask);

      return { ...prev, columns };
    });

    try {
      await api.moveTask(auth.token, taskId, destColId, destination.index);
    } catch {
      // If the move failed on the server, refetch to get back in sync.
      const fresh = await api.getBoard(auth.token, boardId);
      setBoard(fresh);
    }
  }

  if (!board) {
    return <div className="loading-screen">Loading board...</div>;
  }

  return (
    <div className="board-page">
      <header className="board-header">
        <Link to="/" className="back-link">← Boards</Link>
        <h1>{board.name}</h1>
      </header>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="columns-row">
          {board.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onDeleteColumn={handleDeleteColumn}
            />
          ))}

          <div className="column add-column" style={{ background: "transparent" }}>
            {addingColumn ? (
              <form onSubmit={handleAddColumn}>
                <input
                  autoFocus
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onBlur={() => !newColumnName.trim() && setAddingColumn(false)}
                  placeholder="Column name"
                />
              </form>
            ) : (
              <button className="add-task-trigger" onClick={() => setAddingColumn(true)}>
                + Add a column
              </button>
            )}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
