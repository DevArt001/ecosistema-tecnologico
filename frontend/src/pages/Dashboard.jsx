import { useState, useEffect } from "react"
import { clientesAPI, ordenesAPI, productosAPI, facturasAPI } from "../services/api"

const estadoConfig = {
  recibido:    { color: "#9CA3AF", bg: "#1F293788", label: "Recibido" },
  diagnostico: { color: "#F59E0B", bg: "#45190388", label: "Diagnóstico" },
  en_proceso:  { color: "#10B981", bg: "#065F4688", label: "En proceso" },
  finalizado:  { color: "#3B82F6", bg: "#1E3A5F88", label: "Finalizado" },
  entregado:   { color: "#6B7280", bg: "#1F293788", label: "Entregado" },
}

function StatCard({ titulo, valor, color, sub, trend }) {
  return (
    <div style={{
      flex: 1, minWidth: "160px", padding: "1.25rem",
      background: "var(--bg2)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        background: color
      }}/>
      <div style={{ fontSize: "11px", color: "var(--text3)", fontWeight: "600",
        textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "10px" }}>
        {titulo}
      </div>
      <div style={{ fontSize: "36px", fontWeight: "700", color, lineHeight: 1, marginBottom: "6px" }}>
        {valor}
      </div>
      <div style={{ fontSize: "12px", color: "var(--text3)" }}>{sub}</div>
    </div>
  )
}

function OrdenRow({ orden }) {
  const s = estadoConfig[orden.estado] || estadoConfig.recibido
  return (
    <tr>
      <td style={{ fontFamily: "monospace", fontSize: "12px", color: "#10B981", fontWeight: "600" }}>
        {orden.codigo}
      </td>
      <td style={{ color: "var(--text)", fontWeight: "500" }}>{orden.cliente_nombre || "—"}</td>
      <td style={{ fontSize: "12px" }}>{orden.vehiculo_placa || "—"}</td>
      <td>
        <span style={{
          background: s.bg, color: s.color, padding: "3px 10px",
          borderRadius: "20px", fontSize: "11px", fontWeight: "600"
        }}>{s.label}</span>
      </td>
      <td style={{ color: "#10B981", fontWeight: "600" }}>
        ${Number(orden.costo_final || 0).toLocaleString("es-CO")}
      </td>
    </tr>
  )
}

export default function Dashboard() {
  const [stats, setStats]     = useState({ clientes: 0, ordenes: 0, productos: 0, facturas: 0 })
  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const username = localStorage.getItem("username") || "Admin"
  const rol      = localStorage.getItem("rol") || "admin"

  const hora = new Date().getHours()
  const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches"

  useEffect(() => { cargar() }, [])

  const cargar = () => {
    setLoading(true)
    setError(null)
    Promise.all([
      clientesAPI.listar(),
      ordenesAPI.listar(),
      productosAPI.listar(),
      facturasAPI.listar(),
    ]).then(([c, o, p, f]) => {
      const ords = o.data.results || o.data
      setStats({
        clientes:  (c.data.results || c.data).length,
        ordenes:   ords.length,
        productos: (p.data.results || p.data).length,
        facturas:  (f.data.results || f.data).length,
      })
      setOrdenes(ords.slice(0, 6))
    }).catch(err => setError(err.mensaje || "Error al cargar"))
    .finally(() => setLoading(false))
  }

  const ordenesActivas = ordenes.filter(o =>
    ["recibido","diagnostico","en_proceso"].includes(o.estado)
  ).length

  return (
    <div>
      {/* Header */}
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: "1.5rem 2rem",
        marginBottom: "1.5rem", display: "flex",
        justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <div style={{ fontSize: "22px", fontWeight: "700", color: "var(--text)" }}>
            {saludo}, {username} 👋
          </div>
          <div style={{ fontSize: "13px", color: "var(--text3)", marginTop: "4px" }}>
            {new Date().toLocaleDateString("es-CO", {
              weekday: "long", year: "numeric", month: "long", day: "numeric"
            })}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontSize: "11px", fontWeight: "700", textTransform: "uppercase",
            letterSpacing: ".1em", color: "#10B981",
            background: "#10B98122", border: "1px solid #10B98144",
            padding: "4px 12px", borderRadius: "20px"
          }}>{rol}</div>
          {ordenesActivas > 0 && (
            <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "6px" }}>
              {ordenesActivas} orden{ordenesActivas > 1 ? "es" : ""} activa{ordenesActivas > 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          background: "#3B0A0A", border: "1px solid #EF4444", borderRadius: "8px",
          padding: "12px 16px", marginBottom: "1.5rem", color: "#FCA5A5",
          fontSize: "13px", display: "flex", justifyContent: "space-between"
        }}>
          {error}
          <button onClick={cargar} style={{ background: "none", border: "none",
            color: "#FCA5A5", cursor: "pointer", textDecoration: "underline", fontSize: "12px" }}>
            Reintentar
          </button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <StatCard titulo="Clientes"  valor={stats.clientes}
          color="#10B981" sub="Registrados en el sistema" />
        <StatCard titulo="Órdenes"   valor={stats.ordenes}
          color="#8B5CF6" sub="Total órdenes de trabajo" />
        <StatCard titulo="Productos" valor={stats.productos}
          color="#F59E0B" sub="Ítems en inventario" />
        <StatCard titulo="Facturas"  valor={stats.facturas}
          color="#3B82F6" sub="Facturas emitidas" />
      </div>

      {/* Dos columnas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem",
        marginBottom: "1.5rem" }}>

        {/* Órdenes recientes */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)",
            display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "14px" }}>
                Órdenes recientes
              </div>
              <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
                Últimas 6 órdenes
              </div>
            </div>
            <a href="/ordenes" style={{ fontSize: "12px", color: "#10B981",
              textDecoration: "none", fontWeight: "500" }}>
              Ver todas →
            </a>
          </div>
          {loading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
              Cargando...
            </div>
          ) : ordenes.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
              No hay órdenes todavía
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Código</th><th>Cliente</th><th>Placa</th>
                  <th>Estado</th><th>Costo</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map(o => <OrdenRow key={o.id} orden={o} />)}
              </tbody>
            </table>
          )}
        </div>

        {/* Panel derecho */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Estado de órdenes */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
            <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "14px",
              marginBottom: "1rem" }}>Estado de órdenes</div>
            {Object.entries(estadoConfig).map(([key, s]) => {
              const count = ordenes.filter(o => o.estado === key).length
              return (
                <div key={key} style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "center", padding: "6px 0",
                  borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%",
                      background: s.color }}/>
                    <span style={{ fontSize: "13px", color: "var(--text2)" }}>{s.label}</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: s.color }}>
                    {count}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Links públicos */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
            <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "14px",
              marginBottom: "1rem" }}>Links públicos</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Agendar cita",  url: "/agendar", color: "#10B981", desc: "Clientes agendan online" },
                { label: "Página pública", url: "/public",  color: "#3B82F6", desc: "Info del taller" },
                { label: "Portal cliente", url: "/portal",  color: "#8B5CF6", desc: "Estado de la moto" },
              ].map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noreferrer"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 12px", borderRadius: "8px", textDecoration: "none",
                    background: link.color + "11", border: `1px solid ${link.color}33`,
                  }}>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: link.color }}>
                      {link.label}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text3)" }}>{link.desc}</div>
                  </div>
                  <span style={{ color: link.color, fontSize: "14px" }}>→</span>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
