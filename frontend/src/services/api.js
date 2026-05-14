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

export default API
