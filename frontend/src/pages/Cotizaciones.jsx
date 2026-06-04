import { useState, useEffect } from "react"
import API from "../services/api"
import { PageHeader, Toast, KPICard, EmptyState, SearchBar,
         TableSkeleton, ModalForm, Field, ConfirmModal } from "../components/UI"

const ESTADO_CONFIG = {
  borrador:  { color: "#6A7A92", bg: "#6A7A9215", icon: "📝", label: "Borrador" },
  enviada:   { color: "#1E5FD4", bg: "#1E5FD415", icon: "📤", label: "Enviada" },
  aprobada:  { color: "#00D4A0", bg: "#00D4A015", icon: "✅", label: "Aprobada" },
  rechazada: { color: "#E8213A", bg: "#E8213A15", icon: "❌", label: "Rechazada" },
}

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([])
  const [ordenes, setOrdenes]           = useState([])
  const [modal, setModal]               = useState(null)
  const [cotActual, setCotActual]       = useState(null)
  const [form, setForm]                 = useState({ orden:"", descuento:0, vigencia_dias:15, notas:"", aplica_iva:false })
  const [lineaForm, setLineaForm]       = useState({ tipo:"servicio", descripcion:"", cantidad:1, precio_costo:0, precio_unit:0 })
  const [loading, setLoading]           = useState(true)
  const [guardando, setGuardando]       = useState(false)
  const [mensaje, setMensaje]           = useState("")
  const [buscar, setBuscar]             = useState("")
  const [confirmDel, setConfirmDel]     = useState(null)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const [c, o] = await Promise.all([API.get("/cotizaciones/"), API.get("/ordenes/")])
      setCotizaciones(c.data.results || c.data)
      setOrdenes(o.data.results || o.data)
    } catch { mostrar("❌ Error al cargar") }
    setLoading(false)
  }

  const mostrar = (msg) => { setMensaje(msg); setTimeout(() => setMensaje(""), 3000) }

  const crearCotizacion = async () => {
    if (!form.orden) return mostrar("❌ Selecciona una orden")
    setGuardando(true)
    try {
      const orden = ordenes.find(o => o.id == form.orden)
      const res = await API.post("/cotizaciones/", {
        orden: form.orden, cliente: orden.cliente,
        descuento: form.descuento, vigencia_dias: form.vigencia_dias,
        notas: form.notas, aplica_iva: form.aplica_iva
      })
      setCotActual(res.data)
      setModal("detalle")
      mostrar("✅ Cotización creada")
      cargar()
    } catch { mostrar("❌ Error al crear cotización") }
    setGuardando(false)
  }

  const agregarLinea = async () => {
    if (!lineaForm.descripcion) return mostrar("❌ Ingresa una descripción")
    try {
      await API.post(`/cotizaciones/${cotActual.id}/agregar_linea/`, lineaForm)
      const res = await API.get(`/cotizaciones/${cotActual.id}/`)
      setCotActual(res.data)
      setLineaForm({ tipo:"servicio", descripcion:"", cantidad:1, precio_costo:0, precio_unit:0 })
      cargar()
    } catch { mostrar("❌ Error al agregar línea") }
  }

  const eliminarLinea = async (lineaId) => {
    try {
      await API.delete(`/cotizaciones/${cotActual.id}/eliminar_linea/${lineaId}/`)
      const res = await API.get(`/cotizaciones/${cotActual.id}/`)
      setCotActual(res.data)
      cargar()
    } catch { mostrar("❌ Error al eliminar línea") }
  }

  const aprobar = async () => {
    if (!window.confirm("¿Aprobar cotización y generar factura?")) return
    try {
      await API.post(`/cotizaciones/${cotActual.id}/aprobar/`)
      mostrar("✅ Factura generada correctamente")
      setModal(null)
      cargar()
    } catch { mostrar("❌ Error al aprobar") }
  }

  const eliminarCot = async () => {
    try {
      await API.delete(`/cotizaciones/${confirmDel.id}/`)
      mostrar("✅ Cotización eliminada")
      setConfirmDel(null)
      cargar()
    } catch { mostrar("❌ Error al eliminar") }
  }

  const verPDF = () => {
    const token = localStorage.getItem("access")
    window.open(`${API.defaults.baseURL}/cotizaciones/${cotActual.id}/pdf/?token=${token}`, "_blank")
  }

  const filtradas = cotizaciones.filter(c =>
    !buscar ||
    c.numero?.toLowerCase().includes(buscar.toLowerCase()) ||
    c.cliente_nombre?.toLowerCase().includes(buscar.toLowerCase())
  )

  const totalAprobadas  = cotizaciones.filter(c => c.estado === "aprobada").reduce((s,c) => s + parseFloat(c.total||0), 0)
  const totalBorradores = cotizaciones.filter(c => c.estado === "borrador").reduce((s,c) => s + parseFloat(c.total||0), 0)

  return (
    <div>
      <Toast mensaje={mensaje} />

      {confirmDel && (
        <ConfirmModal titulo="¿Eliminar cotización?"
          texto={<>Se eliminará la cotización <strong style={{ color:"var(--text)" }}>{confirmDel.numero}</strong>.</>}
          onConfirm={eliminarCot} onCancel={() => setConfirmDel(null)} />
      )}

      {/* Modal nueva cotización */}
      {modal === "nueva" && (
        <ModalForm titulo="Nueva cotización"
          onClose={() => setModal(null)} onGuardar={crearCotizacion} loading={guardando}>
          <Field label="Orden de trabajo *">
            <select value={form.orden} onChange={e => setForm({...form, orden: e.target.value})}>
              <option value="">Seleccionar orden...</option>
              {ordenes.filter(o => o.estado !== "entregado").map(o => (
                <option key={o.id} value={o.id}>
                  {o.codigo} — {o.cliente_nombre} · {o.vehiculo_placa}
                </option>
              ))}
            </select>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Descuento ($)">
              <input type="number" value={form.descuento}
                onChange={e => setForm({...form, descuento: e.target.value})} />
            </Field>
            <Field label="Vigencia (días)">
              <input type="number" value={form.vigencia_dias}
                onChange={e => setForm({...form, vigencia_dias: e.target.value})} />
            </Field>
          </div>
          <Field label="Notas">
            <textarea value={form.notas}
              onChange={e => setForm({...form, notas: e.target.value})}
              style={{ minHeight: "70px" }} />
          </Field>
          <label style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 14px", borderRadius: "10px", cursor: "pointer",
            background: form.aplica_iva ? "rgba(0,212,160,.08)" : "var(--bg3)",
            border: `1px solid ${form.aplica_iva ? "rgba(0,212,160,.3)" : "var(--border)"}`,
            transition: "all .15s",
          }}>
            <input type="checkbox" checked={form.aplica_iva}
              onChange={e => setForm({...form, aplica_iva: e.target.checked})}
              style={{ width:"auto", accentColor:"var(--green)" }} />
            <div>
              <div style={{ fontSize:"13px", color:"var(--text)", fontWeight:"500" }}>
                Aplicar IVA (19%)
              </div>
              <div style={{ fontSize:"11px", color:"var(--text3)" }}>
                El IVA se incluirá en el precio final
              </div>
            </div>
          </label>
        </ModalForm>
      )}

      {/* Modal detalle */}
      {modal === "detalle" && cotActual && (
        <div className="modal-overlay">
          <div className="modal-box scale-in" style={{ maxWidth:"780px",
            maxHeight:"90vh", overflowY:"auto" }}>

            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"flex-start", marginBottom:"1.5rem" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:"10px",
                  marginBottom:"4px" }}>
                  <span style={{ fontFamily:"var(--font-mono)", fontSize:"16px",
                    fontWeight:"700", color:"#00D4A0" }}>{cotActual.numero}</span>
                  {(() => {
                    const est = ESTADO_CONFIG[cotActual.estado] || ESTADO_CONFIG.borrador
                    return (
                      <span style={{ background:est.bg, color:est.color,
                        padding:"3px 10px", borderRadius:"20px",
                        fontSize:"11px", fontWeight:"600" }}>
                        {est.icon} {est.label}
                      </span>
                    )
                  })()}
                </div>
                <div style={{ fontSize:"14px", color:"var(--text2)", fontWeight:"600" }}>
                  {cotActual.cliente_nombre}
                </div>
                <div style={{ fontSize:"12px", color:"var(--text3)", marginTop:"2px" }}>
                  {cotActual.vehiculo_info} · Orden: {cotActual.orden_codigo}
                </div>
              </div>
              <div style={{ display:"flex", gap:"8px", flexWrap:"wrap",
                alignItems:"center" }}>
                <button onClick={verPDF} className="btn btn-secondary"
                  style={{ padding:"6px 12px", fontSize:"12px" }}>
                  🖨️ PDF
                </button>
                {cotActual.estado === "borrador" && (
                  <button onClick={aprobar}
                    className="btn btn-primary"
                    style={{ padding:"6px 12px", fontSize:"12px" }}>
                    ✅ Aprobar → Factura
                  </button>
                )}
                <button onClick={() => setModal(null)} style={{
                  background:"none", border:"none", color:"var(--text3)",
                  cursor:"pointer", fontSize:"22px", lineHeight:1 }}>×</button>
              </div>
            </div>

            {/* Agregar línea */}
            {cotActual.estado === "borrador" && (
              <div style={{ background:"var(--bg3)",
                border:"1px solid var(--border)",
                borderRadius:"12px", padding:"1rem", marginBottom:"1.25rem" }}>
                <div style={{ fontSize:"12px", fontWeight:"700",
                  color:"var(--text3)", textTransform:"uppercase",
                  letterSpacing:".1em", marginBottom:"10px" }}>
                  Agregar ítem
                </div>
                <div style={{ display:"grid",
                  gridTemplateColumns:"110px 1fr 60px 100px 100px auto",
                  gap:"8px", alignItems:"end" }}>
                  <select value={lineaForm.tipo}
                    onChange={e => setLineaForm({...lineaForm, tipo:e.target.value})}>
                    <option value="servicio">🔧 Servicio</option>
                    <option value="repuesto">🔩 Repuesto</option>
                  </select>
                  <input value={lineaForm.descripcion}
                    onChange={e => setLineaForm({...lineaForm, descripcion:e.target.value})}
                    placeholder="Descripción del ítem" />
                  <input type="number" value={lineaForm.cantidad} min="1"
                    onChange={e => setLineaForm({...lineaForm, cantidad:e.target.value})} />
                  <div>
                    <div style={{ fontSize:"10px", color:"var(--text3)",
                      marginBottom:"3px", fontWeight:"600" }}>Costo interno</div>
                    <input type="number" value={lineaForm.precio_costo}
                      onChange={e => setLineaForm({...lineaForm, precio_costo:e.target.value})}
                      placeholder="$0" />
                  </div>
                  <div>
                    <div style={{ fontSize:"10px", color:"var(--text3)",
                      marginBottom:"3px", fontWeight:"600" }}>Precio cliente</div>
                    <input type="number" value={lineaForm.precio_unit}
                      onChange={e => setLineaForm({...lineaForm, precio_unit:e.target.value})}
                      placeholder="$0" />
                  </div>
                  <button onClick={agregarLinea} className="btn btn-primary"
                    style={{ padding:"9px 12px", fontSize:"12px",
                      alignSelf:"flex-end", whiteSpace:"nowrap" }}>
                    + Agregar
                  </button>
                </div>
                {lineaForm.precio_unit > 0 && (
                  <div style={{ marginTop:"8px", fontSize:"12px",
                    color:"#00D4A0", textAlign:"right" }}>
                    Subtotal: ${(lineaForm.cantidad * lineaForm.precio_unit).toLocaleString("es-CO")}
                  </div>
                )}
              </div>
            )}

            {/* Tabla líneas */}
            <div className="card" style={{ marginBottom:"1.25rem" }}>
              <table>
                <thead>
                  <tr>
                    <th>Tipo</th><th>Descripción</th><th>Cant.</th>
                    <th>Costo</th><th>Precio</th><th>Subtotal</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {!cotActual.lineas?.length ? (
                    <tr><td colSpan="7">
                      <EmptyState icon="📋" titulo="Sin ítems"
                        sub="Agrega servicios o repuestos" />
                    </td></tr>
                  ) : cotActual.lineas.map(l => (
                    <tr key={l.id}>
                      <td>
                        <span style={{ fontSize:"10px", padding:"2px 8px",
                          borderRadius:"4px", fontWeight:"600",
                          background: l.tipo==="servicio" ? "#00D4A015" : "#1E5FD415",
                          color: l.tipo==="servicio" ? "#00D4A0" : "#1E5FD4" }}>
                          {l.tipo==="servicio" ? "🔧" : "🔩"} {l.tipo}
                        </span>
                      </td>
                      <td style={{ color:"var(--text)", fontWeight:"500" }}>{l.descripcion}</td>
                      <td style={{ textAlign:"center" }}>{l.cantidad}</td>
                      <td style={{ fontFamily:"var(--font-mono)", fontSize:"12px",
                        color:"var(--text3)" }}>
                        ${parseFloat(l.precio_costo||0).toLocaleString("es-CO")}
                      </td>
                      <td style={{ fontFamily:"var(--font-mono)", fontSize:"12px" }}>
                        ${parseFloat(l.precio_unit).toLocaleString("es-CO")}
                      </td>
                      <td style={{ fontFamily:"var(--font-mono)", fontSize:"13px",
                        fontWeight:"700", color:"#00D4A0" }}>
                        ${parseFloat(l.subtotal).toLocaleString("es-CO")}
                      </td>
                      <td>
                        {cotActual.estado === "borrador" && (
                          <button onClick={() => eliminarLinea(l.id)}
                            className="btn btn-danger"
                            style={{ padding:"3px 8px", fontSize:"11px" }}>×</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div style={{ display:"flex", justifyContent:"flex-end" }}>
              <div style={{ width:"280px",
                background:"var(--bg3)", borderRadius:"12px",
                padding:"1rem" }}>
                {[
                  { label:"Subtotal", valor:cotActual.subtotal, color:"var(--text2)" },
                  { label:"IVA (19%)", valor:cotActual.iva||0, color:"var(--text3)" },
                  { label:"Descuento", valor:`-${cotActual.descuento}`, color:"#E8213A" },
                ].map(item => (
                  <div key={item.label} style={{ display:"flex",
                    justifyContent:"space-between", padding:"6px 0",
                    fontSize:"13px", color:item.color,
                    borderBottom:"1px solid var(--border)" }}>
                    <span>{item.label}</span>
                    <span style={{ fontFamily:"var(--font-mono)" }}>
                      ${parseFloat(item.valor||0).toLocaleString("es-CO")}
                    </span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between",
                  padding:"12px 0 0", fontSize:"22px",
                  fontWeight:"800", color:"#00D4A0" }}>
                  <span>TOTAL</span>
                  <span style={{ fontFamily:"var(--font-mono)" }}>
                    ${parseFloat(cotActual.total).toLocaleString("es-CO")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <PageHeader titulo="Cotizaciones" sub={`${cotizaciones.length} cotizaciones`}>
        <button className="btn btn-primary" onClick={() => {
          setForm({ orden:"", descuento:0, vigencia_dias:15, notas:"", aplica_iva:false })
          setModal("nueva")
        }}>+ Nueva cotización</button>
      </PageHeader>

      {/* KPIs */}
      <div className="stagger" style={{ display:"flex", gap:"1rem",
        flexWrap:"wrap", marginBottom:"1.5rem" }}>
        <KPICard titulo="Total" valor={cotizaciones.length}
          color="#1E5FD4" icon="📄" delay={0} />
        <KPICard titulo="Aprobadas"
          valor={cotizaciones.filter(c=>c.estado==="aprobada").length}
          color="#00D4A0" icon="✅" delay={.04} />
        <KPICard titulo="Borradores"
          valor={cotizaciones.filter(c=>c.estado==="borrador").length}
          color="#6A7A92" icon="📝" delay={.08} />
        <KPICard titulo="Valor aprobado"
          valor={`$${Math.round(totalAprobadas/1000)}K`}
          color="#00D4A0" icon="💰" delay={.12} />
        <KPICard titulo="En proceso"
          valor={`$${Math.round(totalBorradores/1000)}K`}
          color="#F5A623" icon="⏳" delay={.16} />
      </div>

      <div className="card fade-in">
        <div style={{ padding:"1rem 1.25rem",
          borderBottom:"1px solid var(--border)",
          display:"flex", justifyContent:"space-between",
          alignItems:"center", flexWrap:"wrap", gap:"8px" }}>
          <SearchBar value={buscar} onChange={setBuscar}
            placeholder="Buscar por número o cliente..." />
          <span style={{ fontSize:"12px", color:"var(--text3)" }}>
            {filtradas.length} cotizaciones
          </span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Número</th><th>Cliente</th><th>Vehículo</th>
              <th>Total</th><th>Estado</th><th>Fecha</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <TableSkeleton rows={5} cols={7} /> :
             filtradas.length === 0 ? (
              <tr><td colSpan="7">
                <EmptyState icon="📄" titulo="Sin cotizaciones"
                  sub="Crea la primera cotización"
                  action={<button className="btn btn-primary" onClick={() => {
                    setForm({ orden:"", descuento:0, vigencia_dias:15, notas:"", aplica_iva:false })
                    setModal("nueva")
                  }}>+ Nueva cotización</button>} />
              </td></tr>
            ) : filtradas.map(c => {
              const est = ESTADO_CONFIG[c.estado] || ESTADO_CONFIG.borrador
              return (
                <tr key={c.id} className="fade-in">
                  <td style={{ fontFamily:"var(--font-mono)", fontWeight:"700",
                    color:"#00D4A0", fontSize:"12px" }}>{c.numero}</td>
                  <td style={{ fontWeight:"600", color:"var(--text)" }}>
                    {c.cliente_nombre}
                  </td>
                  <td style={{ fontSize:"12px", color:"var(--text3)" }}>
                    {c.vehiculo_info}
                  </td>
                  <td style={{ fontFamily:"var(--font-mono)", fontWeight:"700",
                    color:"var(--text)" }}>
                    ${parseFloat(c.total||0).toLocaleString("es-CO")}
                  </td>
                  <td>
                    <span style={{ background:est.bg, color:est.color,
                      padding:"3px 10px", borderRadius:"20px",
                      fontSize:"11px", fontWeight:"600" }}>
                      {est.icon} {est.label}
                    </span>
                  </td>
                  <td style={{ fontSize:"12px", color:"var(--text3)" }}>
                    {new Date(c.fecha_emision).toLocaleDateString("es-CO")}
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:"6px" }}>
                      <button onClick={async () => {
                        const res = await API.get(`/cotizaciones/${c.id}/`)
                        setCotActual(res.data)
                        setModal("detalle")
                      }} className="btn btn-secondary"
                        style={{ padding:"4px 10px", fontSize:"12px" }}>
                        📝 Ver
                      </button>
                      {c.estado === "borrador" && (
                        <button onClick={() => setConfirmDel(c)}
                          className="btn btn-danger"
                          style={{ padding:"4px 10px", fontSize:"12px" }}>🗑️</button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
