import { useState, useEffect } from "react"
import { facturasAPI, clientesAPI, ordenesAPI } from "../services/api"

export default function FormFactura({ onGuardado, onCancelar, facturaEditar = null }) {
  const [form, setForm] = useState(facturaEditar || {
    cliente: "", orden: "", descuento: "0",
    metodo_pago: "efectivo", estado: "pendiente", notas: ""
  })
  const [clientes, setClientes] = useState([])
  const [ordenes, setOrdenes]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")

  const esEdicion = !!facturaEditar

  useEffect(() => {
    clientesAPI.listar().then(res => setClientes(res.data.results || res.data))
    ordenesAPI.listar().then(res => setOrdenes(res.data.results || res.data))
  }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    if (!form.cliente) {
      setError("El cliente es obligatorio")
      return
    }
    setLoading(true)
    setError("")
    try {
      if (esEdicion) {
        await facturasAPI.editar(form.id, form)
      } else {
        await facturasAPI.crear(form)
      }
      onGuardado()
    } catch (err) {
      setError("Error al guardar la factura")
      setLoading(false)
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "1rem" }}>
      <div style={{ background: "var(--bg2)", borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)", width: "100%", maxWidth: "540px",
        maxHeight: "90vh", overflowY: "auto" }}>

        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: "600", color: "var(--text)" }}>
              {esEdicion ? "Editar factura" : "Nueva factura"}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
              {esEdicion ? `Editando: ${facturaEditar.numero}` : "El número se genera automáticamente"}
            </div>
          </div>
          <button onClick={onCancelar} style={{
            background: "none", border: "none", color: "var(--text3)",
            fontSize: "20px", cursor: "pointer" }}>×</button>
        </div>

        <div style={{ padding: "1.5rem" }}>
          {error && (
            <div style={{ background: "#3B0A0A", border: "1px solid var(--red)",
              borderRadius: "8px", padding: "10px 14px", marginBottom: "1rem",
              fontSize: "13px", color: "var(--red)" }}>{error}</div>
          )}

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
              color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase",
              letterSpacing: ".04em" }}>Cliente *</label>
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
              color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase",
              letterSpacing: ".04em" }}>Orden de trabajo (opcional)</label>
            <select name="orden" value={form.orden}
              onChange={handleChange} style={{ width: "100%" }}>
              <option value="">Sin orden asociada</option>
              {ordenes.map(o => (
                <option key={o.id} value={o.id}>{o.codigo} — {o.cliente_nombre}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
                color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase",
                letterSpacing: ".04em" }}>Descuento ($)</label>
              <input name="descuento" type="number" value={form.descuento}
                onChange={handleChange} style={{ width: "100%" }} />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
                color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase",
                letterSpacing: ".04em" }}>Método de pago</label>
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
                color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase",
                letterSpacing: ".04em" }}>Estado</label>
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
              color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase",
              letterSpacing: ".04em" }}>Notas</label>
            <textarea name="notas" value={form.notas || ""}
              onChange={handleChange} rows={2}
              style={{ width: "100%", resize: "vertical" }} />
          </div>
        </div>

        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear factura"}
          </button>
        </div>
      </div>
    </div>
  )
}
