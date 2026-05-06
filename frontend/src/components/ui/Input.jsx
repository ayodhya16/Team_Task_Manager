const Input = ({ label, error, className = "", ...props }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label style={styles.label}>
          {label}
        </label>
      )}
      <input {...props} style={styles.input} className={className} />
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
};

const styles = {
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    boxSizing: "border-box", 
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    outline: "none",
    fontSize: "15px",
    background: "#fff",
  },
  error: {
    margin: 0,
    fontSize: "12px",
    color: "#dc2626",
  },
};

export default Input;
