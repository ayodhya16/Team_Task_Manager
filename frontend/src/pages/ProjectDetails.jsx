import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddMember, setShowAddMember] = useState(false);

  // ✅ CHANGED: email instead of ID
  const [email, setEmail] = useState("");
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

  // ✅ FIXED: email-based
  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError("");

    try {
      await api.post(`/projects/${id}/members`, {
        email: email,
      });

      setShowAddMember(false);
      setEmail("");
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

        <Button onClick={() => navigate(`/projects/${id}/tasks`)}>
          View Tasks →
        </Button>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2>Team Members</h2>

          {user?.role === "admin" && (
            <Button
              variant="secondary"
              onClick={() => setShowAddMember(true)}
            >
              + Add Member
            </Button>
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

      {/* MODAL */}
      {showAddMember && (
        <div style={styles.modalOverlay} onClick={() => setShowAddMember(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Add Member</h3>

            {memberError && <div style={styles.error}>{memberError}</div>}

            <form onSubmit={handleAddMember} style={styles.form}>
              <Input
                label="User Email"
                type="email"
                placeholder="Enter user email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div style={styles.actions}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddMember(false)}
                >
                  Cancel
                </Button>

                <Button type="submit">Add</Button>
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
    width: "100%",
    maxWidth: "420px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
};

export default ProjectDetails;