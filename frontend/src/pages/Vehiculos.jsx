import { useState, useEffect } from "react"
import { vehiculosAPI, clientesAPI } from "../services/api"
import { PageHeader, Toast, ConfirmModal, EmptyState, KPICard,
         SearchBar, TableSkeleton, ModalForm, Field } from "../components/UI"

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([])
  const [clientes, setClientes]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [buscar, setBuscar]       = useState("")
  const [modal, setModal]         = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)
  const [mensaje, setMensaje]     = useState("")
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    cliente:"", placa:"", marca:"", linea:"", modelo:"",
    cilindraje:"", color:"", kilometraje:0, tipo:"moto"
  })

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const [v, c] = await Promise.all([vehiculosAPI.listar(), clientesAPI.listar()])
      setVehiculos(v.data.results || v.data)
      setClientes(c.data.results || c.data)
    } catch { mostrar("❌ Error al cargar") }
    setLoading(false)
  }

  const mostrar = (msg) => { setMensaje(msg); setTimeout(() => setMensaje(""), 3000) }

  const abrirModal = (v = null) => {
    setForm(v ? { ...v, cliente: v.cliente } : {
      cliente:"", placa:"", marca:"", linea:"", modelo: new Date().getFullYear(),
      cilindraje:"", color:"", kilometraje:0, tipo:"moto"
    })
    setModal(v || {})
  }

  const guardar = async () => {
    if (!form.cliente || !form.placa || !form.marca || !form.linea) {
      mostrar("❌ Cliente, placa, marca y línea son obligatorios")
      return
    }
    setGuardando(true)
    try {
      if (modal?.id) await vehiculosAPI.editar(modal.id, form)
      else await vehiculosAPI.crear(form)
      mostrar("✅ Vehículo guardado")
      setModal(null)
      cargar()
    } catch(e) {
      mostrar("❌ " + (e.response?.data?.placa?.[0] || "Error al guardar"))
    }
    setGuardando(false)
  }

  const eliminar = async () => {
    try {
      await vehiculosAPI.eliminar(confirmDel.id)
      mostrar("✅ Vehículo eliminado")
      setConfirmDel(null)
      cargar()
    } catch { mostrar("❌ No se puede eliminar — tiene órdenes asociadas") }
  }

  const TIPO_ICON = { moto: "🏍", carro: "🚗", bicicleta: "⚡" }

  const filtrados = vehiculos.filter(v =>
    v.placa?.toLowerCase().includes(buscar.toLowerCase()) ||
    v.marca?.toLowerCase().includes(buscar.toLowerCase()) ||
    v.linea?.toLowerCase().includes(buscar.toLowerCase())
  )

  const marcas = [...new Set(vehiculos.map(v => v.marca))].filter(Boolean)

  return (
    <div>
      <Toast mensaje={mensaje} />

      {confirmDel && (
        <ConfirmModal titulo="¿Eliminar vehículo?"
          texto={<>Se eliminará <strong style={{ color: "var(--text)" }}>{confirmDel.placa}</strong> permanentemente.</>}
          onConfirm={eliminar} onCancel={() => setConfirmDel(null)} />
      )}

      {modal !== null && (
        <ModalForm titulo={modal?.id ? "Editar vehículo" : "Nuevo vehículo"}
          onClose={() => setModal(null)} onGuardar={guardar} loading={guardando}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Cliente *" style={{ gridColumn: "1/-1" }}>
              <select value={form.cliente} onChange={e => setForm({...form, cliente: e.target.value})}>
                <option value="">Seleccionar cliente...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} — {c.documento}</option>)}
              </select>
            </Field>
            <Field label="Placa *">
              <input value={form.placa} onChange={e => setForm({...form, placa: e.target.value.toUpperCase()})}
                placeholder="NHX14G" />
            </Field>
            <Field label="Tipo">
              <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                <option value="moto">🏍 Motocicleta</option>
                <option value="carro">🚗 Automóvil</option>
                <option value="bicicleta">⚡ Bicicleta Eléctrica</option>
              </select>
            </Field>
            <Field label="Marca *">
              <input value={form.marca} onChange={e => setForm({...form, marca: e.target.value})}
                placeholder="Bajaj, Honda, Yamaha..." list="marcas-list" />
              <datalist id="marcas-list">
                {marcas.map(m => <option key={m} value={m} />)}
              </datalist>
            </Field>
            <Field label="Línea / Modelo *">
              <input value={form.linea} onChange={e => setForm({...form, linea: e.target.value})}
                placeholder="Pulsar NS200" />
            </Field>
            <Field label="Año">
              <input type="number" value={form.modelo}
                onChange={e => setForm({...form, modelo: e.target.value})}
                placeholder={new Date().getFullYear()} />
            </Field>
            <Field label="Cilindraje (cc)">
              <input type="number" value={form.cilindraje}
                onChange={e => setForm({...form, cilindraje: e.target.value})}
                placeholder="200" />
            </Field>
            <Field label="Color">
              <input value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                placeholder="Negro" />
            </Field>
            <Field label="Kilometraje">
              <input type="number" value={form.kilometraje}
                onChange={e => setForm({...form, kilometraje: e.target.value})}
                placeholder="15000" />
            </Field>
          </div>
        </ModalForm>
      )}

      <PageHeader titulo="Vehículos" sub={`${vehiculos.length} vehículos registrados`}>
        <button className="btn btn-primary" onClick={() => abrirModal()}>+ Nuevo vehículo</button>
      </PageHeader>

      <div className="stagger" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <KPICard titulo="Total" valor={vehiculos.length} color="#E8213A" icon="🚗" delay={0} />
        <KPICard titulo="Motos" valor={vehiculos.filter(v=>v.tipo==="moto").length} color="#1E5FD4" icon="🏍" delay={.04} />
        <KPICard titulo="Carros" valor={vehiculos.filter(v=>v.tipo==="carro").length} color="#F5A623" icon="🚗" delay={.08} />
        <KPICard titulo="Marcas" valor={marcas.length} color="#00D4A0" icon="🏷️" delay={.12} />
      </div>

      <div className="card fade-in">
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
          <SearchBar value={buscar} onChange={setBuscar} placeholder="Buscar por placa, marca o línea..." />
          <span style={{ fontSize: "12px", color: "var(--text3)" }}>{filtrados.length} resultados</span>
        </div>
        <table>
          <thead>
            <tr><th>Placa</th><th>Tipo</th><th>Marca / Línea</th><th>Año</th>
              <th>Cilindraje</th><th>Kilometraje</th><th>Color</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {loading ? <TableSkeleton rows={5} cols={8} /> :
             filtrados.length === 0 ? (
              <tr><td colSpan="8">
                <EmptyState icon="🏍" titulo="No hay vehículos"
                  sub="Registra el primer vehículo"
                  action={<button className="btn btn-primary" onClick={() => abrirModal()}>+ Nuevo vehículo</button>} />
              </td></tr>
            ) : filtrados.map(v => (
              <tr key={v.id} className="fade-in">
                <td style={{ fontFamily: "var(--font-mono)", fontWeight: "700",
                  color: "#E8213A", fontSize: "13px" }}>{v.placa}</td>
                <td style={{ fontSize: "16px" }}>{TIPO_ICON[v.tipo] || "🚗"}</td>
                <td>
                  <div style={{ fontWeight: "600", color: "var(--text)" }}>{v.marca}</div>
                  <div style={{ fontSize: "11px", color: "var(--text3)" }}>{v.linea}</div>
                </td>
                <td style={{ color: "var(--text2)" }}>{v.modelo}</td>
                <td style={{ color: "var(--text3)", fontSize: "12px" }}>
                  {v.cilindraje ? `${v.cilindraje}cc` : "—"}
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                  {v.kilometraje ? `${Number(v.kilometraje).toLocaleString()} km` : "—"}
                </td>
                <td style={{ color: "var(--text3)" }}>{v.color || "—"}</td>
                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => abrirModal(v)} className="btn btn-secondary"
                      style={{ padding: "4px 10px", fontSize: "12px" }}>✏️</button>
                    <button onClick={() => setConfirmDel(v)} className="btn btn-danger"
                      style={{ padding: "4px 10px", fontSize: "12px" }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
