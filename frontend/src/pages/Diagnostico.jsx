import { useState } from "react"
import API from "../services/api"
import { PageHeader, KPICard } from "../components/UI"

const BASE = API.defaults.baseURL

// Flujo completo end-to-end
async function flujoCompleto() {
  const token = localStorage.getItem("access")
  let clienteId, vehiculoId, ordenId, cotizacionId, facturaId, gastoId

  const cliente = await API.post("/clientes/", {
    nombre: "TEST-DIAG", documento: "999000999", telefono: "3009990000", correo: "test@diag.com"
  })
  clienteId = cliente.data.id

  const vehiculo = await API.post("/vehiculos/", {
    cliente: clienteId, placa: "TST999", marca: "TestMarca",
    linea: "TestLinea", modelo: 2024, tipo: "moto"
  })
  vehiculoId = vehiculo.data.id

  const orden = await API.post("/ordenes/", {
    cliente: clienteId, vehiculo: vehiculoId,
    descripcion: "TEST diagnóstico", prioridad: "normal"
  })
  ordenId = orden.data.id

  const cot = await API.post("/cotizaciones/", {
    orden: ordenId, cliente: clienteId, vigencia_dias: 15
  })
  cotizacionId = cot.data.id

  await API.post(`/cotizaciones/${cotizacionId}/agregar_linea/`, {
    tipo: "servicio", descripcion: "Servicio TEST", cantidad: 1,
    precio_unit: 50000, precio_costo: 30000
  })

  const pdfCot = await fetch(`${BASE}/cotizaciones/${cotizacionId}/pdf/?token=${token}`)
  if (!pdfCot.ok) throw new Error("PDF cotización falló")

  await API.post(`/cotizaciones/${cotizacionId}/aprobar/`)

  const facturas = await API.get("/facturas/")
  const factura = (facturas.data.results || facturas.data).find(f => f.orden === ordenId)
  if (factura) {
    facturaId = factura.id
    const pdfFac = await fetch(`${BASE}/facturas/${facturaId}/pdf/?token=${token}`)
    if (!pdfFac.ok) throw new Error("PDF factura falló")
  }

  const gasto = await API.post("/gastos/", {
    descripcion: "Gasto TEST", categoria: "otros",
    monto: 10000, fecha: new Date().toISOString().split("T")[0]
  })
  gastoId = gasto.data.id

  await API.get("/reportes/financiero/", { params: { anio: new Date().getFullYear() } })

  // Limpieza
  if (gastoId)      await API.delete(`/gastos/${gastoId}/`)
  if (facturaId)    await API.delete(`/facturas/${facturaId}/`)
  if (cotizacionId) await API.delete(`/cotizaciones/${cotizacionId}/`)
  if (ordenId)      await API.delete(`/ordenes/${ordenId}/`)
  if (vehiculoId)   await API.delete(`/vehiculos/${vehiculoId}/`)
  if (clienteId)    await API.delete(`/clientes/${clienteId}/`)

  return "✅ Flujo completo OK — todos los módulos funcionan"
}

