import { useState, useEffect } from "react"
import { clientesAPI } from "../services/api"
import FormCliente from "../components/FormCliente"

export default function Clientes() {
  const [clientes, setClientes]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [buscar, setBuscar]             = useState("")
  const [showForm, setShowForm]         = useState(false)
  const [clienteEditar, setClienteEditar] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { cargarClientes() }, [])

  const cargarClientes = () => {
    setLoading(true)
    clientesAPI.listar().then(res => {
      setClientes(res.data.results || res.data)
      setLoading(false)
    })
  }

  const handleEditar = (cliente) => {
    setClienteEditar(cliente)
    setShowForm(true)
  }

  const handleEliminar = async (id) => {
    await clientesAPI.eliminar(id)
    setConfirmDelete(null)
    cargarClientes()
  }

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
    c.documento.includes(buscar)
  )

  const tipoBadge = {
    regular:   { bg: "#1F2937", color: "#9CA3AF" },
    frecuente: { bg: "#1E3A5F", color: "#3B82F6" },
    premium:   { bg: "#451A03", color: "#F59E0B" },
    inactivo:  { bg: "#3B0A0A", color: "#EF4444" },
  }

  return (
    <div>
      {/* Modal confirmar eliminar */}
      {confirmDelete && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem"
        }}>
          <div style={{
            background: "var(--bg2)", borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)", width: "100%", maxWidth: "400px",
            padding: "1.5rem"
          }}>
            <div style={{ fontWeight: "600", color: "var(--text)", marginBottom: "8px", fontSize: "16px" }}>
              ¿Eliminar cliente?
            </div>
            <div style={{ color: "var(--text3)", fontSize: "13px", marginBottom: "1.5rem" }}>
              Esta acción no se puede deshacer. Se eliminará <strong style={{ color: "var(--text)" }}>{confirmDelete.nombre}</strong> permanentemente.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>
                Cancelar
              </button>
              <button
                className="btn"
                onClick={() => handleEliminar(confirmDelete.id)}
                style={{ background: "#7F1D1D", color: "#FCA5A5", border: "1px solid #EF4444" }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <FormCliente
          clienteEditar={clienteEditar}
          onGuardado={() => { setShowForm(false); setClienteEditar(null); cargarClientes() }}
          onCancelar={() => { setShowForm(false); setClienteEditar(null) }}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text)", marginBottom: "4px" }}>
            Clientes
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>
            {clientes.length} clientes registrados
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setClienteEditar(null); setShowForm(true) }}>
          + Nuevo cliente
        </button>
      </div>

      <div className="card">
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
          <input value={buscar} onChange={e => setBuscar(e.target.value)}
            placeholder="Buscar por nombre o documento..."
            style={{ width: "280px" }} />
        </div>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>Cargando...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th><th>Documento</th><th>Teléfono</th>
                <th>Ciudad</th><th>Tipo</th><th>Puntos</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(c => (
                <tr key={c.id}>
                  <td style={{ color: "var(--text)", fontWeight: "500" }}>{c.nombre}</td>
                  <td style={{ fontFamily: "DM Mono, monospace", fontSize: "12px" }}>{c.documento}</td>
                  <td>{c.telefono}</td>
                  <td>{c.ciudad || "—"}</td>
                  <td>
                    <span className="badge" style={{
                      background: tipoBadge[c.tipo]?.bg || "#1F2937",
                      color: tipoBadge[c.tipo]?.color || "#9CA3AF"
                    }}>{c.tipo}</span>
                  </td>
                  <td style={{ color: "var(--green)" }}>{c.puntos} pts</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => handleEditar(c)}
                        style={{
                          background: "#1E3A5F", border: "1px solid #3B82F6",
                          color: "#3B82F6", borderRadius: "6px",
                          padding: "4px 10px", fontSize: "12px", cursor: "pointer"
                        }}>✏️</button>
                      <button
                        onClick={() => setConfirmDelete(c)}
                        style={{
                          background: "#3B0A0A", border: "1px solid #EF4444",
                          color: "#EF4444", borderRadius: "6px",
                          padding: "4px 10px", fontSize: "12px", cursor: "pointer"
                        }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
