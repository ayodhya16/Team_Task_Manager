import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Projects", path: "/projects" },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <div style={styles.logo}>T</div>
        <div>
          <h2 style={styles.brandTitle}>TaskFlow</h2>
          <p style={styles.brandSub}>Project Manager</p>
        </div>
      </div>

      <nav style={styles.nav}>
        {menu.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.link,
                background: active ? "#eff6ff" : "transparent",
                color: active ? "#1d4ed8" : "#475569",
                borderColor: active ? "#bfdbfe" : "transparent",
              }}
            >
              <span style={styles.dot(active)} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: "260px",
    minHeight: "100vh",
    background: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    padding: "24px 18px",
    position: "sticky",
    top: 0,
    alignSelf: "flex-start",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "28px",
    padding: "8px 6px",
  },
  logo: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontWeight: "800",
    fontSize: "18px",
    boxShadow: "0 10px 24px rgba(37,99,235,0.25)",
  },
  brandTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
  },
  brandSub: {
    margin: "3px 0 0 0",
    fontSize: "12px",
    color: "#64748b",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid transparent",
    fontWeight: "600",
    transition: "0.2s ease",
  },
  dot: (active) => ({
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    background: active ? "#2563eb" : "#cbd5e1",
  }),
};

export default Sidebar;