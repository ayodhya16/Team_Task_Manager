import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddMember, setShowAddMember] = useState(false);
  const [newUserId, setNewUserId] = useState("");
  const [memberError, setMemberError] = useState("");

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

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError("");

    try {
      await api.post(`/projects/${id}/members`, {
        user_id: newUserId,
      });

      setShowAddMember(false);
      setNewUserId("");
      fetchData();
    } catch (err) {
      setMemberError(err.response?.data?.error || "Failed to add member");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={styles.info}>Loading project...</div>
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
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{project.name}</h1>
          <p style={styles.subtitle}>{project.description}</p>
        </div>

        <button
          style={styles.primaryBtn}
          onClick={() => navigate(`/projects/${id}/tasks`)}
        >
          View Tasks →
        </button>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2>Team Members</h2>

          {user?.role === "admin" && (
            <button
              style={styles.secondaryBtn}
              onClick={() => setShowAddMember(true)}
            >
              + Add Member
            </button>
          )}
        </div>

        <div style={styles.memberGrid}>
          {members.map((m) => (
            <div key={m.id} style={styles.memberCard}>
              <h4>{m.name}</h4>
              <p style={styles.meta}>{m.email}</p>
              <span style={styles.role}>{m.role}</span>
            </div>
          ))}
        </div>
      </div>

      {showAddMember && (
        <div style={styles.modalOverlay} onClick={() => setShowAddMember(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Add Member</h3>

            {memberError && <div style={styles.error}>{memberError}</div>}

            <form onSubmit={handleAddMember} style={styles.form}>
              <input
                type="number"
                placeholder="Enter user ID"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                style={styles.input}
              />

              <div style={styles.actions}>
                <button
                  type="button"
                  style={styles.cancel}
                  onClick={() => setShowAddMember(false)}
                >
                  Cancel
                </button>

                <button type="submit" style={styles.primaryBtn}>
                  Add
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
    marginBottom: "30px",
  },
  title: {
    fontSize: "28px",
    margin: 0,
  },
  subtitle: {
    color: "#6b7280",
    marginTop: "6px",
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
  memberGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  memberCard: {
    padding: "16px",
    background: "#f9fafb",
    borderRadius: "12px",
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
  },
  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "#f3f4f6",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
  },
  info: {
    padding: "20px",
  },
  error: {
    background: "#fee2e2",
    padding: "12px",
    borderRadius: "8px",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    width: "400px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  cancel: {
    background: "#e5e7eb",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
  },
};

export default ProjectDetails;