import { useState, useEffect } from "react"
import API from "../services/api"

const ACCIONES = {
  crear:    { color: "#10B981", bg: "#065F46", icon: "➕" },
  editar:   { color: "#3B82F6", bg: "#1E3A5F", icon: "✏️" },
  eliminar: { color: "#EF4444", bg: "#3B0A0A", icon: "🗑️" },
  ver:      { color: "#9CA3AF", bg: "#1F2937", icon: "👁️" },
  login:    { color: "#8B5CF6", bg: "#2D1B69", icon: "🔐" },
  logout:   { color: "#F59E0B", bg: "#451A03", icon: "🚪" },
  export:   { color: "#06B6D4", bg: "#0C4A6E", icon: "📤" },
}

export default function Auditoria() {
  const [logs, setLogs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [buscar, setBuscar]     = useState("")
  const [filtroAccion, setFiltroAccion] = useState("")
  const [filtroModulo, setFiltroModulo] = useState("")

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const res = await API.get("/auditlog/")
      setLogs(res.data.results || res.data)
    } catch { }
    setLoading(false)
  }

  const logsFiltrados = logs.filter(l => {
    const matchBuscar = !buscar ||
      l.descripcion?.toLowerCase().includes(buscar.toLowerCase()) ||
      l.usuario_nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
      l.modulo?.toLowerCase().includes(buscar.toLowerCase())
    const matchAccion = !filtroAccion || l.accion === filtroAccion
    const matchModulo = !filtroModulo || l.modulo === filtroModulo
    return matchBuscar && matchAccion && matchModulo
  })

  const modulos = [...new Set(logs.map(l => l.modulo))].filter(Boolean)

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700",
            color: "var(--text)", marginBottom: "4px" }}>Auditoría</h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>
            Registro de todas las acciones del sistema
          </p>
        </div>
        <button className="btn btn-primary" onClick={cargar}>↻ Actualizar</button>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input value={buscar} onChange={e => setBuscar(e.target.value)}
          placeholder="Buscar..." style={{ width: "220px" }} />
        <select value={filtroAccion} onChange={e => setFiltroAccion(e.target.value)}
          style={{ width: "140px" }}>
          <option value="">Todas las acciones</option>
          {Object.keys(ACCIONES).map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select value={filtroModulo} onChange={e => setFiltroModulo(e.target.value)}
          style={{ width: "140px" }}>
          <option value="">Todos los módulos</option>
          {modulos.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {(buscar || filtroAccion || filtroModulo) && (
          <button onClick={() => { setBuscar(""); setFiltroAccion(""); setFiltroModulo("") }}
            style={{ background: "transparent", border: "1px solid var(--border)",
              color: "var(--text3)", borderRadius: "8px", padding: "6px 12px",
              fontSize: "12px", cursor: "pointer" }}>
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* Resumen */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {Object.entries(ACCIONES).map(([accion, config]) => {
          const count = logs.filter(l => l.accion === accion).length
          if (count === 0) return null
          return (
            <div key={accion} onClick={() => setFiltroAccion(filtroAccion === accion ? "" : accion)}
              style={{
                padding: "6px 14px", borderRadius: "20px", cursor: "pointer",
                background: filtroAccion === accion ? config.color : config.bg,
                border: `1px solid ${config.color}`,
                color: filtroAccion === accion ? "white" : config.color,
                fontSize: "12px", fontWeight: "600"
              }}>
              {config.icon} {accion} ({count})
            </div>
          )
        })}
      </div>

      {/* Tabla */}
      <div className="card">
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
            Cargando logs...
          </div>
        ) : logsFiltrados.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
            No hay registros de auditoría todavía.
            Los logs aparecen automáticamente cuando se realizan acciones en el sistema.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Módulo</th>
                <th>Descripción</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {logsFiltrados.map(log => {
                const a = ACCIONES[log.accion] || ACCIONES.ver
                return (
                  <tr key={log.id}>
                    <td style={{ fontSize: "11px", color: "var(--text3)", whiteSpace: "nowrap" }}>
                      {new Date(log.fecha).toLocaleString("es-CO", {
                        day: "2-digit", month: "2-digit", year: "2-digit",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td style={{ fontWeight: "600", color: "var(--text)", fontSize: "13px" }}>
                      @{log.usuario_nombre || "sistema"}
                    </td>
                    <td>
                      <span style={{
                        background: a.bg, color: a.color,
                        padding: "3px 10px", borderRadius: "20px",
                        fontSize: "11px", fontWeight: "600"
                      }}>
                        {a.icon} {log.accion}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        background: "var(--bg1)", color: "var(--text2)",
                        padding: "2px 8px", borderRadius: "4px", fontSize: "11px"
                      }}>
                        {log.modulo}
                      </span>
                    </td>
                    <td style={{ fontSize: "13px", color: "var(--text2)", maxWidth: "300px" }}>
                      {log.descripcion}
                    </td>
                    <td style={{ fontSize: "11px", color: "var(--text3)", fontFamily: "monospace" }}>
                      {log.ip || "—"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)",
          fontSize: "12px", color: "var(--text3)" }}>
          {logsFiltrados.length} registros {buscar || filtroAccion || filtroModulo ? "filtrados" : "totales"}
        </div>
      </div>
    </div>
  )
}
