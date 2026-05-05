const Card = ({ children, className = "" }) => {
  return <div style={styles.card} className={className}>{children}</div>;
};

const styles = {
  card: {
    background: "#fff",
    borderRadius: "18px",
    padding: "22px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
  },
};

export default Card;