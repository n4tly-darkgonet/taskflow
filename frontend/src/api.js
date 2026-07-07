// api.js
// A thin wrapper around fetch() so the rest of the app doesn't have to
// repeat "attach the token / parse JSON / handle errors" every time.

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 204 No Content has no body to parse
  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || "Something went wrong. Please try again.");
  }

  return data;
}

export const api = {
  register: (username, password) =>
    request("/auth/register", { method: "POST", body: { username, password } }),
  login: (username, password) =>
    request("/auth/login", { method: "POST", body: { username, password } }),

  getBoards: (token) => request("/boards", { token }),
  createBoard: (token, name) =>
    request("/boards", { method: "POST", body: { name }, token }),
  getBoard: (token, id) => request(`/boards/${id}`, { token }),
  deleteBoard: (token, id) => request(`/boards/${id}`, { method: "DELETE", token }),

  createColumn: (token, boardId, name) =>
    request(`/boards/${boardId}/columns`, { method: "POST", body: { name }, token }),
  deleteColumn: (token, id) => request(`/columns/${id}`, { method: "DELETE", token }),

  createTask: (token, columnId, title) =>
    request(`/columns/${columnId}/tasks`, { method: "POST", body: { title }, token }),
  deleteTask: (token, id) => request(`/tasks/${id}`, { method: "DELETE", token }),
  moveTask: (token, taskId, toColumnId, toIndex) =>
    request("/tasks/move", { method: "POST", body: { taskId, toColumnId, toIndex }, token }),
};
