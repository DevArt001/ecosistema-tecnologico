import { useState, useEffect } from "react"
import { productosAPI } from "../services/api"

export default function Inventario() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading]     = useState(true)
  const [buscar, setBuscar]       = useState("")

  useEffect(() => {
    productosAPI.listar().then(res => {
      setProductos(res.data.results || res.data)
      setLoading(false)
    })
  }, [])

  const filtrados = productos.filter(p =>
    p.nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
    p.sku?.toLowerCase().includes(buscar.toLowerCase())
  )

  const stockBadge = {
    normal:  { bg: "#065F46", color: "#10B981" },
    bajo:    { bg: "#451A03", color: "#F59E0B" },
    critico: { bg: "#3B0A0A", color: "#EF4444" },
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text)", marginBottom: "4px" }}>
            Inventario
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>
            {productos.length} productos registrados
          </p>
        </div>
        <button className="btn btn-primary">+ Nuevo producto</button>
      </div>

      <div className="card">
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
          <input value={buscar} onChange={e => setBuscar(e.target.value)}
            placeholder="Buscar por nombre o SKU..." style={{ width: "280px" }} />
        </div>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
            No hay productos todavía
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>SKU</th><th>Nombre</th><th>Stock</th>
                <th>Mínimo</th><th>Costo</th><th>Precio</th><th>Margen</th><th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id}>
                  <td style={{ fontFamily: "DM Mono, monospace", fontSize: "12px",
                    color: "var(--text)" }}>{p.sku}</td>
                  <td style={{ color: "var(--text)", fontWeight: "500" }}>{p.nombre}</td>
                  <td style={{ color: "var(--text)", fontWeight: "600" }}>{p.stock_actual}</td>
                  <td>{p.stock_minimo}</td>
                  <td>${Number(p.costo).toLocaleString()}</td>
                  <td style={{ color: "var(--green)" }}>${Number(p.precio_venta).toLocaleString()}</td>
                  <td style={{ color: "var(--amber)" }}>{p.margen}%</td>
                  <td>
                    <span className="badge" style={{
                      background: stockBadge[p.estado_stock]?.bg || "#1F2937",
                      color: stockBadge[p.estado_stock]?.color || "#9CA3AF"
                    }}>{p.estado_stock}</span>
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