import { useEffect, useMemo, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const TaskBoard = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`),
      ]);

      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load task board");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const groupedTasks = useMemo(() => {
    return {
      todo: tasks.filter((task) => task.status === "todo"),
      in_progress: tasks.filter((task) => task.status === "in_progress"),
      done: tasks.filter((task) => task.status === "done"),
    };
  }, [tasks]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      if (!title.trim()) {
        setFormError("Task title is required");
        setFormLoading(false);
        return;
      }

      await api.post("/tasks", {
        title,
        description,
        priority,
        due_date: dueDate || null,
        project_id: Number(projectId),
        assigned_to: assignedTo ? Number(assignedTo) : null,
      });

      setShowModal(false);
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setAssignedTo("");

      await fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to create task");
    } finally {
      setFormLoading(false);
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update task");
    }
  };

  const statusOrder = [
    { key: "todo", label: "To Do", color: "#e0f2fe" },
    { key: "in_progress", label: "In Progress", color: "#fef3c7" },
    { key: "done", label: "Done", color: "#dcfce7" },
  ];

  if (loading) {
    return (
      <Layout>
        <div style={styles.loading}>Loading task board...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={styles.errorBox}>{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <div style={styles.breadcrumb}>
            <span style={styles.breadcrumbLink} onClick={() => navigate("/projects")}>
              Projects
            </span>
            <span style={styles.breadcrumbSlash}>/</span>
            <span>Task Board</span>
          </div>

          <h1 style={styles.title}>{project?.name || "Project Tasks"}</h1>
          <p style={styles.subtitle}>
            Organize tasks across your team and track progress visually.
          </p>
        </div>

        {user?.role === "admin" && (
          <button style={styles.primaryBtn} onClick={() => setShowModal(true)}>
            + New Task
          </button>
        )}
      </div>

      <div style={styles.board}>
        {statusOrder.map((column) => (
          <div key={column.key} style={styles.column}>
            <div style={styles.columnHeader}>
              <h3 style={styles.columnTitle}>{column.label}</h3>
              <span style={{ ...styles.countBadge, background: column.color }}>
                {groupedTasks[column.key].length}
              </span>
            </div>

            <div style={styles.columnBody}>
              {groupedTasks[column.key].length === 0 ? (
                <div style={styles.emptyColumn}>No tasks</div>
              ) : (
                groupedTasks[column.key].map((task) => (
                  <div key={task.id} style={styles.taskCard}>
                    <div style={styles.taskTop}>
                      <h4 style={styles.taskTitle}>{task.title}</h4>
                      <span style={styles.priorityBadge}>{task.priority}</span>
                    </div>

                    {task.description && (
                      <p style={styles.taskDesc}>{task.description}</p>
                    )}

                    <div style={styles.metaRow}>
                      <span style={styles.metaText}>
                        Due: {task.due_date || "No due date"}
                      </span>
                      <span style={styles.metaText}>
                        Assigned: {task.assigned_to_name || "Unassigned"}
                      </span>
                    </div>

                    <div style={styles.actionsRow}>
                      {task.status !== "todo" && (
                        <button
                          style={styles.smallBtn}
                          onClick={() => updateStatus(task.id, "todo")}
                        >
                          To Do
                        </button>
                      )}

                      {task.status !== "in_progress" && (
                        <button
                          style={styles.smallBtn}
                          onClick={() => updateStatus(task.id, "in_progress")}
                        >
                          In Progress
                        </button>
                      )}

                      {task.status !== "done" && (
                        <button
                          style={styles.smallBtn}
                          onClick={() => updateStatus(task.id, "done")}
                        >
                          Done
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Create Task</h2>

            {formError && <div style={styles.errorBox}>{formError}</div>}

            <form onSubmit={handleCreateTask} style={styles.form}>
              <input
                style={styles.input}
                type="text"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <textarea
                style={styles.textarea}
                placeholder="Task description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div style={styles.row}>
                <select
                  style={styles.input}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

                <input
                  style={styles.input}
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <input
                style={styles.input}
                type="number"
                placeholder="Assigned user ID (optional)"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" style={styles.primaryBtn} disabled={formLoading}>
                  {formLoading ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

const styles = {
  loading: {
    padding: "30px",
    fontSize: "18px",
    color: "#374151",
  },
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "14px 16px",
    borderRadius: "12px",
    marginBottom: "18px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "24px",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "8px",
  },
  breadcrumbLink: {
    cursor: "pointer",
    color: "#2563eb",
    fontWeight: "600",
  },
  breadcrumbSlash: {
    color: "#9ca3af",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
  },
  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 16px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  board: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
  },
  column: {
    background: "#fff",
    borderRadius: "18px",
    padding: "16px",
    border: "1px solid #eef2f7",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    minHeight: "500px",
  },
  columnHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  columnTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
  },
  countBadge: {
    minWidth: "32px",
    height: "32px",
    borderRadius: "999px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    color: "#111827",
  },
  columnBody: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  emptyColumn: {
    border: "1px dashed #d1d5db",
    borderRadius: "14px",
    padding: "20px",
    color: "#6b7280",
    textAlign: "center",
    background: "#f9fafb",
  },
  taskCard: {
    borderRadius: "16px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    padding: "14px",
  },
  taskTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
  },
  taskTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
  },
  taskDesc: {
    marginTop: "10px",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  priorityBadge: {
    padding: "5px 10px",
    borderRadius: "999px",
    background: "#e0e7ff",
    color: "#4338ca",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  metaRow: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginTop: "12px",
  },
  metaText: {
    fontSize: "12px",
    color: "#6b7280",
  },
  actionsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "14px",
  },
  smallBtn: {
    border: "none",
    background: "#e5e7eb",
    color: "#111827",
    padding: "7px 10px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    zIndex: 50,
  },
  modal: {
    width: "100%",
    maxWidth: "560px",
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    boxSizing: "borderbox",
    overflow: "hidden",

  },
  modalTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "800",
    color: "#111827",
    marginBottom: "18px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    width: "100%",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "15px",
    background: "#fff",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "15px",
    resize: "vertical",
    fontFamily: "inherit",
    background: "#fff",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "8px",
  },
  cancelBtn: {
    background: "#f3f4f6",
    color: "#111827",
    border: "none",
    borderRadius: "12px",
    padding: "12px 16px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default TaskBoard;