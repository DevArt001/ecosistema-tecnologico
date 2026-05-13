import { useState, useEffect } from "react"
import { clientesAPI } from "../services/api"

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading]   = useState(true)
  const [buscar, setBuscar]     = useState("")

  useEffect(() => {
    cargarClientes()
  }, [])

  const cargarClientes = () => {
    clientesAPI.listar()
      .then(res => {
        setClientes(res.data.results || res.data)
        setLoading(false)
      })
  }

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    c.documento.includes(buscar)
  )

  const tipoBadge = {
    regular:   { bg: "#E5E7EB", color: "#374151" },
    frecuente: { bg: "#DBEAFE", color: "#1D4ED8" },
    premium:   { bg: "#FEF3C7", color: "#92400E" },
    inactivo:  { bg: "#FEE2E2", color: "#991B1B" },
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: 0, color: "#1A1A2E" }}>Clientes</h1>
          <p style={{ margin: "4px 0 0", color: "#6B7280" }}>
            {clientes.length} clientes registrados
          </p>
        </div>
        <button style={{
          background: "#0F6E56", color: "white", border: "none",
          padding: "10px 20px", borderRadius: "8px", cursor: "pointer",
          fontSize: "14px", fontWeight: "500"
        }}>
          + Nuevo cliente
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "12px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>

        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #F3F4F6" }}>
          <input
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
            placeholder="Buscar por nombre o documento..."
            style={{
              width: "300px", padding: "8px 12px", border: "1px solid #E5E7EB",
              borderRadius: "8px", fontSize: "14px", outline: "none"
            }}
          />
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#6B7280" }}>
            Cargando clientes...
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["Nombre", "Documento", "Teléfono", "Ciudad", "Tipo", "Puntos"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left",
                    fontSize: "12px", color: "#6B7280", fontWeight: "600",
                    textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c, i) => (
                <tr key={c.id} style={{
                  borderTop: "1px solid #F3F4F6",
                  background: i % 2 === 0 ? "white" : "#FAFAFA"
                }}>
                  <td style={{ padding: "12px 16px", fontWeight: "500", color: "#1A1A2E" }}>
                    {c.nombre}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6B7280", fontSize: "13px" }}>
                    {c.documento}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6B7280", fontSize: "13px" }}>
                    {c.telefono}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6B7280", fontSize: "13px" }}>
                    {c.ciudad || "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "12px",
                      fontWeight: "500",
                      background: tipoBadge[c.tipo]?.bg || "#E5E7EB",
                      color: tipoBadge[c.tipo]?.color || "#374151",
                    }}>
                      {c.tipo}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6B7280", fontSize: "13px" }}>
                    {c.puntos} pts
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