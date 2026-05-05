import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import api from "../services/api";
import StatCard from "../components/ui/StatCard";
import SectionCard from "../components/ui/SectionCard";

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
          <p style={styles.subtitle}>Track projects, tasks, and overdue work</p>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <StatCard label="Total Tasks" value={summary?.total_tasks || 0} />
        <StatCard label="Completed" value={summary?.completed_tasks || 0} />
        <StatCard label="In Progress" value={summary?.in_progress_tasks || 0} />
        <StatCard label="Todo" value={summary?.todo_tasks || 0} />
      </div>

      <div style={styles.grid}>
        <SectionCard title="Overdue Tasks">
          {overdueTasks.length === 0 ? (
            <p style={styles.emptyText}>No overdue tasks 🎉</p>
          ) : (
            overdueTasks.map((task) => (
              <div key={task.id} style={styles.listItem}>
                <div>
                  <h4 style={styles.itemTitle}>{task.title}</h4>
                  <p style={styles.itemMeta}>
                    {task.project_name} • Due {task.due_date}
                  </p>
                </div>
                <span style={styles.badge}>{task.status}</span>
              </div>
            ))
          )}
        </SectionCard>

        <SectionCard title="Project Stats">
          {projectStats.length === 0 ? (
            <p style={styles.emptyText}>No project data yet</p>
          ) : (
            projectStats.map((project) => (
              <div key={project.id} style={styles.listItem}>
                <div>
                  <h4 style={styles.itemTitle}>{project.name}</h4>
                  <p style={styles.itemMeta}>
                    {project.total_tasks} tasks • {project.completed_tasks} done
                  </p>
                </div>
              </div>
            ))
          )}
        </SectionCard>
      </div>
    </Layout>
  );
};

const styles = {
  loading: {
    padding: "24px",
    color: "#475569",
    fontSize: "16px",
  },
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "16px",
    borderRadius: "14px",
    margin: "24px",
  },
  header: {
    marginBottom: "22px",
  },
  title: {
    fontSize: "34px",
    fontWeight: "900",
    margin: 0,
    color: "#0f172a",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    marginTop: "8px",
    color: "#64748b",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #e5e7eb",
    gap: "12px",
  },
  itemTitle: {
    margin: 0,
    fontSize: "15px",
    color: "#0f172a",
    fontWeight: "700",
  },
  itemMeta: {
    marginTop: "4px",
    fontSize: "13px",
    color: "#64748b",
  },
  badge: {
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  emptyText: {
    color: "#64748b",
    fontSize: "14px",
  },
};

export default Dashboard;