const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const styles = {
    primary: {
      background: "linear-gradient(135deg, #2563eb, #7c3aed)",
      color: "#fff",
    },
    secondary: {
      background: "#f1f5f9",
      color: "#0f172a",
    },
    danger: {
      background: "#ef4444",
      color: "#fff",
    },
  };

  return (
    <button
      {...props}
      style={{
        ...baseStyles.button,
        ...styles[variant],
      }}
      className={className}
    >
      {children}
    </button>
  );
};

const baseStyles = {
  button: {
    border: "none",
    borderRadius: "12px",
    padding: "11px 16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "0.2s ease",
    boxShadow: "0 8px 20px rgba(15,23,42,0.08)",
  },
};

export default Button;