import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddMember, setShowAddMember] = useState(false);
  const [email, setEmail] = useState("");
  const [memberError, setMemberError] = useState("");

  // EDIT STATES
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // CHECK ADMIN (PROJECT LEVEL)
  const isAdmin =
    members.find((m) => m.id === user?.id)?.role === "admin";

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectRes, membersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/members`),
      ]);

      setProject(projectRes.data);
      setMembers(membersRes.data);

    } catch (err) {
      setError(err.response?.data?.error || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Set edit values
  useEffect(() => {
    if (project) {
      setEditName(project.name);
      setEditDesc(project.description || "");
    }
  }, [project]);

  // ADD MEMBER
  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError("");

    try {
      await api.post(`/projects/${id}/members`, { email });

      setEmail("");
      setShowAddMember(false);
      fetchData();
    } catch (err) {
      setMemberError(err.response?.data?.error || "Failed to add member");
    }
  };

  // UPDATE PROJECT
  const handleUpdateProject = async () => {
    try {
      await api.put(`/projects/${id}`, {
        name: editName,
        description: editDesc,
      });

      setEditMode(false);
      fetchData();
    } catch {
      alert("Update failed");
    }
  };

  // DELETE PROJECT
  const handleDeleteProject = async () => {
    if (!window.confirm("Delete this project?")) return;

    try {
      await api.delete(`/projects/${id}`);
      navigate("/projects");
    } catch {
      alert("Delete failed");
    }
  };

  // REMOVE MEMBER
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;

    try {
      await api.delete(`/projects/${id}/members/${memberId}`);
      fetchData();
    } catch {
      alert("Failed to remove member");
    }
  };

  if (loading) return <Layout>Loading...</Layout>;
  if (error) return <Layout>{error}</Layout>;

  return (
    <Layout>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          {editMode ? (
            <>
              <Input
                label="Project Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <Input
                label="Description"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </>
          ) : (
            <>
              <h1>{project.name}</h1>
              <p>{project.description}</p>
            </>
          )}
        </div>

        <div style={styles.actions}>
          <Button onClick={() => navigate(`/projects/${id}/tasks`)}>
            View Tasks →
          </Button>

          {isAdmin && (
            <>
              {editMode ? (
                <Button onClick={handleUpdateProject}>Save</Button>
              ) : (
                <Button onClick={() => setEditMode(true)}>Edit</Button>
              )}

              <Button variant="danger" onClick={handleDeleteProject}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* MEMBERS */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2>Team Members</h2>

          {isAdmin && (
            <Button
              variant="secondary"
              onClick={() => setShowAddMember(true)}
            >
              + Add Member
            </Button>
          )}
        </div>

        <div style={styles.grid}>
          {members.map((m) => (
            <div key={m.id} style={styles.card}>
              <h4>{m.name}</h4>
              <p style={styles.meta}>{m.email}</p>
              <span style={styles.role}>{m.role}</span>

              {isAdmin && m.id !== user.id && (
                <button
                  style={styles.removeBtn}
                  onClick={() => handleRemoveMember(m.id)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ADD MEMBER MODAL */}
      {showAddMember && (
        <div style={styles.modal}>
          <div style={styles.modalBox}>
            <h3>Add Member</h3>

            {memberError && (
              <p style={{ color: "red" }}>{memberError}</p>
            )}

            <form onSubmit={handleAddMember} style={styles.form}>
              <Input
                label="User Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div style={styles.actions}>
                <Button type="submit">Add</Button>

                <Button
                  variant="secondary"
                  onClick={() => setShowAddMember(false)}
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  section: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  card: {
    padding: "14px",
    background: "#f9fafb",
    borderRadius: "12px",
    position: "relative",
  },
  meta: {
    fontSize: "13px",
    color: "#6b7280",
  },
  role: {
    fontSize: "12px",
    background: "#dbeafe",
    padding: "4px 8px",
    borderRadius: "999px",
    display: "inline-block",
    marginTop: "6px",
  },
  removeBtn: {
    marginTop: "8px",
    fontSize: "12px",
    color: "red",
    cursor: "pointer",
    background: "none",
    border: "none",
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
    width: "100%",
    maxWidth: "420px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
};

export default ProjectDetails;