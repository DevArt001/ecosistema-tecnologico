import { useState, useEffect } from "react"
import { vehiculosAPI } from "../services/api"
import FormVehiculo from "../components/FormVehiculo"

export default function Vehiculos() {
  const [vehiculos, setVehiculos]         = useState([])
  const [loading, setLoading]             = useState(true)
  const [buscar, setBuscar]               = useState("")
  const [showForm, setShowForm]           = useState(false)
  const [vehiculoEditar, setVehiculoEditar] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { cargarVehiculos() }, [])

  const cargarVehiculos = () => {
    setLoading(true)
    vehiculosAPI.listar().then(res => {
      setVehiculos(res.data.results || res.data)
      setLoading(false)
    })
  }

  const handleEditar = (v) => { setVehiculoEditar(v); setShowForm(true) }
  const handleEliminar = async (id) => {
    await vehiculosAPI.eliminar(id)
    setConfirmDelete(null)
    cargarVehiculos()
  }

  const filtrados = vehiculos.filter(v =>
    v.placa?.toLowerCase().includes(buscar.toLowerCase()) ||
    v.marca?.toLowerCase().includes(buscar.toLowerCase())
  )

  const estadoBadge = {
    activo:      { bg: "#065F46", color: "#10B981" },
    en_servicio: { bg: "#451A03", color: "#F59E0B" },
    inactivo:    { bg: "#1F2937", color: "#6B7280" },
  }

  return (
    <div>
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)", width: "100%", maxWidth: "400px", padding: "1.5rem" }}>
            <div style={{ fontWeight: "600", color: "var(--text)", marginBottom: "8px", fontSize: "16px" }}>
              ¿Eliminar vehículo?
            </div>
            <div style={{ color: "var(--text3)", fontSize: "13px", marginBottom: "1.5rem" }}>
              Se eliminará el vehículo <strong style={{ color: "var(--text)" }}>{confirmDelete.placa}</strong> permanentemente.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn" onClick={() => handleEliminar(confirmDelete.id)}
                style={{ background: "#7F1D1D", color: "#FCA5A5", border: "1px solid #EF4444" }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <FormVehiculo
          vehiculoEditar={vehiculoEditar}
          onGuardado={() => { setShowForm(false); setVehiculoEditar(null); cargarVehiculos() }}
          onCancelar={() => { setShowForm(false); setVehiculoEditar(null) }}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text)", marginBottom: "4px" }}>Vehículos</h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>{vehiculos.length} vehículos registrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setVehiculoEditar(null); setShowForm(true) }}>
          + Nuevo vehículo
        </button>
      </div>

      <div className="card">
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
          <input value={buscar} onChange={e => setBuscar(e.target.value)}
            placeholder="Buscar por placa o marca..." style={{ width: "280px" }} />
        </div>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>Cargando...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Placa</th><th>Marca</th><th>Línea</th>
                <th>Modelo</th><th>Kilometraje</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(v => (
                <tr key={v.id}>
                  <td style={{ color: "var(--text)", fontWeight: "600", fontFamily: "DM Mono, monospace" }}>{v.placa}</td>
                  <td style={{ color: "var(--text)" }}>{v.marca}</td>
                  <td>{v.linea}</td>
                  <td>{v.modelo}</td>
                  <td>{v.kilometraje?.toLocaleString()} km</td>
                  <td>
                    <span className="badge" style={{
                      background: estadoBadge[v.estado]?.bg || "#1F2937",
                      color: estadoBadge[v.estado]?.color || "#9CA3AF"
                    }}>{v.estado}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => handleEditar(v)} style={{
                        background: "#1E3A5F", border: "1px solid #3B82F6",
                        color: "#3B82F6", borderRadius: "6px",
                        padding: "4px 10px", fontSize: "12px", cursor: "pointer" }}>✏️</button>
                      <button onClick={() => setConfirmDelete(v)} style={{
                        background: "#3B0A0A", border: "1px solid #EF4444",
                        color: "#EF4444", borderRadius: "6px",
                        padding: "4px 10px", fontSize: "12px", cursor: "pointer" }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