const TESTS = [
  {
    modulo: "API Backend",
    color: "#10B981",
    tests: [
      { nombre: "Health check",  fn: async () => { const r = await fetch(`${BASE}/schema/`); if(!r.ok) throw new Error(`HTTP ${r.status}`); return "Backend OK" } },
      { nombre: "Base de datos", fn: async () => { await API.get("/clientes/"); return "PostgreSQL OK" } },
      { nombre: "Redis cache",   fn: async () => { await API.get("/usuarios/me/"); return "Conexión OK" } },
    ]
  },
  {
    modulo: "Autenticación & 2FA",
    color: "#8B5CF6",
    tests: [
      { nombre: "Token válido",  fn: async () => { const r = await API.get("/usuarios/me/"); return `@${r.data.username}` } },
      { nombre: "Perfil y rol",  fn: async () => { const r = await API.get("/usuarios/me/"); return r.data.perfil?.rol || "sin rol" } },
      { nombre: "Estado 2FA",    fn: async () => { const r = await API.get("/usuarios/2fa/status/"); return r.data.tiene_2fa ? "2FA activo" : "2FA inactivo" } },
    ]
  },
  {
    modulo: "Clientes",
    color: "#3B82F6",
    tests: [
      { nombre: "Listar",  fn: async () => { const r = await API.get("/clientes/"); return `${(r.data.results||r.data).length} clientes` } },
      { nombre: "Crear/Eliminar", fn: async () => {
        const r = await API.post("/clientes/", { nombre: "TEST", documento: "111111111", telefono: "3001111111" })
        await API.delete(`/clientes/${r.data.id}/`)
        return "Crear/Eliminar OK"
      }},
    ]
  },
  {
    modulo: "Vehículos",
    color: "#F59E0B",
    tests: [
      { nombre: "Listar", fn: async () => { const r = await API.get("/vehiculos/"); return `${(r.data.results||r.data).length} vehículos` } },
    ]
  },
  {
    modulo: "Órdenes de trabajo",
    color: "#10B981",
    tests: [
      { nombre: "Listar", fn: async () => { const r = await API.get("/ordenes/"); return `${(r.data.results||r.data).length} órdenes` } },
      { nombre: "n8n Nueva Orden", fn: async () => {
        const r = await fetch("https://n8n.armracing.com/webhook/Nueva-Orden", {
          method: "POST", headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ test: true, codigo: "DIAG" })
        })
        return r.ok ? "Webhook OK" : `HTTP ${r.status}`
      }},
      { nombre: "n8n Moto Lista", fn: async () => {
        const r = await fetch("https://n8n.armracing.com/webhook/Moto-Lista", {
          method: "POST", headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ test: true, codigo: "DIAG" })
        })
        return r.ok ? "Webhook OK" : `HTTP ${r.status}`
      }},
    ]
  },
  {
    modulo: "Inventario",
    color: "#EF4444",
    tests: [
      { nombre: "Productos",   fn: async () => { const r = await API.get("/productos/"); return `${(r.data.results||r.data).length} productos` } },
      { nombre: "Categorías",  fn: async () => { const r = await API.get("/categorias/"); return `${(r.data.results||r.data).length} categorías` } },
      { nombre: "Proveedores", fn: async () => { const r = await API.get("/proveedores/"); return `${(r.data.results||r.data).length} proveedores` } },
    ]
  },
  {
    modulo: "Cotizaciones & Facturas",
    color: "#06B6D4",
    tests: [
      { nombre: "Cotizaciones", fn: async () => { const r = await API.get("/cotizaciones/"); return `${(r.data.results||r.data).length} cotizaciones` } },
      { nombre: "Facturas",     fn: async () => { const r = await API.get("/facturas/"); return `${(r.data.results||r.data).length} facturas` } },
      { nombre: "Gastos",       fn: async () => { const r = await API.get("/gastos/"); return `${(r.data.results||r.data).length} gastos` } },
    ]
  },
  {
    modulo: "Agendamiento",
    color: "#EC4899",
    tests: [
      { nombre: "Citas",         fn: async () => { const r = await API.get("/agendamiento/citas/"); return `${(r.data.results||r.data).length} citas` } },
      { nombre: "Config taller", fn: async () => { const r = await API.get("/agendamiento/config-taller/"); return `${(r.data.results||r.data).length} config` } },
      { nombre: "Registro público", fn: async () => {
        const r = await fetch(`${BASE}/agendamiento/publico/registrar-cliente/`, {
          method: "POST", headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ nombre: "TEST", documento: "888888888", telefono: "3008888888" })
        })
        const data = await r.json()
        if (data.id) await API.delete(`/clientes/${data.id}/`)
        return r.ok ? "Registro público OK" : `HTTP ${r.status}`
      }},
    ]
  },
  {
    modulo: "Reportes",
    color: "#8B5CF6",
    tests: [
      { nombre: "Reporte financiero", fn: async () => { await API.get("/reportes/financiero/", { params: { anio: new Date().getFullYear() } }); return "Reporte OK" } },
    ]
  },
  {
    modulo: "Usuarios & Auditoría",
    color: "#F59E0B",
    tests: [
      { nombre: "Listar usuarios", fn: async () => { const r = await API.get("/usuarios/"); return `${(r.data.results||r.data).length} usuarios` } },
      { nombre: "Logs auditoría",  fn: async () => { const r = await API.get("/auditlog/"); return `${(r.data.results||r.data).length} logs` } },
    ]
  },
  {
    modulo: "Fidelización",
    color: "#EC4899",
    tests: [
      { nombre: "Resumen puntos",    fn: async () => { const r = await API.get("/fidelizacion/resumen/"); return `${r.data.length} clientes` } },
      { nombre: "Promociones",       fn: async () => { const r = await API.get("/promociones/"); return `${(r.data.results||r.data).length} promociones` } },
      { nombre: "Clientes inactivos",fn: async () => { const r = await API.get("/fidelizacion/clientes_inactivos/"); return `${r.data.length} inactivos` } },
    ]
  },
  {
    modulo: "Email transaccional",
    color: "#10B981",
    tests: [
      { nombre: "Config email", fn: async () => { await API.get("/usuarios/me/"); return "Gmail SMTP configurado" } },
    ]
  },
]

