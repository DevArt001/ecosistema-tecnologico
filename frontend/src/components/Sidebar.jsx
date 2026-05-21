import { NavLink, useNavigate } from "react-router-dom"

const TODOS_MODULOS = [
  { path: "/",             label: "Dashboard",    color: "#10B981", modulo: "dashboard" },
  { path: "/clientes",     label: "Clientes",     color: "#3B82F6", modulo: "clientes" },
  { path: "/vehiculos",    label: "Vehículos",    color: "#8B5CF6", modulo: "vehiculos" },
  { path: "/ordenes",      label: "Órdenes",      color: "#F59E0B", modulo: "ordenes" },
  { path: "/inventario",   label: "Inventario",   color: "#EF4444", modulo: "inventario" },
  { path: "/facturas",     label: "Facturación",  color: "#10B981", modulo: "facturas" },
  { path: "/cotizaciones", label: "Cotizaciones", color: "#F59E0B", modulo: "cotizaciones" },
  { path: "/agendamiento", label: "Agendamiento", color: "#06B6D4", modulo: "agendamiento" },
  { path: "/gastos",       label: "Gastos",       color: "#EF4444", modulo: "gastos" },
  { path: "/reportes",     label: "Reportes",     color: "#8B5CF6", modulo: "reportes" },
  { path: "/usuarios",     label: "Usuarios",     color: "#EC4899", modulo: "admin" },
]

export default function Sidebar({ onLogout }) {
  const navigate   = useNavigate()
  const rol        = localStorage.getItem("rol") || "tecnico"
  const permisos   = JSON.parse(localStorage.getItem("permisos") || '["dashboard"]')
  const username   = localStorage.getItem("username") || "usuario"

  const modulosVisibles = TODOS_MODULOS.filter(m => {
    if (m.modulo === "admin") return rol === "admin"
    return rol === "admin" || permisos.includes(m.modulo)
  })

  const handleLogout = () => {
    localStorage.clear()
    onLogout()
    navigate("/")
  }

  return (
    <aside style={{
      width: "220px", minHeight: "100vh", background: "var(--bg2)",
      borderRight: "1px solid var(--border)", display: "flex",
      flexDirection: "column", padding: "1rem 0"
    }}>
      {/* Logo */}
      <div style={{ padding: "0 1rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: "16px", fontWeight: "700", color: "#10B981" }}>
          🔧 TallerOS
        </div>
        <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "2px" }}>
          ARM Racing Performance
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "1rem 0", overflowY: "auto" }}>
        {modulosVisibles.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === "/"}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "10px",
              padding: "8px 1rem", margin: "2px 8px",
              borderRadius: "8px", textDecoration: "none",
              fontSize: "13px", fontWeight: "500",
              color: isActive ? item.color : "var(--text2)",
              background: isActive ? item.color + "18" : "transparent",
              transition: "all 0.15s",
            })}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: item.color, flexShrink: 0
            }}/>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Usuario y logout */}
      <div style={{ padding: "1rem", borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "4px" }}>
          {username}
        </div>
        <div style={{
          fontSize: "11px", color: "#10B981", fontWeight: "600",
          textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px"
        }}>
          {rol}
        </div>
        <button onClick={handleLogout} style={{
          width: "100%", background: "var(--bg1)",
          border: "1px solid var(--border)", color: "var(--text3)",
          borderRadius: "6px", padding: "6px", fontSize: "12px",
          cursor: "pointer"
        }}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
