import { useState, useEffect } from "react"
import { ordenesAPI } from "../services/api"

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltro] = useState("todos")

  useEffect(() => {
    ordenesAPI.listar().then(res => {
      setOrdenes(res.data.results || res.data)
      setLoading(false)
    })
  }, [])

  const estados = ["todos","recibido","diagnostico","en_proceso","finalizado","entregado"]

  const filtrados = filtroEstado === "todos"
    ? ordenes
    : ordenes.filter(o => o.estado === filtroEstado)

  const estadoBadge = {
    recibido:    { bg: "#1F2937", color: "#9CA3AF" },
    diagnostico: { bg: "#451A03", color: "#F59E0B" },
    aprobado:    { bg: "#1E3A5F", color: "#3B82F6" },
    en_proceso:  { bg: "#065F46", color: "#10B981" },
    esperando_repuestos: { bg: "#3B1F5F", color: "#8B5CF6" },
    en_pruebas:  { bg: "#451A03", color: "#F59E0B" },
    finalizado:  { bg: "#1E3A5F", color: "#3B82F6" },
    entregado:   { bg: "#1F2937", color: "#6B7280" },
  }

  const prioridadColor = {
    baja: "#6B7280", normal: "#3B82F6", alta: "#F59E0B", urgente: "#EF4444"
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text)", marginBottom: "4px" }}>
            Órdenes de Trabajo
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>
            {ordenes.length} órdenes en el sistema
          </p>
        </div>
        <button className="btn btn-primary">+ Nueva orden</button>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {estados.map(e => (
          <button key={e} onClick={() => setFiltro(e)}
            style={{
              padding: "6px 14px", borderRadius: "20px", border: "none",
              fontSize: "12px", fontWeight: "500",
              background: filtroEstado === e ? "var(--green)" : "var(--bg3)",
              color: filtroEstado === e ? "white" : "var(--text3)",
            }}>
            {e === "todos" ? "Todos" : e.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>Cargando...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Código</th><th>Cliente</th><th>Placa</th>
                <th>Técnico</th><th>Estado</th><th>Prioridad</th><th>Costo</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: "DM Mono, monospace", fontSize: "12px",
                    color: "var(--text)", fontWeight: "500" }}>{o.codigo}</td>
                  <td style={{ color: "var(--text)" }}>{o.cliente_nombre || "—"}</td>
                  <td style={{ fontFamily: "DM Mono, monospace", fontSize: "12px" }}>
                    {o.vehiculo_placa || "—"}
                  </td>
                  <td>{o.tecnico || "—"}</td>
                  <td>
                    <span className="badge" style={{
                      background: estadoBadge[o.estado]?.bg || "#1F2937",
                      color: estadoBadge[o.estado]?.color || "#9CA3AF"
                    }}>{o.estado.replace("_", " ")}</span>
                  </td>
                  <td>
                    <span style={{ color: prioridadColor[o.prioridad], fontWeight: "600",
                      fontSize: "12px" }}>
                      ● {o.prioridad}
                    </span>
                  </td>
                  <td style={{ color: "var(--green)", fontWeight: "600" }}>
                    ${Number(o.costo_final || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}