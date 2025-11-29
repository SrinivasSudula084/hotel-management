export default function Input({ type="text", placeholder, value, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        width: "95%",
        padding: "12px 14px",
        margin: "10px 0",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.05)",
        color: "#fff",
        outline: "none",
      }}
    />
  );
}
