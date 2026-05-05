import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div style={styles.container}>
      <Sidebar />

      <div style={styles.main}>
        <Navbar />

        <div style={styles.content}>{children}</div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
  },
  main: {
    flex: 1,
    background: "#f9fafb",
    minHeight: "100vh",
  },
  content: {
    padding: "20px",
  },
};

export default Layout;