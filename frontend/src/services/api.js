import axios from "axios"

const API = axios.create({
  baseURL: "http://192.168.0.8:8000/api",
  headers: { "Content-Type": "application/json" }
})

API.interceptors.request.use(config => {
  const token = localStorage.getItem("access")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const clientesAPI = {
  listar:   () => API.get("/clientes/"),
  obtener:  (id) => API.get(`/clientes/${id}/`),
  crear:    (data) => API.post("/clientes/", data),
  editar:   (id, data) => API.put(`/clientes/${id}/`, data),
  eliminar: (id) => API.delete(`/clientes/${id}/`),
}

export const vehiculosAPI = {
  listar:   () => API.get("/vehiculos/"),
  obtener:  (id) => API.get(`/vehiculos/${id}/`),
  crear:    (data) => API.post("/vehiculos/", data),
  editar:   (id, data) => API.put(`/vehiculos/${id}/`, data),
}

export const ordenesAPI = {
  listar:   () => API.get("/ordenes/"),
  obtener:  (id) => API.get(`/ordenes/${id}/`),
  crear:    (data) => API.post("/ordenes/", data),
  editar:   (id, data) => API.put(`/ordenes/${id}/`, data),
}

export const productosAPI = {
  listar:   () => API.get("/productos/"),
  crear:    (data) => API.post("/productos/", data),
  editar:   (id, data) => API.put(`/productos/${id}/`, data),
}

export const facturasAPI = {
  listar:   () => API.get("/facturas/"),
  crear:    (data) => API.post("/facturas/", data),
  editar:   (id, data) => API.put(`/facturas/${id}/`, data),
}

export default API