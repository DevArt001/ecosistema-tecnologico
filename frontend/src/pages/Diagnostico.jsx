import { useState } from "react"
import API from "../services/api"

const PRUEBAS = [
  {
    modulo: "Autenticación",
    icon: "🔐",
    pruebas: [
      { nombre: "Login", fn: async () => { await API.get("/usuarios/me/"); return "Token válido" } },
    ]
  },
  {
    modulo: "Clientes",
    icon: "👥",
    pruebas: [
      { nombre: "Listar clientes", fn: async () => { const r = await API.get("/clientes/"); return `${(r.data.results||r.data).length} clientes` } },
      { nombre: "Crear cliente", fn: async () => {
        const r = await API.post("/clientes/", { nombre: "TEST_DIAG", documento: "000000000", telefono: "3000000000" })
        await API.delete(`/clientes/${r.data.id}/`)
        return "Crear/Eliminar OK"
      }},
    ]
  },
  {
    modulo: "Vehículos",
    icon: "🏍",
    pruebas: [
      { nombre: "Listar vehículos", fn: async () => { const r = await API.get("/vehiculos/"); return `${(r.data.results||r.data).length} vehículos` } },
    ]
  },
  {
    modulo: "Órdenes",
    icon: "🔧",
    pruebas: [
      { nombre: "Listar órdenes", fn: async () => { const r = await API.get("/ordenes/"); return `${(r.data.results||r.data).length} órdenes` } },
    ]
  },
  {
    modulo: "Inventario",
    icon: "📦",
    pruebas: [
      { nombre: "Listar productos", fn: async () => { const r = await API.get("/inventario/productos/"); return `${(r.data.results||r.data).length} productos` } },
      { nombre: "Categorías", fn: async () => { const r = await API.get("/inventario/categorias/"); return `${(r.data.results||r.data).length} categorías` } },
    ]
  },
  {
    modulo: "Cotizaciones",
    icon: "📋",
    pruebas: [
      { nombre: "Listar cotizaciones", fn: async () => { const r = await API.get("/cotizaciones/"); return `${(r.data.results||r.data).length} cotizaciones` } },
      { nombre: "PDF cotización", fn: async () => {
        const r = await API.get("/cotizaciones/")
        const lista = r.data.results || r.data
        if (lista.length === 0) return "Sin cotizaciones para probar"
        const token = localStorage.getItem("access")
        const res = await fetch(`${API.defaults.baseURL}/cotizaciones/${lista[0].id}/pdf/?token=${token}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return "PDF genera OK"
      }},
    ]
  },
  {
    modulo: "Facturas",
    icon: "💰",
    pruebas: [
      { nombre: "Listar facturas", fn: async () => { const r = await API.get("/facturas/"); return `${(r.data.results||r.data).length} facturas` } },
      { nombre: "PDF factura", fn: async () => {
        const r = await API.get("/facturas/")
        const lista = r.data.results || r.data
        if (lista.length === 0) return "Sin facturas para probar"
        const token = localStorage.getItem("access")
        const res = await fetch(`${API.defaults.baseURL}/facturas/${lista[0].id}/pdf/?token=${token}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return "PDF genera OK"
      }},
    ]
  },
  {
    modulo: "Gastos",
    icon: "📤",
    pruebas: [
      { nombre: "Listar gastos", fn: async () => { const r = await API.get("/gastos/"); return `${(r.data.results||r.data).length} gastos` } },
    ]
  },
  {
    modulo: "Reportes",
    icon: "📊",
    pruebas: [
      { nombre: "Reporte financiero", fn: async () => {
        const r = await API.get("/reportes/financiero/", { params: { anio: new Date().getFullYear() } })
        return `Ingresos: $${Number(r.data.resumen.ingresos).toLocaleString()}`
      }},
    ]
  },
  {
    modulo: "Agendamiento",
    icon: "📅",
    pruebas: [
      { nombre: "Listar citas", fn: async () => { const r = await API.get("/agendamiento/citas/"); return `${(r.data.results||r.data).length} citas` } },
      { nombre: "Config taller", fn: async () => { await API.get("/agendamiento/config-taller/"); return "Config OK" } },
    ]
  },
  {
    modulo: "Usuarios",
    icon: "👤",
    pruebas: [
      { nombre: "Listar usuarios", fn: async () => { const r = await API.get("/usuarios/"); return `${(r.data.results||r.data).length} usuarios` } },
      { nombre: "Perfil actual", fn: async () => { const r = await API.get("/usuarios/me/"); return `@${r.data.username} — ${r.data.perfil?.rol}` } },
    ]
  },
  {
    modulo: "n8n Webhook",
    icon: "⚡",
    pruebas: [
      { nombre: "Webhook Nueva Orden", fn: async () => {
        const r = await fetch("https://n8n.armracing.com/webhook/Nueva-Orden", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ test: true, codigo: "DIAG-TEST" })
        })
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return "Webhook responde OK"
      }},
    ]
  },
  {
    modulo: "API Backend",
    icon: "🖥️",
    pruebas: [
      { nombre: "Health check", fn: async () => {
        const r = await fetch("https://api.armracing.com/api/schema/")
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return "Backend OK"
      }},
      { nombre: "Base de datos", fn: async () => {
        await API.get("/clientes/")
        return "PostgreSQL OK"
      }},
    ]
  },
]

