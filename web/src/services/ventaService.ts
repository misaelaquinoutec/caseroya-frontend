import api from './api';
import type { RegistrarVentaDto, Venta } from '../types';

type RawVenta = Venta & {
  numeroDocumento?: string;
  fechaEmision?: string;
  anulado?: boolean;
  cliente?: {
    id?: number;
    nombre?: string;
  };
  usuario?: {
    codigoUsuario?: string;
    nombre?: string;
  };
  moneda?: {
    id?: number;
    codigo?: string;
  };
};

const normalizarVenta = (raw: RawVenta): Venta => ({
  ...raw,
  numeroVenta: raw.numeroVenta || raw.numeroDocumento,
  clienteId: raw.clienteId ?? raw.cliente?.id ?? 0,
  nombreCliente: raw.nombreCliente || raw.cliente?.nombre,
  usuarioId: raw.usuarioId || raw.usuario?.codigoUsuario || 'SISTEMA',
  monedaId: raw.monedaId ?? raw.moneda?.id ?? 5,
  fechaCreacion: raw.fechaCreacion || raw.fechaEmision,
  estado: raw.anulado ? 'ANULADO' : (raw.estado || 'REGISTRADO'),
  subtotal: Number(raw.subtotal ?? 0),
  igv: Number(raw.igv ?? 0),
  total: Number(raw.total ?? 0),
  detalles: Array.isArray(raw.detalles)
    ? raw.detalles.map((d) => ({
        ...d,
        cantidad: Number(d.cantidad ?? 0),
        precioUnitario: Number(d.precioUnitario ?? 0),
        subtotal: Number(d.subtotal ?? Number(d.cantidad ?? 0) * Number(d.precioUnitario ?? 0)),
      }))
    : [],
});

export const ventaService = {
  obtenerVentas: async (page = 0, size = 10, signal?: AbortSignal) => {
    const response = await api.get<{ content?: RawVenta[]; totalElements?: number } | RawVenta[]>('/ventas', {
      params: { page, size },
      signal,
    });
    const data = response.data;
    if (Array.isArray(data)) {
      return data.map(normalizarVenta);
    }
    if (data && 'content' in data && Array.isArray(data.content)) {
      return {
        ...data,
        content: data.content.map(normalizarVenta),
      };
    }
    return data;
  },

  obtenerVentaPorId: async (id: number, signal?: AbortSignal) => {
    const response = await api.get<RawVenta>(`/ventas/${id}`, { signal });
    return normalizarVenta(response.data);
  },

  registrarVenta: async (data: RegistrarVentaDto) => {
    const response = await api.post<RawVenta>('/ventas', data);
    return normalizarVenta(response.data);
  },

  anularVenta: async (id: number) => {
    const response = await api.put<RawVenta>(`/ventas/${id}/anular`);
    return normalizarVenta(response.data);
  },

  obtenerReporte: async (desde: string, hasta: string) => {
    const response = await api.get<RawVenta[]>('/reportes/ventas', {
      params: { desde, hasta },
    });
    return Array.isArray(response.data) ? response.data.map(normalizarVenta) : [];
  },
};
