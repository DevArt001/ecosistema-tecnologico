import { NavLink } from "react-router-dom"

const menu = [
  { path: "/",           icon: "▪", label: "Dashboard",   color: "#10B981" },
  { path: "/clientes",   icon: "▪", label: "Clientes",    color: "#3B82F6" },
  { path: "/vehiculos",  icon: "▪", label: "Vehículos",   color: "#8B5CF6" },
  { path: "/ordenes",    icon: "▪", label: "Órdenes",     color: "#F59E0B" },
  { path: "/inventario", icon: "▪", label: "Inventario",  color: "#EF4444" },
  { path: "/facturas",   icon: "▪", label: "Facturación", color: "#10B981" },
]

export default function Sidebar() {
  return (
    <aside style={{
      width: "240px", minHeight: "100vh",
      background: "#0D1117",
      borderRight: "1px solid #1F2937",
      display: "flex", flexDirection: "column",
      position: "fixed", left: 0, top: 0,
    }}>
      {/* Logo */}
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

      {/* Nav */}
      <nav style={{ padding: "12px 10px", flex: 1 }}>
        <div style={{ fontSize: "10px", fontWeight: "600", color: "#4B5563",
          letterSpacing: ".08em", textTransform: "uppercase",
          padding: "8px 10px 4px" }}>
          Módulos
        </div>
        {menu.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === "/"}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "10px",
              padding: "9px 10px", borderRadius: "8px",
              textDecoration: "none", marginBottom: "2px",
              color: isActive ? "#F9FAFB" : "#6B7280",
              background: isActive ? "#1F2937" : "transparent",
              fontWeight: isActive ? "500" : "400",
              fontSize: "13px",
              transition: "all .15s",
            })}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: item.color, flexShrink: 0
            }} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #1F2937" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: "linear-gradient(135deg, #10B981, #3B82F6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", color: "white", fontWeight: "600"
          }}>A</div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "500", color: "#F9FAFB" }}>Arturo</div>
            <div style={{ fontSize: "11px", color: "#6B7280" }}>Administrador</div>
          </div>
        </div>
      </div>
    </aside>
  )
}