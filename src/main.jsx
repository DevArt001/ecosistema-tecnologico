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
import "./index.css"

function App() {
  const [token, setToken] = useState(localStorage.getItem("access"))

  const handleLogin = (t) => setToken(t)
  const handleLogout = () => {
    localStorage.removeItem("access")
    localStorage.removeItem("refresh")
    setToken(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas — sin auth */}
        <Route path="/public" element={<Public />} />
        <Route path="/portal/:token" element={<Portal />} />
        <Route path="/portal/:token" element={<Portal />} />
        <Route path="/agendar" element={<Agendar />} />

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
