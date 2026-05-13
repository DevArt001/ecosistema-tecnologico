import { useState, useEffect } from "react"
import { facturasAPI } from "../services/api"

export default function Facturas() {
  const [facturas, setFacturas] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    facturasAPI.listar().then(res => {
      setFacturas(res.data.results || res.data)
      setLoading(false)
    })
  }, [])

  const estadoBadge = {
    pendiente: { bg: "#451A03", color: "#F59E0B" },
    pagada:    { bg: "#065F46", color: "#10B981" },
    anulada:   { bg: "#3B0A0A", color: "#EF4444" },
  }

  const total = facturas
    .filter(f => f.estado === "pagada")
    .reduce((sum, f) => sum + Number(f.total), 0)

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text)", marginBottom: "4px" }}>
            Facturación
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>
            {facturas.length} facturas · Total cobrado:
            <span style={{ color: "var(--green)", fontWeight: "600", marginLeft: "6px" }}>
              ${total.toLocaleString()}
            </span>
          </p>
        </div>
        <button className="btn btn-primary">+ Nueva factura</button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>Cargando...</div>
        ) : facturas.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
            No hay facturas todavía
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Número</th><th>Cliente</th><th>Subtotal</th>
                <th>Descuento</th><th>Total</th><th>Método</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map(f => (
                <tr key={f.id}>
                  <td style={{ fontFamily: "DM Mono, monospace", fontSize: "12px",
                    color: "var(--text)", fontWeight: "500" }}>{f.numero}</td>
                  <td style={{ color: "var(--text)" }}>{f.cliente_nombre || "—"}</td>
                  <td>${Number(f.subtotal).toLocaleString()}</td>
                  <td style={{ color: "var(--red)" }}>-${Number(f.descuento).toLocaleString()}</td>
                  <td style={{ color: "var(--green)", fontWeight: "600" }}>
                    ${Number(f.total).toLocaleString()}
                  </td>
                  <td>{f.metodo_pago}</td>
                  <td>
                    <span className="badge" style={{
                      background: estadoBadge[f.estado]?.bg || "#1F2937",
                      color: estadoBadge[f.estado]?.color || "#9CA3AF"
                    }}>{f.estado}</span>
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