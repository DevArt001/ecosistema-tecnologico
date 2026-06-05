import { useState, useEffect } from "react"
import { clientesAPI } from "../services/api"
import { PageHeader, Toast, ConfirmModal, EmptyState, KPICard,
         SearchBar, TableSkeleton, ModalForm, Field } from "../components/UI"

export default function Clientes() {
  const [clientes, setClientes]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [buscar, setBuscar]       = useState("")
  const [modal, setModal]         = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [mensaje, setMensaje]     = useState("")
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    nombre:"", documento:"", telefono:"", whatsapp:"",
    correo:"", ciudad:"", tipo:"regular", observaciones:""
  })

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const r = await clientesAPI.listar()
      setClientes(r.data.results || r.data)
    } catch { mostrar("❌ Error al cargar clientes") }
    setLoading(false)
  }

  const mostrar = (msg) => { setMensaje(msg); setTimeout(() => setMensaje(""), 3000) }

  const abrirModal = (c = null) => {
    setForm(c ? { ...c } : {
      nombre:"", documento:"", telefono:"", whatsapp:"",
      correo:"", ciudad:"", tipo:"regular", observaciones:""
    })
    setModal(c || {})
  }

  const guardar = async () => {
    if (!form.nombre || !form.documento || !form.telefono) {
      mostrar("❌ Nombre, documento y teléfono son obligatorios")
      return
    }
    setGuardando(true)
    try {
      if (modal?.id) await clientesAPI.editar(modal.id, form)
      else await clientesAPI.crear(form)
      mostrar("✅ Cliente guardado")
      setModal(null)
      cargar()
    } catch(e) {
      mostrar("❌ " + (e.response?.data?.documento?.[0] || "Error al guardar"))
    }
    setGuardando(false)
  }

  const eliminar = async () => {
    try {
      await clientesAPI.eliminar(confirmDel.id)
      mostrar("✅ Cliente eliminado")
      setConfirmDel(null)
      cargar()
    } catch { mostrar("❌ No se puede eliminar — tiene órdenes asociadas") }
  }

  const TIPO_COLOR = {
    regular:   { color: "#4A5A72", label: "Regular" },
    frecuente: { color: "#1E5FD4", label: "Frecuente" },
    premium:   { color: "#F5A623", label: "Premium" },
    inactivo:  { color: "var(--text3)", label: "Inactivo" },
  }

  const filtrados = clientes.filter(c =>
    c.nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
    c.documento?.includes(buscar) ||
    c.telefono?.includes(buscar)
  )

  return (
    <div>
      <Toast mensaje={mensaje} />

      {confirmDel && (
        <ConfirmModal
          titulo="¿Eliminar cliente?"
          texto={<>Se eliminará a <strong style={{ color: "var(--text)" }}>{confirmDel.nombre}</strong> permanentemente. Esta acción no se puede deshacer.</>}
          onConfirm={eliminar}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      {modal !== null && (
        <ModalForm titulo={modal?.id ? "Editar cliente" : "Nuevo cliente"}
          onClose={() => setModal(null)} onGuardar={guardar} loading={guardando}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Nombre completo *" style={{ gridColumn: "1/-1" }}>
              <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
                placeholder="Ej: Felipe Rodríguez" />
            </Field>
            <Field label="Cédula / NIT *">
              <input value={form.documento} onChange={e => setForm({...form, documento: e.target.value})}
                placeholder="1000594748" />
            </Field>
            <Field label="Teléfono *">
              <input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})}
                placeholder="3001234567" />
            </Field>
            <Field label="WhatsApp">
              <input value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})}
                placeholder="3001234567" />
            </Field>
            <Field label="Correo">
              <input value={form.correo} onChange={e => setForm({...form, correo: e.target.value})}
                placeholder="correo@ejemplo.com" />
            </Field>
            <Field label="Ciudad">
              <input value={form.ciudad} onChange={e => setForm({...form, ciudad: e.target.value})}
                placeholder="Bogotá" />
            </Field>
            <Field label="Tipo de cliente" style={{ gridColumn: "1/-1" }}>
              <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                <option value="regular">Regular</option>
                <option value="frecuente">Frecuente</option>
                <option value="premium">Premium</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </Field>
            <Field label="Observaciones" style={{ gridColumn: "1/-1" }}>
              <textarea value={form.observaciones}
                onChange={e => setForm({...form, observaciones: e.target.value})}
                placeholder="Notas internas..." style={{ minHeight: "70px" }} />
            </Field>
          </div>
        </ModalForm>
      )}

      <PageHeader titulo="Clientes"
        sub={`${clientes.length} clientes registrados`}>
        <button className="btn btn-primary" onClick={() => abrirModal()}>
          + Nuevo cliente
        </button>
      </PageHeader>

      {/* KPIs */}
      <div className="stagger" style={{ display: "flex", gap: "1rem",
        flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <KPICard titulo="Total" valor={clientes.length}
          color="#1E5FD4" icon="👤" delay={0} />
        <KPICard titulo="Frecuentes" valor={clientes.filter(c=>c.tipo==="frecuente").length}
          color="#F5A623" icon="⭐" delay={.04} />
        <KPICard titulo="Premium" valor={clientes.filter(c=>c.tipo==="premium").length}
          color="#E8213A" icon="💎" delay={.08} />
        <KPICard titulo="Con puntos" valor={clientes.filter(c=>c.puntos>0).length}
          color="#00D4A0" icon="🏆" delay={.12} />
      </div>

      <div className="card fade-in">
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "8px" }}>
          <SearchBar value={buscar} onChange={setBuscar}
            placeholder="Buscar por nombre, documento o teléfono..." width="320px" />
          <span style={{ fontSize: "12px", color: "var(--text3)" }}>
            {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Nombre</th><th>Documento</th><th>Teléfono</th>
              <th>Ciudad</th><th>Tipo</th><th>Puntos</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <TableSkeleton rows={5} cols={7} /> :
             filtrados.length === 0 ? (
              <tr><td colSpan="7">
                <EmptyState icon="👤"
                  titulo={buscar ? "Sin resultados" : "No hay clientes"}
                  sub={buscar ? `No encontramos "${buscar}"` : "Crea el primer cliente"}
                  action={!buscar && (
                    <button className="btn btn-primary" onClick={() => abrirModal()}>
                      + Nuevo cliente
                    </button>
                  )} />
              </td></tr>
            ) : filtrados.map(c => {
              const t = TIPO_COLOR[c.tipo] || TIPO_COLOR.regular
              return (
                <tr key={c.id} className="fade-in">
                  <td style={{ fontWeight: "600", color: "var(--text)" }}>{c.nombre}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{c.documento}</td>
                  <td>{c.telefono}</td>
                  <td style={{ color: "var(--text3)" }}>{c.ciudad || "—"}</td>
                  <td>
                    <span style={{ background: t.color + "18", color: t.color,
                      padding: "3px 10px", borderRadius: "20px",
                      fontSize: "11px", fontWeight: "600" }}>{t.label}</span>
                  </td>
                  <td>
                    {c.puntos > 0 ? (
                      <span style={{ color: "#F5A623", fontWeight: "600",
                        fontSize: "12px" }}>⭐ {c.puntos}</span>
                    ) : <span style={{ color: "var(--text3)" }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => abrirModal(c)}
                        className="btn btn-secondary"
                        style={{ padding: "4px 10px", fontSize: "12px" }}>✏️</button>
                      <button onClick={() => setConfirmDel(c)}
                        className="btn btn-danger"
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
