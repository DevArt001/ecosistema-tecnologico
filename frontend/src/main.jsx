import { StrictMode, useState } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import Clientes from "./pages/Clientes"
import Vehiculos from "./pages/Vehiculos"
import Ordenes from "./pages/Ordenes"
import Inventario from "./pages/Inventario"
import Facturas from "./pages/Facturas"
import Login from "./pages/Login"
import Agendar from "./pages/Agendar"
import Public from "./pages/Public"
import Agendamiento from "./pages/Agendamiento"
import Portal from "./pages/Portal"
import Cotizaciones from "./pages/Cotizaciones"
import Reportes from "./pages/Reportes"
import Usuarios from "./pages/Usuarios"
import Gastos from "./pages/Gastos"
import Diagnostico from "./pages/Diagnostico"
import Inteligencia from "./pages/Inteligencia"
import Fidelizacion from "./pages/Fidelizacion"
import Auditoria from "./pages/Auditoria"
import Nomina from "./pages/Nomina"
import Registro from "./pages/Registro"
import "./index.css"

function App() {
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem("access")
    if (!t) return null
    try {
      const payload = JSON.parse(atob(t.split(".")[1]))
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("access")
        localStorage.removeItem("refresh")
        localStorage.removeItem("rol")
        localStorage.removeItem("permisos")
        localStorage.removeItem("username")
        return null
      }
      return t
    } catch {
      localStorage.removeItem("access")
      localStorage.removeItem("refresh")
      return null
    }
  })

  const handleLogin = (t) => setToken(t)
  const handleLogout = () => {
    localStorage.clear()
    setToken(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas — sin auth */}
        <Route path="/public" element={<Public />} />
        <Route path="/portal/:token" element={<Portal />} />
        <Route path="/agendar" element={<Agendar />} />
        <Route path="/registro" element={<Registro />} />

        {/* Rutas privadas */}
        <Route path="*" element={
          !token ? <Login onLogin={handleLogin} /> : (
            <Routes>
              <Route path="/" element={<Layout onLogout={handleLogout} />}>
                <Route index element={<Dashboard />} />
                <Route path="clientes"     element={<Clientes />} />
                <Route path="vehiculos"    element={<Vehiculos />} />
                <Route path="ordenes"      element={<Ordenes />} />
                <Route path="inventario"   element={<Inventario />} />
                <Route path="facturas"     element={<Facturas />} />
                <Route path="agendamiento" element={<Agendamiento />} />
                <Route path="cotizaciones" element={<Cotizaciones />} />
                <Route path="reportes"      element={<Reportes />} />
                <Route path="usuarios"      element={<Usuarios />} />
                <Route path="gastos"        element={<Gastos />} />
                <Route path="diagnostico"   element={<Diagnostico />} />
                <Route path="inteligencia"  element={<Inteligencia />} />
                <Route path="fidelizacion"  element={<Fidelizacion />} />
                <Route path="auditoria"    element={<Auditoria />} />
                <Route path="nomina"       element={<Nomina />} />

              </Route>
            </Routes>
          )
        } />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById("root")).render(
  <StrictMode><App /></StrictMode>
)
