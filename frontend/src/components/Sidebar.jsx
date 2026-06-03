import { NavLink, useNavigate } from "react-router-dom"

const CATEGORIAS = [
  {
    titulo: "Principal",
    items: [
      { path: "/",             label: "Dashboard",    color: "#E8213A", icon: "⊞" , modulo: "dashboard" },
    ]
  },
  {
    titulo: "Clientes & Motos",
    items: [
      { path: "/clientes",     label: "Clientes",     color: "#4D9EFF", icon: "👤", modulo: "clientes" },
      { path: "/vehiculos",    label: "Vehículos",    color: "#E8213A", icon: "🏍", modulo: "vehiculos" },
      { path: "/agendamiento", label: "Agendamiento", color: "#06C4E0", icon: "📅", modulo: "agendamiento" },
      { path: "/fidelizacion", label: "Fidelización", color: "#FF6EB4", icon: "⭐", modulo: "admin" },
    ]
  },
  {
    titulo: "Operaciones",
    items: [
      { path: "/ordenes",      label: "Órdenes",      color: "#FFB020", icon: "🔧", modulo: "ordenes" },
      { path: "/inventario",   label: "Inventario",   color: "#FF4466", icon: "📦", modulo: "inventario" },
      { path: "/proveedores",  label: "Proveedores",  color: "#22D3EE", icon: "🏭", modulo: "inventario" },
    ]
  },
  {
    titulo: "Finanzas",
    items: [
      { path: "/facturas",     label: "Facturación",  color: "#00D4A0", icon: "💰", modulo: "facturas" },
      { path: "/cotizaciones", label: "Cotizaciones", color: "#FFB020", icon: "📄", modulo: "cotizaciones" },
      { path: "/gastos",       label: "Gastos",       color: "#FF4466", icon: "📤", modulo: "gastos" },
      { path: "/flujo-caja",   label: "Flujo de Caja",color: "#00D4A0", icon: "📊", modulo: "contabilidad" },
      { path: "/reportes",     label: "Reportes",     color: "#A855F7", icon: "📈", modulo: "reportes" },
    ]
  },
  {
    titulo: "Personal",
    items: [
      { path: "/nomina",       label: "Nómina",       color: "#00D4A0", icon: "👥", modulo: "admin" },
    ]
  },
  {
    titulo: "Inteligencia",
    items: [
      { path: "/inteligencia", label: "Inteligencia", color: "#22D3EE", icon: "🧠", modulo: "admin" },
    ]
  },
  {
    titulo: "Sistema",
    items: [
      { path: "/usuarios",     label: "Usuarios",     color: "#FF6EB4", icon: "🔐", modulo: "admin" },
      { path: "/auditoria",    label: "Auditoría",    color: "#FFB020", icon: "🔍", modulo: "admin" },
      { path: "/diagnostico",  label: "Diagnóstico",  color: "#22D3EE", icon: "⚡", modulo: "admin" },
    ]
  },
]

const PUBLICOS = [
  { label: "Agendar cita",    url: "/agendar",  color: "#00D4A0", icon: "📅" },
  { label: "Registro",        url: "/registro", color: "#FFB020", icon: "✍️" },
  { label: "Página pública",  url: "/public",   color: "#4D9EFF", icon: "🌐" },
  { label: "Portal cliente",  url: "/portal",   color: "#A855F7", icon: "🔗" },
]

