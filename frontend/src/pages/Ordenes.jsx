import { useState, useEffect } from "react"
import { ordenesAPI, portalAPI, procesosAPI } from "../services/api"
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

const PASOS_GUIA = [
  { numero: 1, titulo: "Diagnóstico", descripcion: "Inspección inicial y diagnóstico del vehículo" },
  { numero: 2, titulo: "Presupuesto", descripcion: "Elaboración y aprobación del presupuesto" },
  { numero: 3, titulo: "Reparación", descripcion: "Ejecución del trabajo de reparación" },
  { numero: 4, titulo: "Pruebas", descripcion: "Pruebas de funcionamiento del vehículo" },
  { numero: 5, titulo: "Entrega", descripcion: "Entrega y explicación al cliente" },
]

export default function Ordenes() {
  const [ordenes, setOrdenes]             = useState([])
  const [loading, setLoading]             = useState(true)
  const [filtroEstado, setFiltro]         = useState("todos")
  const [showForm, setShowForm]           = useState(false)
  const [ordenEditar, setOrdenEditar]     = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [cambiando, setCambiando]         = useState(null)
  const [generandoLink, setGenerandoLink] = useState(null)
  const [mensajeExito, setMensajeExito]   = useState("")
  const [showEditorProceso, setShowEditorProceso] = useState(null)
  const [ordenDetalles, setOrdenDetalles] = useState(null)
  const [nuevoPaso, setNuevoPaso]         = useState({ numero: 1, titulo: "", descripcion: "" })
  const [nuevaFoto, setNuevaFoto]         = useState({ file: null, descripcion: "", paso_numero: 1 })
  const [guardandoPaso, setGuardandoPaso] = useState(false)
  const [guardandoFoto, setGuardandoFoto] = useState(false)

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

  const handleGenerarLink = async (ordenId) => {
    setGenerandoLink(ordenId)
    try {
      const res = await portalAPI.generarLink(ordenId)
      const urlCompleta = `${window.location.origin}/portal/${res.data.token}`
      navigator.clipboard.writeText(urlCompleta)
      setMensajeExito(`✅ Link generado y copiado: ${res.data.token.slice(0,15)}...`)
    } catch (e) {
      setMensajeExito(`❌ Error generando link`)
    }
    setGenerandoLink(null)
    setTimeout(() => setMensajeExito(""), 3000)
  }

  const handleAbrirEditorProceso = async (ordenId) => {
    try {
      const res = await procesosAPI.obtenerDetalles(ordenId)
      setOrdenDetalles(res.data)
      setShowEditorProceso(ordenId)
    } catch (e) {
      setMensajeExito("❌ Error cargando orden")
    }
  }

  const handleAgregarPaso = async () => {
    if (!nuevoPaso.titulo) {
      setMensajeExito("❌ Completa el título del paso")
      return
    }
    setGuardandoPaso(true)
    try {
      await procesosAPI.agregarPaso(showEditorProceso, nuevoPaso)
      const res = await procesosAPI.obtenerDetalles(showEditorProceso)
      setOrdenDetalles(res.data)
      setNuevoPaso({ numero: (nuevoPaso.numero || 0) + 1, titulo: "", descripcion: "" })
      setMensajeExito("✅ Paso agregado")
    } catch (e) {
      setMensajeExito("❌ Error agregando paso")
    }
    setGuardandoPaso(false)
  }

  const handleAgregarFoto = async () => {
    if (!nuevaFoto.file) {
      setMensajeExito("❌ Selecciona una foto")
      return
    }
    setGuardandoFoto(true)
    try {
      const formData = new FormData()
      formData.append('foto', nuevaFoto.file)
      formData.append('descripcion', nuevaFoto.descripcion)
      formData.append('paso_numero', nuevaFoto.paso_numero)
      
      await procesosAPI.agregarFoto(showEditorProceso, formData)
      const res = await procesosAPI.obtenerDetalles(showEditorProceso)
      setOrdenDetalles(res.data)
      setNuevaFoto({ file: null, descripcion: "", paso_numero: 1 })
      setMensajeExito("✅ Foto subida")
    } catch (e) {
      setMensajeExito("❌ Error subiendo foto")
    }
    setGuardandoFoto(false)
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
      {/* Mensaje de éxito */}
      {mensajeExito && (
        <div style={{
          position: "fixed", top: "1rem", right: "1rem", zIndex: 9999,
          background: mensajeExito.startsWith("✅") ? "#065F46" : "#3B0A0A",
          border: `1px solid ${mensajeExito.startsWith("✅") ? "#10B981" : "#EF4444"}`,
          color: "white", borderRadius: "8px", padding: "12px 20px", fontSize: "13px", fontWeight: "500"
        }}>{mensajeExito}</div>
      )}

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

      {/* MODAL: EDITOR DE PROCESO */}
      {showEditorProceso && ordenDetalles && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem", overflowY: "auto" }}>
          <div style={{ background: "var(--bg2)", borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)", width: "100%", maxWidth: "700px", padding: "1.5rem", maxHeight: "90vh", overflowY: "auto" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "var(--text)", fontSize: "18px", fontWeight: "700" }}>
                📝 Editar Proceso — {ordenDetalles.codigo}
              </h2>
              <button onClick={() => setShowEditorProceso(null)}
                style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: "24px" }}>×</button>
            </div>

            {/* TABS */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
              <button style={{
                background: "none", border: "none", color: "#10B981",
                fontSize: "14px", fontWeight: "600", cursor: "pointer",
                borderBottom: "2px solid #10B981", paddingBottom: "4px"
              }}>🔧 Pasos</button>
              <button style={{
                background: "none", border: "none", color: "#6B7280",
                fontSize: "14px", fontWeight: "600", cursor: "pointer",
                paddingBottom: "4px"
              }}>📸 Fotos</button>
            </div>

            {/* AGREGAR PASOS */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ color: "var(--text)", fontSize: "14px", fontWeight: "600", marginBottom: "1rem" }}>
                Agregar Paso del Proceso
              </h3>
              <div style={{ display: "grid", gap: "8px", marginBottom: "1rem" }}>
                <input type="number" min="1" value={nuevoPaso.numero}
                  onChange={e => setNuevoPaso({...nuevoPaso, numero: parseInt(e.target.value)})}
                  placeholder="Número" style={{ width: "100%" }} />
                <input type="text" value={nuevoPaso.titulo}
                  onChange={e => setNuevoPaso({...nuevoPaso, titulo: e.target.value})}
                  placeholder="Título (ej: Diagnóstico, Reparación...)" style={{ width: "100%" }} />
                <textarea value={nuevoPaso.descripcion}
                  onChange={e => setNuevoPaso({...nuevoPaso, descripcion: e.target.value})}
                  placeholder="Descripción detallada" style={{ width: "100%", minHeight: "80px" }} />
              </div>
              <button className="btn btn-primary" onClick={handleAgregarPaso} disabled={guardandoPaso}
                style={{ width: "100%" }}>
                {guardandoPaso ? "Guardando..." : "+ Agregar Paso"}
              </button>

              {/* Guía */}
              <div style={{ marginTop: "1.5rem", background: "#1F2937", borderRadius: "8px", padding: "1rem" }}>
                <p style={{ color: "#6B7280", fontSize: "12px", marginBottom: "8px", fontWeight: "600" }}>💡 Guía sugerida:</p>
                {PASOS_GUIA.map(p => (
                  <div key={p.numero} style={{ color: "#9CA3AF", fontSize: "12px", marginBottom: "4px" }}>
                    <strong>{p.numero}. {p.titulo}:</strong> {p.descripcion}
                  </div>
                ))}
              </div>
            </div>

            {/* PASOS ACTUALES */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ color: "var(--text)", fontSize: "14px", fontWeight: "600", marginBottom: "1rem" }}>
                Pasos Registrados ({ordenDetalles.pasos?.length || 0})
              </h3>
              {!ordenDetalles.pasos || ordenDetalles.pasos.length === 0 ? (
                <p style={{ color: "var(--text3)", fontSize: "13px" }}>Sin pasos aún</p>
              ) : (
                ordenDetalles.pasos.map(paso => (
                  <div key={paso.id} style={{
                    background: "#111827", borderRadius: "8px", padding: "12px",
                    marginBottom: "8px", borderLeft: `4px solid #10B981`
                  }}>
                    <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "13px", marginBottom: "4px" }}>
                      {paso.numero}. {paso.titulo}
                    </div>
                    <p style={{ color: "var(--text3)", fontSize: "12px", lineHeight: "1.5" }}>
                      {paso.descripcion}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* AGREGAR FOTOS */}
            <div>
              <h3 style={{ color: "var(--text)", fontSize: "14px", fontWeight: "600", marginBottom: "1rem" }}>
                Subir Fotos del Proceso
              </h3>
              <div style={{ display: "grid", gap: "8px", marginBottom: "1rem" }}>
                <input type="file" accept="image/*"
                  onChange={e => setNuevaFoto({...nuevaFoto, file: e.target.files?.[0]})}
                  style={{ width: "100%" }} />
                <textarea value={nuevaFoto.descripcion}
                  onChange={e => setNuevaFoto({...nuevaFoto, descripcion: e.target.value})}
                  placeholder="Descripción de la foto (ej: Estado inicial, después del diagnóstico...)"
                  style={{ width: "100%", minHeight: "60px" }} />
                <select value={nuevaFoto.paso_numero}
                  onChange={e => setNuevaFoto({...nuevaFoto, paso_numero: parseInt(e.target.value)})}
                  style={{ width: "100%" }}>
                  <option>Selecciona el paso...</option>
                  {PASOS_GUIA.map(p => (
                    <option key={p.numero} value={p.numero}>
                      Paso {p.numero}: {p.titulo}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" onClick={handleAgregarFoto} disabled={guardandoFoto}
                style={{ width: "100%" }}>
                {guardandoFoto ? "Subiendo..." : "📸 Subir Foto"}
              </button>

              {/* FOTOS ACTUALES */}
              {ordenDetalles.fotos && ordenDetalles.fotos.length > 0 && (
                <div style={{ marginTop: "1.5rem" }}>
                  <p style={{ color: "var(--text3)", fontSize: "12px", marginBottom: "8px" }}>
                    {ordenDetalles.fotos.length} foto(s) subida(s)
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "8px" }}>
                    {ordenDetalles.fotos.map(foto => (
                      <div key={foto.id} style={{
                        borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)"
                      }}>
                        <img src={foto.foto} alt={foto.descripcion}
                          style={{ width: "100%", height: "100px", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "2rem" }}>
              <button className="btn btn-secondary" onClick={() => setShowEditorProceso(null)}>
                Cerrar
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
          background: filtroEstado === "todos" ? "#10B981" : "#1F2937",
          color: filtroEstado === "todos" ? "white" : "#6B7280",
        }}>Todos ({ordenes.length})</button>
        {ESTADOS.map(e => {
          const count = ordenes.filter(o => o.estado === e.value).length
          if (count === 0) return null
          return (
            <button key={e.value} onClick={() => setFiltro(e.value)} style={{
              padding: "6px 14px", borderRadius: "20px", border: "none",
              fontSize: "12px", fontWeight: "500", cursor: "pointer",
              background: filtroEstado === e.value ? e.bg : "#1F2937",
              color: filtroEstado === e.value ? e.color : "#6B7280",
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
                    <td style={{ color: "#10B981", fontWeight: "600" }}>
                      ${Number(o.costo_final || 0).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                        {/* Botón editar proceso */}
                        <button
                          onClick={() => alert("Modalidad en desarrollo - usa el portal cliente para ver el progreso")}
                          title="Editar pasos y fotos"
                          style={{
                            background: "#1E3A5F",
                            border: "1px solid #3B82F6",
                            color: "#3B82F6",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            fontSize: "11px",
                            cursor: "pointer",
                          }}>📝</button>

                        {/* Botón generar link */}
                        <button
                          onClick={() => handleGenerarLink(o.id)}
                          disabled={generandoLink === o.id}
                          title="Generar link temporal para el cliente"
                          style={{
                            background: "#065F46",
                            border: "1px solid #10B981",
                            color: "#10B981",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            fontSize: "11px",
                            cursor: "pointer",
                            opacity: generandoLink === o.id ? 0.5 : 1,
                          }}>
                          {generandoLink === o.id ? "..." : "🔗"}
                        </button>

                        {/* Botón avance rápido */}
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
                            }}>→</button>
                        )}

                        {/* Botón editar */}
                        <button onClick={() => handleEditar(o)} style={{
                          background: "#1F2937", border: "1px solid #374151",
                          color: "#D1D5DB", borderRadius: "6px",
                          padding: "4px 10px", fontSize: "12px", cursor: "pointer" }}>✏️</button>

                        {/* Botón eliminar */}
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
