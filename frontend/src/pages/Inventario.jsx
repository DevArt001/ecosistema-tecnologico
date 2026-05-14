import { useState, useEffect } from "react"
import { productosAPI } from "../services/api"
import FormProducto from "../components/FormProducto"

export default function Inventario() {
  const [productos, setProductos]         = useState([])
  const [loading, setLoading]             = useState(true)
  const [buscar, setBuscar]               = useState("")
  const [showForm, setShowForm]           = useState(false)
  const [productoEditar, setProductoEditar] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { cargarProductos() }, [])

  const cargarProductos = () => {
    setLoading(true)
    productosAPI.listar().then(res => {
      setProductos(res.data.results || res.data)
      setLoading(false)
    })
  }

  const handleEditar = (p) => { setProductoEditar(p); setShowForm(true) }
  const handleEliminar = async (id) => {
    await productosAPI.eliminar(id)
    setConfirmDelete(null)
    cargarProductos()
  }

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
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)", width: "100%", maxWidth: "400px", padding: "1.5rem" }}>
            <div style={{ fontWeight: "600", color: "var(--text)", marginBottom: "8px", fontSize: "16px" }}>
              ¿Eliminar producto?
            </div>
            <div style={{ color: "var(--text3)", fontSize: "13px", marginBottom: "1.5rem" }}>
              Se eliminará <strong style={{ color: "var(--text)" }}>{confirmDelete.nombre}</strong> permanentemente.
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
        <FormProducto
          productoEditar={productoEditar}
          onGuardado={() => { setShowForm(false); setProductoEditar(null); cargarProductos() }}
          onCancelar={() => { setShowForm(false); setProductoEditar(null) }}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text)", marginBottom: "4px" }}>
            Inventario
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>{productos.length} productos registrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setProductoEditar(null); setShowForm(true) }}>
          + Nuevo producto
        </button>
      </div>

      <div className="card">
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
          <input value={buscar} onChange={e => setBuscar(e.target.value)}
            placeholder="Buscar por nombre o SKU..." style={{ width: "280px" }} />
        </div>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>No hay productos todavía</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>SKU</th><th>Nombre</th><th>Stock</th><th>Mínimo</th>
                <th>Costo</th><th>Precio</th><th>Margen</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id}>
                  <td style={{ fontFamily: "DM Mono, monospace", fontSize: "12px", color: "var(--text)" }}>{p.sku}</td>
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
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => handleEditar(p)} style={{
                        background: "#1E3A5F", border: "1px solid #3B82F6",
                        color: "#3B82F6", borderRadius: "6px",
                        padding: "4px 10px", fontSize: "12px", cursor: "pointer" }}>✏️</button>
                      <button onClick={() => setConfirmDelete(p)} style={{
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
