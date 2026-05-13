import { useState, useEffect } from "react"
import { clientesAPI, ordenesAPI, productosAPI, facturasAPI } from "../services/api"

function StatCard({ titulo, valor, color, icono }) {
  return (
    <div style={{
      background: "white", borderRadius: "12px",
      padding: "1.5rem", flex: 1, minWidth: "150px",
      borderLeft: `4px solid ${color}`, boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
    }}>
      <div style={{ fontSize: "24px", marginBottom: "8px" }}>{icono}</div>
      <div style={{ fontSize: "28px", fontWeight: "600", color }}>{valor}</div>
      <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px" }}>{titulo}</div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({ clientes: 0, ordenes: 0, productos: 0, facturas: 0 })

  useEffect(() => {
    Promise.all([
      clientesAPI.listar(),
      ordenesAPI.listar(),
      productosAPI.listar(),
      facturasAPI.listar(),
    ]).then(([c, o, p, f]) => {
      setStats({
        clientes:  (c.data.results || c.data).length,
        ordenes:   (o.data.results || o.data).length,
        productos: (p.data.results || p.data).length,
        facturas:  (f.data.results || f.data).length,
      })
    })
  }, [])

  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem", color: "#1A1A2E" }}>Dashboard</h1>
      <p style={{ color: "#6B7280", marginBottom: "2rem" }}>Resumen del taller</p>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <StatCard titulo="Clientes"  valor={stats.clientes}  color="#0F6E56" icono="👥" />
        <StatCard titulo="Órdenes"   valor={stats.ordenes}   color="#534AB7" icono="🔧" />
        <StatCard titulo="Productos" valor={stats.productos} color="#854F0B" icono="📦" />
        <StatCard titulo="Facturas"  valor={stats.facturas}  color="#185FA5" icono="💰" />
      </div>

      <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <h3 style={{ marginBottom: "1rem", color: "#1A1A2E" }}>Bienvenido a TallerOS</h3>
        <p style={{ color: "#6B7280", lineHeight: "1.6" }}>
          Tu sistema de gestión inteligente está funcionando. 
          Usa el menú lateral para gestionar clientes, vehículos, 
          órdenes de trabajo, inventario y facturación.
        </p>
      </div>
    </div>
  )
}