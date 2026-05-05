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
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8fafc 0%, #f3f4f6 100%)",
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  content: {
    padding: "28px",
    maxWidth: "1600px",
    margin: "0 auto",
  },
};

export default Layout;