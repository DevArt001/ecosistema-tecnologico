import { NavLink, useNavigate } from "react-router-dom"

const TODOS_MODULOS = [
  { path: "/",             label: "Dashboard",     color: "#E8213A", icon: "⊞",  modulo: "dashboard" },
  { path: "/clientes",     label: "Clientes",      color: "#1E5FD4", icon: "👤", modulo: "clientes" },
  { path: "/vehiculos",    label: "Vehículos",     color: "#E8213A", icon: "🏍", modulo: "vehiculos" },
  { path: "/ordenes",      label: "Órdenes",       color: "#F5A623", icon: "🔧", modulo: "ordenes" },
  { path: "/inventario",   label: "Inventario",    color: "#1E5FD4", icon: "📦", modulo: "inventario" },
  { path: "/proveedores",  label: "Proveedores",   color: "#06C4E0", icon: "🏭", modulo: "inventario" },
  { path: "/facturas",     label: "Facturación",   color: "#00D4A0", icon: "💰", modulo: "facturas" },
  { path: "/cotizaciones", label: "Cotizaciones",  color: "#F5A623", icon: "📄", modulo: "cotizaciones" },
  { path: "/gastos",       label: "Gastos",        color: "#E8213A", icon: "📤", modulo: "gastos" },
  { path: "/flujo-caja",   label: "Flujo de Caja", color: "#00D4A0", icon: "📊", modulo: "contabilidad" },
  { path: "/agendamiento", label: "Agendamiento",  color: "#06C4E0", icon: "📅", modulo: "agendamiento" },
  { path: "/reportes",     label: "Reportes",      color: "#8B5CF6", icon: "📈", modulo: "reportes" },
  { path: "/inteligencia", label: "Inteligencia",  color: "#06C4E0", icon: "🧠", modulo: "admin" },
  { path: "/fidelizacion", label: "Fidelización",  color: "#E8213A", icon: "⭐", modulo: "admin" },
  { path: "/nomina",       label: "Nómina",        color: "#00D4A0", icon: "👥", modulo: "admin" },
  { path: "/usuarios",     label: "Usuarios",      color: "#1E5FD4", icon: "🔐", modulo: "admin" },
  { path: "/auditoria",    label: "Auditoría",     color: "#F5A623", icon: "🔍", modulo: "admin" },
  { path: "/diagnostico",  label: "Diagnóstico",   color: "#06C4E0", icon: "⚡", modulo: "admin" },
]

