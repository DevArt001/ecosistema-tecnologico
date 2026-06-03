import { useTheme } from "../hooks/useTheme"

export default function ThemeToggle({ position = "fixed" }) {
  const { tema, toggleTema } = useTheme()
  const isDark = tema === "oscuro"

  return (
    <button
      onClick={toggleTema}
      title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      style={{
        position,
        top:   position === "fixed" ? "1rem" : "auto",
        right: position === "fixed" ? "1.25rem" : "auto",
        zIndex: 9998,
        width: "44px", height: "44px",
        borderRadius: "50%",
        background: isDark
          ? "rgba(255,255,255,.08)"
          : "rgba(0,0,0,.08)",
        border: isDark
          ? "1.5px solid rgba(255,255,255,.15)"
          : "1.5px solid rgba(0,0,0,.12)",
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "18px",
        transition: "all .25s cubic-bezier(.4,0,.2,1)",
        backdropFilter: "blur(8px)",
        boxShadow: isDark
          ? "0 4px 16px rgba(0,0,0,.4)"
          : "0 4px 16px rgba(0,0,0,.15)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "scale(1.1) rotate(15deg)"
        e.currentTarget.style.boxShadow = isDark
          ? "0 6px 24px rgba(0,0,0,.5)"
          : "0 6px 24px rgba(0,0,0,.2)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "scale(1) rotate(0deg)"
        e.currentTarget.style.boxShadow = isDark
          ? "0 4px 16px rgba(0,0,0,.4)"
          : "0 4px 16px rgba(0,0,0,.15)"
      }}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  )
}
