const PageHeader = ({ title, subtitle, action }) => {
  return (
    <div style={styles.header}>
      <div>
        <h1 style={styles.title}>{title}</h1>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    marginTop: "8px",
    color: "#64748b",
  },
};

export default PageHeader;