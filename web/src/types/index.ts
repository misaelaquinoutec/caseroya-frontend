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
  rol?: string;
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
  nombre?: string;
  nombreRazonSocial?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  activo?: boolean;
}

export interface ClienteRequest {
  nombre: string;
  numeroDocumento: string;
  tipoDocumentoId: number;
  telefono: string;
  direccion: string;
}

export interface Proveedor {
  id: number;
  razonSocial: string;
  ruc: string;
  tipoDocumentoId: number;
  telefono?: string;
  direccion?: string;
  activo?: boolean;
}

export interface ProveedorRequest {
  razonSocial: string;
  ruc: string;
  tipoDocumentoId: number;
  telefono: string;
  direccion: string;
}

export interface RegistrarCompraDto {
  numeroDocumento: string;
  proveedorId: number;
  usuarioId: string;
  monedaId: number;
  detalles: {
    productoId: number;
    cantidad: number;
    precioUnitario: number;
  }[];
}

export interface DocumentoCompra {
  id: number;
  numeroDocumento: string;
  fechaEmision?: string;
  subtotal: number;
  igv: number;
  total: number;
  anulado?: boolean;
  proveedor?: { id: number; razonSocial?: string; ruc?: string };
  usuario?: { codigoUsuario: string; nombre?: string };
  moneda?: { id: number; codigo?: string };
  detalles?: {
    id?: number;
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    subtotal?: number;
  }[];
}

export interface UsuarioSistema {
  codigoUsuario: string;
  nombre: string;
  perfilId: string;
  activo?: boolean;
}

export interface UsuarioRequest {
  codigoUsuario: string;
  clave?: string;
  nombre: string;
  perfilId: string;
}

export interface PerfilSistema {
  codigoPerfil: string;
  nombrePerfil: string;
  activo?: boolean;
}

export interface Producto {
  id: number;
  codigo?: string;
  nombre: string;
  categoria?: string;
  unidadMedida?: string;
  descripcion?: string;
  precioVenta?: number;
  precioCompra?: number;
  precioBase: number;
  categoriaId?: number;
  stockActual?: number;
  activo?: boolean;
}

export interface ProductoRequest {
  codigo: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  precioVenta: number;
  precioCompra: number;
  usuario: string;
}

export interface ControlStock {
  productoId: number;
  cantidadActual: number;
  actualizadoEn?: string;
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
  numeroDocumento?: string;
  numeroVenta?: string;
  clienteId?: number;
  cliente?: { id: number; nombre?: string; numeroDocumento?: string };
  nombreCliente?: string;
  usuarioId?: string;
  usuario?: { codigoUsuario: string; nombre?: string };
  monedaId?: number;
  subtotal: number;
  igv: number;
  total: number;
  anulado?: boolean;
  estado?: 'REGISTRADO' | 'ANULADO' | string;
  fechaEmision?: string;
  fechaCreacion?: string;
  detalles?: DetalleVenta[];
}

export interface RegistrarVentaDto {
  numeroDocumento?: string;
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
