import { useState } from "react"
import API from "../services/api"

const BASE = API.defaults.baseURL

// Flujo end-to-end completo
const FLUJO_COMPLETO = async (log) => {
  let clienteId, vehiculoId, ordenId, cotizacionId, facturaId, gastoId

  log("Creando cliente de prueba...")
  const cliente = await API.post("/clientes/", {
    nombre: "DIAG_TEST", documento: "999999999", telefono: "3009999999"
  })
  clienteId = cliente.data.id

  log("Creando vehículo de prueba...")
  const vehiculo = await API.post("/vehiculos/", {
    cliente: clienteId, placa: "DGX999", marca: "Test",
    linea: "Diag", modelo: "2024", tipo: "moto"
  })
  vehiculoId = vehiculo.data.id

  log("Creando orden de trabajo...")
  const orden = await API.post("/ordenes/", {
    cliente: clienteId, vehiculo: vehiculoId,
    codigo: "DIAG-001", descripcion: "Prueba diagnóstico", estado: "recibido"
  })
  ordenId = orden.data.id

  log("Creando cotización...")
  const cot = await API.post("/cotizaciones/", {
    orden: ordenId, cliente: clienteId, descuento: 0, vigencia_dias: 15
  })
  cotizacionId = cot.data.id

  log("Agregando línea a cotización...")
  await API.post(`/cotizaciones/${cotizacionId}/agregar_linea/`, {
    tipo: "servicio", descripcion: "Servicio de prueba",
    cantidad: 1, precio_unit: 50000, precio_costo: 0
  })

  log("Generando PDF cotización...")
  const token = localStorage.getItem("access")
  const pdfCot = await fetch(`${BASE}/cotizaciones/${cotizacionId}/pdf/?token=${token}`)
  if (!pdfCot.ok) throw new Error(`PDF cotización: HTTP ${pdfCot.status}`)

  log("Aprobando cotización → factura...")
  await API.post(`/cotizaciones/${cotizacionId}/aprobar/`)

  log("Verificando factura generada...")
  const facturas = await API.get("/facturas/")
  const lista = facturas.data.results || facturas.data
  facturaId = lista[lista.length - 1]?.id

  if (facturaId) {
    log("Generando PDF factura...")
    const pdfFac = await fetch(`${BASE}/facturas/${facturaId}/pdf/?token=${token}`)
    if (!pdfFac.ok) throw new Error(`PDF factura: HTTP ${pdfFac.status}`)
  }

  log("Creando gasto de prueba...")
  const gasto = await API.post("/gastos/", {
    descripcion: "DIAG_GASTO", categoria: "otros",
    monto: 1000, fecha: new Date().toISOString().split("T")[0]
  })
  gastoId = gasto.data.id

  log("Verificando reportes...")
  await API.get("/reportes/financiero/", { params: { anio: new Date().getFullYear() } })

  log("Limpiando datos de prueba...")
  if (gastoId)      await API.delete(`/gastos/${gastoId}/`)
  if (facturaId)    await API.delete(`/facturas/${facturaId}/`)
  if (cotizacionId) await API.delete(`/cotizaciones/${cotizacionId}/`)
  if (ordenId)      await API.delete(`/ordenes/${ordenId}/`)
  if (vehiculoId)   await API.delete(`/vehiculos/${vehiculoId}/`)
  if (clienteId)    await API.delete(`/clientes/${clienteId}/`)

  return "✅ Flujo completo exitoso — todos los datos eliminados"
}

