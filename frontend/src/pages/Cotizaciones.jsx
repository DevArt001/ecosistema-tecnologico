import { useState, useEffect } from "react"
import axios from "axios"

const api = (token) => axios.create({
  baseURL: "/api",
  headers: { Authorization: `Bearer ${token}` }
})

export default function Cotizaciones() {
  const token = localStorage.getItem("access")
  const [cotizaciones, setCotizaciones] = useState([])
  const [ordenes, setOrdenes] = useState([])
  const [modal, setModal] = useState(null) // null | 'nueva' | 'detalle'
  const [cotActual, setCotActual] = useState(null)
  const [form, setForm] = useState({ orden: "", descuento: 0, vigencia_dias: 15, notas: "" })
  const [lineaForm, setLineaForm] = useState({ tipo: "servicio", descripcion: "", cantidad: 1, precio_unit: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    const [c, o] = await Promise.all([
      api(token).get("/cotizaciones/"),
      api(token).get("/ordenes/")
    ])
    setCotizaciones(c.data.results || c.data)
    setOrdenes(o.data.results || o.data)
  }

  const crearCotizacion = async () => {
    if (!form.orden) return alert("Selecciona una orden")
    setLoading(true)
    try {
      const orden = ordenes.find(o => o.id == form.orden)
      const res = await api(token).post("/cotizaciones/", {
        orden: form.orden,
        cliente: orden.cliente,
        descuento: form.descuento,
        vigencia_dias: form.vigencia_dias,
        notas: form.notas
      })
      setCotActual(res.data)
      setModal("detalle")
      cargar()
    } catch(e) { alert("Error al crear cotización") }
    setLoading(false)
  }

  const agregarLinea = async () => {
    if (!lineaForm.descripcion) return alert("Ingresa una descripción")
    await api(token).post(`/cotizaciones/${cotActual.id}/agregar_linea/`, lineaForm)
    const res = await api(token).get(`/cotizaciones/${cotActual.id}/`)
    setCotActual(res.data)
    setLineaForm({ tipo: "servicio", descripcion: "", cantidad: 1, precio_unit: 0 })
    cargar()
  }

  const eliminarLinea = async (lineaId) => {
    await api(token).delete(`/cotizaciones/${cotActual.id}/eliminar_linea/${lineaId}/`)
    const res = await api(token).get(`/cotizaciones/${cotActual.id}/`)
    setCotActual(res.data)
    cargar()
  }

  const aprobar = async () => {
    if (!confirm("¿Aprobar cotización y generar factura?")) return
    await api(token).post(`/cotizaciones/${cotActual.id}/aprobar/`)
    alert("✅ Factura generada")
    setModal(null)
    cargar()
  }

  const verPDF = () => {
    window.open(`/api/cotizaciones/${cotActual.id}/pdf/`, "_blank")
  }

  const estadoColor = { borrador: "#6B7280", enviada: "#3B82F6", aprobada: "#10B981", rechazada: "#EF4444" }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text)" }}>Cotizaciones</h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>{cotizaciones.length} cotizaciones</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ orden: "", descuento: 0, vigencia_dias: 15, notas: "" }); setModal("nueva") }}>
          + Nueva Cotización
        </button>
      </div>

      {/* Tabla */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
              {["Número", "Cliente", "Vehículo", "Total", "Estado", "Fecha", "Acciones"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "var(--text3)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cotizaciones.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--text3)" }}>No hay cotizaciones</td></tr>
            ) : cotizaciones.map(c => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "12px 16px", fontWeight: "600", color: "#10B981" }}>{c.numero}</td>
                <td style={{ padding: "12px 16px" }}>{c.cliente_nombre}</td>
                <td style={{ padding: "12px 16px", fontSize: "13px" }}>{c.vehiculo_info}</td>
                <td style={{ padding: "12px 16px", fontWeight: "600" }}>${parseFloat(c.total).toLocaleString()}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ background: estadoColor[c.estado] + "22", color: estadoColor[c.estado], padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
                    {c.estado}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--text3)" }}>
                  {new Date(c.fecha_emision).toLocaleDateString()}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <button onClick={async () => {
                    const res = await api(token).get(`/cotizaciones/${c.id}/`)
                    setCotActual(res.data)
                    setModal("detalle")
                  }} style={{ background: "#1F2937", border: "1px solid var(--border)", color: "var(--text)", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Nueva Cotización */}
      {modal === "nueva" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "32px", width: "500px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ marginBottom: "24px", color: "var(--text)" }}>Nueva Cotización</h2>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>Orden de Trabajo</label>
              <select value={form.orden} onChange={e => setForm({...form, orden: e.target.value})} style={{ width: "100%" }}>
                <option value="">Seleccionar orden...</option>
                {ordenes.map(o => (
                  <option key={o.id} value={o.id}>{o.codigo} — {o.cliente_nombre || o.cliente}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>Descuento ($)</label>
                <input type="number" value={form.descuento} onChange={e => setForm({...form, descuento: e.target.value})} style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>Vigencia (días)</label>
                <input type="number" value={form.vigencia_dias} onChange={e => setForm({...form, vigencia_dias: e.target.value})} style={{ width: "100%" }} />
              </div>
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>Notas</label>
              <textarea value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} style={{ width: "100%", minHeight: "80px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px", color: "var(--text)", resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn btn-primary" onClick={crearCotizacion} disabled={loading} style={{ flex: 1 }}>
                {loading ? "Creando..." : "Crear Cotización"}
              </button>
              <button onClick={() => setModal(null)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text)", padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Cotización */}
      {modal === "detalle" && cotActual && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "32px", width: "700px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 style={{ color: "#10B981", fontSize: "20px" }}>{cotActual.numero}</h2>
                <p style={{ color: "var(--text3)", fontSize: "13px" }}>{cotActual.cliente_nombre} · {cotActual.vehiculo_info}</p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={verPDF} style={{ background: "#1F2937", border: "1px solid var(--border)", color: "#10B981", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
                  📄 Ver PDF
                </button>
                {cotActual.estado === "borrador" && (
                  <button onClick={aprobar} style={{ background: "#10B981", border: "none", color: "white", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
                    ✅ Aprobar
                  </button>
                )}
                <button onClick={() => setModal(null)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text)", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>✕</button>
              </div>
            </div>

            {/* Agregar línea */}
            {cotActual.estado === "borrador" && (
              <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", padding: "16px", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: "600", color: "var(--text2)", marginBottom: "12px", textTransform: "uppercase" }}>Agregar línea</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 80px 100px auto", gap: "8px", alignItems: "end" }}>
                  <div>
                    <label style={{ fontSize: "11px", color: "var(--text3)", display: "block", marginBottom: "4px" }}>Tipo</label>
                    <select value={lineaForm.tipo} onChange={e => setLineaForm({...lineaForm, tipo: e.target.value})} style={{ width: "100%" }}>
                      <option value="servicio">🔧 Servicio</option>
                      <option value="repuesto">🔩 Repuesto</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "var(--text3)", display: "block", marginBottom: "4px" }}>Descripción</label>
                    <input value={lineaForm.descripcion} onChange={e => setLineaForm({...lineaForm, descripcion: e.target.value})} placeholder="Descripción del servicio o repuesto" style={{ width: "100%" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "var(--text3)", display: "block", marginBottom: "4px" }}>Cantidad</label>
                    <input type="number" value={lineaForm.cantidad} onChange={e => setLineaForm({...lineaForm, cantidad: e.target.value})} style={{ width: "100%" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", color: "var(--text3)", display: "block", marginBottom: "4px" }}>Precio Unit.</label>
                    <input type="number" value={lineaForm.precio_unit} onChange={e => setLineaForm({...lineaForm, precio_unit: e.target.value})} style={{ width: "100%" }} />
                  </div>
                  <button onClick={agregarLinea} style={{ background: "#10B981", border: "none", color: "white", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", whiteSpace: "nowrap" }}>
                    + Agregar
                  </button>
                </div>
              </div>
            )}

            {/* Líneas */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
              <thead>
                <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
                  {["Tipo", "Descripción", "Cant.", "Precio Unit.", "Subtotal", ""].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "11px", fontWeight: "600", color: "var(--text3)", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cotActual.lineas?.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "20px", textAlign: "center", color: "var(--text3)", fontSize: "13px" }}>Sin líneas — agrega servicios o repuestos</td></tr>
                ) : cotActual.lineas?.map(l => (
                  <tr key={l.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 12px", fontSize: "13px" }}>{l.tipo === "servicio" ? "🔧" : "🔩"}</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px" }}>{l.descripcion}</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", textAlign: "center" }}>{l.cantidad}</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", textAlign: "right" }}>${parseFloat(l.precio_unit).toLocaleString()}</td>
                    <td style={{ padding: "10px 12px", fontSize: "13px", textAlign: "right", fontWeight: "600" }}>${parseFloat(l.subtotal).toLocaleString()}</td>
                    <td style={{ padding: "10px 12px" }}>
                      {cotActual.estado === "borrador" && (
                        <button onClick={() => eliminarLinea(l.id)} style={{ background: "transparent", border: "none", color: "#EF4444", cursor: "pointer", fontSize: "16px" }}>✕</button>
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
                  ["Subtotal", cotActual.subtotal],
                  ["IVA (19%)", cotActual.iva],
                  ["Descuento", `-${cotActual.descuento}`],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "13px", borderBottom: "1px solid var(--border)", color: "var(--text2)" }}>
                    <span>{label}</span><span>${parseFloat(val).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontSize: "18px", fontWeight: "700", color: "#10B981" }}>
                  <span>TOTAL</span><span>${parseFloat(cotActual.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
