import api from './api';
import type {
  Cliente,
  ClienteRequest,
  ControlStock,
  DocumentoCompra,
  PerfilSistema,
  Producto,
  ProductoRequest,
  Proveedor,
  ProveedorRequest,
  RegistrarCompraDto,
  UsuarioRequest,
  UsuarioSistema,
} from '../types';

export const productoService = {
  obtenerProductos: async (signal?: AbortSignal): Promise<Producto[]> => {
    const [prodRes, stockRes] = await Promise.all([
      api.get<Producto[]>('/productos', { signal }),
      api.get<ControlStock[]>('/stock', { signal }).catch(() => ({ data: [] as ControlStock[] })),
    ]);

    const stockMap = new Map<number, number>();
    if (Array.isArray(stockRes.data)) {
      stockRes.data.forEach((s) => {
        stockMap.set(Number(s.productoId), Number(s.cantidadActual));
      });
    }

    return (prodRes.data || []).map((p) => {
      const precio = Number(p.precioVenta ?? p.precioBase ?? 0);
      return {
        ...p,
        precioVenta: precio,
        precioBase: precio,
        descripcion: p.categoria ? `${p.categoria} (${p.unidadMedida || 'UND'})` : p.descripcion,
        stockActual: stockMap.has(Number(p.id)) ? stockMap.get(Number(p.id)) : (p.stockActual ?? 0),
      };
    });
  },

  obtenerStock: async (signal?: AbortSignal): Promise<ControlStock[]> => {
    const response = await api.get<ControlStock[]>('/stock', { signal });
    return response.data;
  },

  aumentarStock: async (idProducto: number, cantidad: number): Promise<ControlStock> => {
    const response = await api.put<ControlStock>(`/stock/${idProducto}/aumentar`, null, {
      params: { cantidad },
    });
    return response.data;
  },

  disminuirStock: async (idProducto: number, cantidad: number): Promise<ControlStock> => {
    const response = await api.put<ControlStock>(`/stock/${idProducto}/restar`, null, {
      params: { cantidad },
    });
    return response.data;
  },

  crearProducto: async (datos: ProductoRequest): Promise<Producto> => {
    const response = await api.post<Producto>('/productos', datos);
    return response.data;
  },

  actualizarProducto: async (id: number, datos: ProductoRequest): Promise<Producto> => {
    const response = await api.put<Producto>(`/productos/${id}`, datos);
    return response.data;
  },

  eliminarProducto: async (id: number, usuario: string): Promise<void> => {
    await api.delete(`/productos/${id}`, { params: { usuario } });
  },
};

export const clienteService = {
  obtenerClientes: async (signal?: AbortSignal): Promise<Cliente[]> => {
    const response = await api.get<Cliente[]>('/clientes', { signal });
    return response.data;
  },

  crearCliente: async (datos: ClienteRequest): Promise<Cliente> => {
    const response = await api.post<Cliente>('/clientes', datos);
    return response.data;
  },

  actualizarCliente: async (id: number, datos: ClienteRequest): Promise<Cliente> => {
    const response = await api.put<Cliente>(`/clientes/${id}`, datos);
    return response.data;
  },

  eliminarCliente: async (id: number): Promise<void> => {
    await api.delete(`/clientes/${id}`);
  },
};

export const proveedorService = {
  obtenerProveedores: async (signal?: AbortSignal): Promise<Proveedor[]> => {
    const response = await api.get<Proveedor[]>('/proveedores', { signal });
    return response.data;
  },

  crearProveedor: async (datos: ProveedorRequest): Promise<Proveedor> => {
    const response = await api.post<Proveedor>('/proveedores', datos);
    return response.data;
  },

  actualizarProveedor: async (id: number, datos: ProveedorRequest): Promise<Proveedor> => {
    const response = await api.put<Proveedor>(`/proveedores/${id}`, datos);
    return response.data;
  },

  eliminarProveedor: async (id: number): Promise<void> => {
    await api.delete(`/proveedores/${id}`);
  },
};

export const compraService = {
  registrarCompra: async (datos: RegistrarCompraDto): Promise<DocumentoCompra> => {
    const response = await api.post<DocumentoCompra>('/compras', datos);
    return response.data;
  },

  obtenerCompraPorId: async (id: number, signal?: AbortSignal): Promise<DocumentoCompra> => {
    const response = await api.get<DocumentoCompra>(`/compras/${id}`, { signal });
    return response.data;
  },

  anularCompra: async (id: number): Promise<void> => {
    await api.put(`/compras/${id}/anular`);
  },
};

export const usuarioService = {
  obtenerUsuarios: async (signal?: AbortSignal): Promise<UsuarioSistema[]> => {
    const response = await api.get<UsuarioSistema[]>('/usuarios', { signal });
    return response.data;
  },

  crearUsuario: async (datos: UsuarioRequest): Promise<UsuarioSistema> => {
    const response = await api.post<UsuarioSistema>('/usuarios', datos);
    return response.data;
  },

  actualizarUsuario: async (id: string, datos: UsuarioRequest): Promise<UsuarioSistema> => {
    const response = await api.put<UsuarioSistema>(`/usuarios/${id}`, datos);
    return response.data;
  },

  eliminarUsuario: async (id: string): Promise<void> => {
    await api.delete(`/usuarios/${id}`);
  },

  obtenerPerfiles: async (signal?: AbortSignal): Promise<PerfilSistema[]> => {
    const response = await api.get<PerfilSistema[]>('/perfiles', { signal });
    return response.data;
  },
};
