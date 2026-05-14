import { useState } from "react"
import { productosAPI } from "../services/api"

export default function FormProducto({ onGuardado, onCancelar, productoEditar = null }) {
  const [form, setForm] = useState(productoEditar || {
    sku: "", nombre: "", descripcion: "",
    costo: "0", precio_venta: "0",
    stock_actual: "0", stock_minimo: "0",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  const esEdicion = !!productoEditar

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    if (!form.sku || !form.nombre || !form.precio_venta) {
      setError("SKU, nombre y precio de venta son obligatorios")
      return
    }
    setLoading(true)
    setError("")
    try {
      if (esEdicion) {
        await productosAPI.editar(form.id, form)
      } else {
        await productosAPI.crear(form)
      }
      onGuardado()
    } catch (err) {
      setError(err.response?.data?.sku?.[0] || "Error al guardar el producto")
      setLoading(false)
    }
  }

  const campo = (label, name, type = "text") => (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
        color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase",
        letterSpacing: ".04em" }}>{label}</label>
      <input name={name} type={type} value={form[name]}
        onChange={handleChange} style={{ width: "100%" }} />
    </div>
  )

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
              {esEdicion ? "Editar producto" : "Nuevo producto"}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
              {esEdicion ? `Editando: ${productoEditar.nombre}` : "Agrega un producto al inventario"}
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
            {campo("SKU *", "sku")}
            {campo("Nombre *", "nombre")}
            {campo("Costo", "costo", "number")}
            {campo("Precio venta *", "precio_venta", "number")}
            {campo("Stock actual", "stock_actual", "number")}
            {campo("Stock mínimo", "stock_minimo", "number")}
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
              color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase",
              letterSpacing: ".04em" }}>Descripción</label>
            <textarea name="descripcion" value={form.descripcion || ""}
              onChange={handleChange} rows={2}
              style={{ width: "100%", resize: "vertical" }} />
          </div>
        </div>

        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Guardando..." : esEdicion ? "Guardar cambios" : "Guardar producto"}
          </button>
        </div>
      </div>
    </div>
  )
}
