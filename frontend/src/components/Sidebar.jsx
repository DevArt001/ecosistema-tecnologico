import { NavLink } from "react-router-dom"

const menu = [
  { path: "/",          icon: "📊", label: "Dashboard"   },
  { path: "/clientes",  icon: "👥", label: "Clientes"    },
  { path: "/vehiculos", icon: "🏍️", label: "Vehículos"   },
  { path: "/ordenes",   icon: "🔧", label: "Órdenes"     },
  { path: "/inventario",icon: "📦", label: "Inventario"  },
  { path: "/facturas",  icon: "💰", label: "Facturación" },
]

export default function Sidebar() {
  return (
    <aside style={{
      width: "220px", minHeight: "100vh",
      background: "#1A1A2E", color: "white",
      display: "flex", flexDirection: "column",
      padding: "0", position: "fixed", left: 0, top: 0,
    }}>
      <div style={{ padding: "1.5rem", borderBottom: "1px solid #2d2d4e" }}>
        <h2 style={{ margin: 0, fontSize: "16px", color: "#0F6E56" }}>🔧 TallerOS</h2>
        <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#6B7280" }}>Sistema de gestión</p>
      </div>
      <nav style={{ padding: "1rem 0", flex: 1 }}>
        {menu.map(item => (
          <NavLink key={item.path} to={item.path}
            end={item.path === "/"}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 1.5rem", textDecoration: "none",
              color: isActive ? "white" : "#9CA3AF",
              background: isActive ? "#0F6E56" : "transparent",
              fontSize: "14px", borderLeft: isActive ? "3px solid #58d68d" : "3px solid transparent",
            })}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #2d2d4e",
        fontSize: "11px", color: "#6B7280" }}>
        Arturo · DevArt001
      </div>
    </aside>
  )
}