import { useState, useEffect } from "react"
import { clientesAPI } from "../services/api"

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading]   = useState(true)
  const [buscar, setBuscar]     = useState("")

  useEffect(() => { cargarClientes() }, [])

  const cargarClientes = () => {
    clientesAPI.listar().then(res => {
      setClientes(res.data.results || res.data)
      setLoading(false)
    })
  }

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    c.documento.includes(buscar)
  )

  const tipoBadge = {
    regular:   { bg: "#1F2937", color: "#9CA3AF" },
    frecuente: { bg: "#1E3A5F", color: "#3B82F6" },
    premium:   { bg: "#451A03", color: "#F59E0B" },
    inactivo:  { bg: "#3B0A0A", color: "#EF4444" },
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text)", marginBottom: "4px" }}>
            Clientes
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>
            {clientes.length} clientes registrados
          </p>
        </div>
        <button className="btn btn-primary">+ Nuevo cliente</button>
      </div>

      <div className="card">
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
          <input
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
            placeholder="Buscar por nombre o documento..."
            style={{ width: "280px" }}
          />
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
            Cargando...
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Teléfono</th>
                <th>Ciudad</th>
                <th>Tipo</th>
                <th>Puntos</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(c => (
                <tr key={c.id}>
                  <td style={{ color: "var(--text)", fontWeight: "500" }}>{c.nombre}</td>
                  <td style={{ fontFamily: "DM Mono, monospace", fontSize: "12px" }}>{c.documento}</td>
                  <td>{c.telefono}</td>
                  <td>{c.ciudad || "—"}</td>
                  <td>
                    <span className="badge" style={{
                      background: tipoBadge[c.tipo]?.bg || "#1F2937",
                      color: tipoBadge[c.tipo]?.color || "#9CA3AF"
                    }}>
                      {c.tipo}
                    </span>
                  </td>
                  <td style={{ color: "var(--green)" }}>{c.puntos} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}