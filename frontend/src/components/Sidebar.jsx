import { NavLink } from "react-router-dom"

const menu = [
  { path: "/",           label: "Dashboard",   color: "#10B981" },
  { path: "/clientes",   label: "Clientes",    color: "#3B82F6" },
  { path: "/vehiculos",  label: "Vehículos",   color: "#8B5CF6" },
  { path: "/ordenes",    label: "Órdenes",     color: "#F59E0B" },
  { path: "/inventario", label: "Inventario",  color: "#EF4444" },
  { path: "/facturas",   label: "Facturación", color: "#10B981" },
]

export default function Sidebar({ onLogout, onClose }) {
  const usuario = (() => {
    try {
      const token = localStorage.getItem("access")
      if (!token) return "Usuario"
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.username || payload.user || payload.name || payload.sub || "Usuario"
    } catch { return "Usuario" }
  })()

  return (
    <div style={{
      width: "240px",
      height: "100%",
      background: "#0D1117",
      borderRight: "1px solid #1F2937",
      display: "flex",
      flexDirection: "column",
      position: "relative",
    }}>
      {/* Header */}
      <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid #1F2937", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "linear-gradient(135deg, #10B981, #065F46)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px"
          }}>🔧</div>
          <div>
            <div style={{ fontWeight: "700", fontSize: "15px", color: "#F9FAFB" }}>TallerOS</div>
            <div style={{ fontSize: "11px", color: "#9CA3AF" }}>v1.0 · Sistema ERP</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: "12px 10px", flex: 1, overflowY: "auto", paddingBottom: "120px" }}>
        <div style={{
          fontSize: "10px", fontWeight: "600", color: "#9CA3AF",
          letterSpacing: ".08em", textTransform: "uppercase",
          padding: "8px 10px 4px"
        }}>Módulos</div>
        {menu.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            onClick={onClose}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "10px",
              padding: "9px 10px", borderRadius: "8px",
              textDecoration: "none", marginBottom: "2px",
              color: isActive ? "#ffffff" : "#D1D5DB",
              background: isActive ? "#1F2937" : "transparent",
              fontWeight: isActive ? "600" : "400",
              fontSize: "14px", transition: "all .15s",
            })}>
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: item.color, flexShrink: 0
            }} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer — posición absoluta al fondo */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        padding: "12px 16px",
        borderTop: "1px solid #1F2937",
        background: "#0D1117",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "50%",
            background: "linear-gradient(135deg, #10B981, #3B82F6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", color: "white", fontWeight: "600", flexShrink: 0
          }}>
            {usuario.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: "13px", fontWeight: "600", color: "#F9FAFB",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>{usuario}</div>
            <div style={{ fontSize: "11px", color: "#9CA3AF" }}>Administrador</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            background: "#1F2937",
            border: "1px solid #374151",
            color: "#D1D5DB",
            cursor: "pointer",
            fontSize: "13px",
            padding: "8px 12px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >⏻ Cerrar sesión</button>
      </div>
    </div>
  )
}
