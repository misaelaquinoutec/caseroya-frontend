import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';
import { Pagination } from '../components/common/Pagination';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { productoService } from '../services/productoService';
import type { Producto, ProductoRequest } from '../types';
import { Search, Plus, PackagePlus, Edit2, Trash2, RefreshCw } from 'lucide-react';

export const Inventario: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('TODAS');

  // Modal de Reabastecimiento de Stock
  const [stockModalProduct, setStockModalProduct] = useState<Producto | null>(null);
  const [stockCantidad, setStockCantidad] = useState<number>(10);
  const [stockModo, setStockModo] = useState<'AUMENTAR' | 'DISMINUIR'>('AUMENTAR');
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Modal de Crear / Editar Producto
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [formData, setFormData] = useState<ProductoRequest>({
    codigo: '',
    nombre: '',
    categoria: 'Abarrotes',
    unidadMedida: 'UND',
    precioVenta: 1.0,
    precioCompra: 0.8,
    usuario: user?.codigoUsuario || 'ADMIN01',
  });
  const [InitialStockNewProduct, setInitialStockNewProduct] = useState<number>(20);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const loadProductos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await productoService.obtenerProductos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'No se pudo cargar el inventario');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  const categorias = ['TODAS', ...Array.from(new Set(productos.map((p) => p.categoria || 'General')))];

  const filtered = productos.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (p.codigo && p.codigo.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
      (p.categoria && p.categoria.toLowerCase().includes(debouncedSearch.toLowerCase()));
    const matchesCategory = selectedCategoria === 'TODAS' || (p.categoria || 'General') === selectedCategoria;
    return matchesSearch && matchesCategory;
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    setPageSize,
  } = usePagination({
    totalItems: filtered.length,
    initialPage: 1,
    initialPageSize: 10,
  });

  const paginated = filtered.slice(startIndex, endIndex);

  const handleOpenStockModal = (prod: Producto) => {
    setStockModalProduct(prod);
    setStockModo('AUMENTAR');
    setStockCantidad(10);
  };

  const handleConfirmStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalProduct || stockCantidad <= 0) return;

    setIsUpdatingStock(true);
    try {
      if (stockModo === 'AUMENTAR') {
        await productoService.aumentarStock(stockModalProduct.id, stockCantidad);
        toast.success(`Se agregaron +${stockCantidad} uds. a "${stockModalProduct.nombre}"`);
      } else {
        await productoService.disminuirStock(stockModalProduct.id, stockCantidad);
        toast.success(`Se descontaron -${stockCantidad} uds. de "${stockModalProduct.nombre}"`);
      }
      setStockModalProduct(null);
      await loadProductos();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Error al actualizar el stock');
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      codigo: `775${Math.floor(10000 + Math.random() * 90000)}`,
      nombre: '',
      categoria: 'Abarrotes',
      unidadMedida: 'UND',
      precioVenta: 2.5,
      precioCompra: 1.8,
      usuario: user?.codigoUsuario || 'ADMIN01',
    });
    setInitialStockNewProduct(25);
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (prod: Producto) => {
    setEditingProduct(prod);
    setFormData({
      codigo: prod.codigo || String(prod.id),
      nombre: prod.nombre,
      categoria: prod.categoria || 'Abarrotes',
      unidadMedida: prod.unidadMedida || 'UND',
      precioVenta: Number(prod.precioVenta ?? prod.precioBase ?? 1.0),
      precioCompra: Number(prod.precioCompra ?? 0.8),
      usuario: user?.codigoUsuario || 'ADMIN01',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProduct(true);
    try {
      if (editingProduct) {
        await productoService.actualizarProducto(editingProduct.id, formData);
        toast.success(`Producto "${formData.nombre}" actualizado correctamente`);
      } else {
        const nuevo = await productoService.crearProducto(formData);
        if (nuevo?.id && InitialStockNewProduct > 0) {
          await productoService.aumentarStock(nuevo.id, InitialStockNewProduct);
        }
        toast.success(`Producto "${formData.nombre}" creado con ${InitialStockNewProduct} uds. de stock`);
      }
      setIsProductModalOpen(false);
      await loadProductos();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Error al guardar el producto');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (prod: Producto) => {
    if (!window.confirm(`¿Deseas dar de baja el producto "${prod.nombre}"?`)) return;
    try {
      await productoService.eliminarProducto(prod.id, user?.codigoUsuario || 'ADMIN01');
      toast.success(`Producto "${prod.nombre}" eliminado`);
      await loadProductos();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Error al eliminar producto');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventario & Control de Stock</h2>
          <p className="text-sm text-slate-500">
            Gestiona tu catálogo de productos y reabastece unidades cuando te quedes sin stock
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadProductos}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Actualizar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nuevo Producto
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="w-full sm:max-w-sm">
            <Input
              placeholder="Buscar por nombre, código o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Categoría:</span>
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <Spinner size="lg" label="Cargando existencias desde Supabase..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Sin resultados"
            description={`No se encontraron productos para "${debouncedSearch}".`}
            actionText="Limpiar filtros"
            onAction={() => {
              setSearchTerm('');
              setSelectedCategoria('TODAS');
            }}
          />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">Código</th>
                    <th className="py-3 px-3.5">Producto</th>
                    <th className="py-3 px-3.5">Categoría</th>
                    <th className="py-3 px-3.5">Precio Venta</th>
                    <th className="py-3 px-3.5">Stock Actual</th>
                    <th className="py-3 px-3.5">Estado</th>
                    <th className="py-3 px-3.5 text-right">Acciones / Reabastecer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((p) => {
                    const stock = Number(p.stockActual ?? 0);
                    const isOut = stock <= 0;
                    const isLow = stock > 0 && stock <= 10;
                    const precio = Number(p.precioVenta ?? p.precioBase ?? 0);

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3.5 font-mono text-xs font-semibold text-slate-700">
                          {p.codigo || `#${p.id}`}
                        </td>
                        <td className="py-3 px-3.5 font-medium text-slate-900">{p.nombre}</td>
                        <td className="py-3 px-3.5 text-xs text-slate-500">
                          {p.categoria || 'General'} ({p.unidadMedida || 'UND'})
                        </td>
                        <td className="py-3 px-3.5 font-semibold text-indigo-600">
                          S/ {precio.toFixed(2)}
                        </td>
                        <td className="py-3 px-3.5 font-bold text-slate-800">
                          {stock} {p.unidadMedida || 'uds.'}
                        </td>
                        <td className="py-3 px-3.5">
                          <Badge variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}>
                            {isOut ? 'Sin Stock (0)' : isLow ? 'Bajo Stock' : 'Disponible'}
                          </Badge>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenStockModal(p)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                              title="Aumentar o ajustar stock"
                            >
                              <PackagePlus className="w-3.5 h-3.5" />
                              <span>+ Stock</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Editar producto"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={goToPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </Card>

      {/* Modal para Reabastecer / Ajustar Stock */}
      <Modal
        isOpen={Boolean(stockModalProduct)}
        onClose={() => setStockModalProduct(null)}
        title={`Reabastecer Stock: ${stockModalProduct?.nombre || ''}`}
      >
        <form onSubmit={handleConfirmStockUpdate} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-sm">
            <span className="text-slate-600">Stock actual en almacén:</span>
            <span className="font-bold text-slate-900">
              {stockModalProduct?.stockActual ?? 0} {stockModalProduct?.unidadMedida || 'UND'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStockModo('AUMENTAR')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                stockModo === 'AUMENTAR'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              + Ingresar Mercadería (Aumentar)
            </button>
            <button
              type="button"
              onClick={() => setStockModo('DISMINUIR')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                stockModo === 'DISMINUIR'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              - Descontar Merma (Disminuir)
            </button>
          </div>

          <div>
            <Input
              label="Cantidad de unidades"
              type="number"
              min="1"
              step="1"
              value={stockCantidad}
              onChange={(e) => setStockCantidad(Math.max(1, Number(e.target.value)))}
              required
            />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-400"> Selección rápida:</span>
              {[10, 25, 50, 100].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setStockCantidad(val)}
                  className="px-2 py-1 text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded border border-slate-200 transition-colors"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setStockModalProduct(null)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isUpdatingStock}>
              Confirmar Ajuste de Stock
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal para Crear / Editar Producto */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? `Editar Producto: ${editingProduct.nombre}` : 'Registrar Nuevo Producto'}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Código de Barras / SKU"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              required
            />
            <Input
              label="Categoría"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              required
            />
          </div>

          <Input
            label="Nombre del Producto"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Aceite Vegetal Primor 1L"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Unidad (UND, KG, LT)"
              value={formData.unidadMedida}
              onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value.toUpperCase() })}
              required
            />
            <Input
              label="Precio Compra (S/)"
              type="number"
              min="0.10"
              step="0.01"
              value={formData.precioCompra}
              onChange={(e) => setFormData({ ...formData, precioCompra: Number(e.target.value) })}
              required
            />
            <Input
              label="Precio Venta (S/)"
              type="number"
              min="0.10"
              step="0.01"
              value={formData.precioVenta}
              onChange={(e) => setFormData({ ...formData, precioVenta: Number(e.target.value) })}
              required
            />
          </div>

          {!editingProduct && (
            <Input
              label="Stock Inicial en Almacén"
              type="number"
              min="0"
              step="1"
              value={InitialStockNewProduct}
              onChange={(e) => setInitialStockNewProduct(Math.max(0, Number(e.target.value)))}
              helperText="Unidades con las que iniciará el producto en inventario"
            />
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsProductModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSavingProduct}>
              {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
