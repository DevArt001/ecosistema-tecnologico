import { NavLink, useNavigate } from "react-router-dom"

const TODOS_MODULOS = [
  { path: "/",             label: "Dashboard",     color: "#00E5A0", icon: "⊞",  modulo: "dashboard" },
  { path: "/clientes",     label: "Clientes",      color: "#4D9EFF", icon: "👤", modulo: "clientes" },
  { path: "/vehiculos",    label: "Vehículos",     color: "#A855F7", icon: "🏍", modulo: "vehiculos" },
  { path: "/ordenes",      label: "Órdenes",       color: "#FFB020", icon: "🔧", modulo: "ordenes" },
  { path: "/inventario",   label: "Inventario",    color: "#FF4466", icon: "📦", modulo: "inventario" },
  { path: "/proveedores",  label: "Proveedores",   color: "#22D3EE", icon: "🏭", modulo: "inventario" },
  { path: "/facturas",     label: "Facturación",   color: "#00E5A0", icon: "💰", modulo: "facturas" },
  { path: "/cotizaciones", label: "Cotizaciones",  color: "#FFB020", icon: "📄", modulo: "cotizaciones" },
  { path: "/gastos",       label: "Gastos",        color: "#FF4466", icon: "📤", modulo: "gastos" },
  { path: "/flujo-caja",   label: "Flujo de Caja", color: "#00E5A0", icon: "📊", modulo: "contabilidad" },
  { path: "/agendamiento", label: "Agendamiento",  color: "#22D3EE", icon: "📅", modulo: "agendamiento" },
  { path: "/reportes",     label: "Reportes",      color: "#A855F7", icon: "📈", modulo: "reportes" },
  { path: "/inteligencia", label: "Inteligencia",  color: "#22D3EE", icon: "🧠", modulo: "admin" },
  { path: "/fidelizacion", label: "Fidelización",  color: "#FF6EB4", icon: "⭐", modulo: "admin" },
  { path: "/nomina",       label: "Nómina",        color: "#00E5A0", icon: "👥", modulo: "admin" },
  { path: "/usuarios",     label: "Usuarios",      color: "#FF6EB4", icon: "🔐", modulo: "admin" },
  { path: "/auditoria",    label: "Auditoría",     color: "#FFB020", icon: "🔍", modulo: "admin" },
  { path: "/diagnostico",  label: "Diagnóstico",   color: "#22D3EE", icon: "⚡", modulo: "admin" },
]

const PUBLICOS = [
  { label: "Agendar cita",    url: "/agendar",   color: "#00E5A0", icon: "📅" },
  { label: "Registro cliente",url: "/registro",  color: "#FFB020", icon: "✍️" },
  { label: "Página pública",  url: "/public",    color: "#4D9EFF", icon: "🌐" },
  { label: "Portal cliente",  url: "/portal",    color: "#A855F7", icon: "🔗" },
]

