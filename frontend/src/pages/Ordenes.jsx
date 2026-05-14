import { useState, useEffect } from "react"
import { ordenesAPI } from "../services/api"
import FormOrden from "../components/FormOrden"

const ESTADOS = [
  { value: "recibido",             label: "Recibido",             bg: "#1F2937", color: "#9CA3AF" },
  { value: "diagnostico",          label: "Diagnóstico",          bg: "#451A03", color: "#F59E0B" },
  { value: "aprobado",             label: "Aprobado",             bg: "#1E3A5F", color: "#3B82F6" },
  { value: "en_proceso",           label: "En proceso",           bg: "#065F46", color: "#10B981" },
  { value: "esperando_repuestos",  label: "Esp. repuestos",       bg: "#3B1F5F", color: "#8B5CF6" },
  { value: "en_pruebas",           label: "En pruebas",           bg: "#451A03", color: "#F59E0B" },
  { value: "finalizado",           label: "Finalizado",           bg: "#1E3A5F", color: "#3B82F6" },
  { value: "entregado",            label: "Entregado",            bg: "#1F2937", color: "#6B7280" },
]

const prioridadColor = {
  baja: "#6B7280", normal: "#3B82F6", alta: "#F59E0B", urgente: "#EF4444"
}

export default function Ordenes() {
  const [ordenes, setOrdenes]             = useState([])
  const [loading, setLoading]             = useState(true)
  const [filtroEstado, setFiltro]         = useState("todos")
  const [showForm, setShowForm]           = useState(false)
  const [ordenEditar, setOrdenEditar]     = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [cambiando, setCambiando]         = useState(null) // id de orden en cambio

  useEffect(() => { cargarOrdenes() }, [])

  const cargarOrdenes = () => {
    setLoading(true)
    ordenesAPI.listar().then(res => {
      setOrdenes(res.data.results || res.data)
      setLoading(false)
    })
  }

  const handleEditar = (o) => { setOrdenEditar(o); setShowForm(true) }

  const handleEliminar = async (id) => {
    await ordenesAPI.eliminar(id)
    setConfirmDelete(null)
    cargarOrdenes()
  }

  const handleCambiarEstado = async (id, nuevoEstado) => {
    setCambiando(id)
    try {
      await ordenesAPI.cambiarEstado(id, nuevoEstado)
      setOrdenes(prev => prev.map(o => o.id === id ? { ...o, estado: nuevoEstado } : o))
    } catch (e) {
      console.error("Error cambiando estado", e)
    }
    setCambiando(null)
  }

  const siguienteEstado = (estadoActual) => {
    const idx = ESTADOS.findIndex(e => e.value === estadoActual)
    return idx < ESTADOS.length - 1 ? ESTADOS[idx + 1] : null
  }

  const filtrados = filtroEstado === "todos"
    ? ordenes
    : ordenes.filter(o => o.estado === filtroEstado)

  const estadoInfo = (val) => ESTADOS.find(e => e.value === val) || { bg: "#1F2937", color: "#9CA3AF", label: val }

  return (
    <div>
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)", width: "100%", maxWidth: "400px", padding: "1.5rem" }}>
            <div style={{ fontWeight: "600", color: "var(--text)", marginBottom: "8px", fontSize: "16px" }}>
              ¿Eliminar orden?
            </div>
            <div style={{ color: "var(--text3)", fontSize: "13px", marginBottom: "1.5rem" }}>
              Se eliminará la orden <strong style={{ color: "var(--text)" }}>{confirmDelete.codigo}</strong> permanentemente.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn" onClick={() => handleEliminar(confirmDelete.id)}
                style={{ background: "#7F1D1D", color: "#FCA5A5", border: "1px solid #EF4444" }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <FormOrden
          ordenEditar={ordenEditar}
          onGuardado={() => { setShowForm(false); setOrdenEditar(null); cargarOrdenes() }}
          onCancelar={() => { setShowForm(false); setOrdenEditar(null) }}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text)", marginBottom: "4px" }}>
            Órdenes de Trabajo
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>{ordenes.length} órdenes en el sistema</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setOrdenEditar(null); setShowForm(true) }}>
          + Nueva orden
        </button>
      </div>

      {/* Filtros por estado */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button onClick={() => setFiltro("todos")} style={{
          padding: "6px 14px", borderRadius: "20px", border: "none",
          fontSize: "12px", fontWeight: "500", cursor: "pointer",
          background: filtroEstado === "todos" ? "var(--green)" : "var(--bg3)",
          color: filtroEstado === "todos" ? "white" : "var(--text3)",
        }}>Todos ({ordenes.length})</button>
        {ESTADOS.map(e => {
          const count = ordenes.filter(o => o.estado === e.value).length
          if (count === 0) return null
          return (
            <button key={e.value} onClick={() => setFiltro(e.value)} style={{
              padding: "6px 14px", borderRadius: "20px", border: "none",
              fontSize: "12px", fontWeight: "500", cursor: "pointer",
              background: filtroEstado === e.value ? e.bg : "var(--bg3)",
              color: filtroEstado === e.value ? e.color : "var(--text3)",
            }}>{e.label} ({count})</button>
          )
        })}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>No hay órdenes</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Código</th><th>Cliente</th><th>Placa</th>
                <th>Técnico</th><th>Estado</th><th>Prioridad</th>
                <th>Costo</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(o => {
                const siguiente = siguienteEstado(o.estado)
                const info = estadoInfo(o.estado)
                return (
                  <tr key={o.id}>
                    <td style={{ fontFamily: "DM Mono, monospace", fontSize: "12px",
                      color: "var(--text)", fontWeight: "500" }}>{o.codigo}</td>
                    <td style={{ color: "var(--text)" }}>{o.cliente_nombre || "—"}</td>
                    <td style={{ fontFamily: "DM Mono, monospace", fontSize: "12px" }}>{o.vehiculo_placa || "—"}</td>
                    <td>{o.tecnico || "—"}</td>
                    <td>
                      {/* Selector de estado inline */}
                      <select
                        value={o.estado}
                        disabled={cambiando === o.id}
                        onChange={e => handleCambiarEstado(o.id, e.target.value)}
                        style={{
                          background: info.bg,
                          color: info.color,
                          border: `1px solid ${info.color}`,
                          borderRadius: "20px",
                          padding: "3px 8px",
                          fontSize: "11px",
                          fontWeight: "600",
                          cursor: "pointer",
                          opacity: cambiando === o.id ? 0.5 : 1,
                        }}
                      >
                        {ESTADOS.map(e => (
                          <option key={e.value} value={e.value}>{e.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span style={{ color: prioridadColor[o.prioridad], fontWeight: "600", fontSize: "12px" }}>
                        ● {o.prioridad}
                      </span>
                    </td>
                    <td style={{ color: "var(--green)", fontWeight: "600" }}>
                      ${Number(o.costo_final || 0).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        {/* Botón avance rápido al siguiente estado */}
                        {siguiente && (
                          <button
                            onClick={() => handleCambiarEstado(o.id, siguiente.value)}
                            disabled={cambiando === o.id}
                            title={`Avanzar a: ${siguiente.label}`}
                            style={{
                              background: siguiente.bg,
                              border: `1px solid ${siguiente.color}`,
                              color: siguiente.color,
                              borderRadius: "6px",
                              padding: "4px 8px",
                              fontSize: "11px",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}>→ {siguiente.label}</button>
                        )}
                        <button onClick={() => handleEditar(o)} style={{
                          background: "#1E3A5F", border: "1px solid #3B82F6",
                          color: "#3B82F6", borderRadius: "6px",
                          padding: "4px 10px", fontSize: "12px", cursor: "pointer" }}>✏️</button>
                        <button onClick={() => setConfirmDelete(o)} style={{
                          background: "#3B0A0A", border: "1px solid #EF4444",
                          color: "#EF4444", borderRadius: "6px",
                          padding: "4px 10px", fontSize: "12px", cursor: "pointer" }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