const PUBLICOS = [
  { label: "Agendar cita",    url: "/agendar",  color: "#00D4A0", icon: "📅" },
  { label: "Registro",        url: "/registro", color: "#F5A623", icon: "✍️" },
  { label: "Página pública",  url: "/public",   color: "#1E5FD4", icon: "🌐" },
  { label: "Portal cliente",  url: "/portal",   color: "#8B5CF6", icon: "🔗" },
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

  const rolColors = { admin: "#E8213A", contabilidad: "#F5A623", tecnico: "#1E5FD4" }
  const rolColor = rolColors[rol] || "#E8213A"

  return (
    <div style={{
      width: "240px", height: "100%",
      background: "#07090F",
      borderRight: "1px solid #141826",
      display: "flex", flexDirection: "column",
      overflowY: "auto",
    }}>
      {/* Logo ARM Racing */}
      <div style={{
        padding: "1rem 1.25rem",
        borderBottom: "1px solid #141826",
        display: "flex", alignItems: "center", gap: "10px",
        flexShrink: 0,
        background: "linear-gradient(135deg, rgba(232,33,58,.05) 0%, rgba(30,95,212,.05) 100%)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Glow de fondo */}
        <div style={{
          position: "absolute", left: "-10px", top: "-10px",
          width: "80px", height: "80px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,33,58,.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}/>

        {/* Logo container — muestra el logo completo sin recorte */}
        <div style={{
          width: "42px", height: "42px",
          borderRadius: "10px",
          overflow: "hidden",
          flexShrink: 0,
          background: "#0A0A0A",
          border: "1.5px solid rgba(232,33,58,.3)",
          boxShadow: "0 0 12px rgba(232,33,58,.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "3px",
        }}>
          <img src="/logo_arm.png" alt="ARM Racing"
            style={{
              width: "100%", height: "100%",
              objectFit: "contain",
              objectPosition: "center",
            }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "13px", fontWeight: "800", letterSpacing: "-.2px",
            lineHeight: 1.2,
            background: "linear-gradient(135deg, #E8213A 0%, #1E5FD4 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>ARM Racing</div>
          <div style={{
            fontSize: "9px", color: "#3A4A62", marginTop: "2px",
            fontWeight: "600", letterSpacing: ".12em", textTransform: "uppercase"
          }}>Performance</div>
        </div>

        {onClose && (
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#3A4A62",
            fontSize: "18px", cursor: "pointer", padding: "4px",
            lineHeight: 1, transition: "color .15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#E8213A"}
          onMouseLeave={e => e.currentTarget.style.color = "#3A4A62"}>×</button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
        <div style={{
          fontSize: "9px", fontWeight: "700", color: "#252D3E",
          textTransform: "uppercase", letterSpacing: ".14em",
          padding: "10px 16px 4px",
        }}>Sistema</div>

        {modulosVisibles.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === "/"}
            onClick={onClose}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "9px",
              padding: "7px 16px", textDecoration: "none",
              fontSize: "13px",
              fontWeight: isActive ? "600" : "400",
              color: isActive ? item.color : "#4A5A72",
              background: isActive
                ? `linear-gradient(90deg, ${item.color}12 0%, transparent 80%)`
                : "transparent",
              borderLeft: `2px solid ${isActive ? item.color : "transparent"}`,
              transition: "all .12s",
            })}>
            <span style={{ fontSize: "13px", width: "18px",
              textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: "nowrap" }}>{item.label}</span>
          </NavLink>
        ))}

        {/* Públicos */}
        <div style={{
          fontSize: "9px", fontWeight: "700", color: "#252D3E",
          textTransform: "uppercase", letterSpacing: ".14em",
          padding: "12px 16px 4px",
          borderTop: "1px solid #141826", marginTop: "6px",
        }}>Público</div>

        {PUBLICOS.map(link => (
          <a key={link.url} href={link.url} target="_blank" rel="noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "9px",
              padding: "7px 16px", textDecoration: "none",
              fontSize: "13px", color: "#3A4A60",
              transition: "color .12s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = link.color}
            onMouseLeave={e => e.currentTarget.style.color = "#3A4A60"}>
            <span style={{ fontSize: "13px", width: "18px", textAlign: "center" }}>{link.icon}</span>
            <span>{link.label}</span>
            <span style={{ marginLeft: "auto", fontSize: "9px", opacity: .35 }}>↗</span>
          </a>
        ))}
      </nav>

      {/* Usuario */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid #141826",
        background: "rgba(0,0,0,.3)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center",
          gap: "10px", marginBottom: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: `${rolColor}15`,
            border: `1.5px solid ${rolColor}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: "800", color: rolColor,
            flexShrink: 0, letterSpacing: "-.5px",
          }}>
            {username[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: "13px", fontWeight: "600", color: "#D0D8F0",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>{username}</div>
            <div style={{
              fontSize: "9px", fontWeight: "700", color: rolColor,
              textTransform: "uppercase", letterSpacing: ".1em"
            }}>{rol}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: "100%",
          background: "rgba(232,33,58,.06)",
          border: "1px solid rgba(232,33,58,.18)",
          color: "#E8213A",
          borderRadius: "8px", padding: "7px",
          fontSize: "12px", cursor: "pointer",
          fontWeight: "500", fontFamily: "var(--font)",
          transition: "all .15s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "rgba(232,33,58,.12)"
          e.currentTarget.style.borderColor = "rgba(232,33,58,.35)"
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "rgba(232,33,58,.06)"
          e.currentTarget.style.borderColor = "rgba(232,33,58,.18)"
        }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
