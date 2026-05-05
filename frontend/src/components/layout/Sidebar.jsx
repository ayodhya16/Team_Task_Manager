import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Projects", path: "/projects" },
    { name: "Tasks", path: "/tasks" },
  ];

  return (
    <div style={styles.sidebar}>
      <h2 style={styles.logo}>TaskFlow</h2>

      {menu.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          style={{
            ...styles.link,
            background:
              location.pathname === item.path ? "#1e40af" : "transparent",
          }}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
};

const styles = {
  sidebar: {
    width: "220px",
    height: "100vh",
    background: "#1e3a8a",
    color: "#fff",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  logo: {
    marginBottom: "30px",
  },
  link: {
    padding: "12px",
    borderRadius: "8px",
    color: "#fff",
    textDecoration: "none",
    marginBottom: "10px",
  },
};

export default Sidebar;