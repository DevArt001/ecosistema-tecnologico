import { StrictMode, useState, useEffect } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import Clientes from "./pages/Clientes"
import Vehiculos from "./pages/Vehiculos"
import Ordenes from "./pages/Ordenes"
import Inventario from "./pages/Inventario"
import Facturas from "./pages/Facturas"
import Login from "./pages/Login"
import "./index.css"

function App() {
  const [token, setToken] = useState(localStorage.getItem("access"))

  const handleLogin = (accessToken) => {
    setToken(accessToken)
  }

  const handleLogout = () => {
    localStorage.removeItem("access")
    localStorage.removeItem("refresh")
    setToken(null)
  }

  if (!token) return <Login onLogin={handleLogin} />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout onLogout={handleLogout} />}>
          <Route index element={<Dashboard />} />
          <Route path="clientes"    element={<Clientes />} />
          <Route path="vehiculos"   element={<Vehiculos />} />
          <Route path="ordenes"     element={<Ordenes />} />
          <Route path="inventario"  element={<Inventario />} />
          <Route path="facturas"    element={<Facturas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById("root")).render(
  <StrictMode><App /></StrictMode>
)