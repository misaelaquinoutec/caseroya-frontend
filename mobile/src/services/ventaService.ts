import api from './api';

export interface MobileVenta {
  id: number;
  clienteId: number;
  usuarioId: string;
  total: number;
  estado: string;
  fechaCreacion?: string;
}

export const ventaService = {
  obtenerVentas: async (): Promise<MobileVenta[]> => {
    const response = await api.get('/ventas?page=0&size=20');
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.content)) return response.data.content;
    return [];
  },

  registrarVentaExpress: async (data: {
    clienteId: number;
    usuarioId: string;
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    ubicacion?: { lat: number; lng: number };
  }) => {
    const payload = {
      clienteId: data.clienteId,
      usuarioId: data.usuarioId,
      monedaId: 1,
      detalles: [
        {
          productoId: data.productoId,
          cantidad: data.cantidad,
          precioUnitario: data.precioUnitario,
        },
      ],
    };
    const response = await api.post('/ventas', payload);
    return response.data;
  },
};
