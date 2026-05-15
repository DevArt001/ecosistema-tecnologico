import { useState, useEffect } from "react"
import axios from "axios"

const API = "http://192.168.0.8:8000/api"

function App() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API}/clientes/`)
      .then(res => {
        setClientes(res.data.results || res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>ERP Taller — Clientes</h1>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={{ background: "#0F6E56", color: "white" }}>
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Teléfono</th>
              <th>Tipo</th>
              <th>Ciudad</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.documento}</td>
                <td>{c.telefono}</td>
                <td>{c.tipo}</td>
                <td>{c.ciudad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App