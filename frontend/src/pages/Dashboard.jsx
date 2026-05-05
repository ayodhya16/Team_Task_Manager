import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/layout/Layout";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [projectStats, setProjectStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryRes, overdueRes, projectStatsRes] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/dashboard/overdue"),
        api.get("/dashboard/project-stats"),
      ]);

      setSummary(summaryRes.data);
      setOverdueTasks(overdueRes.data);
      setProjectStats(projectStatsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div style={styles.loading}>Loading dashboard...</div>
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
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>Track your projects and task progress</p>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <StatCard title="Total Tasks" value={summary?.total_tasks || 0} />
        <StatCard title="Completed" value={summary?.completed_tasks || 0} />
        <StatCard title="In Progress" value={summary?.in_progress_tasks || 0} />
        <StatCard title="Todo" value={summary?.todo_tasks || 0} />
      </div>

      <div style={styles.sectionGrid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Overdue Tasks</h2>
          {overdueTasks.length === 0 ? (
            <p style={styles.emptyText}>No overdue tasks 🎉</p>
          ) : (
            overdueTasks.map((task) => (
              <div key={task.id} style={styles.taskItem}>
                <div>
                  <h3 style={styles.taskTitle}>{task.title}</h3>
                  <p style={styles.taskMeta}>
                    {task.project_name} • Due: {task.due_date}
                  </p>
                </div>
                <span style={styles.badge}>{task.status}</span>
              </div>
            ))
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Project Stats</h2>
          {projectStats.length === 0 ? (
            <p style={styles.emptyText}>No project data yet</p>
          ) : (
            projectStats.map((project) => (
              <div key={project.id} style={styles.projectItem}>
                <div>
                  <h3 style={styles.taskTitle}>{project.name}</h3>
                  <p style={styles.taskMeta}>
                    Total: {project.total_tasks} • Completed: {project.completed_tasks}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ title, value }) => (
  <div style={styles.statCard}>
    <p style={styles.statLabel}>{title}</p>
    <h2 style={styles.statValue}>{value}</h2>
  </div>
);

const styles = {
  loading: {
    padding: "40px",
    fontSize: "18px",
    color: "#374151",
  },
  errorBox: {
    margin: "20px",
    padding: "16px",
    borderRadius: "12px",
    background: "#fee2e2",
    color: "#991b1b",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    margin: 0,
    color: "#111827",
  },
  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },
  statLabel: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
  },
  statValue: {
    margin: "10px 0 0 0",
    fontSize: "32px",
    fontWeight: "700",
    color: "#111827",
  },
  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    minHeight: "300px",
  },
  cardTitle: {
    margin: "0 0 16px 0",
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
  },
  taskItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  projectItem: {
    padding: "14px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  taskTitle: {
    margin: 0,
    fontSize: "16px",
    color: "#111827",
  },
  taskMeta: {
    margin: "4px 0 0 0",
    fontSize: "13px",
    color: "#6b7280",
  },
  badge: {
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  emptyText: {
    color: "#6b7280",
    marginTop: "10px",
  },
};

export default Dashboard;