import { useState, useEffect } from "react"
import API from "../services/api"
import { PageHeader, Toast, KPICard, EmptyState, Tabs } from "../components/UI"

export default function Nomina() {
  const [resumen, setResumen]         = useState(null)
  const [empleados, setEmpleados]     = useState([])
  const [pagos, setPagos]             = useState([])
  const [nominas, setNominas]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [tab, setTab]                 = useState("resumen")
  const [mensaje, setMensaje]         = useState("")
  const [modalEmpleado, setModalEmpleado] = useState(null)
  const [modalPago, setModalPago]     = useState(null)
  const [modalNomina, setModalNomina] = useState(null)
  const [formEmpleado, setFormEmpleado] = useState({
    nombre: "", documento: "", telefono: "", correo: "",
    cargo: "", tipo: "tecnico", tipo_pago: "servicio",
    salario_base: 0, porcentaje_mano_obra: 50, activo: true,
    aplica_comision: false, porcentaje_comision: 10
  })
  const [formPago, setFormPago] = useState({
    empleado: "", descripcion: "", monto_orden: 0, porcentaje: 50, notas: "", aplica_comision: false
  })
  const [formNomina, setFormNomina] = useState({
    empleado: "", inicio: "", fin: "", deducciones: 0
  })

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const [res, emps, pags, noms] = await Promise.all([
        API.get("/nomina/resumen/"),
        API.get("/empleados/"),
        API.get("/pagos-servicio/"),
        API.get("/pagos-nomina/"),
      ])
      setResumen(res.data)
      setEmpleados(emps.data.results || emps.data)
      setPagos(pags.data.results || pags.data)
      setNominas(noms.data.results || noms.data)
    } catch(e) { mostrarMensaje("❌ Error al cargar") }
    setLoading(false)
  }

  const mostrarMensaje = (msg) => {
    setMensaje(msg)
    setTimeout(() => setMensaje(""), 3000)
  }

  const guardarEmpleado = async () => {
    try {
      if (modalEmpleado?.id) {
        await API.put(`/empleados/${modalEmpleado.id}/`, formEmpleado)
      } else {
        await API.post("/empleados/", formEmpleado)
      }
      mostrarMensaje("✅ Empleado guardado")
      setModalEmpleado(null)
      cargar()
    } catch(e) { mostrarMensaje("❌ Error: " + (e.response?.data ? JSON.stringify(e.response.data) : e.message)) }
  }

  const guardarPago = async () => {
    try {
      const emp = empleados.find(e => e.id == formPago.empleado)
      const montoComision = formPago.aplica_comision ? formPago.monto_orden * (emp?.porcentaje_comision || 10) / 100 : 0
      await API.post("/pagos-servicio/", {
        ...formPago,
        monto_pago: (formPago.monto_orden * formPago.porcentaje / 100).toFixed(0),
        monto_comision: montoComision.toFixed(0),
        monto_total: (formPago.monto_orden * formPago.porcentaje / 100 + montoComision).toFixed(0)
      })
      mostrarMensaje("✅ Pago registrado")
      setModalPago(false)
      cargar()
    } catch(e) { mostrarMensaje("❌ Error al registrar pago") }
  }

  const marcarPagado = async (id, tipo) => {
    try {
      if (tipo === 'servicio') await API.post(`/pagos-servicio/${id}/marcar_pagado/`)
      else await API.post(`/pagos-nomina/${id}/marcar_pagado/`)
      mostrarMensaje("✅ Marcado como pagado")
      cargar()
    } catch { mostrarMensaje("❌ Error") }
  }

  const generarNomina = async () => {
    try {
      await API.post(`/empleados/${formNomina.empleado}/generar_nomina/`, {
        inicio: formNomina.inicio,
        fin: formNomina.fin,
        deducciones: formNomina.deducciones
      })
      mostrarMensaje("✅ Nómina generada")
      setModalNomina(false)
      cargar()
    } catch(e) { mostrarMensaje("❌ Error al generar nómina") }
  }

  const hoy = new Date().toISOString().split("T")[0]
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]

  return (
    <div>
      <Toast mensaje={mensaje} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text)", marginBottom: "4px" }}>
            Nómina y Personal
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>
            {resumen?.mes || "Mes actual"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => { setModalPago(true); setFormPago({ empleado: "", descripcion: "", monto_orden: 0, porcentaje: 50, notas: "" }) }}
            style={{ background: "#065F46", border: "1px solid #10B981", color: "#10B981",
              borderRadius: "8px", padding: "8px 14px", fontSize: "13px", cursor: "pointer" }}>
            + Registrar pago
          </button>
          <button onClick={() => { setModalNomina(true); setFormNomina({ empleado: "", inicio: inicioMes, fin: hoy, deducciones: 0 }) }}
            style={{ background: "#1E3A5F", border: "1px solid #3B82F6", color: "#3B82F6",
              borderRadius: "8px", padding: "8px 14px", fontSize: "13px", cursor: "pointer" }}>
            📋 Generar nómina
          </button>
          <button className="btn btn-primary" onClick={() => {
            setModalEmpleado({})
            setFormEmpleado({ nombre: "", documento: "", telefono: "", correo: "",
              cargo: "", tipo: "tecnico", tipo_pago: "servicio",
              salario_base: 0, porcentaje_mano_obra: 50, activo: true,
    aplica_comision: false, porcentaje_comision: 10 })
          }}>+ Empleado</button>
        </div>
      </div>

      {/* KPIs */}
      {resumen && (
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {[
            { titulo: "Total mes", valor: `$${Number(resumen.total_mes).toLocaleString("es-CO")}`, color: "#10B981", icon: "💰" },
            { titulo: "Pendiente pagar", valor: `$${Number(resumen.total_pendiente).toLocaleString("es-CO")}`, color: "#F59E0B", icon: "⏳" },
            { titulo: "Empleados activos", valor: resumen.empleados?.length || 0, color: "#3B82F6", icon: "👥" },
            { titulo: "Pagos del mes", valor: pagos.filter(p => p.estado === "pendiente").length, color: "#EF4444", icon: "📋" },
          ].map(k => (
            <div key={k.titulo} style={{
              flex: 1, minWidth: "150px", background: "var(--bg2)",
              border: `1px solid ${k.color}33`, borderRadius: "var(--radius-lg)",
              padding: "1.25rem", position: "relative", overflow: "hidden"
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: k.color }}/>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text3)", fontWeight: "600",
                    textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "8px" }}>
                    {k.titulo}
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: k.color }}>{k.valor}</div>
                </div>
                <div style={{ fontSize: "28px" }}>{k.icon}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
        {[
          { key: "resumen", label: "👥 Empleados" },
          { key: "pagos", label: `💳 Pagos por servicio (${pagos.filter(p=>p.estado==="pendiente").length} pendientes)` },
          { key: "nominas", label: "📋 Nóminas" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background: "none", border: "none", padding: "10px 16px",
            fontSize: "13px", fontWeight: tab === t.key ? "600" : "400",
            color: tab === t.key ? "#10B981" : "var(--text3)",
            borderBottom: tab === t.key ? "2px solid #10B981" : "2px solid transparent",
            cursor: "pointer", marginBottom: "-1px"
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>Cargando...</div>
      ) : (
        <>
          {/* Tab Empleados */}
          {tab === "resumen" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {resumen?.empleados?.map(e => (
                <div key={e.id} style={{
                  background: "var(--bg2)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)", padding: "1.25rem",
                  display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap"
                }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    background: "#10B98122", border: "2px solid #10B981",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "20px", flexShrink: 0
                  }}>👤</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "15px" }}>{e.nombre}</div>
                    <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
                      {e.cargo} · {e.tipo_pago === "servicio" ? "Pago por servicio" : "Salario fijo"}
                    </div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: "100px" }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "#10B981" }}>
                      ${Number(e.total_mes).toLocaleString("es-CO")}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text3)" }}>ganado este mes</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: "80px" }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "#F59E0B" }}>
                      ${Number(e.pendiente).toLocaleString("es-CO")}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text3)" }}>pendiente</div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: "60px" }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "#3B82F6" }}>{e.ordenes_mes}</div>
                    <div style={{ fontSize: "11px", color: "var(--text3)" }}>órdenes</div>
                  </div>
                  <button onClick={() => {
                    const emp = empleados.find(em => em.id === e.id)
                    setModalEmpleado(emp)
                    setFormEmpleado({ ...emp })
                  }} style={{ background: "#1F2937", border: "1px solid #374151",
                    color: "#D1D5DB", borderRadius: "8px", padding: "6px 12px",
                    fontSize: "12px", cursor: "pointer" }}>✏️ Editar</button>
                </div>
              ))}
              {(!resumen?.empleados || resumen.empleados.length === 0) && (
                <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
                  No hay empleados registrados. Crea el primero con "+ Empleado"
                </div>
              )}
            </div>
          )}

          {/* Tab Pagos */}
          {tab === "pagos" && (
            <div className="card">
              <table>
                <thead>
                  <tr>
                    <th>Empleado</th><th>Descripción</th><th>Monto orden</th>
                    <th>%</th><th>A pagar</th><th>Estado</th><th>Fecha</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: "600", color: "var(--text)" }}>{p.empleado_nombre}</td>
                      <td style={{ fontSize: "13px" }}>{p.descripcion}</td>
                      <td>${Number(p.monto_orden).toLocaleString("es-CO")}</td>
                      <td>{p.porcentaje}%</td>
                      <td style={{ fontWeight: "700", color: "#10B981" }}>
                        ${Number(p.monto_pago).toLocaleString("es-CO")}
                      </td>
                      <td>
                        <span style={{
                          padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                          background: p.estado === "pagado" ? "#065F46" : "#451A03",
                          color: p.estado === "pagado" ? "#10B981" : "#F59E0B"
                        }}>{p.estado}</span>
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--text3)" }}>{p.fecha}</td>
                      <td>
                        {p.estado === "pendiente" && (
                          <button onClick={() => marcarPagado(p.id, 'servicio')} style={{
                            background: "#065F46", border: "1px solid #10B981", color: "#10B981",
                            borderRadius: "6px", padding: "4px 10px", fontSize: "11px", cursor: "pointer"
                          }}>✓ Pagar</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab Nóminas */}
          {tab === "nominas" && (
            <div className="card">
              <table>
                <thead>
                  <tr>
                    <th>Empleado</th><th>Período</th><th>Salario base</th>
                    <th>Servicios</th><th>Deducciones</th><th>Total</th><th>Estado</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {nominas.map(n => (
                    <tr key={n.id}>
                      <td style={{ fontWeight: "600", color: "var(--text)" }}>{n.empleado_nombre}</td>
                      <td style={{ fontSize: "12px", color: "var(--text3)" }}>{n.periodo_inicio} → {n.periodo_fin}</td>
                      <td>${Number(n.salario_base).toLocaleString("es-CO")}</td>
                      <td style={{ color: "#10B981" }}>${Number(n.total_servicios).toLocaleString("es-CO")}</td>
                      <td style={{ color: "#EF4444" }}>-${Number(n.deducciones).toLocaleString("es-CO")}</td>
                      <td style={{ fontWeight: "700", color: "#10B981", fontSize: "15px" }}>
                        ${Number(n.total_pagar).toLocaleString("es-CO")}
                      </td>
                      <td>
                        <span style={{
                          padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                          background: n.estado === "pagado" ? "#065F46" : "#451A03",
                          color: n.estado === "pagado" ? "#10B981" : "#F59E0B"
                        }}>{n.estado}</span>
                      </td>
                      <td>
                        {n.estado === "pendiente" && (
                          <button onClick={() => marcarPagado(n.id, 'nomina')} style={{
                            background: "#065F46", border: "1px solid #10B981", color: "#10B981",
                            borderRadius: "6px", padding: "4px 10px", fontSize: "11px", cursor: "pointer"
                          }}>✓ Pagar</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {nominas.length === 0 && (
                    <tr><td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "var(--text3)" }}>
                      Sin nóminas generadas. Usa "Generar nómina" arriba.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modal Empleado */}
      {modalEmpleado !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "1.5rem", width: "100%", maxWidth: "500px",
            maxHeight: "92vh", overflowY: "auto", overflowX: "hidden" }}>
            <h2 style={{ marginBottom: "1.5rem", color: "var(--text)", fontSize: "18px" }}>
              {modalEmpleado?.id ? "Editar empleado" : "Nuevo empleado"}
            </h2>
            {[
              { label: "Nombre completo", key: "nombre" },
              { label: "Documento", key: "documento" },
              { label: "Teléfono", key: "telefono" },
              { label: "Correo", key: "correo" },
              { label: "Cargo", key: "cargo" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                  color: "var(--text2)", marginBottom: "4px", textTransform: "uppercase" }}>{f.label}</label>
                <input value={formEmpleado[f.key] || ""} onChange={e => setFormEmpleado({...formEmpleado, [f.key]: e.target.value})}
                  style={{ width: "100%" }} />
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                  color: "var(--text2)", marginBottom: "4px", textTransform: "uppercase" }}>Tipo</label>
                <select value={formEmpleado.tipo} onChange={e => setFormEmpleado({...formEmpleado, tipo: e.target.value})}
                  style={{ width: "100%" }}>
                  <option value="tecnico">Técnico</option>
                  <option value="contabilidad">Contabilidad</option>
                  <option value="admin">Admin</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                  color: "var(--text2)", marginBottom: "4px", textTransform: "uppercase" }}>Tipo pago</label>
                <select value={formEmpleado.tipo_pago} onChange={e => setFormEmpleado({...formEmpleado, tipo_pago: e.target.value})}
                  style={{ width: "100%" }}>
                  <option value="servicio">Por servicio</option>
                  <option value="fijo">Salario fijo</option>
                  <option value="mixto">Mixto</option>
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                  color: "var(--text2)", marginBottom: "4px", textTransform: "uppercase" }}>Salario base</label>
                <input type="number" value={formEmpleado.salario_base} onChange={e => setFormEmpleado({...formEmpleado, salario_base: e.target.value})}
                  style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                  color: "var(--text2)", marginBottom: "4px", textTransform: "uppercase" }}>% mano de obra</label>
                <input type="number" value={formEmpleado.porcentaje_mano_obra}
                  onChange={e => setFormEmpleado({...formEmpleado, porcentaje_mano_obra: e.target.value})}
                  style={{ width: "100%" }} />
              </div>
            </div>

            {/* Comisiones */}
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px", borderRadius: "10px", cursor: "pointer",
                background: formEmpleado.aplica_comision ? "rgba(245,166,35,.08)" : "var(--bg3)",
                border: `1px solid ${formEmpleado.aplica_comision ? "rgba(245,166,35,.3)" : "var(--border)"}`,
                transition: "all .15s" }}>
                <input type="checkbox" checked={formEmpleado.aplica_comision || false}
                  onChange={e => setFormEmpleado({...formEmpleado, aplica_comision: e.target.checked})}
                  style={{ width: "auto", accentColor: "#F5A623" }} />
                <div>
                  <div style={{ fontSize: "13px", color: "var(--text)", fontWeight: "600" }}>
                    Aplica comisión adicional
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text3)" }}>
                    Porcentaje extra sobre el total de cada orden
                  </div>
                </div>
              </label>
            </div>

            {formEmpleado.aplica_comision && (
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                  color: "var(--text2)", marginBottom: "4px", textTransform: "uppercase" }}>
                  % Comisión adicional
                </label>
                <input type="number" value={formEmpleado.porcentaje_comision || 10}
                  onChange={e => setFormEmpleado({...formEmpleado, porcentaje_comision: e.target.value})}
                  style={{ width: "100%" }} min="0" max="100" />
              </div>
            )}

                  style={{ width: "100%" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-primary" onClick={guardarEmpleado} style={{ flex: 1 }}>
                Guardar
              </button>
              <button className="btn btn-secondary" onClick={() => setModalEmpleado(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Pago */}
      {modalPago && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "1.5rem", width: "100%", maxWidth: "440px" }}>
            <h2 style={{ marginBottom: "1.5rem", color: "var(--text)", fontSize: "18px" }}>
              Registrar pago por servicio
            </h2>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                color: "var(--text2)", marginBottom: "4px", textTransform: "uppercase" }}>Empleado</label>
              <select value={formPago.empleado} onChange={e => setFormPago({...formPago, empleado: e.target.value})}
                style={{ width: "100%" }}>
                <option value="">Seleccionar...</option>
                {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                color: "var(--text2)", marginBottom: "4px", textTransform: "uppercase" }}>Descripción</label>
              <input value={formPago.descripcion} onChange={e => setFormPago({...formPago, descripcion: e.target.value})}
                placeholder="Ej: Mantenimiento preventivo NHX14G" style={{ width: "100%" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                  color: "var(--text2)", marginBottom: "4px", textTransform: "uppercase" }}>Monto orden ($)</label>
                <input type="number" value={formPago.monto_orden} onChange={e => setFormPago({...formPago, monto_orden: parseFloat(e.target.value)})}
                  style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                  color: "var(--text2)", marginBottom: "4px", textTransform: "uppercase" }}>% mano de obra</label>
                <input type="number" value={formPago.porcentaje} onChange={e => setFormPago({...formPago, porcentaje: parseFloat(e.target.value)})}
                  style={{ width: "100%" }} />
              </div>
            </div>
            {/* Checkbox comisión */}
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px", borderRadius: "10px", cursor: "pointer",
                background: formPago.aplica_comision ? "rgba(245,166,35,.08)" : "var(--bg3)",
                border: `1px solid ${formPago.aplica_comision ? "rgba(245,166,35,.3)" : "var(--border)"}`,
                transition: "all .15s" }}>
                <input type="checkbox" checked={formPago.aplica_comision || false}
                  onChange={e => setFormPago({...formPago, aplica_comision: e.target.checked})}
                  style={{ width: "auto", accentColor: "#F5A623" }} />
                <div>
                  <div style={{ fontSize: "13px", color: "var(--text)", fontWeight: "500" }}>
                    Aplicar comisión adicional
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text3)" }}>
                    Se suma al pago de mano de obra
                  </div>
                </div>
              </label>
            </div>

            {/* Preview pago */}
            <div style={{ background: "rgba(0,212,160,.06)", border: "1px solid rgba(0,212,160,.2)",
              borderRadius: "10px", padding: "14px", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", color: "var(--text3)" }}>Mano de obra ({formPago.porcentaje}%)</span>
                <span style={{ fontSize: "13px", color: "#00D4A0", fontWeight: "600" }}>
                  ${Number(formPago.monto_orden * formPago.porcentaje / 100).toLocaleString("es-CO")}
                </span>
              </div>
              {formPago.aplica_comision && (() => {
                const emp = empleados.find(e => e.id == formPago.empleado)
                const pctComision = emp?.porcentaje_comision || 10
                const montoComision = formPago.monto_orden * pctComision / 100
                return (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text3)" }}>Comisión ({pctComision}%)</span>
                    <span style={{ fontSize: "13px", color: "#F5A623", fontWeight: "600" }}>
                      +${Number(montoComision).toLocaleString("es-CO")}
                    </span>
                  </div>
                )
              })()}
              <div style={{ borderTop: "1px solid rgba(0,212,160,.2)", paddingTop: "8px",
                display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text)" }}>Total a pagar</span>
                <span style={{ fontSize: "20px", fontWeight: "800", color: "#00D4A0" }}>
                  {(() => {
                    const base = formPago.monto_orden * formPago.porcentaje / 100
                    const emp = empleados.find(e => e.id == formPago.empleado)
                    const comision = formPago.aplica_comision ? formPago.monto_orden * (emp?.porcentaje_comision || 10) / 100 : 0
                    return `$${Number(base + comision).toLocaleString("es-CO")}`
                  })()}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-primary" onClick={guardarPago} style={{ flex: 1 }}>Registrar pago</button>
              <button className="btn btn-secondary" onClick={() => setModalPago(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Generar Nómina */}
      {modalNomina && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "1.5rem", width: "100%", maxWidth: "440px" }}>
            <h2 style={{ marginBottom: "1.5rem", color: "var(--text)", fontSize: "18px" }}>
              Generar nómina
            </h2>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                color: "var(--text2)", marginBottom: "4px", textTransform: "uppercase" }}>Empleado</label>
              <select value={formNomina.empleado} onChange={e => setFormNomina({...formNomina, empleado: e.target.value})}
                style={{ width: "100%" }}>
                <option value="">Seleccionar...</option>
                {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                  color: "var(--text2)", marginBottom: "4px", textTransform: "uppercase" }}>Inicio período</label>
                <input type="date" value={formNomina.inicio} onChange={e => setFormNomina({...formNomina, inicio: e.target.value})}
                  style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                  color: "var(--text2)", marginBottom: "4px", textTransform: "uppercase" }}>Fin período</label>
                <input type="date" value={formNomina.fin} onChange={e => setFormNomina({...formNomina, fin: e.target.value})}
                  style={{ width: "100%" }} />
              </div>
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                color: "var(--text2)", marginBottom: "4px", textTransform: "uppercase" }}>Deducciones ($)</label>
              <input type="number" value={formNomina.deducciones} onChange={e => setFormNomina({...formNomina, deducciones: e.target.value})}
                style={{ width: "100%" }} />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-primary" onClick={generarNomina} style={{ flex: 1 }}>Generar nómina</button>
              <button className="btn btn-secondary" onClick={() => setModalNomina(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
