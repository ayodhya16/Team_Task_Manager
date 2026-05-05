import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header style={styles.navbar}>
      <div>
        <h3 style={styles.title}>Welcome back, {user?.name || "User"}</h3>
        
      </div>

      <div style={styles.right}>
        <div style={styles.avatar}>
          {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

const styles = {
  navbar: {
    height: "80px",
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 28px",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: "4px",
    fontSize: "12px",
    color: "#64748b",
    textTransform: "capitalize",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontWeight: "700",
    boxShadow: "0 10px 24px rgba(37,99,235,0.25)",
  },
  logoutBtn: {
    border: "none",
    background: "#f1f5f9",
    color: "#0f172a",
    padding: "10px 16px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
};

export default Navbar;