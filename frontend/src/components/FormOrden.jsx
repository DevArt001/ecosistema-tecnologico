import { useState, useEffect } from "react"
import { ordenesAPI, clientesAPI, vehiculosAPI } from "../services/api"

export default function FormOrden({ onGuardado, onCancelar }) {
  const [form, setForm] = useState({
    cliente: "", vehiculo: "", descripcion: "",
    prioridad: "normal", tecnico: "",
    costo_estimado: "0"
  })
  const [clientes, setClientes]   = useState([])
  const [vehiculos, setVehiculos] = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState("")

  useEffect(() => {
    clientesAPI.listar().then(res => setClientes(res.data.results || res.data))
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (name === "cliente") {
      vehiculosAPI.listar().then(res => {
        const todos = res.data.results || res.data
        setVehiculos(todos.filter(v => String(v.cliente) === value))
        setForm(prev => ({ ...prev, cliente: value, vehiculo: "" }))
      })
    }
  }

  const handleSubmit = async () => {
    if (!form.cliente || !form.vehiculo || !form.descripcion) {
      setError("Cliente, vehículo y descripción son obligatorios")
      return
    }
    setLoading(true)
    setError("")
    try {
      await ordenesAPI.crear(form)
      onGuardado()
    } catch (err) {
      setError("Error al crear la orden")
      setLoading(false)
    }
  }

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
            <div style={{ fontWeight: "600", color: "var(--text)" }}>Nueva orden de trabajo</div>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
              El código se genera automáticamente
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
              letterSpacing: ".04em" }}>Cliente *</label>
            <select name="cliente" value={form.cliente}
              onChange={handleChange} style={{ width: "100%" }}>
              <option value="">Seleccionar cliente...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} — {c.documento}</option>
              ))}
            </select>
          </div>

          {/* Vehículo */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
              color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase",
              letterSpacing: ".04em" }}>Vehículo *</label>
            <select name="vehiculo" value={form.vehiculo}
              onChange={handleChange} style={{ width: "100%" }}
              disabled={!form.cliente}>
              <option value="">
                {form.cliente ? "Seleccionar vehículo..." : "Primero selecciona un cliente"}
              </option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>
                  {v.placa} — {v.marca} {v.linea}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
              color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase",
              letterSpacing: ".04em" }}>Descripción del problema *</label>
            <textarea name="descripcion" value={form.descripcion}
              onChange={handleChange} rows={3}
              placeholder="¿Qué reporta el cliente?"
              style={{ width: "100%", resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
            {/* Prioridad */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
                color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase",
                letterSpacing: ".04em" }}>Prioridad</label>
              <select name="prioridad" value={form.prioridad}
                onChange={handleChange} style={{ width: "100%" }}>
                <option value="baja">Baja</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            {/* Técnico */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
                color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase",
                letterSpacing: ".04em" }}>Técnico</label>
              <input name="tecnico" value={form.tecnico}
                onChange={handleChange} style={{ width: "100%" }}
                placeholder="Nombre del técnico" />
            </div>

            {/* Costo estimado */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
                color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase",
                letterSpacing: ".04em" }}>Costo estimado</label>
              <input name="costo_estimado" type="number"
                value={form.costo_estimado}
                onChange={handleChange} style={{ width: "100%" }} />
            </div>
          </div>
        </div>

        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <button className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creando..." : "Crear orden"}
          </button>
        </div>
      </div>
    </div>
  )
}