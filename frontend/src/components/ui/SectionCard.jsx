const SectionCard = ({ title, children, action }) => {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
};

const styles = {
  card: {
    background: "#fff",
    borderRadius: "18px",
    padding: "22px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
  },
};

export default SectionCard;