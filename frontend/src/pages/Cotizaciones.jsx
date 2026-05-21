import { useState, useEffect } from "react"
import API from "../services/api"

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([])
  const [ordenes, setOrdenes]           = useState([])
  const [modal, setModal]               = useState(null)
  const [cotActual, setCotActual]       = useState(null)
  const [form, setForm]                 = useState({ orden: "", descuento: 0, vigencia_dias: 15, notas: "" })
  const [lineaForm, setLineaForm]       = useState({ tipo: "servicio", descripcion: "", cantidad: 1, precio_costo: 0, precio_unit: 0 })
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [mensaje, setMensaje]           = useState("")

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      const [c, o] = await Promise.all([
        API.get("/cotizaciones/"),
        API.get("/ordenes/")
      ])
      setCotizaciones(c.data.results || c.data)
      setOrdenes(o.data.results || o.data)
    } catch (err) {
      setError(err.mensaje || "Error al cargar cotizaciones")
    }
  }

  const mostrarMensaje = (msg) => {
    setMensaje(msg)
    setTimeout(() => setMensaje(""), 3000)
  }

  const crearCotizacion = async () => {
    if (!form.orden) return mostrarMensaje("❌ Selecciona una orden")
    setLoading(true)
    try {
      const orden = ordenes.find(o => o.id == form.orden)
      const res = await API.post("/cotizaciones/", {
        orden: form.orden,
        cliente: orden.cliente,
        descuento: form.descuento,
        vigencia_dias: form.vigencia_dias,
        notas: form.notas
      })
      setCotActual(res.data)
      setModal("detalle")
      cargar()
    } catch (e) {
      mostrarMensaje("❌ Error al crear cotización")
    }
    setLoading(false)
  }

  const agregarLinea = async () => {
    if (!lineaForm.descripcion) return mostrarMensaje("❌ Ingresa una descripción")
    try {
      await API.post(`/cotizaciones/${cotActual.id}/agregar_linea/`, lineaForm)
      const res = await API.get(`/cotizaciones/${cotActual.id}/`)
      setCotActual(res.data)
      setLineaForm({ tipo: "servicio", descripcion: "", cantidad: 1, precio_costo: 0, precio_unit: 0 })
      cargar()
    } catch (e) {
      mostrarMensaje("❌ Error al agregar línea")
    }
  }

  const eliminarLinea = async (lineaId) => {
    try {
      await API.delete(`/cotizaciones/${cotActual.id}/eliminar_linea/${lineaId}/`)
      const res = await API.get(`/cotizaciones/${cotActual.id}/`)
      setCotActual(res.data)
      cargar()
    } catch (e) {
      mostrarMensaje("❌ Error al eliminar línea")
    }
  }

  const aprobar = async () => {
    if (!window.confirm("¿Aprobar cotización y generar factura?")) return
    try {
      const res = await API.post(`/cotizaciones/${cotActual.id}/aprobar/`)
      mostrarMensaje("✅ Factura generada correctamente")
      setModal(null)
      cargar()
    } catch (e) {
      mostrarMensaje("❌ Error al aprobar cotización")
    }
  }

  const verPDF = () => {
    const baseURL = API.defaults.baseURL.replace('/api', '')
    window.open(`${baseURL}/api/cotizaciones/${cotActual.id}/pdf/`, "_blank")
  }

  const estadoColor = {
    borrador:  { bg: "#1F2937", color: "#9CA3AF" },
    enviada:   { bg: "#1E3A5F", color: "#3B82F6" },
    aprobada:  { bg: "#065F46", color: "#10B981" },
    rechazada: { bg: "#3B0A0A", color: "#EF4444" },
  }

  return (
    <div>
      {mensaje && (
        <div style={{
          position: "fixed", top: "1rem", right: "1rem", zIndex: 9999,
          background: mensaje.startsWith("✅") ? "#065F46" : "#3B0A0A",
          border: `1px solid ${mensaje.startsWith("✅") ? "#10B981" : "#EF4444"}`,
          color: "white", borderRadius: "8px", padding: "12px 20px",
          fontSize: "13px", fontWeight: "500"
        }}>{mensaje}</div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text)", marginBottom: "4px" }}>
            Cotizaciones
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>{cotizaciones.length} cotizaciones</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setForm({ orden: "", descuento: 0, vigencia_dias: 15, notas: "" })
          setModal("nueva")
        }}>
          + Nueva Cotización
        </button>
      </div>

      {error && (
        <div style={{ background: "#3B0A0A", border: "1px solid #EF4444", borderRadius: "8px",
          padding: "12px 16px", marginBottom: "1rem", color: "#FCA5A5", fontSize: "13px",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {error}
          <button onClick={cargar} style={{ background: "none", border: "none",
            color: "#FCA5A5", cursor: "pointer", fontSize: "12px", textDecoration: "underline" }}>
            Reintentar
          </button>
        </div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Número</th><th>Cliente</th><th>Vehículo</th>
              <th>Total</th><th>Estado</th><th>Fecha</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cotizaciones.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
                No hay cotizaciones
              </td></tr>
            ) : cotizaciones.map(c => (
              <tr key={c.id}>
                <td style={{ color: "#10B981", fontWeight: "600", fontFamily: "monospace", fontSize: "12px" }}>
                  {c.numero}
                </td>
                <td style={{ color: "var(--text)" }}>{c.cliente_nombre}</td>
                <td style={{ fontSize: "12px" }}>{c.vehiculo_info}</td>
                <td style={{ color: "var(--green)", fontWeight: "600" }}>
                  ${parseFloat(c.total).toLocaleString()}
                </td>
                <td>
                  <span className="badge" style={{
                    background: estadoColor[c.estado]?.bg || "#1F2937",
                    color: estadoColor[c.estado]?.color || "#9CA3AF"
                  }}>{c.estado}</span>
                </td>
                <td style={{ fontSize: "12px", color: "var(--text3)" }}>
                  {new Date(c.fecha_emision).toLocaleDateString("es-CO")}
                </td>
                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={async () => {
                      const res = await API.get(`/cotizaciones/${c.id}/`)
                      setCotActual(res.data)
                      setModal("detalle")
                    }} style={{
                      background: "#1E3A5F", border: "1px solid #3B82F6",
                      color: "#3B82F6", borderRadius: "6px",
                      padding: "4px 10px", fontSize: "12px", cursor: "pointer"
                    }}>Ver</button>
                    {c.estado === "borrador" && (
                      <button onClick={async () => {
                        if (!window.confirm(`¿Eliminar cotización ${c.numero}?`)) return
                        try {
                          await API.delete(`/cotizaciones/${c.id}/`)
                          cargar()
                        } catch { mostrarMensaje("❌ Error al eliminar") }
                      }} style={{
                        background: "#3B0A0A", border: "1px solid #EF4444",
                        color: "#EF4444", borderRadius: "6px",
                        padding: "4px 10px", fontSize: "12px", cursor: "pointer"
                      }}>🗑️</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Nueva Cotización */}
      {modal === "nueva" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "1.5rem",
            width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ marginBottom: "1.5rem", color: "var(--text)", fontSize: "18px" }}>
              Nueva Cotización
            </h2>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                Orden de Trabajo
              </label>
              <select value={form.orden} onChange={e => setForm({...form, orden: e.target.value})}
                style={{ width: "100%" }}>
                <option value="">Seleccionar orden...</option>
                {ordenes.filter(o => o.estado !== 'entregado').map(o => (
                  <option key={o.id} value={o.id}>
                    {o.codigo} — {o.cliente_nombre} · {o.vehiculo_placa}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                  color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                  Descuento ($)
                </label>
                <input type="number" value={form.descuento}
                  onChange={e => setForm({...form, descuento: e.target.value})}
                  style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                  color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                  Vigencia (días)
                </label>
                <input type="number" value={form.vigencia_dias}
                  onChange={e => setForm({...form, vigencia_dias: e.target.value})}
                  style={{ width: "100%" }} />
              </div>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                Notas
              </label>
              <textarea value={form.notas} onChange={e => setForm({...form, notas: e.target.value})}
                style={{ width: "100%", minHeight: "80px" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px",
              marginBottom: "1.5rem", padding: "10px 12px",
              background: "var(--bg1)", borderRadius: "8px",
              border: "1px solid var(--border)" }}>
              <input type="checkbox" id="aplica_iva" checked={form.aplica_iva}
                onChange={e => setForm({...form, aplica_iva: e.target.checked})}
                style={{ width: "16px", height: "16px", cursor: "pointer" }} />
              <label htmlFor="aplica_iva" style={{ fontSize: "13px",
                color: "var(--text)", cursor: "pointer", fontWeight: "500" }}>
                Aplicar IVA (19% incluido en el precio)
              </label>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-primary" onClick={crearCotizacion}
                disabled={loading} style={{ flex: 1 }}>
                {loading ? "Creando..." : "Crear Cotización"}
              </button>
              <button className="btn btn-secondary" onClick={() => setModal(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {modal === "detalle" && cotActual && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "1.5rem",
            width: "100%", maxWidth: "750px", maxHeight: "90vh", overflowY: "auto" }}>

            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ color: "#10B981", fontSize: "20px", fontFamily: "monospace" }}>
                  {cotActual.numero}
                </h2>
                <p style={{ color: "var(--text3)", fontSize: "13px", marginTop: "4px" }}>
                  {cotActual.cliente_nombre} · {cotActual.vehiculo_info}
                </p>
                <p style={{ color: "var(--text3)", fontSize: "12px", marginTop: "2px" }}>
                  Orden: {cotActual.orden_codigo}
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button onClick={verPDF} style={{
                  background: "#1F2937", border: "1px solid #374151",
                  color: "#D1D5DB", padding: "6px 12px",
                  borderRadius: "6px", cursor: "pointer", fontSize: "12px"
                }}>📄 PDF</button>
                {cotActual.estado === "borrador" && (
                  <button onClick={aprobar} style={{
                    background: "#065F46", border: "1px solid #10B981",
                    color: "#10B981", padding: "6px 12px",
                    borderRadius: "6px", cursor: "pointer", fontSize: "12px"
                  }}>✅ Aprobar → Factura</button>
                )}
                <button onClick={() => setModal(null)} style={{
                  background: "none", border: "none",
                  color: "var(--text3)", cursor: "pointer", fontSize: "20px"
                }}>×</button>
              </div>
            </div>

            {/* Agregar línea */}
            {cotActual.estado === "borrador" && (
              <div style={{ background: "var(--bg1)", border: "1px solid var(--border)",
                borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--text2)",
                  marginBottom: "8px", textTransform: "uppercase" }}>Agregar línea</div>
                <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 60px 90px 90px auto",
                  gap: "8px", alignItems: "end" }}>
                  <select value={lineaForm.tipo}
                    onChange={e => setLineaForm({...lineaForm, tipo: e.target.value})}
                    style={{ width: "100%" }}>
                    <option value="servicio">🔧 Servicio</option>
                    <option value="repuesto">🔩 Repuesto</option>
                  </select>
                  <input value={lineaForm.descripcion}
                    onChange={e => setLineaForm({...lineaForm, descripcion: e.target.value})}
                    placeholder="Descripción" style={{ width: "100%" }} />
                  <input type="number" value={lineaForm.cantidad}
                    onChange={e => setLineaForm({...lineaForm, cantidad: e.target.value})}
                    style={{ width: "100%" }} />
                  <div>
                    <label style={{ fontSize: "10px", color: "var(--text3)", display: "block", marginBottom: "2px" }}>
                      Costo interno
                    </label>
                    <input type="number" value={lineaForm.precio_costo}
                      onChange={e => setLineaForm({...lineaForm, precio_costo: e.target.value})}
                      placeholder="$0" style={{ width: "100%" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "10px", color: "var(--text3)", display: "block", marginBottom: "2px" }}>
                      Precio cliente
                    </label>
                    <input type="number" value={lineaForm.precio_unit}
                      onChange={e => setLineaForm({...lineaForm, precio_unit: e.target.value})}
                      placeholder="$0" style={{ width: "100%" }} />
                  </div>
                  <button onClick={agregarLinea} style={{
                    background: "#10B981", border: "none", color: "white",
                    padding: "8px 12px", borderRadius: "6px",
                    cursor: "pointer", whiteSpace: "nowrap", fontSize: "12px",
                    alignSelf: "flex-end"
                  }}>+ Agregar</button>
                </div>
              </div>
            )}

            {/* Líneas */}
            <table style={{ marginBottom: "1rem" }}>
              <thead>
                <tr>
                  <th>Tipo</th><th>Descripción</th><th>Cant.</th>
                  <th>Costo</th><th>Precio</th><th>Margen</th><th></th>
                </tr>
              </thead>
              <tbody>
                {!cotActual.lineas?.length ? (
                  <tr><td colSpan={6} style={{ padding: "1.5rem", textAlign: "center",
                    color: "var(--text3)", fontSize: "13px" }}>
                    Sin líneas — agrega servicios o repuestos
                  </td></tr>
                ) : cotActual.lineas.map(l => (
                  <tr key={l.id}>
                    <td>{l.tipo === "servicio" ? "🔧" : "🔩"}</td>
                    <td style={{ color: "var(--text)" }}>{l.descripcion}</td>
                    <td style={{ textAlign: "center" }}>{l.cantidad}</td>
                    <td style={{ textAlign: "right" }}>${parseFloat(l.precio_unit).toLocaleString()}</td>
                    <td style={{ textAlign: "right", fontWeight: "600", color: "var(--green)" }}>
                      ${parseFloat(l.subtotal).toLocaleString()}
                    </td>
                    <td>
                      {cotActual.estado === "borrador" && (
                        <button onClick={() => eliminarLinea(l.id)} style={{
                          background: "none", border: "none",
                          color: "#EF4444", cursor: "pointer", fontSize: "16px"
                        }}>✕</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totales */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ width: "260px" }}>
                {[
                  ["Subtotal", cotActual.subtotal, "var(--text2)"],
                  ["IVA (19%)", cotActual.iva, "var(--text2)"],
                  ["Descuento", `-${cotActual.descuento}`, "#EF4444"],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between",
                    padding: "6px 0", fontSize: "13px",
                    borderBottom: "1px solid var(--border)", color }}>
                    <span>{label}</span>
                    <span>${parseFloat(val).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between",
                  padding: "12px 0 0", fontSize: "20px",
                  fontWeight: "700", color: "#10B981" }}>
                  <span>TOTAL</span>
                  <span>${parseFloat(cotActual.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
