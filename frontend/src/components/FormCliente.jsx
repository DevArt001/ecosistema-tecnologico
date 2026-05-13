import { useState } from "react"
import { clientesAPI } from "../services/api"

export default function FormCliente({ onGuardado, onCancelar }) {
  const [form, setForm] = useState({
    nombre: "", documento: "", telefono: "", whatsapp: "",
    correo: "", ciudad: "", tipo: "regular", observaciones: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.nombre || !form.documento || !form.telefono) {
      setError("Nombre, documento y teléfono son obligatorios")
      return
    }
    setLoading(true)
    setError("")
    try {
      await clientesAPI.crear(form)
      onGuardado()
    } catch (err) {
      setError(err.response?.data?.documento?.[0] || "Error al guardar el cliente")
      setLoading(false)
    }
  }

  const campo = (label, name, type = "text", opciones = null) => (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
        color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase",
        letterSpacing: ".04em" }}>
        {label}
      </label>
      {opciones ? (
        <select name={name} value={form[name]} onChange={handleChange}
          style={{ width: "100%" }}>
          {opciones.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : (
        <input name={name} type={type} value={form[name]}
          onChange={handleChange} style={{ width: "100%" }} />
      )}
    </div>
  )

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "1rem"
    }}>
      <div style={{
        background: "var(--bg2)", borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)", width: "100%", maxWidth: "540px",
        maxHeight: "90vh", overflowY: "auto"
      }}>
        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: "600", color: "var(--text)" }}>Nuevo cliente</div>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
              Completa los datos del cliente
            </div>
          </div>
          <button onClick={onCancelar} style={{
            background: "none", border: "none", color: "var(--text3)",
            fontSize: "20px", lineHeight: 1
          }}>×</button>
        </div>

        {/* Form */}
        <div style={{ padding: "1.5rem" }}>
          {error && (
            <div style={{ background: "#3B0A0A", border: "1px solid var(--red)",
              borderRadius: "8px", padding: "10px 14px", marginBottom: "1rem",
              fontSize: "13px", color: "var(--red)" }}>
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
            {campo("Nombre completo *", "nombre")}
            {campo("Documento *", "documento")}
            {campo("Teléfono *", "telefono")}
            {campo("WhatsApp", "whatsapp")}
            {campo("Correo", "correo", "email")}
            {campo("Ciudad", "ciudad")}
          </div>

          {campo("Tipo de cliente", "tipo", "text", [
            { value: "regular",   label: "Regular" },
            { value: "frecuente", label: "Frecuente" },
            { value: "premium",   label: "Premium" },
          ])}

          {campo("Observaciones", "observaciones")}
        </div>

        {/* Footer */}
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button className="btn btn-secondary" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Guardando..." : "Guardar cliente"}
          </button>
        </div>
      </div>
    </div>
  )
}