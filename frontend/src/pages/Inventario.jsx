import { useState, useEffect } from "react"
import { productosAPI } from "../services/api"
import API from "../services/api"
import { PageHeader, Toast, ConfirmModal, EmptyState, KPICard,
         SearchBar, TableSkeleton, ModalForm, Field } from "../components/UI"
import FormProducto from "../components/FormProducto"

export default function Inventario() {
  const [productos, setProductos]   = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading]       = useState(true)
  const [buscar, setBuscar]         = useState("")
  const [filtroEstado, setFiltroEstado] = useState("")
  const [showForm, setShowForm]     = useState(false)
  const [productoEditar, setProductoEditar] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [mensaje, setMensaje]       = useState("")

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([
        productosAPI.listar(), API.get("/categorias/")
      ])
      setProductos(p.data.results || p.data)
      setCategorias(c.data.results || c.data)
    } catch { mostrar("❌ Error al cargar") }
    setLoading(false)
  }

  const mostrar = (msg) => { setMensaje(msg); setTimeout(() => setMensaje(""), 3000) }

  const eliminar = async () => {
    try {
      await productosAPI.eliminar(confirmDel.id)
      mostrar("✅ Producto eliminado")
      setConfirmDel(null)
      cargar()
    } catch { mostrar("❌ Error al eliminar") }
  }

  const STOCK_CONFIG = {
    normal:  { color: "#00D4A0", bg: "#00D4A015", label: "Normal",   icon: "✅" },
    bajo:    { color: "#F5A623", bg: "#F5A62315", label: "Bajo",     icon: "⚠️" },
    critico: { color: "#E8213A", bg: "#E8213A15", label: "Crítico",  icon: "🚨" },
  }

  const filtrados = productos.filter(p => {
    const matchBuscar = !buscar ||
      p.nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
      p.sku?.toLowerCase().includes(buscar.toLowerCase())
    const matchEstado = !filtroEstado || p.estado_stock === filtroEstado
    return matchBuscar && matchEstado
  })

  const stockCritico = productos.filter(p => p.estado_stock === "critico").length
  const stockBajo    = productos.filter(p => p.estado_stock === "bajo").length
  const valorInventario = productos.reduce((s, p) =>
    s + (parseFloat(p.costo || 0) * p.stock_actual), 0)

  return (
    <div>
      <Toast mensaje={mensaje} />

      {confirmDel && (
        <ConfirmModal titulo="¿Eliminar producto?"
          texto={<>Se eliminará <strong style={{ color: "var(--text)" }}>{confirmDel.nombre}</strong> (SKU: {confirmDel.sku}) permanentemente.</>}
          onConfirm={eliminar} onCancel={() => setConfirmDel(null)} />
      )}

      {showForm && (
        <FormProducto
          productoEditar={productoEditar}
          onGuardado={() => { setShowForm(false); setProductoEditar(null); cargar() }}
          onCancelar={() => { setShowForm(false); setProductoEditar(null) }}
        />
      )}

      <PageHeader titulo="Inventario" sub={`${productos.length} productos registrados`}>
        <button className="btn btn-primary"
          onClick={() => { setProductoEditar(null); setShowForm(true) }}>
          + Nuevo producto
        </button>
      </PageHeader>

      {/* KPIs */}
      <div className="stagger" style={{ display: "flex", gap: "1rem",
        flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <KPICard titulo="Total productos" valor={productos.length}
          color="#1E5FD4" icon="📦" delay={0} />
        <KPICard titulo="Stock crítico" valor={stockCritico}
          color="#E8213A" icon="🚨" delay={.04} />
        <KPICard titulo="Stock bajo" valor={stockBajo}
          color="#F5A623" icon="⚠️" delay={.08} />
        <KPICard titulo="Valor inventario"
          valor={`$${Math.round(valorInventario/1000)}K`}
          color="#00D4A0" icon="💰" delay={.12} />
      </div>

      {/* Alertas */}
      {(stockCritico > 0 || stockBajo > 0) && (
        <div className="fade-in" style={{ marginBottom: "1.5rem",
          display: "flex", flexDirection: "column", gap: "8px" }}>
          {stockCritico > 0 && (
            <div style={{
              padding: "10px 16px", borderRadius: "10px", fontSize: "13px",
              background: "rgba(232,33,58,.08)", border: "1px solid rgba(232,33,58,.25)",
              color: "#FF6B6B", display: "flex", alignItems: "center", gap: "8px"
            }}>
              🚨 <strong>{stockCritico} producto{stockCritico > 1 ? "s" : ""}</strong> en stock crítico — requieren reposición urgente
            </div>
          )}
          {stockBajo > 0 && (
            <div style={{
              padding: "10px 16px", borderRadius: "10px", fontSize: "13px",
              background: "rgba(245,166,35,.08)", border: "1px solid rgba(245,166,35,.25)",
              color: "#F5A623", display: "flex", alignItems: "center", gap: "8px"
            }}>
              ⚠️ <strong>{stockBajo} producto{stockBajo > 1 ? "s" : ""}</strong> con stock bajo
            </div>
          )}
        </div>
      )}

      {/* Filtros estado */}
      <div className="fade-in" style={{ display: "flex", gap: "6px",
        flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {[
          { key: "", label: `Todos (${productos.length})`, color: "var(--red)" },
          { key: "critico", label: `Crítico (${stockCritico})`, color: "#E8213A" },
          { key: "bajo",    label: `Bajo (${stockBajo})`, color: "#F5A623" },
          { key: "normal",  label: `Normal (${productos.filter(p=>p.estado_stock==="normal").length})`, color: "#00D4A0" },
        ].map(f => (
          <button key={f.key} onClick={() => setFiltroEstado(f.key)} style={{
            padding: "5px 14px", borderRadius: "20px", border: "none",
            fontSize: "12px", fontWeight: "500", cursor: "pointer",
            background: filtroEstado === f.key ? f.color + "25" : "var(--bg3)",
            color: filtroEstado === f.key ? f.color : "var(--text3)",
            transition: "all .15s",
          }}>{f.label}</button>
        ))}
      </div>

      <div className="card fade-in">
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "8px" }}>
          <SearchBar value={buscar} onChange={setBuscar}
            placeholder="Buscar por nombre o SKU..." />
          <span style={{ fontSize: "12px", color: "var(--text3)" }}>
            {filtrados.length} productos
          </span>
        </div>
        <table>
          <thead>
            <tr><th>SKU</th><th>Nombre</th><th>Categoría</th><th>Stock</th>
              <th>Costo</th><th>Precio</th><th>Margen</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {loading ? <TableSkeleton rows={5} cols={9} /> :
             filtrados.length === 0 ? (
              <tr><td colSpan="9">
                <EmptyState icon="📦" titulo="Sin productos"
                  sub="Agrega el primer producto al inventario"
                  action={<button className="btn btn-primary"
                    onClick={() => { setProductoEditar(null); setShowForm(true) }}>
                    + Nuevo producto</button>} />
              </td></tr>
            ) : filtrados.map(p => {
              const s = STOCK_CONFIG[p.estado_stock] || STOCK_CONFIG.normal
              return (
                <tr key={p.id} className="fade-in">
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px",
                    color: "var(--text3)" }}>{p.sku}</td>
                  <td style={{ fontWeight: "600", color: "var(--text)" }}>{p.nombre}</td>
                  <td style={{ fontSize: "12px", color: "var(--text3)" }}>
                    {p.categoria_nombre || "—"}
                  </td>
                  <td>
                    <span style={{ fontWeight: "700", fontSize: "15px",
                      color: s.color }}>{p.stock_actual}</span>
                    <span style={{ fontSize: "10px", color: "var(--text3)",
                      marginLeft: "4px" }}>/ min {p.stock_minimo}</span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px",
                    color: "var(--text2)" }}>
                    ${Number(p.costo).toLocaleString("es-CO")}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px",
                    color: "#00D4A0", fontWeight: "600" }}>
                    ${Number(p.precio_venta).toLocaleString("es-CO")}
                  </td>
                  <td style={{ color: p.margen >= 20 ? "#00D4A0" : "#F5A623",
                    fontWeight: "600", fontSize: "12px" }}>
                    {p.margen}%
                  </td>
                  <td>
                    <span style={{ background: s.bg, color: s.color,
                      padding: "3px 10px", borderRadius: "20px",
                      fontSize: "11px", fontWeight: "600" }}>
                      {s.icon} {s.label}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => { setProductoEditar(p); setShowForm(true) }}
                        className="btn btn-secondary"
                        style={{ padding: "4px 10px", fontSize: "12px" }}>✏️</button>
                      <button onClick={() => setConfirmDel(p)} className="btn btn-danger"
                        style={{ padding: "4px 10px", fontSize: "12px" }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
