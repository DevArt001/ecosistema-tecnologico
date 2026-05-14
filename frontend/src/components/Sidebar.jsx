import { NavLink } from "react-router-dom"

const menu = [
  { path: "/",           label: "Dashboard",   color: "#10B981" },
  { path: "/clientes",   label: "Clientes",    color: "#3B82F6" },
  { path: "/vehiculos",  label: "Vehículos",   color: "#8B5CF6" },
  { path: "/ordenes",    label: "Órdenes",     color: "#F59E0B" },
  { path: "/inventario", label: "Inventario",  color: "#EF4444" },
  { path: "/facturas",   label: "Facturación", color: "#10B981" },
]

export default function Sidebar({ onLogout }) {
const usuario = localStorage.getItem("username") || "Usuario" (() => {
  try {
    const token = localStorage.getItem("access")
    if (!token) return "Usuario"
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.username || "Usuario"
  } catch { return "Usuario" }
})()

  return (
    <aside style={{
      width: "240px", minHeight: "100vh",
      background: "#0D1117",
      borderRight: "1px solid #1F2937",
      display: "flex", flexDirection: "column",
      position: "fixed", left: 0, top: 0,
    }}>
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #1F2937" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "linear-gradient(135deg, #10B981, #065F46)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px"
          }}>🔧</div>
          <div>
            <div style={{ fontWeight: "700", fontSize: "15px", color: "#F9FAFB" }}>TallerOS</div>
            <div style={{ fontSize: "11px", color: "#6B7280" }}>v1.0 · Sistema ERP</div>
          </div>
        </div>
      </div>

      <nav style={{ padding: "12px 10px", flex: 1 }}>
        <div style={{ fontSize: "10px", fontWeight: "600", color: "#4B5563",
          letterSpacing: ".08em", textTransform: "uppercase",
          padding: "8px 10px 4px" }}>Módulos</div>
        {menu.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === "/"}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "10px",
              padding: "9px 10px", borderRadius: "8px",
              textDecoration: "none", marginBottom: "2px",
              color: isActive ? "#F9FAFB" : "#6B7280",
              background: isActive ? "#1F2937" : "transparent",
              fontWeight: isActive ? "500" : "400",
              fontSize: "13px", transition: "all .15s",
            })}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: item.color, flexShrink: 0
            }} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: "16px 20px", borderTop: "1px solid #1F2937" }}>
        <div style={{ display: "flex", alignItems: "center",
          justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "linear-gradient(135deg, #10B981, #3B82F6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", color: "white", fontWeight: "600"
            }}>A</div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "500", color: "#F9FAFB" }}>{usuario}</div>
              <div style={{ fontSize: "11px", color: "#6B7280" }}>Administrador</div>
            </div>
          </div>
          <button onClick={onLogout} style={{
            background: "none", border: "none", color: "#6B7280",
            cursor: "pointer", fontSize: "18px", padding: "4px"
          }} title="Cerrar sesión">⏻</button>
        </div>
      </div>
    </aside>
  )
}