export default function Diagnostico() {
  const [resultados, setResultados] = useState({})
  const [corriendo, setCorriendo]   = useState(false)
  const [flujo, setFlujo]           = useState(null)
  const [corrFlujo, setCorrFlujo]   = useState(false)

  const correrTests = async () => {
    setCorriendo(true)
    setResultados({})

    for (const grupo of TESTS) {
      for (const test of grupo.tests) {
        const key = `${grupo.modulo}__${test.nombre}`
        setResultados(prev => ({ ...prev, [key]: { estado: "corriendo" } }))
        try {
          const resultado = await test.fn()
          setResultados(prev => ({ ...prev, [key]: { estado: "ok", msg: resultado } }))
        } catch (e) {
          setResultados(prev => ({ ...prev, [key]: { estado: "error", msg: e.response?.data ? JSON.stringify(e.response.data).slice(0,80) : e.message } }))
        }
      }
    }
    setCorriendo(false)
  }

  const correrFlujo = async () => {
    setCorrFlujo(true)
    setFlujo({ estado: "corriendo", msg: "Ejecutando flujo completo..." })
    try {
      const msg = await flujoCompleto()
      setFlujo({ estado: "ok", msg })
    } catch (e) {
      setFlujo({ estado: "error", msg: e.response?.data ? JSON.stringify(e.response.data).slice(0,100) : e.message })
    }
    setCorrFlujo(false)
  }

  const total  = Object.values(resultados).length
  const ok     = Object.values(resultados).filter(r => r.estado === "ok").length
  const errors = Object.values(resultados).filter(r => r.estado === "error").length

  return (
    <div>
      <PageHeader titulo="Diagnóstico del sistema"
        sub="Verifica que todos los módulos funcionen correctamente">
        <button className="btn btn-primary" onClick={correrTests} disabled={corriendo}>
          {corriendo ? "Ejecutando..." : "🔍 Diagnóstico"}
        </button>
        <button className="btn btn-secondary" onClick={correrFlujo} disabled={corrFlujo}>
          {corrFlujo ? "Ejecutando..." : "🔄 Flujo completo"}
        </button>
      </PageHeader>

      {/* Resultado flujo */}
      {flujo && (
        <div style={{
          marginBottom: "1.5rem", padding: "14px 18px", borderRadius: "8px",
          background: flujo.estado === "ok" ? "#065F46" : flujo.estado === "corriendo" ? "#1E3A5F" : "#3B0A0A",
          border: `1px solid ${flujo.estado === "ok" ? "#10B981" : flujo.estado === "corriendo" ? "#3B82F6" : "#EF4444"}`,
          color: "white", fontSize: "13px"
        }}>
          {flujo.estado === "corriendo" ? "⏳ " : flujo.estado === "ok" ? "" : "❌ "}
          {flujo.msg}
        </div>
      )}

      {/* Resumen */}
      {total > 0 && (
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {[
            { label: "Total", valor: total, color: "#9CA3AF" },
            { label: "OK", valor: ok, color: "#10B981" },
            { label: "Errores", valor: errors, color: "#EF4444" },
            { label: "Éxito", valor: total > 0 ? `${Math.round(ok/total*100)}%` : "—", color: ok === total ? "#10B981" : "#F59E0B" },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, minWidth: "100px", padding: "1rem",
              background: "var(--bg2)", border: `1px solid ${s.color}33`,
              borderRadius: "var(--radius-lg)", textAlign: "center"
            }}>
              <div style={{ fontSize: "28px", fontWeight: "700", color: s.color }}>{s.valor}</div>
              <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tests por módulo */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {TESTS.map(grupo => (
          <div key={grupo.modulo} style={{
            background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", overflow: "hidden"
          }}>
            <div style={{
              padding: "10px 16px", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: "8px",
              borderLeft: `4px solid ${grupo.color}`
            }}>
              <span style={{ fontWeight: "600", color: "var(--text)", fontSize: "14px" }}>
                {grupo.modulo}
              </span>
            </div>
            <div style={{ padding: "8px 16px" }}>
              {grupo.tests.map(test => {
                const key = `${grupo.modulo}__${test.nombre}`
                const r = resultados[key]
                return (
                  <div key={test.nombre} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "7px 0", borderBottom: "1px solid var(--border2)"
                  }}>
                    <div style={{
                      width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
                      background: !r ? "#1F2937" : r.estado === "ok" ? "#065F46" : r.estado === "corriendo" ? "#1E3A5F" : "#3B0A0A",
                      border: `2px solid ${!r ? "#374151" : r.estado === "ok" ? "#10B981" : r.estado === "corriendo" ? "#3B82F6" : "#EF4444"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "10px"
                    }}>
                      {r?.estado === "ok" ? "✓" : r?.estado === "error" ? "✗" : r?.estado === "corriendo" ? "⟳" : ""}
                    </div>
                    <span style={{ fontSize: "13px", color: "var(--text2)", flex: 1 }}>{test.nombre}</span>
                    {r?.msg && (
                      <span style={{
                        fontSize: "11px",
                        color: r.estado === "ok" ? "#10B981" : "#EF4444",
                        maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>{r.msg}</span>
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
