import { useEffect, useMemo, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

// UI components
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";

const TaskBoard = () => {
  const { id: projectId } = useParams();
  const { user } = useContext(AuthContext);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const [showMine, setShowMine] = useState(false);

  // 📌 Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);

      const [projectRes, tasksRes, membersRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`),
        api.get(`/projects/${projectId}/members`),
      ]);

      setProject(projectRes.data);
      setTasks(tasksRes.data || []);
      setMembers(membersRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  // 📌 Filter + group
  const groupedTasks = useMemo(() => {
    const filtered = showMine
      ? tasks.filter((t) => t.assigned_to === user?.id)
      : tasks;

    return {
      todo: filtered.filter((t) => t.status === "todo"),
      in_progress: filtered.filter((t) => t.status === "in_progress"),
      done: filtered.filter((t) => t.status === "done"),
    };
  }, [tasks, showMine, user]);

  // 📌 Create / Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!title.trim()) return;

      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, {
          title,
          description,
          priority,
          due_date: dueDate,
          assigned_to: assignedTo || null,
        });
      } else {
        await api.post("/tasks", {
          title,
          description,
          priority,
          due_date: dueDate || null,
          project_id: Number(projectId),
          assigned_to: assignedTo ? Number(assignedTo) : null,
        });
      }

      resetForm();
      fetchData();
    } catch {
      alert("Save failed");
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setAssignedTo("");
  };

  // 📌 Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    await api.delete(`/tasks/${id}`);
    fetchData();
  };

  // 📌 Edit
  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setDueDate(task.due_date || "");
    setAssignedTo(task.assigned_to || "");
    setShowModal(true);
  };

  if (loading) return <Layout>Loading...</Layout>;
  if (!project) return <Layout>Project not found</Layout>;

  return (
    <Layout>
      {/* HEADER */}
      <PageHeader
        title={project.name}
        subtitle="Manage tasks and track progress"
        action={
          <div style={{ display: "flex", gap: "10px" }}>
            <Button variant="secondary" onClick={() => setShowMine(!showMine)}>
              {showMine ? "All Tasks" : "My Tasks"}
            </Button>

            {user?.role === "admin" && (
              <Button onClick={() => setShowModal(true)}>+ New Task</Button>
            )}
          </div>
        }
      />

      {/* EMPTY */}
      {tasks.length === 0 && (
        <p style={{ color: "#64748b" }}>No tasks created yet</p>
      )}

      {/* BOARD */}
      <div style={styles.board}>
        {["todo", "in_progress", "done"].map((status) => (
          <div key={status} style={styles.column}>
            <h3 style={styles.columnTitle}>{status.toUpperCase()}</h3>

            {groupedTasks[status].length === 0 ? (
              <p style={{ color: "#9ca3af" }}>No tasks</p>
            ) : (
              groupedTasks[status].map((task) => (
                <Card key={task.id}>
                  {task.assigned_to === user?.id && (
                    <span style={styles.badge}>My Task</span>
                  )}

                  <h4>{task.title}</h4>

                  <p style={styles.desc}>{task.description}</p>

                  <p style={styles.meta}>
                    Priority: <b>{task.priority}</b>
                  </p>

                  <p style={styles.meta}>
                    Assigned:{" "}
                    <b>
                      {members.find((m) => m.id === task.assigned_to)?.name ||
                        "Unassigned"}
                    </b>
                  </p>

                  {/* STATUS BUTTONS */}
                  <div style={styles.row}>
                    {task.status !== "todo" && (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          api
                            .put(`/tasks/${task.id}`, { status: "todo" })
                            .then(fetchData)
                        }
                      >
                        ToDo
                      </Button>
                    )}

                    {task.status !== "in_progress" && (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          api
                            .put(`/tasks/${task.id}`, {
                              status: "in_progress",
                            })
                            .then(fetchData)
                        }
                      >
                        Progress
                      </Button>
                    )}

                    {task.status !== "done" && (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          api
                            .put(`/tasks/${task.id}`, { status: "done" })
                            .then(fetchData)
                        }
                      >
                        Done
                      </Button>
                    )}
                  </div>

                  {/* ADMIN */}
                  {user?.role === "admin" && (
                    <div style={styles.row}>
                      <Button
                        variant="secondary"
                        onClick={() => handleEdit(task)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="danger"
                        onClick={() => handleDelete(task.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalBox}>
            <h2>{editingTask ? "Edit Task" : "Create Task"}</h2>

            <form onSubmit={handleSubmit} style={styles.form}>
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={styles.select}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              {/* DROPDOWN */}
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                style={styles.select}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>

              <div style={styles.row}>
                <Button type="submit">
                  {editingTask ? "Update" : "Create"}
                </Button>

                <Button variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

const styles = {
  board: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
  },
  column: {
    background: "#f8fafc",
    padding: "12px",
    borderRadius: "16px",
  },
  columnTitle: {
    marginBottom: "10px",
    fontWeight: "700",
  },
  desc: {
    fontSize: "14px",
    color: "#64748b",
  },
  meta: {
    fontSize: "12px",
    marginTop: "4px",
  },
  row: {
    display: "flex",
    gap: "8px",
    marginTop: "10px",
    flexWrap: "wrap",
  },
  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    width: "400px",
    maxWidth : "420px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  select: {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  badge: {
    background: "#2563eb",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "999px",
    fontSize: "11px",
  },
};

export default TaskBoard;