"use client";

import { useEffect, useState } from "react";

interface KanbanTask {
  id: number;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  position: number;
}

interface KanbanBoardProps {
  proposalId: number;
  readonly?: boolean;
}

const COLUMNS: { key: KanbanTask["status"]; label: string; color: string }[] = [
  { key: "TODO", label: "To Do", color: "bg-gray-100" },
  { key: "IN_PROGRESS", label: "In Progress", color: "bg-yellow-50" },
  { key: "DONE", label: "Done", color: "bg-green-50" },
];

export default function KanbanBoard({ proposalId, readonly = false }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/proposals/${proposalId}/kanban`)
      .then((r) => r.json())
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [proposalId]);

  async function addTask() {
    if (!newTitle.trim()) return;
    const res = await fetch(`/api/proposals/${proposalId}/kanban`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    if (res.ok) {
      const task = await res.json();
      setTasks((prev) => [...prev, task]);
      setNewTitle("");
    }
  }

  async function moveTask(task: KanbanTask, newStatus: KanbanTask["status"]) {
    const res = await fetch(`/api/kanban/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    }
  }

  async function deleteTask(taskId: number) {
    await fetch(`/api/kanban/${taskId}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  if (loading) return <div className="text-gray-500 py-4">Loading tasks…</div>;

  return (
    <div>
      {!readonly && (
        <div className="flex gap-2 mb-4">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="New task title…"
            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addTask}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.key} className={`${col.color} rounded-lg p-3`}>
            <h3 className="font-semibold text-sm mb-3 text-gray-700">{col.label}</h3>
            <div className="space-y-2 min-h-[80px]">
              {tasks.filter((t) => t.status === col.key).map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded shadow-sm p-3 text-sm border border-gray-200"
                >
                  <p className="font-medium text-gray-800">{task.title}</p>
                  {task.description && (
                    <p className="text-gray-500 text-xs mt-1">{task.description}</p>
                  )}
                  {!readonly && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {COLUMNS.filter((c) => c.key !== col.key).map((c) => (
                        <button
                          key={c.key}
                          onClick={() => moveTask(task, c.key)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          → {c.label}
                        </button>
                      ))}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-xs text-red-500 hover:underline ml-auto"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