export default function Diagnostico() {
  const [resultados, setResultados] = useState({})
  const [corriendo, setCorriendo]   = useState(false)
  const [progreso, setProgreso]     = useState(0)
  const [total, setTotal]           = useState(0)

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
        setResultados(prev => ({ ...prev, [key]: { estado: "error", msg: e.message || "Error desconocido" } }))
      }
      setProgreso(p => p + 1)
    }
    setCorriendo(false)
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
            Verifica que todos los módulos funcionen correctamente
          </p>
        </div>
        <button className="btn btn-primary" onClick={correrDiagnostico}
          disabled={corriendo}>
          {corriendo ? `Verificando... ${progreso}/${total}` : "🔍 Correr diagnóstico"}
        </button>
      </div>

      {/* Barra de progreso */}
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
              <span style={{ fontSize: "13px", color: "#10B981" }}>
                ✅ {totalOk} pruebas exitosas
              </span>
              {totalError > 0 && (
                <span style={{ fontSize: "13px", color: "#EF4444" }}>
                  ❌ {totalError} con errores
                </span>
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
            <div style={{ padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>{modulo.icon}</span>
              <span style={{ fontWeight: "600", color: "var(--text)" }}>
                {modulo.modulo}
              </span>
              <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
                {modulo.pruebas.map(p => {
                  const key = `${modulo.modulo}__${p.nombre}`
                  const r = resultados[key]
                  if (!r) return null
                  return (
                    <span key={key} style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: r.estado === "ok" ? "#10B981" :
                        r.estado === "error" ? "#EF4444" : "#F59E0B"
                    }}/>
                  )
                })}
              </div>
            </div>
            <div style={{ padding: "0.75rem 1.25rem" }}>
              {modulo.pruebas.map(prueba => {
                const key = `${modulo.modulo}__${prueba.nombre}`
                const r = resultados[key]
                return (
                  <div key={key} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "6px 0", borderBottom: "1px solid var(--border)",
                  }}>
                    <span style={{ fontSize: "14px", minWidth: "20px" }}>
                      {!r ? "⬜" :
                        r.estado === "ok" ? "✅" :
                        r.estado === "error" ? "❌" : "⏳"}
                    </span>
                    <span style={{ fontSize: "13px", color: "var(--text2)",
                      flex: 1 }}>{prueba.nombre}</span>
                    {r && (
                      <span style={{ fontSize: "12px",
                        color: r.estado === "ok" ? "#10B981" :
                          r.estado === "error" ? "#EF4444" : "#F59E0B" }}>
                        {r.msg}
                        {r.ms && <span style={{ color: "var(--text3)",
                          marginLeft: "8px" }}>{r.ms}ms</span>}
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
