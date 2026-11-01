import api from './api';
import type { RegistrarVentaDto, Venta } from '../types';

export const ventaService = {
  obtenerVentas: async (page = 0, size = 10, signal?: AbortSignal) => {
    const response = await api.get<{ content?: Venta[]; totalElements?: number } | Venta[]>('/ventas', {
      params: { page, size },
      signal,
    });
    return response.data;
  },

  obtenerVentaPorId: async (id: number, signal?: AbortSignal) => {
    const response = await api.get<Venta>(`/ventas/${id}`, { signal });
    return response.data;
  },

  registrarVenta: async (data: RegistrarVentaDto) => {
    const response = await api.post<Venta>('/ventas', data);
    return response.data;
  },

  anularVenta: async (id: number) => {
    const response = await api.put<Venta>(`/ventas/${id}/anular`);
    return response.data;
  },

  obtenerReporte: async (desde: string, hasta: string) => {
    const response = await api.get<Venta[]>('/reportes/ventas', {
      params: { desde, hasta },
    });
    return response.data;
  },
};
