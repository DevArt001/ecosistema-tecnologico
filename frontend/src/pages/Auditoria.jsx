import { useState, useEffect } from "react"
import API from "../services/api"
import { PageHeader, Toast, EmptyState, KPICard, SearchBar, TableSkeleton } from "../components/UI"

const ACCIONES = {
  crear:    { color: "#00D4A0", bg: "#00D4A015", icon: "➕", label: "Crear" },
  editar:   { color: "#1E5FD4", bg: "#1E5FD415", icon: "✏️", label: "Editar" },
  eliminar: { color: "#E8213A", bg: "#E8213A15", icon: "🗑️", label: "Eliminar" },
  ver:      { color: "#4A5A72", bg: "#4A5A7215", icon: "👁️", label: "Ver" },
  login:    { color: "#8B5CF6", bg: "#8B5CF615", icon: "🔐", label: "Login" },
  logout:   { color: "#F5A623", bg: "#F5A62315", icon: "🚪", label: "Logout" },
  export:   { color: "#06C4E0", bg: "#06C4E015", icon: "📤", label: "Export" },
}

export default function Auditoria() {
  const [logs, setLogs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [buscar, setBuscar]       = useState("")
  const [filtroAccion, setFiltroAccion] = useState("")
  const [filtroModulo, setFiltroModulo] = useState("")
  const [mensaje, setMensaje]     = useState("")

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const r = await API.get("/auditlog/")
      setLogs(r.data.results || r.data)
    } catch { }
    setLoading(false)
  }

  const mostrar = (msg) => { setMensaje(msg); setTimeout(() => setMensaje(""), 3000) }

  const logsFiltrados = logs.filter(l => {
    const matchBuscar = !buscar ||
      l.descripcion?.toLowerCase().includes(buscar.toLowerCase()) ||
      l.usuario_nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
      l.modulo?.toLowerCase().includes(buscar.toLowerCase())
    const matchAccion = !filtroAccion || l.accion === filtroAccion
    const matchModulo = !filtroModulo || l.modulo === filtroModulo
    return matchBuscar && matchAccion && matchModulo
  })

  const modulos = [...new Set(logs.map(l => l.modulo))].filter(Boolean).sort()

  const hoy = new Date().toDateString()
  const logsHoy = logs.filter(l => new Date(l.fecha).toDateString() === hoy).length

  return (
    <div>
      <Toast mensaje={mensaje} />

      <PageHeader titulo="Auditoría"
        sub="Registro completo de todas las acciones del sistema">
        <button className="btn btn-secondary" onClick={cargar}>↻ Actualizar</button>
      </PageHeader>

      {/* KPIs */}
      <div className="stagger" style={{ display: "flex", gap: "1rem",
        flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <KPICard titulo="Total logs" valor={logs.length}
          color="#1E5FD4" icon="📋" delay={0} />
        <KPICard titulo="Hoy" valor={logsHoy}
          color="#00D4A0" icon="📅" delay={.04} />
        <KPICard titulo="Creaciones" valor={logs.filter(l=>l.accion==="crear").length}
          color="#00D4A0" icon="➕" delay={.08} />
        <KPICard titulo="Eliminaciones" valor={logs.filter(l=>l.accion==="eliminar").length}
          color="#E8213A" icon="🗑️" delay={.12} />
      </div>

      {/* Filtros acciones */}
      <div className="fade-in" style={{ display: "flex", gap: "6px",
        flexWrap: "wrap", marginBottom: "1rem" }}>
        <button onClick={() => setFiltroAccion("")} style={{
          padding: "5px 14px", borderRadius: "20px", border: "none",
          fontSize: "12px", fontWeight: "500", cursor: "pointer",
          background: !filtroAccion ? "var(--red)" : "var(--bg3)",
          color: !filtroAccion ? "white" : "var(--text3)",
          transition: "all .15s",
        }}>Todas ({logs.length})</button>
        {Object.entries(ACCIONES).map(([accion, config]) => {
          const count = logs.filter(l => l.accion === accion).length
          if (count === 0) return null
          return (
            <button key={accion}
              onClick={() => setFiltroAccion(filtroAccion === accion ? "" : accion)}
              style={{
                padding: "5px 14px", borderRadius: "20px", border: "none",
                fontSize: "12px", fontWeight: "500", cursor: "pointer",
                background: filtroAccion === accion ? config.bg : "var(--bg3)",
                color: filtroAccion === accion ? config.color : "var(--text3)",
                transition: "all .15s",
              }}>
              {config.icon} {config.label} ({count})
            </button>
          )
        })}
      </div>

      <div className="card fade-in">
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)",
          display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <SearchBar value={buscar} onChange={setBuscar}
            placeholder="Buscar usuario, módulo, acción..." />
          <select value={filtroModulo} onChange={e => setFiltroModulo(e.target.value)}
            style={{ width: "140px" }}>
            <option value="">Todos los módulos</option>
            {modulos.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {(buscar || filtroAccion || filtroModulo) && (
            <button onClick={() => { setBuscar(""); setFiltroAccion(""); setFiltroModulo("") }}
              className="btn btn-ghost" style={{ padding: "8px 12px", fontSize: "12px" }}>
              ✕ Limpiar
            </button>
          )}
          <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--text3)" }}>
            {logsFiltrados.length} registros
          </span>
        </div>

        <table>
          <thead>
            <tr><th>Fecha</th><th>Usuario</th><th>Acción</th>
              <th>Módulo</th><th>Descripción</th><th>IP</th></tr>
          </thead>
          <tbody>
            {loading ? <TableSkeleton rows={6} cols={6} /> :
             logsFiltrados.length === 0 ? (
              <tr><td colSpan="6">
                <EmptyState icon="📋" titulo="Sin registros"
                  sub="Las acciones del sistema aparecerán aquí automáticamente" />
              </td></tr>
            ) : logsFiltrados.map(log => {
              const a = ACCIONES[log.accion] || ACCIONES.ver
              return (
                <tr key={log.id} className="fade-in">
                  <td style={{ fontSize: "11px", color: "var(--text3)",
                    whiteSpace: "nowrap", fontFamily: "var(--font-mono)" }}>
                    {new Date(log.fecha).toLocaleString("es-CO", {
                      day: "2-digit", month: "2-digit", year: "2-digit",
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </td>
                  <td style={{ fontWeight: "600", color: "var(--text)", fontSize: "13px" }}>
                    @{log.usuario_nombre || "sistema"}
                  </td>
                  <td>
                    <span style={{ background: a.bg, color: a.color,
                      padding: "3px 10px", borderRadius: "20px",
                      fontSize: "11px", fontWeight: "600",
                      display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      {a.icon} {a.label}
                    </span>
                  </td>
                  <td>
                    <span style={{ background: "var(--bg3)", color: "var(--text3)",
                      padding: "2px 8px", borderRadius: "6px",
                      fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                      {log.modulo}
                    </span>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text2)",
                    maxWidth: "280px", overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {log.descripcion}
                  </td>
                  <td style={{ fontSize: "11px", color: "var(--text3)",
                    fontFamily: "var(--font-mono)" }}>
                    {log.ip || "—"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div style={{ padding: "10px 1.25rem", borderTop: "1px solid var(--border)",
          fontSize: "11px", color: "var(--text3)" }}>
          {logsFiltrados.length} registros mostrados
          {(buscar || filtroAccion || filtroModulo) && ` de ${logs.length} totales`}
        </div>
      </div>
    </div>
  )
}
