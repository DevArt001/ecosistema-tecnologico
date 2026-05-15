import axios from "axios"

const API = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" }
})

API.interceptors.request.use(config => {
  const token = localStorage.getItem("access")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const clientesAPI = {
  listar:   ()         => API.get("/clientes/"),
  obtener:  (id)       => API.get(`/clientes/${id}/`),
  crear:    (data)     => API.post("/clientes/", data),
  editar:   (id, data) => API.put(`/clientes/${id}/`, data),
  eliminar: (id)       => API.delete(`/clientes/${id}/`),
}

export const vehiculosAPI = {
  listar:   ()         => API.get("/vehiculos/"),
  obtener:  (id)       => API.get(`/vehiculos/${id}/`),
  crear:    (data)     => API.post("/vehiculos/", data),
  editar:   (id, data) => API.put(`/vehiculos/${id}/`, data),
  eliminar: (id)       => API.delete(`/vehiculos/${id}/`),
}

export const ordenesAPI = {
  listar:        ()               => API.get("/ordenes/"),
  obtener:       (id)             => API.get(`/ordenes/${id}/`),
  crear:         (data)           => API.post("/ordenes/", data),
  editar:        (id, data)       => API.put(`/ordenes/${id}/`, data),
  eliminar:      (id)             => API.delete(`/ordenes/${id}/`),
  cambiarEstado: (id, estado)     => API.patch(`/ordenes/${id}/`, { estado }),
  convertirOrden:(id)             => API.post(`/agendamiento/citas/${id}/convertir-orden/`),
}

export const productosAPI = {
  listar:   ()         => API.get("/productos/"),
  obtener:  (id)       => API.get(`/productos/${id}/`),
  crear:    (data)     => API.post("/productos/", data),
  editar:   (id, data) => API.put(`/productos/${id}/`, data),
  eliminar: (id)       => API.delete(`/productos/${id}/`),
}

export const facturasAPI = {
  listar:   ()         => API.get("/facturas/"),
  obtener:  (id)       => API.get(`/facturas/${id}/`),
  crear:    (data)     => API.post("/facturas/", data),
  editar:   (id, data) => API.put(`/facturas/${id}/`, data),
  eliminar: (id)       => API.delete(`/facturas/${id}/`),
}

export const agendamientoAPI = {
  listarCitas:      (params) => API.get("/agendamiento/citas/", { params }),
  obtenerCita:      (id)     => API.get(`/agendamiento/citas/${id}/`),
  editarCita:       (id, data) => API.patch(`/agendamiento/citas/${id}/`, data),
  eliminarCita:     (id)     => API.delete(`/agendamiento/citas/${id}/`),
  listarConfig:     ()       => API.get("/agendamiento/config-taller/"),
  listarFestivos:   ()       => API.get("/agendamiento/dias-especiales/"),
  crearFestivo:     (data)   => API.post("/agendamiento/dias-especiales/", data),
  eliminarFestivo:  (id)     => API.delete(`/agendamiento/dias-especiales/${id}/`),
  buscarCliente:       (documento) => API.post("/agendamiento/publico/buscar-cliente/", { documento }),
  registrarCliente:    (data)      => API.post("/agendamiento/publico/registrar-cliente/", data),
  registrarVehiculo:   (data)      => API.post("/agendamiento/publico/registrar-vehiculo/", data),
  disponibilidadMes:   (mes, anio) => API.get("/agendamiento/publico/disponibilidad/", { params: { mes, anio } }),
  horasDisponibles:    (fecha)     => API.get("/agendamiento/publico/horas-disponibles/", { params: { fecha } }),
  crearCita:           (data)      => API.post("/agendamiento/publico/crear-cita/", data),
  citaEspecial:        (data)      => API.post("/agendamiento/publico/cita-especial/", data),
}

export const portalAPI = {
  generarLink: (ordenId) => API.post(`/agendamiento/ordenes/${ordenId}/generar-link/`),
  accederPortal: (token) => API.get(`/agendamiento/portal/${token}/`),
}

export default API

export const procesosAPI = {
  agregarPaso: (ordenId, data) => API.post(`/servicios/ordenes/${ordenId}/agregar-paso/`, data),
  agregarFoto: (ordenId, formData) => API.post(`/servicios/ordenes/${ordenId}/agregar-foto/`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  obtenerDetalles: (ordenId) => API.get(`/servicios/ordenes/${ordenId}/detalles/`),
}
