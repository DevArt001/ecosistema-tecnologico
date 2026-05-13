import { useState, useEffect } from "react"
import { vehiculosAPI } from "../services/api"
import FormVehiculo from "../components/FormVehiculo"

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([])
  const [loading, setLoading]     = useState(true)
  const [buscar, setBuscar]       = useState("")
  const [showForm, setShowForm]   = useState(false)

  useEffect(() => { cargarVehiculos() }, [])

  const cargarVehiculos = () => {
    setLoading(true)
    vehiculosAPI.listar().then(res => {
      setVehiculos(res.data.results || res.data)
      setLoading(false)
    })
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
      {showForm && (
        <FormVehiculo
          onGuardado={() => { setShowForm(false); cargarVehiculos() }}
          onCancelar={() => setShowForm(false)}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700",
            color: "var(--text)", marginBottom: "4px" }}>Vehículos</h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>
            {vehiculos.length} vehículos registrados
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Nuevo vehículo
        </button>
      </div>

      <div className="card">
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
          <input value={buscar} onChange={e => setBuscar(e.target.value)}
            placeholder="Buscar por placa o marca..." style={{ width: "280px" }} />
        </div>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
            Cargando...
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Placa</th><th>Marca</th><th>Línea</th>
                <th>Modelo</th><th>Kilometraje</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(v => (
                <tr key={v.id}>
                  <td style={{ color: "var(--text)", fontWeight: "600",
                    fontFamily: "DM Mono, monospace" }}>{v.placa}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}