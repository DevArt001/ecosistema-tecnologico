import { NavLink, useNavigate } from "react-router-dom"

const MODULOS = [
  { path: "/",             label: "Dashboard",    icon: "⊞", color: "#10B981", modulo: "dashboard" },
  { path: "/clientes",     label: "Clientes",     icon: "👥", color: "#3B82F6", modulo: "clientes" },
  { path: "/vehiculos",    label: "Vehículos",    icon: "🏍", color: "#8B5CF6", modulo: "vehiculos" },
  { path: "/ordenes",      label: "Órdenes",      icon: "🔧", color: "#F59E0B", modulo: "ordenes" },
  { path: "/inventario",   label: "Inventario",   icon: "📦", color: "#EF4444", modulo: "inventario" },
  { path: "/facturas",     label: "Facturación",  icon: "💰", color: "#10B981", modulo: "facturas" },
  { path: "/cotizaciones", label: "Cotizaciones", icon: "📋", color: "#F59E0B", modulo: "cotizaciones" },
  { path: "/agendamiento", label: "Agendamiento", icon: "📅", color: "#06B6D4", modulo: "agendamiento" },
  { path: "/gastos",       label: "Gastos",       icon: "📤", color: "#EF4444", modulo: "gastos" },
  { path: "/reportes",     label: "Reportes",     icon: "📊", color: "#8B5CF6", modulo: "reportes" },
  { path: "/usuarios",     label: "Usuarios",     icon: "👤", color: "#EC4899", modulo: "admin" },
]

const PUBLICOS = [
  { label: "Agendar cita",   url: "/agendar", icon: "📆", color: "#10B981" },
  { label: "Página pública", url: "/public",  icon: "🌐", color: "#3B82F6" },
  { label: "Portal cliente", url: "/portal",  icon: "🔗", color: "#8B5CF6" },
]

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate()
  const rol      = localStorage.getItem("rol") || "tecnico"
  const permisos = JSON.parse(localStorage.getItem("permisos") || '["dashboard"]')
  const username = localStorage.getItem("username") || "usuario"

  const modulosVisibles = MODULOS.filter(m => {
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
      width: "240px", minHeight: "100vh",
      background: "var(--bg2)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
    }}>

      {/* Logo */}
      <div style={{
        padding: "1.5rem 1.25rem",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg, #10B981, #065F46)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", flexShrink: 0
          }}>🔧</div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#10B981" }}>
              TallerOS
            </div>
            <div style={{ fontSize: "10px", color: "var(--text3)", marginTop: "1px" }}>
              ARM Racing Performance
            </div>
          </div>
        </div>
      </div>

      {/* Nav principal */}
      <nav style={{ flex: 1, padding: "0.75rem 0", overflowY: "auto" }}>

        <div style={{ padding: "0 0.75rem", marginBottom: "4px" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text3)",
            textTransform: "uppercase", letterSpacing: ".1em", padding: "6px 8px" }}>
            Módulos
          </div>
        </div>

        {modulosVisibles.map(item => (
          <div key={item.path} style={{ padding: "0 0.75rem" }}>
            <NavLink to={item.path} end={item.path === "/"}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 12px", marginBottom: "2px",
                borderRadius: "10px", textDecoration: "none",
                fontSize: "13.5px", fontWeight: isActive ? "600" : "400",
                color: isActive ? item.color : "var(--text2)",
                background: isActive ? item.color + "18" : "transparent",
                borderLeft: isActive ? `3px solid ${item.color}` : "3px solid transparent",
                transition: "all 0.15s",
              })}>
              <span style={{ fontSize: "15px", width: "20px", textAlign: "center" }}>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          </div>
        ))}

        {/* Separador links públicos */}
        <div style={{ padding: "0 0.75rem", marginTop: "12px", marginBottom: "4px" }}>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text3)",
            textTransform: "uppercase", letterSpacing: ".1em", padding: "6px 8px",
            borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
            Links públicos
          </div>
        </div>

        {PUBLICOS.map(link => (
          <div key={link.url} style={{ padding: "0 0.75rem" }}>
            <a href={link.url} target="_blank" rel="noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 12px", marginBottom: "2px",
                borderRadius: "10px", textDecoration: "none",
                fontSize: "13.5px", fontWeight: "400",
                color: "var(--text2)",
                borderLeft: "3px solid transparent",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = link.color
                e.currentTarget.style.background = link.color + "18"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "var(--text2)"
                e.currentTarget.style.background = "transparent"
              }}>
              <span style={{ fontSize: "15px", width: "20px", textAlign: "center" }}>
                {link.icon}
              </span>
              {link.label}
              <span style={{ marginLeft: "auto", fontSize: "10px",
                color: "var(--text3)" }}>↗</span>
            </a>
          </div>
        ))}
      </nav>

      {/* Usuario */}
      <div style={{
        padding: "1rem 1.25rem",
        borderTop: "1px solid var(--border)",
        background: "var(--bg1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px",
          marginBottom: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "#10B98133", border: "2px solid #10B981",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: "700", color: "#10B981"
          }}>
            {username[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)" }}>
              {username}
            </div>
            <div style={{ fontSize: "10px", fontWeight: "700", color: "#10B981",
              textTransform: "uppercase", letterSpacing: ".08em" }}>
              {rol}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: "100%", background: "transparent",
          border: "1px solid var(--border)", color: "var(--text3)",
          borderRadius: "8px", padding: "7px",
          fontSize: "12px", cursor: "pointer",
          transition: "all 0.15s"
        }}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