export default function Sidebar({ onLogout, onClose }) {
  const navigate = useNavigate()

  let rol = "tecnico", permisos = ["dashboard"], username = "usuario"
  try {
    rol      = localStorage.getItem("rol") || "tecnico"
    permisos = JSON.parse(localStorage.getItem("permisos") || '["dashboard"]')
    username = localStorage.getItem("username") || "usuario"
  } catch {}

  const modulosVisibles = TODOS_MODULOS.filter(m => {
    if (m.modulo === "admin") return rol === "admin"
    if (rol === "admin") return true
    return permisos.includes(m.modulo)
  })

  const handleLogout = () => { localStorage.clear(); onLogout(); navigate("/") }

  const rolColor = { admin: "#00E5A0", contabilidad: "#FFB020", tecnico: "#4D9EFF" }[rol] || "#00E5A0"

  return (
    <div style={{
      width: "240px", height: "100%",
      background: "linear-gradient(180deg, #0A0F1E 0%, #080C18 100%)",
      borderRight: "1px solid #1A2438",
      display: "flex", flexDirection: "column",
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{
        padding: "1.25rem",
        borderBottom: "1px solid #1A2438",
        display: "flex", alignItems: "center", gap: "10px",
        flexShrink: 0,
        background: "rgba(0,229,160,.03)",
      }}>
        <div style={{
          width: "38px", height: "38px", borderRadius: "10px",
          overflow: "hidden", flexShrink: 0,
          border: "1.5px solid rgba(0,229,160,.3)",
          boxShadow: "0 0 12px rgba(0,229,160,.15)",
        }}>
          <img src="/logo_arm.png" alt="ARM Racing"
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "#00E5A0",
            letterSpacing: "-.2px", lineHeight: 1.2 }}>ARM Racing</div>
          <div style={{ fontSize: "10px", color: "#3A4A62", marginTop: "2px",
            fontWeight: "500", letterSpacing: ".04em" }}>PERFORMANCE</div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#3A4A62",
            fontSize: "18px", cursor: "pointer", padding: "4px",
            lineHeight: 1, transition: "color .2s"
          }}>×</button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
        <div style={{
          fontSize: "9px", fontWeight: "700", color: "#2A3A52",
          textTransform: "uppercase", letterSpacing: ".14em",
          padding: "10px 16px 4px",
        }}>Sistema</div>

        {modulosVisibles.map((item, idx) => (
          <NavLink key={item.path} to={item.path} end={item.path === "/"}
            onClick={onClose}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "9px",
              padding: "8px 16px", textDecoration: "none",
              fontSize: "13px", fontWeight: isActive ? "600" : "400",
              color: isActive ? item.color : "#6A7A92",
              background: isActive
                ? `linear-gradient(90deg, ${item.color}15 0%, transparent 100%)`
                : "transparent",
              borderLeft: `2px solid ${isActive ? item.color : "transparent"}`,
              transition: "all .15s",
              animationDelay: `${idx * 0.03}s`,
            })}>
            <span style={{ fontSize: "14px", width: "18px", textAlign: "center", flexShrink: 0 }}>
              {item.icon}
            </span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.label}
            </span>
          </NavLink>
        ))}

        {/* Links públicos */}
        <div style={{
          fontSize: "9px", fontWeight: "700", color: "#2A3A52",
          textTransform: "uppercase", letterSpacing: ".14em",
          padding: "14px 16px 4px",
          borderTop: "1px solid #1A2438", marginTop: "8px",
        }}>Público</div>

        {PUBLICOS.map(link => (
          <a key={link.url} href={link.url} target="_blank" rel="noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "9px",
              padding: "8px 16px", textDecoration: "none",
              fontSize: "13px", color: "#4A5A72",
              transition: "color .15s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = link.color}
            onMouseLeave={e => e.currentTarget.style.color = "#4A5A72"}>
            <span style={{ fontSize: "14px", width: "18px", textAlign: "center" }}>{link.icon}</span>
            {link.label}
            <span style={{ marginLeft: "auto", fontSize: "10px", opacity: .4 }}>↗</span>
          </a>
        ))}
      </nav>

      {/* Usuario */}
      <div style={{
        padding: "1rem",
        borderTop: "1px solid #1A2438",
        background: "rgba(0,0,0,.2)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "50%",
            background: `${rolColor}18`,
            border: `1.5px solid ${rolColor}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: "700", color: rolColor, flexShrink: 0,
          }}>
            {username[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#E0E8FF",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {username}
            </div>
            <div style={{ fontSize: "10px", fontWeight: "700", color: rolColor,
              textTransform: "uppercase", letterSpacing: ".08em" }}>
              {rol}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: "100%", background: "rgba(255,68,102,.06)",
          border: "1px solid rgba(255,68,102,.2)", color: "#FF4466",
          borderRadius: "8px", padding: "7px",
          fontSize: "12px", cursor: "pointer", fontWeight: "500",
          transition: "all .15s", fontFamily: "var(--font)"
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,68,102,.12)"; e.currentTarget.style.borderColor = "rgba(255,68,102,.4)" }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,68,102,.06)"; e.currentTarget.style.borderColor = "rgba(255,68,102,.2)" }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
