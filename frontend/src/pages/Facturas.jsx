import { useState, useEffect } from "react"
import { facturasAPI } from "../services/api"
import FormFactura from "../components/FormFactura"

export default function Facturas() {
  const [facturas, setFacturas]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [showForm, setShowForm]           = useState(false)
  const [facturaEditar, setFacturaEditar] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { cargarFacturas() }, [])

  const cargarFacturas = () => {
    setLoading(true)
    setError(null)
    facturasAPI.listar()
      .then(res => setFacturas(res.data.results || res.data))
      .catch(err => setError(err.mensaje || "Error al cargar facturas"))
      .finally(() => setLoading(false))
  }

  const handleEditar = (f) => { setFacturaEditar(f); setShowForm(true) }

  const handleEliminar = async (id) => {
    try {
      await facturasAPI.eliminar(id)
      setConfirmDelete(null)
      cargarFacturas()
    } catch (err) {
      alert(err.mensaje || "Error al eliminar factura")
    }
  }

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
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)", width: "100%", maxWidth: "400px", padding: "1.5rem" }}>
            <div style={{ fontWeight: "600", color: "var(--text)", marginBottom: "8px", fontSize: "16px" }}>
              ¿Eliminar factura?
            </div>
            <div style={{ color: "var(--text3)", fontSize: "13px", marginBottom: "1.5rem" }}>
              Se eliminará la factura <strong style={{ color: "var(--text)" }}>{confirmDelete.numero}</strong> permanentemente.
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
        <FormFactura
          facturaEditar={facturaEditar}
          onGuardado={() => { setShowForm(false); setFacturaEditar(null); cargarFacturas() }}
          onCancelar={() => { setShowForm(false); setFacturaEditar(null) }}
        />
      )}

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
        <button className="btn btn-primary" onClick={() => { setFacturaEditar(null); setShowForm(true) }}>
          + Nueva factura
        </button>
      </div>

      {error && (
        <div style={{ background: "#3B0A0A", border: "1px solid #EF4444", borderRadius: "8px",
          padding: "12px 16px", marginBottom: "1rem", color: "#FCA5A5", fontSize: "13px",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {error}
          <button onClick={cargarFacturas}
            style={{ background: "none", border: "none", color: "#FCA5A5",
              cursor: "pointer", fontSize: "12px", textDecoration: "underline" }}>
            Reintentar
          </button>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>Cargando...</div>
        ) : facturas.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>No hay facturas todavía</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Número</th><th>Cliente</th><th>Subtotal</th>
                <th>Descuento</th><th>Total</th><th>Método</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map(f => (
                <tr key={f.id}>
                  <td style={{ fontFamily: "monospace", fontSize: "12px",
                    color: "var(--text)", fontWeight: "500" }}>{f.numero}</td>
                  <td style={{ color: "var(--text)" }}>{f.cliente_nombre || "—"}</td>
                  <td>${Number(f.subtotal).toLocaleString()}</td>
                  <td style={{ color: "var(--red)" }}>-${Number(f.descuento).toLocaleString()}</td>
                  <td style={{ color: "var(--green)", fontWeight: "600" }}>${Number(f.total).toLocaleString()}</td>
                  <td>{f.metodo_pago}</td>
                  <td>
                    <span className="badge" style={{
                      background: estadoBadge[f.estado]?.bg || "#1F2937",
                      color: estadoBadge[f.estado]?.color || "#9CA3AF"
                    }}>{f.estado}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => window.open(facturasAPI.pdf(f.id), "_blank")} style={{
                        background: "#1F2937", border: "1px solid #374151",
                        color: "#D1D5DB", borderRadius: "6px",
                        padding: "4px 10px", fontSize: "12px", cursor: "pointer" }}>📄</button>
                      <button onClick={() => handleEditar(f)} style={{
                        background: "#1E3A5F", border: "1px solid #3B82F6",
                        color: "#3B82F6", borderRadius: "6px",
                        padding: "4px 10px", fontSize: "12px", cursor: "pointer" }}>✏️</button>
                      <button onClick={() => setConfirmDelete(f)} style={{
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
