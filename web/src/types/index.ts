export interface User {
  codigoUsuario: string;
  nombre?: string;
  perfilId?: string;
  token?: string;
}

export interface AuthResponse {
  token: string;
  codigoUsuario?: string;
  perfilId?: string;
  nombre?: string;
}

export interface LoginCredentials {
  codigoUsuario: string;
  clave: string;
}

export interface Cliente {
  id: number;
  tipoDocumentoId: number;
  numeroDocumento: string;
  nombreRazonSocial: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precioBase: number;
  categoriaId?: number;
  stockActual?: number;
}

export interface DetalleVenta {
  id?: number;
  productoId: number;
  nombreProducto?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
}

export interface Venta {
  id: number;
  numeroVenta?: string;
  clienteId: number;
  nombreCliente?: string;
  usuarioId: string;
  monedaId: number;
  subtotal: number;
  igv: number;
  total: number;
  estado: 'REGISTRADO' | 'ANULADO' | string;
  fechaCreacion: string;
  detalles?: DetalleVenta[];
}

export interface RegistrarVentaDto {
  clienteId: number;
  usuarioId: string;
  monedaId: number;
  detalles: {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
  }[];
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
