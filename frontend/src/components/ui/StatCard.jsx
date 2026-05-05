const StatCard = ({ label, value, hint }) => {
  return (
    <div style={styles.card}>
      <p style={styles.label}>{label}</p>
      <h2 style={styles.value}>{value}</h2>
      {hint && <p style={styles.hint}>{hint}</p>}
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
  label: {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "10px",
    fontWeight: "600",
  },
  value: {
    fontSize: "32px",
    lineHeight: 1,
    color: "#0f172a",
    margin: 0,
    fontWeight: "800",
  },
  hint: {
    marginTop: "10px",
    fontSize: "13px",
    color: "#94a3b8",
  },
};

export default StatCard;