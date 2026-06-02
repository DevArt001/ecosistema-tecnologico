import { useState, useEffect } from "react"
import { facturasAPI } from "../services/api"
import API from "../services/api"
import { PageHeader, Toast, ConfirmModal, EmptyState, KPICard,
         SearchBar, TableSkeleton, ModalForm, Field } from "../components/UI"

const ESTADO_CONFIG = {
  pendiente:  { color: "#F5A623", bg: "#F5A62315", icon: "⏳", label: "Pendiente" },
  pagada:     { color: "#00D4A0", bg: "#00D4A015", icon: "✅", label: "Pagada" },
  anulada:    { color: "#E8213A", bg: "#E8213A15", icon: "❌", label: "Anulada" },
}

const METODO_CONFIG = {
  efectivo:      { icon: "💵", label: "Efectivo" },
  transferencia: { icon: "🏦", label: "Transferencia" },
  tarjeta:       { icon: "💳", label: "Tarjeta" },
  nequi:         { icon: "📱", label: "Nequi" },
  daviplata:     { icon: "📱", label: "Daviplata" },
}

export default function Facturas() {
  const [facturas, setFacturas]   = useState([])
  const [clientes, setClientes]   = useState([])
  const [ordenes, setOrdenes]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [buscar, setBuscar]       = useState("")
  const [filtroEstado, setFiltroEstado] = useState("")
  const [modal, setModal]         = useState(null)
  const [modalLineas, setModalLineas] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [mensaje, setMensaje]     = useState("")
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    cliente:"", orden:"", estado:"pendiente",
    metodo_pago:"efectivo", descuento:0, observaciones:""
  })
  const [formLinea, setFormLinea] = useState({
    tipo:"servicio", descripcion:"", cantidad:1,
    precio_unit:0, precio_costo:0
  })

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const [f, c, o] = await Promise.all([
        facturasAPI.listar(),
        API.get("/clientes/"),
        API.get("/ordenes/"),
      ])
      setFacturas(f.data.results || f.data)
      setClientes(c.data.results || c.data)
      setOrdenes(o.data.results || o.data)
    } catch { mostrar("❌ Error al cargar") }
    setLoading(false)
  }

  const mostrar = (msg) => { setMensaje(msg); setTimeout(() => setMensaje(""), 3000) }

  const guardar = async () => {
    if (!form.cliente) { mostrar("❌ Selecciona un cliente"); return }
    setGuardando(true)
    try {
      if (modal?.id) await facturasAPI.editar(modal.id, form)
      else {
        const r = await facturasAPI.crear(form)
        setModalLineas(r.data)
      }
      mostrar("✅ Factura guardada")
      setModal(null)
      cargar()
    } catch { mostrar("❌ Error al guardar") }
    setGuardando(false)
  }

  const agregarLinea = async () => {
    if (!formLinea.descripcion || !formLinea.precio_unit) {
      mostrar("❌ Descripción y precio son obligatorios")
      return
    }
    try {
      await facturasAPI.agregarLinea(modalLineas.id, formLinea)
      mostrar("✅ Línea agregada")
      setFormLinea({ tipo:"servicio", descripcion:"", cantidad:1, precio_unit:0, precio_costo:0 })
      const r = await facturasAPI.obtener(modalLineas.id)
      setModalLineas(r.data)
      cargar()
    } catch { mostrar("❌ Error al agregar línea") }
  }

  const eliminarLinea = async (lineaId) => {
    try {
      await facturasAPI.eliminarLinea(modalLineas.id, lineaId)
      const r = await facturasAPI.obtener(modalLineas.id)
      setModalLineas(r.data)
      cargar()
    } catch { mostrar("❌ Error al eliminar línea") }
  }

  const cambiarEstado = async (id, estado) => {
    try {
      await facturasAPI.cambiarEstado(id, estado)
      mostrar("✅ Estado actualizado")
      cargar()
    } catch { mostrar("❌ Error") }
  }

  const eliminar = async () => {
    try {
      await facturasAPI.eliminar(confirmDel.id)
      mostrar("✅ Factura eliminada")
      setConfirmDel(null)
      cargar()
    } catch { mostrar("❌ Error al eliminar") }
  }

  const filtrados = facturas.filter(f => {
    const matchBuscar = !buscar ||
      f.numero?.toLowerCase().includes(buscar.toLowerCase()) ||
      f.cliente_nombre?.toLowerCase().includes(buscar.toLowerCase())
    const matchEstado = !filtroEstado || f.estado === filtroEstado
    return matchBuscar && matchEstado
  })

  const totalPagado = facturas.filter(f => f.estado === "pagada")
    .reduce((s, f) => s + parseFloat(f.total || 0), 0)
  const totalPendiente = facturas.filter(f => f.estado === "pendiente")
    .reduce((s, f) => s + parseFloat(f.total || 0), 0)

  return (
    <div>
      <Toast mensaje={mensaje} />

      {confirmDel && (
        <ConfirmModal titulo="¿Eliminar factura?"
          texto={<>Se eliminará la factura <strong style={{ color: "var(--text)" }}>{confirmDel.numero}</strong>.</>}
          onConfirm={eliminar} onCancel={() => setConfirmDel(null)} />
      )}

      {/* Modal nueva factura */}
      {modal !== null && (
        <ModalForm titulo={modal?.id ? "Editar factura" : "Nueva factura"}
          onClose={() => setModal(null)} onGuardar={guardar} loading={guardando}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Cliente *" style={{ gridColumn: "1/-1" }}>
              <select value={form.cliente} onChange={e => setForm({...form, cliente: e.target.value})}>
                <option value="">Seleccionar cliente...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </Field>
            <Field label="Orden de trabajo">
              <select value={form.orden} onChange={e => setForm({...form, orden: e.target.value || null})}>
                <option value="">Sin orden asociada</option>
                {ordenes.map(o => <option key={o.id} value={o.id}>{o.codigo} — {o.cliente_nombre}</option>)}
              </select>
            </Field>
            <Field label="Método de pago">
              <select value={form.metodo_pago} onChange={e => setForm({...form, metodo_pago: e.target.value})}>
                {Object.entries(METODO_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Estado">
              <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                <option value="pendiente">⏳ Pendiente</option>
                <option value="pagada">✅ Pagada</option>
                <option value="anulada">❌ Anulada</option>
              </select>
            </Field>
            <Field label="Descuento ($)">
              <input type="number" value={form.descuento}
                onChange={e => setForm({...form, descuento: e.target.value})} />
            </Field>
            <Field label="Observaciones" style={{ gridColumn: "1/-1" }}>
              <textarea value={form.observaciones}
                onChange={e => setForm({...form, observaciones: e.target.value})}
                style={{ minHeight: "60px" }} />
            </Field>
          </div>
        </ModalForm>
      )}

      {/* Modal líneas */}
      {modalLineas && (
        <div className="modal-overlay">
          <div className="modal-box scale-in" style={{ maxWidth: "620px",
            maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ color: "var(--text)" }}>
                  Factura {modalLineas.numero}
                </h2>
                <p style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
                  {modalLineas.cliente_nombre}
                </p>
              </div>
              <button onClick={() => setModalLineas(null)} style={{
                background: "none", border: "none", color: "var(--text3)",
                fontSize: "22px", cursor: "pointer" }}>×</button>
            </div>

            {/* Líneas existentes */}
            {modalLineas.lineas?.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <table>
                  <thead>
                    <tr><th>Tipo</th><th>Descripción</th><th>Cant.</th>
                      <th>Precio</th><th>Subtotal</th><th></th></tr>
                  </thead>
                  <tbody>
                    {modalLineas.lineas.map(l => (
                      <tr key={l.id}>
                        <td>
                          <span style={{ fontSize: "11px", padding: "2px 8px",
                            borderRadius: "4px", fontWeight: "600",
                            background: l.tipo === "servicio" ? "#00D4A015" : "#1E5FD415",
                            color: l.tipo === "servicio" ? "#00D4A0" : "#1E5FD4" }}>
                            {l.tipo === "servicio" ? "🔧" : "🔩"} {l.tipo}
                          </span>
                        </td>
                        <td style={{ fontSize: "12px" }}>{l.descripcion}</td>
                        <td>{l.cantidad}</td>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                          ${Number(l.precio_unit).toLocaleString("es-CO")}
                        </td>
                        <td style={{ color: "#00D4A0", fontWeight: "600",
                          fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                          ${Number(l.subtotal).toLocaleString("es-CO")}
                        </td>
                        <td>
                          <button onClick={() => eliminarLinea(l.id)}
                            className="btn btn-danger"
                            style={{ padding: "3px 8px", fontSize: "11px" }}>×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ textAlign: "right", padding: "10px 0",
                  fontSize: "18px", fontWeight: "800", color: "#00D4A0",
                  fontFamily: "var(--font-mono)" }}>
                  Total: ${Number(modalLineas.total).toLocaleString("es-CO")}
                </div>
              </div>
            )}

            {/* Agregar línea */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text2)",
                marginBottom: "10px" }}>Agregar ítem</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px",
                marginBottom: "10px" }}>
                <Field label="Tipo">
                  <select value={formLinea.tipo}
                    onChange={e => setFormLinea({...formLinea, tipo: e.target.value})}>
                    <option value="servicio">🔧 Servicio</option>
                    <option value="repuesto">🔩 Repuesto</option>
                  </select>
                </Field>
                <Field label="Cantidad">
                  <input type="number" value={formLinea.cantidad} min="1"
                    onChange={e => setFormLinea({...formLinea, cantidad: e.target.value})} />
                </Field>
                <Field label="Descripción" style={{ gridColumn: "1/-1" }}>
                  <input value={formLinea.descripcion}
                    onChange={e => setFormLinea({...formLinea, descripcion: e.target.value})}
                    placeholder="Ej: Cambio de aceite, Filtro de aire..." />
                </Field>
                <Field label="Precio unitario ($)">
                  <input type="number" value={formLinea.precio_unit}
                    onChange={e => setFormLinea({...formLinea, precio_unit: e.target.value})} />
                </Field>
                <Field label="Costo (interno)">
                  <input type="number" value={formLinea.precio_costo}
                    onChange={e => setFormLinea({...formLinea, precio_costo: e.target.value})} />
                </Field>
              </div>
              {formLinea.precio_unit > 0 && (
                <div style={{ background: "#00D4A010", border: "1px solid #00D4A025",
                  borderRadius: "8px", padding: "8px 12px", marginBottom: "10px",
                  fontSize: "13px", color: "#00D4A0", textAlign: "center" }}>
                  Subtotal: ${(formLinea.cantidad * formLinea.precio_unit).toLocaleString("es-CO")}
                </div>
              )}
              <button className="btn btn-primary" onClick={agregarLinea}
                style={{ width: "100%" }}>
                + Agregar ítem
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "1rem" }}>
              <a href={facturasAPI.pdf(modalLineas.id)} target="_blank" rel="noreferrer"
                className="btn btn-secondary" style={{ flex: 1, textDecoration: "none",
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                🖨️ Ver PDF
              </a>
              <button className="btn btn-ghost" onClick={() => setModalLineas(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <PageHeader titulo="Facturas" sub={`${facturas.length} facturas emitidas`}>
        <button className="btn btn-primary" onClick={() => {
          setForm({ cliente:"", orden:"", estado:"pendiente",
            metodo_pago:"efectivo", descuento:0, observaciones:"" })
          setModal({})
        }}>+ Nueva factura</button>
      </PageHeader>

      {/* KPIs */}
      <div className="stagger" style={{ display: "flex", gap: "1rem",
        flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <KPICard titulo="Total facturado"
          valor={`$${Math.round((totalPagado+totalPendiente)/1000)}K`}
          color="#1E5FD4" icon="💰" delay={0} />
        <KPICard titulo="Cobrado"
          valor={`$${Math.round(totalPagado/1000)}K`}
          color="#00D4A0" icon="✅" delay={.04} />
        <KPICard titulo="Por cobrar"
          valor={`$${Math.round(totalPendiente/1000)}K`}
          color="#F5A623" icon="⏳" delay={.08} />
        <KPICard titulo="Facturas" valor={facturas.length}
          color="#8B5CF6" icon="📄" delay={.12} />
      </div>

      {/* Filtro estado */}
      <div className="fade-in" style={{ display: "flex", gap: "6px",
        flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {[
          { key: "", label: `Todas (${facturas.length})` },
          ...Object.entries(ESTADO_CONFIG).map(([k, v]) => ({
            key: k, label: `${v.icon} ${v.label} (${facturas.filter(f=>f.estado===k).length})`,
            color: v.color
          }))
        ].map(f => (
          <button key={f.key} onClick={() => setFiltroEstado(f.key)} style={{
            padding: "5px 14px", borderRadius: "20px", border: "none",
            fontSize: "12px", fontWeight: "500", cursor: "pointer",
            background: filtroEstado === f.key ? (f.color || "var(--red)") + "25" : "var(--bg3)",
            color: filtroEstado === f.key ? (f.color || "var(--red)") : "var(--text3)",
            transition: "all .15s",
          }}>{f.label}</button>
        ))}
      </div>

      <div className="card fade-in">
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "8px" }}>
          <SearchBar value={buscar} onChange={setBuscar}
            placeholder="Buscar por número o cliente..." />
          <span style={{ fontSize: "12px", color: "var(--text3)" }}>
            {filtrados.length} facturas
          </span>
        </div>
        <table>
          <thead>
            <tr><th>Número</th><th>Cliente</th><th>Estado</th>
              <th>Método</th><th>Total</th><th>Fecha</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {loading ? <TableSkeleton rows={5} cols={7} /> :
             filtrados.length === 0 ? (
              <tr><td colSpan="7">
                <EmptyState icon="💰" titulo="Sin facturas"
                  sub="Crea la primera factura del taller"
                  action={<button className="btn btn-primary" onClick={() => {
                    setForm({ cliente:"", orden:"", estado:"pendiente",
                      metodo_pago:"efectivo", descuento:0, observaciones:"" })
                    setModal({})
                  }}>+ Nueva factura</button>} />
              </td></tr>
            ) : filtrados.map(f => {
              const est = ESTADO_CONFIG[f.estado] || ESTADO_CONFIG.pendiente
              const met = METODO_CONFIG[f.metodo_pago] || { icon: "💵", label: f.metodo_pago }
              return (
                <tr key={f.id} className="fade-in">
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: "700",
                    color: "#00D4A0", fontSize: "12px" }}>{f.numero}</td>
                  <td style={{ fontWeight: "600", color: "var(--text)" }}>
                    {f.cliente_nombre}
                  </td>
                  <td>
                    <span style={{ background: est.bg, color: est.color,
                      padding: "3px 10px", borderRadius: "20px",
                      fontSize: "11px", fontWeight: "600" }}>
                      {est.icon} {est.label}
                    </span>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text3)" }}>
                    {met.icon} {met.label}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: "700",
                    color: f.estado === "pagada" ? "#00D4A0" : "var(--text)" }}>
                    ${Number(f.total).toLocaleString("es-CO")}
                  </td>
                  <td style={{ fontSize: "11px", color: "var(--text3)" }}>
                    {new Date(f.fecha_emision).toLocaleDateString("es-CO")}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                      <button onClick={() => setModalLineas(f)}
                        className="btn btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "11px" }}>📝</button>
                      <a href={facturasAPI.pdf(f.id)} target="_blank" rel="noreferrer"
                        className="btn btn-ghost"
                        style={{ padding: "4px 8px", fontSize: "11px",
                          textDecoration: "none" }}>🖨️</a>
                      {f.estado === "pendiente" && (
                        <button onClick={() => cambiarEstado(f.id, "pagada")}
                          className="btn btn-primary"
                          style={{ padding: "4px 8px", fontSize: "11px" }}>✅</button>
                      )}
                      <button onClick={() => setConfirmDel(f)}
                        className="btn btn-danger"
                        style={{ padding: "4px 8px", fontSize: "11px" }}>🗑️</button>
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
