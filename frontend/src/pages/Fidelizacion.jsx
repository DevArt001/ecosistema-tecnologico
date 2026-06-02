import { useState, useEffect } from "react"
import API from "../services/api"
import { PageHeader, Toast, KPICard, EmptyState, SearchBar, Tabs, ModalForm, Field } from "../components/UI"

const NIVELES = [
  { nombre: "Bronce",   min: 0,    max: 99,   color: "#CD7F32", icon: "🥉" },
  { nombre: "Plata",    min: 100,  max: 499,  color: "#C0C0C0", icon: "🥈" },
  { nombre: "Oro",      min: 500,  max: 999,  color: "#FFD700", icon: "🥇" },
  { nombre: "Platino",  min: 1000, max: 99999, color: "#10B981", icon: "💎" },
]

const getNivel = (puntos) => NIVELES.find(n => puntos >= n.min && puntos <= n.max) || NIVELES[0]

export default function Fidelizacion() {
  const [clientes, setClientes]     = useState([])
  const [inactivos, setInactivos]   = useState([])
  const [promociones, setPromociones] = useState([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState("clientes")
  const [mensaje, setMensaje]       = useState("")
  const [modalPuntos, setModalPuntos] = useState(null)
  const [modalCanje, setModalCanje]   = useState(null)
  const [puntosForm, setPuntosForm]   = useState({ puntos: 0, descripcion: "" })
  const [buscar, setBuscar]           = useState("")

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const [res, inac, promos] = await Promise.all([
        API.get("/fidelizacion/resumen/"),
        API.get("/fidelizacion/clientes_inactivos/"),
        API.get("/promociones/"),
      ])
      setClientes(res.data)
      setInactivos(inac.data)
      setPromociones(promos.data.results || promos.data)
    } catch(e) { mostrarMensaje("❌ Error al cargar") }
    setLoading(false)
  }

  const mostrarMensaje = (msg) => {
    setMensaje(msg)
    setTimeout(() => setMensaje(""), 3000)
  }

  const agregarPuntos = async () => {
    if (!puntosForm.puntos || !puntosForm.descripcion) {
      mostrarMensaje("❌ Completa todos los campos")
      return
    }
    try {
      await API.post("/fidelizacion/agregar_puntos/", {
        cliente_id: modalPuntos.id,
        puntos: parseInt(puntosForm.puntos),
        descripcion: puntosForm.descripcion
      })
      mostrarMensaje(`✅ ${puntosForm.puntos} puntos agregados a ${modalPuntos.nombre}`)
      setModalPuntos(null)
      setPuntosForm({ puntos: 0, descripcion: "" })
      cargar()
    } catch { mostrarMensaje("❌ Error al agregar puntos") }
  }

  const canjear = async (promo) => {
    if (!window.confirm(`¿Canjear "${promo.nombre}" por ${promo.puntos_req} puntos?`)) return
    try {
      await API.post("/fidelizacion/canjear/", {
        cliente_id: modalCanje.id,
        promo_id: promo.id
      })
      mostrarMensaje(`✅ Canje exitoso: ${promo.nombre}`)
      setModalCanje(null)
      cargar()
    } catch(e) {
      mostrarMensaje("❌ " + (e.response?.data?.error || "Error al canjear"))
    }
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    c.telefono?.includes(buscar)
  )

  const totalPuntos = clientes.reduce((s, c) => s + c.puntos, 0)
  const clientesActivos = clientes.filter(c => !c.inactivo).length

  return (
    <div>
      <Toast mensaje={mensaje} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700",
            color: "var(--text)", marginBottom: "4px" }}>Fidelización</h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>
            Programa de puntos y promociones ARM Racing
          </p>
        </div>
        <button className="btn btn-primary" onClick={cargar}>↻ Actualizar</button>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {[
          { titulo: "Clientes activos", valor: clientesActivos, color: "#10B981", icon: "✅" },
          { titulo: "Inactivos +3 meses", valor: inactivos.length, color: "#F59E0B", icon: "⏰" },
          { titulo: "Total puntos emitidos", valor: totalPuntos.toLocaleString(), color: "#8B5CF6", icon: "⭐" },
          { titulo: "Promociones activas", valor: promociones.length, color: "#3B82F6", icon: "🎁" },
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
                <div style={{ fontSize: "28px", fontWeight: "700", color: k.color }}>
                  {k.valor}
                </div>
              </div>
              <div style={{ fontSize: "28px" }}>{k.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "1.5rem",
        borderBottom: "1px solid var(--border)" }}>
        {[
          { key: "clientes", label: "👥 Todos los clientes" },
          { key: "inactivos", label: `⏰ Inactivos (${inactivos.length})` },
          { key: "promociones", label: "🎁 Promociones" },
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
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
          Cargando...
        </div>
      ) : (
        <>
          {/* Tab clientes */}
          {tab === "clientes" && (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <input value={buscar} onChange={e => setBuscar(e.target.value)}
                  placeholder="Buscar cliente..." style={{ width: "280px" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {clientesFiltrados.map(c => {
                  const nivel = getNivel(c.puntos)
                  return (
                    <div key={c.id} style={{
                      background: "var(--bg2)", border: "1px solid var(--border)",
                      borderRadius: "var(--radius-lg)", padding: "1.25rem",
                      display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap"
                    }}>
                      {/* Avatar nivel */}
                      <div style={{
                        width: "48px", height: "48px", borderRadius: "50%",
                        background: nivel.color + "22", border: `2px solid ${nivel.color}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "22px", flexShrink: 0
                      }}>{nivel.icon}</div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: "150px" }}>
                        <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "15px" }}>
                          {c.nombre}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
                          📞 {c.telefono} · {c.total_ordenes} órdenes
                          {c.inactivo && <span style={{ color: "#F59E0B", marginLeft: "8px" }}>⏰ Inactivo</span>}
                        </div>
                      </div>

                      {/* Puntos y nivel */}
                      <div style={{ textAlign: "center", minWidth: "80px" }}>
                        <div style={{ fontSize: "22px", fontWeight: "700", color: nivel.color }}>
                          {c.puntos}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text3)" }}>puntos</div>
                        <div style={{ fontSize: "11px", fontWeight: "600", color: nivel.color }}>
                          {nivel.nombre}
                        </div>
                      </div>

                      {/* Próxima promo */}
                      {c.proxima_promo && (
                        <div style={{
                          background: "#8B5CF622", border: "1px solid #8B5CF644",
                          borderRadius: "8px", padding: "8px 12px", minWidth: "160px"
                        }}>
                          <div style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "2px" }}>
                            Próxima recompensa
                          </div>
                          <div style={{ fontSize: "12px", fontWeight: "600", color: "#8B5CF6" }}>
                            {c.proxima_promo.imagen} {c.proxima_promo.nombre}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "2px" }}>
                            Faltan {c.proxima_promo.puntos_faltan} puntos
                          </div>
                          {/* Barra progreso */}
                          <div style={{ height: "4px", background: "var(--border2)",
                            borderRadius: "2px", marginTop: "6px" }}>
                            <div style={{
                              height: "100%", borderRadius: "2px", background: "#8B5CF6",
                              width: `${Math.min((c.puntos / c.proxima_promo.puntos_req) * 100, 100)}%`
                            }}/>
                          </div>
                        </div>
                      )}

                      {/* Acciones */}
                      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                        <button onClick={() => { setModalPuntos(c); setPuntosForm({ puntos: 0, descripcion: "" }) }}
                          style={{ background: "#065F46", border: "1px solid #10B981",
                            color: "#10B981", borderRadius: "8px", padding: "6px 12px",
                            fontSize: "12px", cursor: "pointer" }}>
                          ⭐ Puntos
                        </button>
                        <button onClick={() => setModalCanje(c)}
                          style={{ background: "#1E3A5F", border: "1px solid #3B82F6",
                            color: "#3B82F6", borderRadius: "8px", padding: "6px 12px",
                            fontSize: "12px", cursor: "pointer" }}>
                          🎁 Canjear
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Tab inactivos */}
          {tab === "inactivos" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {inactivos.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
                  No hay clientes inactivos
                </div>
              ) : inactivos.map(c => (
                <div key={c.id} style={{
                  background: "var(--bg2)", border: "1px solid #F59E0B44",
                  borderRadius: "var(--radius-lg)", padding: "1.25rem",
                  display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap"
                }}>
                  <div style={{ fontSize: "32px" }}>⏰</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "600", color: "var(--text)" }}>{c.nombre}</div>
                    <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
                      📞 {c.telefono}
                      {c.dias_sin_visita && ` · Sin visita hace ${c.dias_sin_visita} días`}
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "#F59E0B" }}>
                      {c.puntos}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text3)" }}>puntos</div>
                  </div>
                  <a href={`https://wa.me/57${c.telefono?.replace(/\D/g, '')}`}
                    target="_blank" rel="noreferrer"
                    style={{ background: "#25D36622", border: "1px solid #25D366",
                      color: "#25D366", borderRadius: "8px", padding: "6px 12px",
                      fontSize: "12px", textDecoration: "none" }}>
                    💬 WhatsApp
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Tab promociones */}
          {tab === "promociones" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem" }}>
              {promociones.map(p => (
                <div key={p.id} style={{
                  background: "var(--bg2)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)", padding: "1.5rem", textAlign: "center"
                }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>{p.imagen}</div>
                  <div style={{ fontWeight: "700", color: "var(--text)", fontSize: "16px",
                    marginBottom: "8px" }}>{p.nombre}</div>
                  <div style={{ fontSize: "13px", color: "var(--text3)", marginBottom: "16px" }}>
                    {p.descripcion}
                  </div>
                  <div style={{
                    background: "#8B5CF622", border: "1px solid #8B5CF644",
                    borderRadius: "8px", padding: "10px",
                  }}>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: "#8B5CF6" }}>
                      {p.puntos_req}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text3)" }}>puntos requeridos</div>
                  </div>
                  {p.tipo === "descuento" && (
                    <div style={{ marginTop: "8px", fontSize: "13px", color: "#10B981" }}>
                      {p.valor}% de descuento
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal agregar puntos */}
      {modalPuntos && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "1.5rem",
            width: "100%", maxWidth: "400px" }}>
            <h2 style={{ marginBottom: "4px", color: "var(--text)", fontSize: "18px" }}>
              Agregar puntos
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "1.5rem" }}>
              {modalPuntos.nombre} — {modalPuntos.puntos} puntos actuales
            </p>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                Puntos a agregar
              </label>
              <input type="number" value={puntosForm.puntos}
                onChange={e => setPuntosForm({...puntosForm, puntos: e.target.value})}
                style={{ width: "100%" }} />
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                Descripción
              </label>
              <input value={puntosForm.descripcion}
                onChange={e => setPuntosForm({...puntosForm, descripcion: e.target.value})}
                placeholder="Ej: Mantenimiento preventivo" style={{ width: "100%" }} />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-primary" onClick={agregarPuntos} style={{ flex: 1 }}>
                ⭐ Agregar puntos
              </button>
              <button className="btn btn-secondary" onClick={() => setModalPuntos(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal canjear */}
      {modalCanje && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "1.5rem",
            width: "100%", maxWidth: "440px" }}>
            <h2 style={{ marginBottom: "4px", color: "var(--text)", fontSize: "18px" }}>
              Canjear promoción
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "1.5rem" }}>
              {modalCanje.nombre} — {modalCanje.puntos} puntos disponibles
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px",
              marginBottom: "1.5rem" }}>
              {promociones.map(p => {
                const puede = modalCanje.puntos >= p.puntos_req
                return (
                  <div key={p.id} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px", borderRadius: "10px",
                    background: puede ? "#065F4622" : "var(--bg1)",
                    border: `1px solid ${puede ? "#10B981" : "var(--border)"}`,
                    opacity: puede ? 1 : 0.5
                  }}>
                    <span style={{ fontSize: "24px" }}>{p.imagen}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: "600",
                        color: puede ? "#10B981" : "var(--text2)" }}>
                        {p.nombre}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text3)" }}>
                        {p.puntos_req} puntos
                        {!puede && ` · Faltan ${p.puntos_req - modalCanje.puntos}`}
                      </div>
                    </div>
                    {puede && (
                      <button onClick={() => canjear(p)} style={{
                        background: "#10B981", border: "none", color: "white",
                        borderRadius: "6px", padding: "6px 12px",
                        fontSize: "12px", cursor: "pointer"
                      }}>Canjear</button>
                    )}
                  </div>
                )
              })}
            </div>
            <button className="btn btn-secondary" onClick={() => setModalCanje(null)}
              style={{ width: "100%" }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}
