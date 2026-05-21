import { useState, useEffect } from "react"
import API from "../services/api"

const CATEGORIAS = [
  { value: "nomina",       label: "Nómina",            color: "#8B5CF6" },
  { value: "arriendo",     label: "Arriendo",           color: "#EF4444" },
  { value: "servicios",    label: "Servicios públicos", color: "#F59E0B" },
  { value: "repuestos",    label: "Repuestos",          color: "#3B82F6" },
  { value: "herramientas", label: "Herramientas",       color: "#10B981" },
  { value: "marketing",    label: "Marketing",          color: "#EC4899" },
  { value: "otros",        label: "Otros",              color: "#6B7280" },
]

const catMap = Object.fromEntries(CATEGORIAS.map(c => [c.value, c]))

export default function Gastos() {
  const [gastos, setGastos]     = useState([])
  const [modal, setModal]       = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [mensaje, setMensaje]   = useState("")
  const [form, setForm]         = useState({
    descripcion: "", categoria: "otros",
    monto: "", fecha: new Date().toISOString().split("T")[0],
    comprobante: "", observaciones: ""
  })
  const [editId, setEditId]     = useState(null)
  const [filtro, setFiltro]     = useState("")

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      const res = await API.get("/gastos/")
      setGastos(res.data.results || res.data)
    } catch { setError("Error al cargar gastos") }
  }

  const mostrarMensaje = (msg) => {
    setMensaje(msg)
    setTimeout(() => setMensaje(""), 3000)
  }

  const abrirNuevo = () => {
    setForm({ descripcion: "", categoria: "otros",
      monto: "", fecha: new Date().toISOString().split("T")[0],
      comprobante: "", observaciones: "" })
    setEditId(null)
    setModal(true)
  }

  const abrirEditar = (g) => {
    setForm({
      descripcion: g.descripcion, categoria: g.categoria,
      monto: g.monto, fecha: g.fecha,
      comprobante: g.comprobante || "", observaciones: g.observaciones || ""
    })
    setEditId(g.id)
    setModal(true)
  }

  const guardar = async () => {
    if (!form.descripcion || !form.monto) {
      mostrarMensaje("❌ Descripción y monto son obligatorios")
      return
    }
    setLoading(true)
    try {
      if (editId) {
        await API.put(`/gastos/${editId}/`, form)
        mostrarMensaje("✅ Gasto actualizado")
      } else {
        await API.post("/gastos/", form)
        mostrarMensaje("✅ Gasto registrado")
      }
      setModal(false)
      cargar()
    } catch { mostrarMensaje("❌ Error al guardar") }
    setLoading(false)
  }

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este gasto?")) return
    try {
      await API.delete(`/gastos/${id}/`)
      mostrarMensaje("✅ Gasto eliminado")
      cargar()
    } catch { mostrarMensaje("❌ Error al eliminar") }
  }

  const gastosFiltrados = gastos.filter(g =>
    !filtro || g.categoria === filtro
  )

  const totalFiltrado = gastosFiltrados.reduce((s, g) => s + parseFloat(g.monto || 0), 0)

  const totalPorCategoria = CATEGORIAS.map(c => ({
    ...c,
    total: gastos.filter(g => g.categoria === c.value)
      .reduce((s, g) => s + parseFloat(g.monto || 0), 0)
  })).filter(c => c.total > 0)

  return (
    <div>
      {mensaje && (
        <div style={{
          position: "fixed", top: "1rem", right: "1rem", zIndex: 9999,
          background: mensaje.startsWith("✅") ? "#065F46" : "#3B0A0A",
          border: `1px solid ${mensaje.startsWith("✅") ? "#10B981" : "#EF4444"}`,
          color: "white", borderRadius: "8px", padding: "12px 20px", fontSize: "13px"
        }}>{mensaje}</div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700",
            color: "var(--text)", marginBottom: "4px" }}>Gastos</h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>
            {gastos.length} gastos · Total: ${gastos.reduce((s,g) =>
              s + parseFloat(g.monto||0), 0).toLocaleString("es-CO")}
          </p>
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>
          + Registrar gasto
        </button>
      </div>

      {error && (
        <div style={{ background: "#3B0A0A", border: "1px solid #EF4444",
          borderRadius: "8px", padding: "12px 16px", marginBottom: "1rem",
          color: "#FCA5A5", fontSize: "13px" }}>{error}</div>
      )}

      {/* Resumen por categoría */}
      {totalPorCategoria.length > 0 && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {totalPorCategoria.map(c => (
            <button key={c.value} onClick={() => setFiltro(filtro === c.value ? "" : c.value)}
              style={{
                padding: "6px 12px", borderRadius: "20px", border: "none",
                cursor: "pointer", fontSize: "12px", fontWeight: "600",
                background: filtro === c.value ? c.color : c.color + "22",
                color: filtro === c.value ? "white" : c.color,
                transition: "all 0.15s"
              }}>
              {c.label} · ${c.total.toLocaleString("es-CO")}
            </button>
          ))}
          {filtro && (
            <button onClick={() => setFiltro("")} style={{
              padding: "6px 12px", borderRadius: "20px",
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--text3)", fontSize: "12px", cursor: "pointer"
            }}>✕ Limpiar filtro</button>
          )}
        </div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Fecha</th><th>Descripción</th><th>Categoría</th>
              <th>Comprobante</th><th>Monto</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gastosFiltrados.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "3rem",
                textAlign: "center", color: "var(--text3)" }}>
                No hay gastos registrados
              </td></tr>
            ) : gastosFiltrados.map(g => {
              const cat = catMap[g.categoria] || catMap.otros
              return (
                <tr key={g.id}>
                  <td style={{ fontSize: "12px", color: "var(--text3)" }}>
                    {new Date(g.fecha + "T00:00:00").toLocaleDateString("es-CO")}
                  </td>
                  <td style={{ color: "var(--text)", fontWeight: "500" }}>
                    {g.descripcion}
                    {g.observaciones && (
                      <div style={{ fontSize: "11px", color: "var(--text3)",
                        marginTop: "2px" }}>{g.observaciones}</div>
                    )}
                  </td>
                  <td>
                    <span style={{
                      background: cat.color + "22", color: cat.color,
                      padding: "3px 10px", borderRadius: "20px",
                      fontSize: "11px", fontWeight: "600"
                    }}>{cat.label}</span>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text3)" }}>
                    {g.comprobante || "—"}
                  </td>
                  <td style={{ color: "#EF4444", fontWeight: "700", fontSize: "14px" }}>
                    -${parseFloat(g.monto).toLocaleString("es-CO")}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => abrirEditar(g)} style={{
                        background: "#1E3A5F", border: "1px solid #3B82F6",
                        color: "#3B82F6", borderRadius: "6px",
                        padding: "4px 10px", fontSize: "12px", cursor: "pointer"
                      }}>✏️</button>
                      <button onClick={() => eliminar(g.id)} style={{
                        background: "#3B0A0A", border: "1px solid #EF4444",
                        color: "#EF4444", borderRadius: "6px",
                        padding: "4px 10px", fontSize: "12px", cursor: "pointer"
                      }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtro && (
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)",
            display: "flex", justifyContent: "flex-end" }}>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)" }}>
              Total filtrado: <span style={{ color: "#EF4444" }}>
                -${totalFiltrado.toLocaleString("es-CO")}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "1.5rem",
            width: "100%", maxWidth: "480px" }}>
            <h2 style={{ marginBottom: "1.5rem", color: "var(--text)", fontSize: "18px" }}>
              {editId ? "Editar gasto" : "Registrar gasto"}
            </h2>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                Descripción *
              </label>
              <input value={form.descripcion}
                onChange={e => setForm({...form, descripcion: e.target.value})}
                placeholder="Ej: Arriendo local noviembre" style={{ width: "100%" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem",
              marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                  color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                  Categoría
                </label>
                <select value={form.categoria}
                  onChange={e => setForm({...form, categoria: e.target.value})}
                  style={{ width: "100%" }}>
                  {CATEGORIAS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                  color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                  Monto ($) *
                </label>
                <input type="number" value={form.monto}
                  onChange={e => setForm({...form, monto: e.target.value})}
                  placeholder="0" style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                  color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                  Fecha
                </label>
                <input type="date" value={form.fecha}
                  onChange={e => setForm({...form, fecha: e.target.value})}
                  style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                  color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                  Comprobante
                </label>
                <input value={form.comprobante}
                  onChange={e => setForm({...form, comprobante: e.target.value})}
                  placeholder="Nº factura o recibo" style={{ width: "100%" }} />
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                Observaciones
              </label>
              <textarea value={form.observaciones}
                onChange={e => setForm({...form, observaciones: e.target.value})}
                rows={2} style={{ width: "100%", resize: "vertical" }} />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-primary" onClick={guardar}
                disabled={loading} style={{ flex: 1 }}>
                {loading ? "Guardando..." : editId ? "Guardar cambios" : "Registrar gasto"}
              </button>
              <button className="btn btn-secondary" onClick={() => setModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
