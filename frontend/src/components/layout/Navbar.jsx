import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div style={styles.navbar}>
      <div>
        <h3 style={{ margin: 0 }}>Welcome, {user?.name}</h3>
        <p style={styles.role}>{user?.role}</p>
      </div>

      <button style={styles.logoutBtn} onClick={logout}>
        Logout
      </button>
    </div>
  );
};

const styles = {
  navbar: {
    height: "70px",
    background: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
    borderBottom: "1px solid #e5e7eb",
  },
  role: {
    margin: 0,
    fontSize: "12px",
    color: "#6b7280",
  },
  logoutBtn: {
    padding: "8px 14px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default Navbar;