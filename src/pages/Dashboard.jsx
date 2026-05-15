import { useState, useEffect } from "react"
import { clientesAPI, ordenesAPI, productosAPI, facturasAPI } from "../services/api"

function StatCard({ titulo, valor, color, icono, sub }) {
  return (
    <div className="card" style={{ padding: "1.5rem", flex: 1, minWidth: "160px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "11px", color: "var(--text3)", fontWeight: "600",
            textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" }}>
            {titulo}
          </div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "var(--text)", lineHeight: 1 }}>
            {valor}
          </div>
          {sub && <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "6px" }}>{sub}</div>}
        </div>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: color + "22", display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: "18px"
        }}>
          {icono}
        </div>
      </div>
      <div style={{ marginTop: "16px", height: "3px", borderRadius: "2px",
        background: "var(--border2)" }}>
        <div style={{ height: "100%", borderRadius: "2px",
          background: color, width: "60%" }} />
      </div>
    </div>
  )
}

function OrdenRow({ orden }) {
  const estadoColor = {
    recibido:    { bg: "#1F2937", color: "#9CA3AF" },
    en_proceso:  { bg: "#065F46", color: "#10B981" },
    finalizado:  { bg: "#1E3A5F", color: "#3B82F6" },
    entregado:   { bg: "#1F2937", color: "#6B7280" },
    diagnostico: { bg: "#451A03", color: "#F59E0B" },
  }
  const s = estadoColor[orden.estado] || estadoColor.recibido
  return (
    <tr>
      <td style={{ color: "var(--text)", fontWeight: "500", fontFamily: "DM Mono, monospace",
        fontSize: "12px" }}>{orden.codigo}</td>
      <td>{orden.cliente_nombre || "—"}</td>
      <td>{orden.vehiculo_placa || "—"}</td>
      <td>
        <span className="badge" style={{ background: s.bg, color: s.color }}>
          {orden.estado.replace("_", " ")}
        </span>
      </td>
      <td style={{ color: "var(--green)", fontWeight: "600" }}>
        ${Number(orden.costo_final || 0).toLocaleString()}
      </td>
    </tr>
  )
}

export default function Dashboard() {
  const [stats, setStats]   = useState({ clientes: 0, ordenes: 0, productos: 0, facturas: 0 })
  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      clientesAPI.listar(),
      ordenesAPI.listar(),
      productosAPI.listar(),
      facturasAPI.listar(),
    ]).then(([c, o, p, f]) => {
      const ords = o.data.results || o.data
      setStats({
        clientes:  (c.data.results || c.data).length,
        ordenes:   ords.length,
        productos: (p.data.results || p.data).length,
        facturas:  (f.data.results || f.data).length,
      })
      setOrdenes(ords.slice(0, 5))
      setLoading(false)
    })
  }, [])

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text)", marginBottom: "4px" }}>
          Dashboard
        </h1>
        <p style={{ color: "var(--text3)", fontSize: "13px" }}>
          {new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric",
            month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <StatCard titulo="Clientes"  valor={stats.clientes}  color="#10B981" icono="👥" sub="Total registrados" />
        <StatCard titulo="Órdenes"   valor={stats.ordenes}   color="#8B5CF6" icono="🔧" sub="En el sistema" />
        <StatCard titulo="Productos" valor={stats.productos} color="#F59E0B" icono="📦" sub="En inventario" />
        <StatCard titulo="Facturas"  valor={stats.facturas}  color="#3B82F6" icono="💰" sub="Emitidas" />
      </div>

      {/* Órdenes recientes */}
      <div className="card">
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: "600", color: "var(--text)" }}>Órdenes recientes</div>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
              Últimas órdenes de trabajo
            </div>
          </div>
        </div>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
            Cargando...
          </div>
        ) : ordenes.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
            No hay órdenes todavía
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th>Placa</th>
                <th>Estado</th>
                <th>Costo</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map(o => <OrdenRow key={o.id} orden={o} />)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}