export default function Sidebar({ onLogout, onClose }) {
  const navigate = useNavigate()

  let rol = "tecnico", permisos = ["dashboard"], username = "usuario"
  try {
    rol      = localStorage.getItem("rol") || "tecnico"
    permisos = JSON.parse(localStorage.getItem("permisos") || '["dashboard"]')
    username = localStorage.getItem("username") || "usuario"
  } catch {}

  const puedeVer = (modulo) => {
    if (modulo === "admin") return rol === "admin"
    if (rol === "admin") return true
    return permisos.includes(modulo)
  }

  const handleLogout = () => { localStorage.clear(); onLogout(); navigate("/") }

  const rolColors = { admin: "#E8213A", contabilidad: "#FFB020", tecnico: "#4D9EFF" }
  const rolColor = rolColors[rol] || "#E8213A"

  return (
    <div style={{
      width: "240px", height: "100%",
      background: "#07090F",
      borderRight: "1px solid #181E2E",
      display: "flex", flexDirection: "column",
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{
        padding: "1.1rem 1.25rem",
        borderBottom: "1px solid #181E2E",
        display: "flex", alignItems: "center", gap: "10px",
        flexShrink: 0,
        background: "linear-gradient(135deg, rgba(232,33,58,.06) 0%, rgba(30,95,212,.04) 100%)",
      }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: "#080808",
          border: "1.5px solid rgba(232,33,58,.35)",
          boxShadow: "0 0 14px rgba(232,33,58,.18)",
          padding: "4px", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <img src="/logo_arm.png" alt="ARM"
            style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "13px", fontWeight: "800", letterSpacing: "-.2px",
            background: "linear-gradient(135deg, #E8213A 0%, #1E5FD4 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", lineHeight: 1.2,
          }}>ARM Racing</div>
          <div style={{ fontSize: "9px", color: "#2A3A52", marginTop: "2px",
            fontWeight: "600", letterSpacing: ".14em", textTransform: "uppercase" }}>
            Performance · TallerOS
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#3A4A62",
            fontSize: "18px", cursor: "pointer", padding: "4px", lineHeight: 1,
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#E8213A"}
          onMouseLeave={e => e.currentTarget.style.color = "#3A4A62"}>×</button>
        )}
      </div>

      {/* Nav por categorías */}
      <nav style={{ flex: 1, padding: "6px 0 8px", overflowY: "auto" }}>
        {CATEGORIAS.map((cat) => {
          const itemsVisibles = cat.items.filter(item => puedeVer(item.modulo))
          if (itemsVisibles.length === 0) return null

          return (
            <div key={cat.titulo}>
              {/* Título categoría */}
              <div style={{
                fontSize: "9px", fontWeight: "800", color: "#2A3A52",
                textTransform: "uppercase", letterSpacing: ".16em",
                padding: "10px 16px 4px",
              }}>{cat.titulo}</div>

              {/* Items */}
              {itemsVisibles.map((item) => (
                <NavLink key={item.path} to={item.path} end={item.path === "/"}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "7px 16px", textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: isActive ? "600" : "400",
                    color: isActive ? item.color : "#8A9AB8",
                    background: isActive
                      ? `linear-gradient(90deg, ${item.color}14 0%, transparent 80%)`
                      : "transparent",
                    borderLeft: `2px solid ${isActive ? item.color : "transparent"}`,
                    transition: "all .12s",
                  })}
                  onMouseEnter={e => {
                    if (!e.currentTarget.style.borderLeftColor || e.currentTarget.style.borderLeftColor === "transparent") {
                      e.currentTarget.style.color = "#C8D4E8"
                      e.currentTarget.style.background = "rgba(255,255,255,.03)"
                    }
                  }}
                  onMouseLeave={e => {
                    const isActive = e.currentTarget.getAttribute("aria-current") === "page"
                    if (!isActive) {
                      e.currentTarget.style.color = "#8A9AB8"
                      e.currentTarget.style.background = "transparent"
                    }
                  }}>
                  <span style={{ fontSize: "14px", width: "18px",
                    textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap" }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )
        })}

        {/* Links públicos */}
        <div style={{
          fontSize: "9px", fontWeight: "800", color: "#2A3A52",
          textTransform: "uppercase", letterSpacing: ".16em",
          padding: "10px 16px 4px",
          borderTop: "1px solid #141826", marginTop: "6px",
        }}>Público</div>

        {PUBLICOS.map(link => (
          <a key={link.url} href={link.url} target="_blank" rel="noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "7px 16px", textDecoration: "none",
              fontSize: "14px", color: "#5A6A82",
              transition: "color .12s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = link.color}
            onMouseLeave={e => e.currentTarget.style.color = "#5A6A82"}>
            <span style={{ fontSize: "14px", width: "18px", textAlign: "center" }}>
              {link.icon}
            </span>
            <span>{link.label}</span>
            <span style={{ marginLeft: "auto", fontSize: "9px", opacity: .3 }}>↗</span>
          </a>
        ))}
      </nav>

      {/* Usuario */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid #181E2E",
        background: "rgba(0,0,0,.25)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center",
          gap: "10px", marginBottom: "10px" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "50%",
            background: `${rolColor}18`,
            border: `1.5px solid ${rolColor}45`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: "800", color: rolColor,
            flexShrink: 0,
          }}>
            {username[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#D8E4F8",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {username}
            </div>
            <div style={{ fontSize: "10px", fontWeight: "700", color: rolColor,
              textTransform: "uppercase", letterSpacing: ".1em" }}>{rol}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: "100%",
          background: "rgba(232,33,58,.06)",
          border: "1px solid rgba(232,33,58,.2)",
          color: "#FF6B6B",
          borderRadius: "8px", padding: "8px",
          fontSize: "13px", cursor: "pointer",
          fontWeight: "500", fontFamily: "var(--font)",
          transition: "all .15s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "rgba(232,33,58,.12)"
          e.currentTarget.style.borderColor = "rgba(232,33,58,.4)"
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "rgba(232,33,58,.06)"
          e.currentTarget.style.borderColor = "rgba(232,33,58,.2)"
        }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
