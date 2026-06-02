import { useState, useEffect } from "react"
import API from "../services/api"
import { PageHeader, Toast, ConfirmModal, EmptyState, KPICard,
         SearchBar, TableSkeleton, ModalForm, Field } from "../components/UI"

const CATEGORIAS = {
  nomina:       { label: "Nómina",           color: "#1E5FD4", icon: "👥" },
  arriendo:     { label: "Arriendo",         color: "#E8213A", icon: "🏠" },
  servicios:    { label: "Servicios",        color: "#F5A623", icon: "💡" },
  repuestos:    { label: "Repuestos",        color: "#00D4A0", icon: "🔩" },
  herramientas: { label: "Herramientas",     color: "#8B5CF6", icon: "🔧" },
  marketing:    { label: "Marketing",        color: "#06C4E0", icon: "📣" },
  otros:        { label: "Otros",            color: "#4A5A72", icon: "📦" },
}

export default function Gastos() {
  const [gastos, setGastos]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [buscar, setBuscar]       = useState("")
  const [filtroCat, setFiltroCat] = useState("")
  const [modal, setModal]         = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [mensaje, setMensaje]     = useState("")
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    descripcion:"", categoria:"otros", monto:"",
    fecha: new Date().toISOString().split("T")[0], comprobante:"", observaciones:""
  })

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const r = await API.get("/gastos/")
      setGastos(r.data.results || r.data)
    } catch { mostrar("❌ Error al cargar gastos") }
    setLoading(false)
  }

  const mostrar = (msg) => { setMensaje(msg); setTimeout(() => setMensaje(""), 3000) }

  const abrirModal = (g = null) => {
    setForm(g ? { ...g } : {
      descripcion:"", categoria:"otros", monto:"",
      fecha: new Date().toISOString().split("T")[0],
      comprobante:"", observaciones:""
    })
    setModal(g || {})
  }

  const guardar = async () => {
    if (!form.descripcion || !form.monto || !form.fecha) {
      mostrar("❌ Descripción, monto y fecha son obligatorios")
      return
    }
    setGuardando(true)
    try {
      if (modal?.id) await API.put(`/gastos/${modal.id}/`, form)
      else await API.post("/gastos/", form)
      mostrar("✅ Gasto guardado")
      setModal(null)
      cargar()
    } catch { mostrar("❌ Error al guardar") }
    setGuardando(false)
  }

  const eliminar = async () => {
    try {
      await API.delete(`/gastos/${confirmDel.id}/`)
      mostrar("✅ Gasto eliminado")
      setConfirmDel(null)
      cargar()
    } catch { mostrar("❌ Error al eliminar") }
  }

  const filtrados = gastos.filter(g => {
    const matchBuscar = !buscar ||
      g.descripcion?.toLowerCase().includes(buscar.toLowerCase()) ||
      g.comprobante?.includes(buscar)
    const matchCat = !filtroCat || g.categoria === filtroCat
    return matchBuscar && matchCat
  })

  const totalMes = gastos.filter(g => {
    const fecha = new Date(g.fecha)
    const hoy = new Date()
    return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear()
  }).reduce((s, g) => s + parseFloat(g.monto || 0), 0)

  const totalGeneral = gastos.reduce((s, g) => s + parseFloat(g.monto || 0), 0)

  const porCategoria = Object.keys(CATEGORIAS).reduce((acc, cat) => {
    acc[cat] = gastos.filter(g => g.categoria === cat)
      .reduce((s, g) => s + parseFloat(g.monto || 0), 0)
    return acc
  }, {})

  return (
    <div>
      <Toast mensaje={mensaje} />

      {confirmDel && (
        <ConfirmModal titulo="¿Eliminar gasto?"
          texto={<>Se eliminará <strong style={{ color: "var(--text)" }}>{confirmDel.descripcion}</strong> por ${Number(confirmDel.monto).toLocaleString("es-CO")}.</>}
          onConfirm={eliminar} onCancel={() => setConfirmDel(null)} />
      )}

      {modal !== null && (
        <ModalForm titulo={modal?.id ? "Editar gasto" : "Nuevo gasto"}
          onClose={() => setModal(null)} onGuardar={guardar} loading={guardando}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Descripción *" style={{ gridColumn: "1/-1" }}>
              <input value={form.descripcion}
                onChange={e => setForm({...form, descripcion: e.target.value})}
                placeholder="Ej: Pago arriendo local" />
            </Field>
            <Field label="Categoría">
              <select value={form.categoria}
                onChange={e => setForm({...form, categoria: e.target.value})}>
                {Object.entries(CATEGORIAS).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Monto ($) *">
              <input type="number" value={form.monto}
                onChange={e => setForm({...form, monto: e.target.value})}
                placeholder="150000" />
            </Field>
            <Field label="Fecha *">
              <input type="date" value={form.fecha}
                onChange={e => setForm({...form, fecha: e.target.value})} />
            </Field>
            <Field label="Comprobante">
              <input value={form.comprobante}
                onChange={e => setForm({...form, comprobante: e.target.value})}
                placeholder="Nro. factura o recibo" />
            </Field>
            <Field label="Observaciones" style={{ gridColumn: "1/-1" }}>
              <textarea value={form.observaciones}
                onChange={e => setForm({...form, observaciones: e.target.value})}
                placeholder="Notas adicionales..." style={{ minHeight: "60px" }} />
            </Field>
          </div>
        </ModalForm>
      )}

      <PageHeader titulo="Gastos" sub={`${gastos.length} gastos registrados`}>
        <button className="btn btn-primary" onClick={() => abrirModal()}>+ Nuevo gasto</button>
      </PageHeader>

      {/* KPIs */}
      <div className="stagger" style={{ display: "flex", gap: "1rem",
        flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <KPICard titulo="Total general"
          valor={`$${Number(totalGeneral).toLocaleString("es-CO")}`}
          color="#E8213A" icon="📤" delay={0} />
        <KPICard titulo="Este mes"
          valor={`$${Number(totalMes).toLocaleString("es-CO")}`}
          color="#F5A623" icon="📅" delay={.04} />
        <KPICard titulo="Registros" valor={gastos.length}
          color="#1E5FD4" icon="📋" delay={.08} />
        <KPICard titulo="Categorías"
          valor={Object.values(porCategoria).filter(v => v > 0).length}
          color="#8B5CF6" icon="🏷️" delay={.12} />
      </div>

      {/* Categorías */}
      <div className="fade-in" style={{ display: "flex", gap: "6px",
        flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <button onClick={() => setFiltroCat("")} style={{
          padding: "5px 14px", borderRadius: "20px", border: "none",
          fontSize: "12px", fontWeight: "500", cursor: "pointer",
          background: !filtroCat ? "var(--red)" : "var(--bg3)",
          color: !filtroCat ? "white" : "var(--text3)",
          transition: "all .15s",
        }}>Todos ({gastos.length})</button>
        {Object.entries(CATEGORIAS).map(([k, v]) => {
          const count = gastos.filter(g => g.categoria === k).length
          if (count === 0) return null
          return (
            <button key={k} onClick={() => setFiltroCat(filtroCat === k ? "" : k)} style={{
              padding: "5px 14px", borderRadius: "20px", border: "none",
              fontSize: "12px", fontWeight: "500", cursor: "pointer",
              background: filtroCat === k ? v.color + "25" : "var(--bg3)",
              color: filtroCat === k ? v.color : "var(--text3)",
              transition: "all .15s",
            }}>{v.icon} {v.label} ({count})</button>
          )
        })}
      </div>

      <div className="card fade-in">
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "8px" }}>
          <SearchBar value={buscar} onChange={setBuscar}
            placeholder="Buscar por descripción..." />
          <span style={{ fontSize: "12px", color: "var(--text3)" }}>
            {filtrados.length} resultados
          </span>
        </div>
        <table>
          <thead>
            <tr><th>Descripción</th><th>Categoría</th><th>Monto</th>
              <th>Fecha</th><th>Comprobante</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {loading ? <TableSkeleton rows={5} cols={6} /> :
             filtrados.length === 0 ? (
              <tr><td colSpan="6">
                <EmptyState icon="💸" titulo="Sin gastos registrados"
                  sub="Registra el primer gasto del taller"
                  action={<button className="btn btn-primary"
                    onClick={() => abrirModal()}>+ Nuevo gasto</button>} />
              </td></tr>
            ) : filtrados.map(g => {
              const cat = CATEGORIAS[g.categoria] || CATEGORIAS.otros
              return (
                <tr key={g.id} className="fade-in">
                  <td style={{ fontWeight: "500", color: "var(--text)" }}>{g.descripcion}</td>
                  <td>
                    <span style={{ background: cat.color + "15", color: cat.color,
                      padding: "3px 10px", borderRadius: "20px",
                      fontSize: "11px", fontWeight: "600" }}>
                      {cat.icon} {cat.label}
                    </span>
                  </td>
                  <td style={{ color: "#E8213A", fontWeight: "700",
                    fontFamily: "var(--font-mono)" }}>
                    ${Number(g.monto).toLocaleString("es-CO")}
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text3)" }}>{g.fecha}</td>
                  <td style={{ fontSize: "12px", color: "var(--text3)",
                    fontFamily: "var(--font-mono)" }}>{g.comprobante || "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => abrirModal(g)} className="btn btn-secondary"
                        style={{ padding: "4px 10px", fontSize: "12px" }}>✏️</button>
                      <button onClick={() => setConfirmDel(g)} className="btn btn-danger"
                        style={{ padding: "4px 10px", fontSize: "12px" }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtrados.length > 0 && (
          <div style={{ padding: "12px 1.25rem", borderTop: "1px solid var(--border)",
            display: "flex", justifyContent: "flex-end", gap: "1.5rem" }}>
            <span style={{ fontSize: "12px", color: "var(--text3)" }}>
              Total filtrado:
            </span>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#E8213A",
              fontFamily: "var(--font-mono)" }}>
              ${filtrados.reduce((s, g) => s + parseFloat(g.monto || 0), 0).toLocaleString("es-CO")}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
