import { useState, useEffect } from "react"
import { vehiculosAPI, clientesAPI } from "../services/api"

export default function FormVehiculo({ onGuardado, onCancelar }) {
  const [form, setForm] = useState({
    cliente: "", placa: "", marca: "", linea: "",
    modelo: "", cilindraje: "", color: "", kilometraje: "0",
    tipo: "moto", estado: "activo"
  })
  const [clientes, setClientes] = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")

  useEffect(() => {
    clientesAPI.listar().then(res => {
      setClientes(res.data.results || res.data)
    })
  }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    if (!form.cliente || !form.placa || !form.marca || !form.linea || !form.modelo) {
      setError("Cliente, placa, marca, línea y modelo son obligatorios")
      return
    }
    setLoading(true)
    setError("")
    try {
      await vehiculosAPI.crear(form)
      onGuardado()
    } catch (err) {
      setError(err.response?.data?.placa?.[0] || "Error al guardar el vehículo")
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
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: "600", color: "var(--text)" }}>Nuevo vehículo</div>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
              Registra el vehículo del cliente
            </div>
          </div>
          <button onClick={onCancelar} style={{
            background: "none", border: "none", color: "var(--text3)", fontSize: "20px"
          }}>×</button>
        </div>

        <div style={{ padding: "1.5rem" }}>
          {error && (
            <div style={{ background: "#3B0A0A", border: "1px solid var(--red)",
              borderRadius: "8px", padding: "10px 14px", marginBottom: "1rem",
              fontSize: "13px", color: "var(--red)" }}>
              {error}
            </div>
          )}

          {/* Cliente */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
              color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase",
              letterSpacing: ".04em" }}>
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
            {campo("Placa *", "placa")}
            {campo("Marca *", "marca")}
            {campo("Línea *", "linea")}
            {campo("Modelo *", "modelo", "number")}
            {campo("Cilindraje (cc)", "cilindraje", "number")}
            {campo("Color", "color")}
            {campo("Kilometraje", "kilometraje", "number")}
            {campo("Tipo", "tipo", "text", [
              { value: "moto",      label: "Motocicleta" },
              { value: "carro",     label: "Automóvil" },
              { value: "bicicleta", label: "Bicicleta eléctrica" },
            ])}
          </div>
        </div>

        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Guardando..." : "Guardar vehículo"}
          </button>
        </div>
      </div>
    </div>
  )
}