const PRUEBAS = [
  {
    modulo: "API Backend",
    icon: "🖥️",
    pruebas: [
      { nombre: "Health check",  fn: async () => { const r = await fetch(`${BASE}/schema/`); if(!r.ok) throw new Error(`HTTP ${r.status}`); return "Backend OK" } },
      { nombre: "Base de datos", fn: async () => { await API.get("/clientes/"); return "PostgreSQL OK" } },
    ]
  },
  {
    modulo: "Autenticación",
    icon: "🔐",
    pruebas: [
      { nombre: "Token válido",  fn: async () => { const r = await API.get("/usuarios/me/"); return `@${r.data.username}` } },
      { nombre: "Perfil y rol",  fn: async () => { const r = await API.get("/usuarios/me/"); return r.data.perfil?.rol || "sin rol" } },
    ]
  },
  {
    modulo: "Clientes",
    icon: "👥",
    pruebas: [
      { nombre: "Listar",        fn: async () => { const r = await API.get("/clientes/"); return `${(r.data.results||r.data).length} clientes` } },
      { nombre: "Crear/Eliminar", fn: async () => {
        const r = await API.post("/clientes/", { nombre: "TEST", documento: "111111111", telefono: "3001111111" })
        await API.delete(`/clientes/${r.data.id}/`)
        return "OK"
      }},
    ]
  },
  {
    modulo: "Vehículos",
    icon: "🏍",
    pruebas: [
      { nombre: "Listar",        fn: async () => { const r = await API.get("/vehiculos/"); return `${(r.data.results||r.data).length} vehículos` } },
    ]
  },
  {
    modulo: "Órdenes",
    icon: "🔧",
    pruebas: [
      { nombre: "Listar",        fn: async () => { const r = await API.get("/ordenes/"); return `${(r.data.results||r.data).length} órdenes` } },
      { nombre: "Notif. n8n",    fn: async () => {
        const r = await fetch("https://n8n.armracing.com/webhook/Nueva-Orden", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ test: true, codigo: "DIAG" })
        })
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return "Webhook OK"
      }},
    ]
  },
  {
    modulo: "Inventario",
    icon: "📦",
    pruebas: [
      { nombre: "Productos",     fn: async () => { const r = await API.get("/inventario/productos/"); return `${(r.data.results||r.data).length} productos` } },
      { nombre: "Categorías",    fn: async () => { const r = await API.get("/inventario/categorias/"); return `${(r.data.results||r.data).length} categorías` } },
    ]
  },
  {
    modulo: "Cotizaciones",
    icon: "📋",
    pruebas: [
      { nombre: "Listar",        fn: async () => { const r = await API.get("/cotizaciones/"); return `${(r.data.results||r.data).length} cotizaciones` } },
      { nombre: "PDF",           fn: async () => {
        const r = await API.get("/cotizaciones/")
        const lista = r.data.results || r.data
        if (!lista.length) return "Sin datos"
        const token = localStorage.getItem("access")
        const res = await fetch(`${BASE}/cotizaciones/${lista[0].id}/pdf/?token=${token}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return "PDF OK"
      }},
    ]
  },
  {
    modulo: "Facturas",
    icon: "💰",
    pruebas: [
      { nombre: "Listar",        fn: async () => { const r = await API.get("/facturas/"); return `${(r.data.results||r.data).length} facturas` } },
      { nombre: "PDF",           fn: async () => {
        const r = await API.get("/facturas/")
        const lista = r.data.results || r.data
        if (!lista.length) return "Sin datos"
        const token = localStorage.getItem("access")
        const res = await fetch(`${BASE}/facturas/${lista[0].id}/pdf/?token=${token}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return "PDF OK"
      }},
    ]
  },
  {
    modulo: "Gastos",
    icon: "📤",
    pruebas: [
      { nombre: "Listar",        fn: async () => { const r = await API.get("/gastos/"); return `${(r.data.results||r.data).length} gastos` } },
    ]
  },
  {
    modulo: "Reportes",
    icon: "📊",
    pruebas: [
      { nombre: "Financiero",    fn: async () => {
        const r = await API.get("/reportes/financiero/", { params: { anio: new Date().getFullYear() } })
        return `$${Number(r.data.resumen.ingresos).toLocaleString()}`
      }},
    ]
  },
  {
    modulo: "Agendamiento",
    icon: "📅",
    pruebas: [
      { nombre: "Citas",         fn: async () => { const r = await API.get("/agendamiento/citas/"); return `${(r.data.results||r.data).length} citas` } },
      { nombre: "Config",        fn: async () => { await API.get("/agendamiento/config-taller/"); return "OK" } },
    ]
  },
  {
    modulo: "Usuarios",
    icon: "👤",
    pruebas: [
      { nombre: "Listar",        fn: async () => { const r = await API.get("/usuarios/"); return `${(r.data.results||r.data).length} usuarios` } },
    ]
  },
  {
    modulo: "Links públicos",
    icon: "🌐",
    pruebas: [
      { nombre: "Página agendar", fn: async () => {
        const r = await fetch(`${window.location.origin}/agendar`)
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return "Accesible"
      }},
      { nombre: "Página registro", fn: async () => {
        const r = await fetch(`${window.location.origin}/registro`)
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return "Accesible"
      }},
      { nombre: "Página pública", fn: async () => {
        const r = await fetch(`${window.location.origin}/public`)
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return "Accesible"
      }},
      { nombre: "API agendamiento público", fn: async () => {
        const r = await fetch(`${BASE}/agendamiento/publico/disponibilidad/?mes=${new Date().getMonth()+1}&anio=${new Date().getFullYear()}`)
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return "API OK"
      }},
      { nombre: "API registro cliente", fn: async () => {
        const r = await fetch(`${BASE}/agendamiento/cliente-publico/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: "TEST", documento: "888888888", telefono: "3008888888" })
        })
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const data = await r.json()
        await API.delete(`/clientes/${data.id}/`)
        return "Registro público OK"
      }},
    ]
  },
]

export default function Diagnostico() {
  const [resultados, setResultados]   = useState({})
  const [corriendo, setCorriendo]     = useState(false)
  const [progreso, setProgreso]       = useState(0)
  const [total, setTotal]             = useState(0)
  const [flujoLogs, setFlujoLogs]     = useState([])
  const [flujoEstado, setFlujoEstado] = useState(null)
  const [flujoMsg, setFlujoMsg]       = useState("")
  const [corriendflujo, setCorriendFlujo] = useState(false)

  const correrDiagnostico = async () => {
    setCorriendo(true)
    setResultados({})
    const todasLasPruebas = PRUEBAS.flatMap(m => m.pruebas.map(p => ({ ...p, modulo: m.modulo })))
    setTotal(todasLasPruebas.length)
    setProgreso(0)
    for (const prueba of todasLasPruebas) {
      const key = `${prueba.modulo}__${prueba.nombre}`
      setResultados(prev => ({ ...prev, [key]: { estado: "corriendo" } }))
      try {
        const inicio = Date.now()
        const msg = await prueba.fn()
        const ms = Date.now() - inicio
        setResultados(prev => ({ ...prev, [key]: { estado: "ok", msg, ms } }))
      } catch (e) {
        setResultados(prev => ({ ...prev, [key]: { estado: "error", msg: e.message || "Error" } }))
      }
      setProgreso(p => p + 1)
    }
    setCorriendo(false)
  }

  const correrFlujoCompleto = async () => {
    setCorriendFlujo(true)
    setFlujoLogs([])
    setFlujoEstado("corriendo")
    setFlujoMsg("")
    const logs = []
    const log = (msg) => {
      logs.push(`${new Date().toLocaleTimeString()} — ${msg}`)
      setFlujoLogs([...logs])
    }
    try {
      const inicio = Date.now()
      const msg = await FLUJO_COMPLETO(log)
      const ms = Date.now() - inicio
      setFlujoEstado("ok")
      setFlujoMsg(`${msg} (${(ms/1000).toFixed(1)}s)`)
    } catch (e) {
      setFlujoEstado("error")
      setFlujoMsg(e.message || "Error en el flujo")
      log(`❌ ERROR: ${e.message}`)
    }
    setCorriendFlujo(false)
  }

  const totalOk    = Object.values(resultados).filter(r => r.estado === "ok").length
  const totalError = Object.values(resultados).filter(r => r.estado === "error").length
  const porcentaje = total > 0 ? Math.round((progreso / total) * 100) : 0

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700",
            color: "var(--text)", marginBottom: "4px" }}>Diagnóstico del ERP</h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>
            Verifica módulos, links públicos y flujo completo
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary" onClick={correrFlujoCompleto}
            disabled={corriendflujo || corriendo}>
            {corriendflujo ? "⏳ Simulando..." : "🔄 Flujo completo"}
          </button>
          <button className="btn btn-primary" onClick={correrDiagnostico}
            disabled={corriendo || corriendflujo}>
            {corriendo ? `⏳ ${progreso}/${total}` : "🔍 Diagnóstico"}
          </button>
        </div>
      </div>

      {/* Flujo completo */}
      <div style={{ background: "var(--bg2)", border: `1px solid ${
        flujoEstado === "ok" ? "#10B981" : flujoEstado === "error" ? "#EF4444" : "var(--border)"
      }`, borderRadius: "var(--radius-lg)", padding: "1.25rem",
        marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px",
          marginBottom: flujoLogs.length ? "1rem" : 0 }}>
          <span style={{ fontSize: "20px" }}>🔄</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "14px" }}>
              Simulación flujo completo
            </div>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
              Crea cliente → vehículo → orden → cotización → PDF → factura → PDF → gasto → reportes → elimina todo
            </div>
          </div>
          {flujoEstado && (
            <span style={{ fontSize: "13px", fontWeight: "600",
              color: flujoEstado === "ok" ? "#10B981" : flujoEstado === "error" ? "#EF4444" : "#F59E0B" }}>
              {flujoEstado === "ok" ? "✅" : flujoEstado === "error" ? "❌" : "⏳"} {flujoMsg}
            </span>
          )}
        </div>
        {flujoLogs.length > 0 && (
          <div style={{ background: "#0A0E1A", borderRadius: "8px",
            padding: "10px 14px", maxHeight: "200px", overflowY: "auto" }}>
            {flujoLogs.map((log, i) => (
              <div key={i} style={{ fontSize: "12px", fontFamily: "monospace",
                color: log.includes("ERROR") ? "#EF4444" : log.includes("✅") ? "#10B981" : "#9CA3AF",
                marginBottom: "2px" }}>
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Barra progreso diagnóstico */}
      {(corriendo || progreso > 0) && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between",
            marginBottom: "8px", fontSize: "13px" }}>
            <span style={{ color: "var(--text)" }}>{porcentaje}% completado</span>
            <span style={{ color: "var(--text3)" }}>{progreso}/{total} pruebas</span>
          </div>
          <div style={{ height: "8px", background: "var(--border2)",
            borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${porcentaje}%`,
              background: totalError > 0 ? "#EF4444" : "#10B981",
              borderRadius: "4px", transition: "width 0.3s" }}/>
          </div>
          {!corriendo && progreso > 0 && (
            <div style={{ display: "flex", gap: "1rem", marginTop: "8px" }}>
              <span style={{ fontSize: "13px", color: "#10B981" }}>✅ {totalOk} OK</span>
              {totalError > 0 && (
                <span style={{ fontSize: "13px", color: "#EF4444" }}>❌ {totalError} errores</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Módulos */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {PRUEBAS.map(modulo => (
          <div key={modulo.modulo} style={{
            background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", overflow: "hidden"
          }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>{modulo.icon}</span>
              <span style={{ fontWeight: "600", color: "var(--text)" }}>{modulo.modulo}</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                {modulo.pruebas.map(p => {
                  const r = resultados[`${modulo.modulo}__${p.nombre}`]
                  if (!r) return null
                  return <span key={p.nombre} style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: r.estado === "ok" ? "#10B981" : r.estado === "error" ? "#EF4444" : "#F59E0B"
                  }}/>
                })}
              </div>
            </div>
            <div style={{ padding: "0.75rem 1.25rem" }}>
              {modulo.pruebas.map(prueba => {
                const key = `${modulo.modulo}__${prueba.nombre}`
                const r = resultados[key]
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center",
                    gap: "10px", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "14px", minWidth: "20px" }}>
                      {!r ? "⬜" : r.estado === "ok" ? "✅" : r.estado === "error" ? "❌" : "⏳"}
                    </span>
                    <span style={{ fontSize: "13px", color: "var(--text2)", flex: 1 }}>
                      {prueba.nombre}
                    </span>
                    {r && (
                      <span style={{ fontSize: "12px",
                        color: r.estado === "ok" ? "#10B981" : r.estado === "error" ? "#EF4444" : "#F59E0B" }}>
                        {r.msg}
                        {r.ms && <span style={{ color: "var(--text3)", marginLeft: "8px" }}>{r.ms}ms</span>}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
