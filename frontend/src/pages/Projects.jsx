import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Projects = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      if (!name.trim()) {
        setFormError("Project name is required");
        setFormLoading(false);
        return;
      }

      await api.post("/projects", {
        name,
        description,
      });

      setShowModal(false);
      setName("");
      setDescription("");
      await fetchProjects();
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to create project");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Layout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Projects</h1>
          <p style={styles.subtitle}>Manage your team projects in one place</p>
        </div>

        {user?.role === "admin" && (
          <button style={styles.primaryBtn} onClick={() => setShowModal(true)}>
            + New Project
          </button>
        )}
      </div>

      {loading && <div style={styles.infoBox}>Loading projects...</div>}

      {error && <div style={styles.errorBox}>{error}</div>}

      {!loading && !error && projects.length === 0 && (
        <div style={styles.emptyBox}>
          <h3 style={{ margin: 0 }}>No projects yet</h3>
          <p style={{ color: "#6b7280" }}>
            Create your first project to start organizing tasks.
          </p>
        </div>
      )}

      <div style={styles.grid}>
        {projects.map((project) => (
          <div key={project.id} style={styles.card}>
            <div style={styles.cardTop}>
              <div>
                <h3 style={styles.cardTitle}>{project.name}</h3>
                <p style={styles.cardText}>
                  {project.description || "No description provided"}
                </p>
              </div>

              <span style={styles.roleBadge}>{project.role}</span>
            </div>

            <div style={styles.cardBottom}>
              <span style={styles.metaText}>
                Created at: {new Date(project.created_at).toLocaleDateString()}
              </span>

              <button
                style={styles.secondaryBtn}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                Open
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Create Project</h2>

            {formError && <div style={styles.errorBox}>{formError}</div>}

            <form onSubmit={handleCreateProject} style={styles.form}>
              <input
                style={styles.input}
                type="text"
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <textarea
                style={styles.textarea}
                placeholder="Project description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
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
                  {formLoading ? "Creating..." : "Create"}
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    gap: "16px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    margin: 0,
    color: "#111827",
  },
  subtitle: {
    marginTop: "6px",
    color: "#6b7280",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    border: "1px solid #eef2f7",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "200px",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
  },
  cardText: {
    marginTop: "10px",
    color: "#6b7280",
    lineHeight: 1.5,
  },
  cardBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "18px",
    gap: "12px",
  },
  metaText: {
    fontSize: "13px",
    color: "#6b7280",
  },
  roleBadge: {
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "12px",
    fontWeight: "600",
    height: "fit-content",
  },
  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "10px 16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "#f3f4f6",
    color: "#111827",
    border: "none",
    borderRadius: "12px",
    padding: "10px 16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  infoBox: {
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "14px 16px",
    borderRadius: "12px",
    marginBottom: "18px",
  },
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "14px 16px",
    borderRadius: "12px",
    marginBottom: "18px",
  },
  emptyBox: {
    background: "#fff",
    borderRadius: "18px",
    padding: "28px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
    border: "1px solid #eef2f7",
    marginBottom: "20px",
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
    maxWidth: "520px",
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  modalTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "18px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  input: {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  outline: "none",
  fontSize: "15px",
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
    padding: "10px 16px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Projects;