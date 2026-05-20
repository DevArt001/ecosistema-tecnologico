import { useState, useEffect } from "react"
import { facturasAPI, clientesAPI, ordenesAPI } from "../services/api"

export default function FormFactura({ onGuardado, onCancelar, facturaEditar = null }) {
  const [form, setForm] = useState({
    cliente: "", orden: "", descuento: "0",
    metodo_pago: "efectivo", estado: "pendiente", notas: "", aplica_iva: false,
    ...(facturaEditar || {})
  })
  const [clientes, setClientes]   = useState([])
  const [ordenes, setOrdenes]     = useState([])
  const [facturaId, setFacturaId] = useState(facturaEditar?.id || null)
  const [lineas, setLineas]       = useState(facturaEditar?.lineas || [])
  const [lineaForm, setLineaForm] = useState({ tipo: "servicio", descripcion: "", cantidad: 1, precio_unit: 0 })
  const [loading, setLoading]     = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError]         = useState("")
  const [paso, setPaso]           = useState(facturaEditar ? 2 : 1) // 1=datos, 2=lineas

  const esEdicion = !!facturaEditar

  useEffect(() => {
    clientesAPI.listar().then(res => setClientes(res.data.results || res.data))
    ordenesAPI.listar().then(res => setOrdenes(res.data.results || res.data))
  }, [])

  const subtotal = lineas.reduce((s, l) => s + parseFloat(l.subtotal || 0), 0)
  const descuento = parseFloat(form.descuento || 0)
  const total = subtotal - descuento

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const crearFacturaBase = async () => {
    if (!form.cliente) { setError("El cliente es obligatorio"); return }
    setLoading(true)
    setError("")
    try {
      let res
      if (esEdicion) {
        res = await facturasAPI.editar(form.id, {
          ...form, subtotal, total: subtotal - descuento
        })
        setLineas(res.data.lineas || [])
        setPaso(2)
      } else {
        res = await facturasAPI.crear({ ...form, subtotal: 0, total: 0 })
        setFacturaId(res.data.id)
        setPaso(2)
      }
    } catch {
      setError("Error al guardar la factura")
    }
    setLoading(false)
  }

  const agregarLinea = async () => {
    if (!lineaForm.descripcion) { setError("Ingresa una descripción"); return }
    if (!facturaId) { setError("Primero guarda los datos básicos"); return }
    setGuardando(true)
    setError("")
    try {
      const res = await facturasAPI.agregarLinea(facturaId, lineaForm)
      setLineas(res.data.lineas || [])
      setLineaForm({ tipo: "servicio", descripcion: "", cantidad: 1, precio_unit: 0 })
    } catch { setError("Error al agregar línea") }
    setGuardando(false)
  }

  const eliminarLinea = async (lineaId) => {
    try {
      const res = await facturasAPI.eliminarLinea(facturaId, lineaId)
      setLineas(res.data.lineas || [])
    } catch { setError("Error al eliminar línea") }
  }

  const finalizar = async () => {
    if (!facturaId) { onGuardado(); return }
    setLoading(true)
    try {
      await facturasAPI.editar(facturaId, {
        ...form, subtotal, total: total > 0 ? total : 0
      })
      onGuardado()
    } catch { setError("Error al finalizar factura") }
    setLoading(false)
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "1rem" }}>
      <div style={{ background: "var(--bg2)", borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)", width: "100%", maxWidth: "680px",
        maxHeight: "92vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: "600", color: "var(--text)" }}>
              {esEdicion ? `Editando factura ${facturaEditar.numero}` : "Nueva factura"}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
              {paso === 1 ? "Paso 1 — Datos básicos" : "Paso 2 — Servicios y repuestos"}
            </div>
          </div>
          <button onClick={onCancelar} style={{
            background: "none", border: "none",
            color: "var(--text3)", fontSize: "20px", cursor: "pointer" }}>×</button>
        </div>

        <div style={{ padding: "1.5rem" }}>
          {error && (
            <div style={{ background: "#3B0A0A", border: "1px solid var(--red)",
              borderRadius: "8px", padding: "10px 14px", marginBottom: "1rem",
              fontSize: "13px", color: "var(--red)" }}>{error}</div>
          )}

          {/* PASO 1 — Datos básicos */}
          {paso === 1 && (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
                  color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                  Cliente *
                </label>
                <select name="cliente" value={form.cliente}
                  onChange={handleChange} style={{ width: "100%" }}>
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} — {c.documento}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
                  color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                  Orden de trabajo (opcional)
                </label>
                <select name="orden" value={form.orden || ""}
                  onChange={handleChange} style={{ width: "100%" }}>
                  <option value="">Sin orden asociada</option>
                  {ordenes.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.codigo} — {o.cliente_nombre} · {o.vehiculo_placa}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
                    color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                    Método de pago
                  </label>
                  <select name="metodo_pago" value={form.metodo_pago}
                    onChange={handleChange} style={{ width: "100%" }}>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="nequi">Nequi</option>
                    <option value="daviplata">Daviplata</option>
                  </select>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
                    color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                    Estado
                  </label>
                  <select name="estado" value={form.estado}
                    onChange={handleChange} style={{ width: "100%" }}>
                    <option value="pendiente">Pendiente</option>
                    <option value="pagada">Pagada</option>
                    <option value="anulada">Anulada</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
                  color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                  Notas
                </label>
                <textarea name="notas" value={form.notas || ""}
                  onChange={handleChange} rows={2}
                  style={{ width: "100%", resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 12px", background: "var(--bg1)", borderRadius: "8px",
                border: "1px solid var(--border)" }}>
                <input type="checkbox" id="aplica_iva_fac" checked={form.aplica_iva || false}
                  onChange={e => setForm({...form, aplica_iva: e.target.checked})}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                <label htmlFor="aplica_iva_fac" style={{ fontSize: "13px",
                  color: "var(--text)", cursor: "pointer", fontWeight: "500" }}>
                  Aplicar IVA (19% incluido en el precio)
                </label>
              </div>
            </>
          )}

          {/* PASO 2 — Líneas */}
          {paso === 2 && (
            <>
              {/* Agregar línea */}
              <div style={{ background: "var(--bg1)", border: "1px solid var(--border)",
                borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--text2)",
                  marginBottom: "8px", textTransform: "uppercase" }}>
                  Agregar servicio o repuesto
                </div>
                <div style={{ display: "grid",
                  gridTemplateColumns: "110px 1fr 70px 100px auto",
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
                  <input type="number" value={lineaForm.cantidad} min="1"
                    onChange={e => setLineaForm({...lineaForm, cantidad: e.target.value})}
                    style={{ width: "100%" }} />
                  <input type="number" value={lineaForm.precio_unit}
                    onChange={e => setLineaForm({...lineaForm, precio_unit: e.target.value})}
                    placeholder="Precio" style={{ width: "100%" }} />
                  <button onClick={agregarLinea} disabled={guardando} style={{
                    background: "#10B981", border: "none", color: "white",
                    padding: "8px 12px", borderRadius: "6px",
                    cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap"
                  }}>{guardando ? "..." : "+ Agregar"}</button>
                </div>
              </div>

              {/* Tabla de líneas */}
              <table style={{ marginBottom: "1rem" }}>
                <thead>
                  <tr>
                    <th>Tipo</th><th>Descripción</th><th>Cant.</th>
                    <th>Precio</th><th>Subtotal</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {!lineas.length ? (
                    <tr><td colSpan={6} style={{ padding: "1.5rem",
                      textAlign: "center", color: "var(--text3)", fontSize: "13px" }}>
                      Sin ítems — agrega servicios o repuestos
                    </td></tr>
                  ) : lineas.map(l => (
                    <tr key={l.id}>
                      <td>{l.tipo === "servicio" ? "🔧" : "🔩"}</td>
                      <td style={{ color: "var(--text)" }}>{l.descripcion}</td>
                      <td style={{ textAlign: "center" }}>{l.cantidad}</td>
                      <td style={{ textAlign: "right" }}>
                        ${parseFloat(l.precio_unit).toLocaleString()}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: "600",
                        color: "var(--green)" }}>
                        ${parseFloat(l.subtotal).toLocaleString()}
                      </td>
                      <td>
                        <button onClick={() => eliminarLinea(l.id)} style={{
                          background: "none", border: "none",
                          color: "#EF4444", cursor: "pointer", fontSize: "16px"
                        }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totales */}
              <div style={{ display: "flex", justifyContent: "flex-end",
                marginBottom: "1rem" }}>
                <div style={{ width: "260px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    padding: "6px 0", fontSize: "13px",
                    borderBottom: "1px solid var(--border)", color: "var(--text2)" }}>
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div style={{ marginTop: "8px", marginBottom: "4px" }}>
                    <div style={{ fontSize: "11px", color: "var(--text3)",
                      marginBottom: "4px" }}>Descuento ($)</div>
                    <input type="number" name="descuento" value={form.descuento}
                      onChange={handleChange}
                      style={{ width: "100%", textAlign: "right" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    padding: "10px 0 0", fontSize: "20px",
                    fontWeight: "700", color: "#10B981" }}>
                    <span>TOTAL</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button className="btn btn-secondary" onClick={paso === 1 ? onCancelar : () => setPaso(1)}>
            {paso === 1 ? "Cancelar" : "← Atrás"}
          </button>
          {paso === 1 ? (
            <button className="btn btn-primary" onClick={crearFacturaBase} disabled={loading}>
              {loading ? "Guardando..." : "Siguiente →"}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={finalizar} disabled={loading}>
              {loading ? "Finalizando..." : esEdicion ? "Guardar cambios" : "✅ Finalizar factura"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
