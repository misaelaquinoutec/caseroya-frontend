import api from './api';
import type { Cliente, Producto } from '../types';

export const productoService = {
  obtenerProductos: async (signal?: AbortSignal): Promise<Producto[]> => {
    const response = await api.get<Producto[]>('/productos', { signal });
    return response.data;
  },

  obtenerStock: async (signal?: AbortSignal) => {
    const response = await api.get('/stock', { signal });
    return response.data;
  },
};

export const clienteService = {
  obtenerClientes: async (signal?: AbortSignal): Promise<Cliente[]> => {
    const response = await api.get<Cliente[]>('/clientes', { signal });
    return response.data;
  },
};
