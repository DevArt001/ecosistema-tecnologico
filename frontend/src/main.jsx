import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import Clientes from "./pages/Clientes"
import Vehiculos from "./pages/Vehiculos"
import Ordenes from "./pages/Ordenes"
import Inventario from "./pages/Inventario"
import Facturas from "./pages/Facturas"
import "./index.css"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clientes"   element={<Clientes />} />
          <Route path="vehiculos"  element={<Vehiculos />} />
          <Route path="ordenes"    element={<Ordenes />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="facturas"   element={<Facturas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)