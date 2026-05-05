import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    setLoading(false);

    if (result.success) navigate("/dashboard");
    else setError(result.message);
  };

  return (
    <div style={styles.page}>
      <div style={styles.leftPanel}>
        <div style={styles.brandBox}>
          <div style={styles.logo}>TF</div>
          <div>
            <h1 style={styles.brand}>TaskFlow</h1>
            <p style={styles.brandSub}>Project & Task Management</p>
          </div>
        </div>

        <h2 style={styles.heroTitle}>Manage projects like a real team.</h2>
        <p style={styles.heroText}>
          Track tasks, assign work, and keep progress organized in one modern workspace.
        </p>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.subtitle}>Log in to continue.</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p style={styles.linkText}>
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    background: "linear-gradient(135deg, #eff6ff 0%, #f8fafc 45%, #eef2ff 100%)",
  },
  leftPanel: {
    padding: "56px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  rightPanel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  brandBox: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "28px",
  },
  logo: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontWeight: "800",
    boxShadow: "0 14px 28px rgba(37,99,235,0.25)",
  },
  brand: { margin: 0, fontSize: "22px", fontWeight: "800", color: "#0f172a" },
  brandSub: { margin: "4px 0 0 0", color: "#64748b" },
  heroTitle: {
    fontSize: "56px",
    lineHeight: 1.05,
    margin: 0,
    color: "#0f172a",
    maxWidth: "620px",
    letterSpacing: "-0.04em",
  },
  heroText: {
    marginTop: "18px",
    fontSize: "18px",
    color: "#475569",
    maxWidth: "560px",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(14px)",
    borderRadius: "24px",
    padding: "30px",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow: "0 20px 50px rgba(15,23,42,0.12)",
  },
  title: { margin: 0, fontSize: "30px", fontWeight: "900", color: "#0f172a" },
  subtitle: { marginTop: "8px", marginBottom: "22px", color: "#64748b" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px 14px",
    borderRadius: "12px",
    marginBottom: "16px",
    fontSize: "14px",
    fontWeight: "600",
  },
  linkText: { marginTop: "18px", textAlign: "center", color: "#64748b" },
};

export default Login;