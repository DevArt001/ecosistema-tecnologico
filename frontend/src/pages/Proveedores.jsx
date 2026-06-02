import { useState, useEffect } from "react"
import API from "../services/api"

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([])
  const [ordenes, setOrdenes]         = useState([])
  const [historial, setHistorial]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [tab, setTab]                 = useState("proveedores")
  const [mensaje, setMensaje]         = useState("")
  const [modalProv, setModalProv]     = useState(null)
  const [modalOC, setModalOC]         = useState(null)
  const [modalLinea, setModalLinea]   = useState(null)
  const [productos, setProductos]     = useState([])
  const [formProv, setFormProv] = useState({ nombre:"", telefono:"", correo:"", ciudad:"", activo:true })
  const [formOC, setFormOC]     = useState({ proveedor:"", notas:"", fecha_esperada:"" })
  const [formLinea, setFormLinea] = useState({ producto:"", cantidad:1, precio_unit:0 })
  const [ocActual, setOcActual]   = useState(null)

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const [provs, ords, hist, prods] = await Promise.all([
        API.get("/proveedores/"),
        API.get("/ordenes-compra/"),
        API.get("/historial-precios/"),
        API.get("/productos/"),
      ])
      setProveedores(provs.data.results || provs.data)
      setOrdenes(ords.data.results || ords.data)
      setHistorial(hist.data.results || hist.data)
      setProductos(prods.data.results || prods.data)
    } catch { mostrarMensaje("❌ Error al cargar") }
    setLoading(false)
  }

  const mostrarMensaje = (msg) => {
    setMensaje(msg)
    setTimeout(() => setMensaje(""), 3000)
  }

  const guardarProveedor = async () => {
    try {
      if (modalProv?.id) await API.put(`/proveedores/${modalProv.id}/`, formProv)
      else await API.post("/proveedores/", formProv)
      mostrarMensaje("✅ Proveedor guardado")
      setModalProv(null)
      cargar()
    } catch { mostrarMensaje("❌ Error al guardar") }
  }

  const crearOC = async () => {
    try {
      const r = await API.post("/ordenes-compra/", formOC)
      mostrarMensaje("✅ Orden de compra creada")
      setModalOC(null)
      setOcActual(r.data)
      setModalLinea(r.data)
      cargar()
    } catch { mostrarMensaje("❌ Error al crear orden") }
  }

  const agregarLinea = async () => {
    try {
      await API.post(`/ordenes-compra/${modalLinea.id}/agregar_linea/`, formLinea)
      mostrarMensaje("✅ Producto agregado")
      setFormLinea({ producto:"", cantidad:1, precio_unit:0 })
      cargar()
      // Actualizar OC actual
      const r = await API.get(`/ordenes-compra/${modalLinea.id}/`)
      setModalLinea(r.data)
    } catch { mostrarMensaje("❌ Error al agregar producto") }
  }

  const recibirOC = async (id) => {
    if (!window.confirm("¿Marcar como recibida? Esto actualizará el stock automáticamente.")) return
    try {
      const r = await API.post(`/ordenes-compra/${id}/recibir/`)
      mostrarMensaje("✅ " + r.data.mensaje)
      cargar()
    } catch { mostrarMensaje("❌ Error al recibir orden") }
  }

  const estadoColor = {
    borrador:   { bg: "#1F2937", color: "#9CA3AF" },
    enviada:    { bg: "#1E3A5F", color: "#3B82F6" },
    confirmada: { bg: "#451A03", color: "#F59E0B" },
    recibida:   { bg: "#065F46", color: "#10B981" },
    cancelada:  { bg: "#3B0A0A", color: "#EF4444" },
  }

  return (
    <div>
      {mensaje && (
        <div style={{
          position: "fixed", top: "1rem", right: "1rem", zIndex: 9999,
          background: mensaje.startsWith("✅") ? "#065F46" : "#3B0A0A",
          border: `1px solid ${mensaje.startsWith("✅") ? "#10B981" : "#EF4444"}`,
          color: "white", borderRadius: "8px", padding: "12px 20px", fontSize: "13px"
        }}>{mensaje}</div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text)", marginBottom: "4px" }}>
            Proveedores
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>
            {proveedores.length} proveedores · {ordenes.filter(o=>o.estado!=="recibida"&&o.estado!=="cancelada").length} órdenes activas
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => { setModalOC(true); setFormOC({ proveedor:"", notas:"", fecha_esperada:"" }) }}
            style={{ background: "#1E3A5F", border: "1px solid #3B82F6", color: "#3B82F6",
              borderRadius: "8px", padding: "8px 14px", fontSize: "13px", cursor: "pointer" }}>
            + Orden de compra
          </button>
          <button className="btn btn-primary" onClick={() => {
            setModalProv({})
            setFormProv({ nombre:"", telefono:"", correo:"", ciudad:"", activo:true })
          }}>+ Proveedor</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
        {[
          { key: "proveedores", label: `🏭 Proveedores (${proveedores.length})` },
          { key: "ordenes", label: `📦 Órdenes de compra (${ordenes.length})` },
          { key: "historial", label: `📊 Historial de precios` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background: "none", border: "none", padding: "10px 16px",
            fontSize: "13px", fontWeight: tab === t.key ? "600" : "400",
            color: tab === t.key ? "#10B981" : "var(--text3)",
            borderBottom: tab === t.key ? "2px solid #10B981" : "2px solid transparent",
            cursor: "pointer", marginBottom: "-1px"
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>Cargando...</div>
      ) : (
        <>
          {/* Proveedores */}
          {tab === "proveedores" && (
            <div className="card">
              <table>
                <thead>
                  <tr><th>Nombre</th><th>Teléfono</th><th>Correo</th><th>Ciudad</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {proveedores.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: "600", color: "var(--text)" }}>{p.nombre}</td>
                      <td>{p.telefono || "—"}</td>
                      <td>{p.correo || "—"}</td>
                      <td>{p.ciudad || "—"}</td>
                      <td>
                        <span style={{
                          padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                          background: p.activo ? "#065F46" : "#1F2937",
                          color: p.activo ? "#10B981" : "#6B7280"
                        }}>{p.activo ? "Activo" : "Inactivo"}</span>
                      </td>
                      <td>
                        <button onClick={() => { setModalProv(p); setFormProv({...p}) }} style={{
                          background: "#1E3A5F", border: "1px solid #3B82F6", color: "#3B82F6",
                          borderRadius: "6px", padding: "4px 10px", fontSize: "12px", cursor: "pointer"
                        }}>✏️</button>
                      </td>
                    </tr>
                  ))}
                  {proveedores.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "var(--text3)" }}>
                      Sin proveedores registrados
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Órdenes de compra */}
          {tab === "ordenes" && (
            <div className="card">
              <table>
                <thead>
                  <tr><th>Número</th><th>Proveedor</th><th>Estado</th><th>Total</th><th>F. Esperada</th><th>F. Emisión</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {ordenes.map(o => {
                    const ec = estadoColor[o.estado] || estadoColor.borrador
                    return (
                      <tr key={o.id}>
                        <td style={{ fontFamily: "monospace", fontWeight: "600", color: "#10B981" }}>{o.numero}</td>
                        <td style={{ fontWeight: "600", color: "var(--text)" }}>{o.proveedor_nombre}</td>
                        <td>
                          <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px",
                            fontWeight: "600", background: ec.bg, color: ec.color }}>
                            {o.estado}
                          </span>
                        </td>
                        <td style={{ color: "#10B981", fontWeight: "600" }}>${Number(o.total).toLocaleString("es-CO")}</td>
                        <td style={{ fontSize: "12px", color: "var(--text3)" }}>{o.fecha_esperada || "—"}</td>
                        <td style={{ fontSize: "12px", color: "var(--text3)" }}>
                          {o.fecha_emision ? new Date(o.fecha_emision).toLocaleDateString("es-CO") : "—"}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => setModalLinea(o)} style={{
                              background: "#1E3A5F", border: "1px solid #3B82F6", color: "#3B82F6",
                              borderRadius: "6px", padding: "4px 8px", fontSize: "11px", cursor: "pointer"
                            }}>📝 Ver</button>
                            {["borrador","enviada","confirmada"].includes(o.estado) && (
                              <button onClick={() => recibirOC(o.id)} style={{
                                background: "#065F46", border: "1px solid #10B981", color: "#10B981",
                                borderRadius: "6px", padding: "4px 8px", fontSize: "11px", cursor: "pointer"
                              }}>✓ Recibir</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {ordenes.length === 0 && (
                    <tr><td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "var(--text3)" }}>
                      Sin órdenes de compra
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Historial precios */}
          {tab === "historial" && (
            <div className="card">
              <table>
                <thead>
                  <tr><th>Proveedor</th><th>Producto</th><th>Precio</th><th>Fecha</th><th>Notas</th></tr>
                </thead>
                <tbody>
                  {historial.map(h => (
                    <tr key={h.id}>
                      <td style={{ fontWeight: "600", color: "var(--text)" }}>{h.proveedor_nombre}</td>
                      <td>{h.producto_nombre}</td>
                      <td style={{ color: "#10B981", fontWeight: "600" }}>${Number(h.precio).toLocaleString("es-CO")}</td>
                      <td style={{ fontSize: "12px", color: "var(--text3)" }}>{h.fecha}</td>
                      <td style={{ fontSize: "12px", color: "var(--text3)" }}>{h.notas || "—"}</td>
                    </tr>
                  ))}
                  {historial.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "var(--text3)" }}>
                      Sin historial de precios. Se genera automáticamente al crear órdenes de compra.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal Proveedor */}
      {modalProv !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "1.5rem", width: "100%", maxWidth: "440px" }}>
            <h2 style={{ marginBottom: "1.5rem", color: "var(--text)", fontSize: "18px" }}>
              {modalProv?.id ? "Editar proveedor" : "Nuevo proveedor"}
            </h2>
            {[
              { label: "Nombre", key: "nombre" },
              { label: "Teléfono", key: "telefono" },
              { label: "Correo", key: "correo" },
              { label: "Ciudad", key: "ciudad" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                  color: "var(--text2)", marginBottom: "4px", textTransform: "uppercase" }}>{f.label}</label>
                <input value={formProv[f.key] || ""} onChange={e => setFormProv({...formProv, [f.key]: e.target.value})}
                  style={{ width: "100%" }} />
              </div>
            ))}
            <div style={{ display: "flex", gap: "8px", marginTop: "1.5rem" }}>
              <button className="btn btn-primary" onClick={guardarProveedor} style={{ flex: 1 }}>Guardar</button>
              <button className="btn btn-secondary" onClick={() => setModalProv(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva OC */}
      {modalOC && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "1.5rem", width: "100%", maxWidth: "440px" }}>
            <h2 style={{ marginBottom: "1.5rem", color: "var(--text)", fontSize: "18px" }}>
              Nueva orden de compra
            </h2>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                color: "var(--text2)", marginBottom: "4px", textTransform: "uppercase" }}>Proveedor</label>
              <select value={formOC.proveedor} onChange={e => setFormOC({...formOC, proveedor: e.target.value})}
                style={{ width: "100%" }}>
                <option value="">Seleccionar...</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                color: "var(--text2)", marginBottom: "4px", textTransform: "uppercase" }}>Fecha esperada</label>
              <input type="date" value={formOC.fecha_esperada} onChange={e => setFormOC({...formOC, fecha_esperada: e.target.value})}
                style={{ width: "100%" }} />
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                color: "var(--text2)", marginBottom: "4px", textTransform: "uppercase" }}>Notas</label>
              <textarea value={formOC.notas} onChange={e => setFormOC({...formOC, notas: e.target.value})}
                style={{ width: "100%", minHeight: "60px" }} />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-primary" onClick={crearOC} style={{ flex: 1 }}>Crear orden</button>
              <button className="btn btn-secondary" onClick={() => setModalOC(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver/Agregar líneas OC */}
      {modalLinea && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "1.5rem", width: "100%", maxWidth: "600px",
            maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "var(--text)", fontSize: "18px" }}>
                {modalLinea.numero} — {modalLinea.proveedor_nombre}
              </h2>
              <button onClick={() => setModalLinea(null)} style={{
                background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: "24px"
              }}>×</button>
            </div>

            {/* Líneas existentes */}
            {modalLinea.lineas?.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text2)", marginBottom: "8px" }}>
                  Productos en la orden:
                </div>
                <table>
                  <thead>
                    <tr><th>Producto</th><th>Cantidad</th><th>Precio unit.</th><th>Subtotal</th></tr>
                  </thead>
                  <tbody>
                    {modalLinea.lineas.map(l => (
                      <tr key={l.id}>
                        <td>{l.producto_nombre}</td>
                        <td>{l.cantidad}</td>
                        <td>${Number(l.precio_unit).toLocaleString("es-CO")}</td>
                        <td style={{ color: "#10B981", fontWeight: "600" }}>${Number(l.subtotal).toLocaleString("es-CO")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ textAlign: "right", padding: "8px 0", fontWeight: "700", color: "#10B981", fontSize: "16px" }}>
                  Total: ${Number(modalLinea.total).toLocaleString("es-CO")}
                </div>
              </div>
            )}

            {/* Agregar producto */}
            {["borrador","enviada"].includes(modalLinea.estado) && (
              <>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text2)", marginBottom: "8px" }}>
                  Agregar producto:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 120px", gap: "8px", marginBottom: "12px" }}>
                  <select value={formLinea.producto} onChange={e => setFormLinea({...formLinea, producto: e.target.value})}
                    style={{ width: "100%" }}>
                    <option value="">Producto...</option>
                    {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.sku})</option>)}
                  </select>
                  <input type="number" value={formLinea.cantidad} min="1"
                    onChange={e => setFormLinea({...formLinea, cantidad: parseInt(e.target.value)})}
                    placeholder="Cant." style={{ width: "100%" }} />
                  <input type="number" value={formLinea.precio_unit}
                    onChange={e => setFormLinea({...formLinea, precio_unit: parseFloat(e.target.value)})}
                    placeholder="Precio" style={{ width: "100%" }} />
                </div>
                <div style={{ background: "#065F4622", border: "1px solid #10B981", borderRadius: "6px",
                  padding: "8px", marginBottom: "12px", textAlign: "center", fontSize: "13px", color: "#10B981" }}>
                  Subtotal: ${Number(formLinea.cantidad * formLinea.precio_unit).toLocaleString("es-CO")}
                </div>
                <button className="btn btn-primary" onClick={agregarLinea} style={{ width: "100%" }}>
                  + Agregar producto
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
