import { NavLink, useNavigate } from "react-router-dom"

const TODOS_MODULOS = [
  { path: "/",             label: "Dashboard",    color: "#10B981", modulo: "dashboard" },
  { path: "/clientes",     label: "Clientes",     color: "#3B82F6", modulo: "clientes" },
  { path: "/vehiculos",    label: "Vehiculos",    color: "#8B5CF6", modulo: "vehiculos" },
  { path: "/ordenes",      label: "Ordenes",      color: "#F59E0B", modulo: "ordenes" },
  { path: "/inventario",   label: "Inventario",   color: "#EF4444", modulo: "inventario" },
  { path: "/facturas",     label: "Facturacion",  color: "#10B981", modulo: "facturas" },
  { path: "/cotizaciones", label: "Cotizaciones", color: "#F59E0B", modulo: "cotizaciones" },
  { path: "/agendamiento", label: "Agendamiento", color: "#06B6D4", modulo: "agendamiento" },
  { path: "/gastos",       label: "Gastos",       color: "#EF4444", modulo: "gastos" },
  { path: "/reportes",     label: "Reportes",     color: "#8B5CF6", modulo: "reportes" },
  { path: "/inteligencia",  label: "Inteligencia",  color: "#06B6D4", modulo: "admin" },
  { path: "/fidelizacion",  label: "Fidelizacion",  color: "#EC4899", modulo: "admin" },
  { path: "/usuarios",     label: "Usuarios",     color: "#EC4899", modulo: "admin" },
  { path: "/diagnostico",  label: "Diagnostico",  color: "#06B6D4", modulo: "admin" },
  { path: "/auditoria",     label: "Auditoria",     color: "#F59E0B", modulo: "admin" },
]

const PUBLICOS = [
  { label: "Agendar cita",   url: "/agendar",  color: "#10B981" },
  { label: "Registro cliente", url: "/registro", color: "#F59E0B" },
  { label: "Pagina publica", url: "/public",   color: "#3B82F6" },
  { label: "Portal cliente", url: "/portal",   color: "#8B5CF6" },
]

export default function Sidebar({ onLogout, onClose }) {
  const navigate = useNavigate()

  let rol = "tecnico"
  let permisos = ["dashboard"]
  let username = "usuario"

  try {
    rol      = localStorage.getItem("rol") || "tecnico"
    permisos = JSON.parse(localStorage.getItem("permisos") || '["dashboard"]')
    username = localStorage.getItem("username") || "usuario"
  } catch(e) {
    rol = "tecnico"
  }

  const modulosVisibles = TODOS_MODULOS.filter(m => {
    if (m.modulo === "admin") return rol === "admin"
    if (rol === "admin") return true
    return permisos.includes(m.modulo)
  })

  const handleLogout = () => {
    localStorage.clear()
    onLogout()
    navigate("/")
  }

  return (
    <div style={{
      width: "240px", height: "100%",
      background: "#111827",
      borderRight: "1px solid #1F2937",
      display: "flex", flexDirection: "column",
      overflowY: "auto",
    }}>

      {/* Logo */}
      <div style={{
        padding: "1rem 1.25rem",
        borderBottom: "1px solid #1F2937",
        display: "flex", alignItems: "center",
        gap: "10px", flexShrink: 0,
      }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px",
          background: "#065F46",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px", flexShrink: 0,
        }}>🔧</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#10B981" }}>
            TallerOS
          </div>
          <div style={{ fontSize: "10px", color: "#6B7280", marginTop: "1px" }}>
            ARM Racing
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#6B7280",
            fontSize: "20px", cursor: "pointer", padding: "4px",
          }}>x</button>
        )}
      </div>

      {/* Modulos */}
      <nav style={{ flex: 1, padding: "0.5rem 0", overflowY: "auto" }}>
        <div style={{
          fontSize: "10px", fontWeight: "700", color: "#6B7280",
          textTransform: "uppercase", letterSpacing: ".1em",
          padding: "8px 1.25rem 4px",
        }}>Modulos</div>

        {modulosVisibles.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            onClick={onClose}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "10px",
              padding: "9px 1.25rem",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: isActive ? "600" : "400",
              color: isActive ? item.color : "#D1D5DB",
              background: isActive ? item.color + "22" : "transparent",
              borderLeft: isActive ? `3px solid ${item.color}` : "3px solid transparent",
            })}>
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: item.color, flexShrink: 0,
            }}/>
            {item.label}
          </NavLink>
        ))}

        {/* Links publicos */}
        <div style={{
          fontSize: "10px", fontWeight: "700", color: "#6B7280",
          textTransform: "uppercase", letterSpacing: ".1em",
          padding: "12px 1.25rem 4px",
          borderTop: "1px solid #1F2937",
          marginTop: "8px",
        }}>Links publicos</div>

        {PUBLICOS.map(link => (

          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "9px 1.25rem",
              textDecoration: "none",
              fontSize: "14px",
              color: "#D1D5DB",
            }}>
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: link.color, flexShrink: 0,
            }}/>
            {link.label}
          </a>
        ))}
      </nav>

      {/* Usuario */}
      <div style={{
        padding: "1rem 1.25rem",
        borderTop: "1px solid #1F2937",
        background: "#0A0E1A",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "#065F46",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: "700", color: "#10B981",
            flexShrink: 0,
          }}>
            {username[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#F9FAFB" }}>
              {username}
            </div>
            <div style={{ fontSize: "10px", color: "#10B981", textTransform: "uppercase" }}>
              {rol}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: "100%", background: "transparent",
          border: "1px solid #374151", color: "#9CA3AF",
          borderRadius: "8px", padding: "7px",
          fontSize: "12px", cursor: "pointer",
        }}>
          Cerrar sesion
        </button>
      </div>
    </div>
  )
}
