import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import api from "../services/api";

// UI
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import Input from "..components/ui/Input";

const Projects = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // 🚀 Fetch projects
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

  // Create project
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      if (!name.trim()) {
        setFormError("Project name is required");
        return;
      }

      await api.post("/projects", {
        name,
        description,
      });

      setShowModal(false);
      setName("");
      setDescription("");

      fetchProjects();
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to create project");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={styles.info}>Loading projects...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={styles.error}>{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* HEADER */}
      <PageHeader
        title="Projects"
        subtitle="Manage your projects and teams"
        action={
          <Button onClick={() => setShowModal(true)}>
            + Create Project
          </Button>
        }
      />

      {/* EMPTY */}
      {projects.length === 0 ? (
        <div style={styles.empty}>
          <h3>No projects yet</h3>
          <p>Create your first project to get started 🚀</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {projects.map((project) => (
            <Card key={project.id}>
              <h3>{project.name}</h3>

              <p style={styles.desc}>
                {project.description || "No description"}
              </p>

              <div style={styles.actions}>
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  View Details
                </Button>

                <Button
                  onClick={() =>
                    navigate(`/projects/${project.id}/tasks`)
                  }
                >
                  Open Tasks
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalBox}>
            <h2>Create Project</h2>

            {formError && (
              <div style={styles.error}>{formError}</div>
            )}

            <form onSubmit={handleCreate} style={styles.form}>
              <Input
                label="Project Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div style={styles.actions}>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? "Creating..." : "Create"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
  },
  desc: {
    color: "#64748b",
    fontSize: "14px",
    marginTop: "6px",
  },
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "12px",
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
    padding: "24px",
    borderRadius: "18px",
    width: "100%",
    maxWidth: "420px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  error: {
    background: "#fee2e2",
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "10px",
  },
  info: {
    padding: "20px",
  },
  empty: {
    textAlign: "center",
    marginTop: "40px",
    color: "#64748b",
  },
};

export default Projects;