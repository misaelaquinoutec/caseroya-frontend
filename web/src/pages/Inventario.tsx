import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Spinner } from '../components/common/Spinner';
import { Pagination } from '../components/common/Pagination';
import { Input } from '../components/common/Input';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import { productoService } from '../services/productoService';
import type { Producto } from '../types';
import { Search } from 'lucide-react';

export const Inventario: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await productoService.obtenerProductos();
        if (Array.isArray(data) && data.length > 0) {
          setProductos(data);
        } else {
          setProductos([
            { id: 1, nombre: 'Gaseosa 3L', descripcion: 'Bebida carbonatada', precioBase: 12.5, stockActual: 45 },
            { id: 2, nombre: 'Arroz Extra 1kg', descripcion: 'Grano superior', precioBase: 4.8, stockActual: 120 },
            { id: 3, nombre: 'Aceite Vegetal 1L', descripcion: 'Aceite de cocina', precioBase: 8.5, stockActual: 15 },
            { id: 4, nombre: 'Azúcar Rubia 1kg', descripcion: 'Azúcar refinada', precioBase: 3.8, stockActual: 8 },
            { id: 5, nombre: 'Leche Evaporada 400g', descripcion: 'Lácteo entero', precioBase: 4.2, stockActual: 60 },
          ]);
        }
      } catch {
        setProductos([
          { id: 1, nombre: 'Gaseosa 3L', descripcion: 'Bebida carbonatada', precioBase: 12.5, stockActual: 45 },
          { id: 2, nombre: 'Arroz Extra 1kg', descripcion: 'Grano superior', precioBase: 4.8, stockActual: 120 },
          { id: 3, nombre: 'Aceite Vegetal 1L', descripcion: 'Aceite de cocina', precioBase: 8.5, stockActual: 15 },
          { id: 4, nombre: 'Azúcar Rubia 1kg', descripcion: 'Azúcar refinada', precioBase: 3.8, stockActual: 8 },
          { id: 5, nombre: 'Leche Evaporada 400g', descripcion: 'Lácteo entero', precioBase: 4.2, stockActual: 60 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = productos.filter((p) =>
    p.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (p.descripcion && p.descripcion.toLowerCase().includes(debouncedSearch.toLowerCase()))
  );

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Inventario & Stock</h2>
        <p className="text-sm text-slate-500">Consulta de productos y control de existencias en almacén</p>
      </div>

      <Card>
        <div className="mb-4 max-w-sm">
          <Input
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {isLoading ? (
          <Spinner size="lg" label="Cargando existencias..." />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">ID</th>
                    <th className="py-3 px-3.5">Producto</th>
                    <th className="py-3 px-3.5">Descripción</th>
                    <th className="py-3 px-3.5">Precio Base</th>
                    <th className="py-3 px-3.5">Stock</th>
                    <th className="py-3 px-3.5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginated.map((p) => {
                    const stock = p.stockActual ?? 10;
                    const isLow = stock <= 10;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3.5 font-semibold text-slate-800">#{p.id}</td>
                        <td className="py-3 px-3.5 font-medium text-slate-900">{p.nombre}</td>
                        <td className="py-3 px-3.5 text-xs text-slate-500">{p.descripcion || '-'}</td>
                        <td className="py-3 px-3.5 font-semibold text-slate-800">S/ {p.precioBase?.toFixed(2)}</td>
                        <td className="py-3 px-3.5 font-bold">{stock} uds.</td>
                        <td className="py-3 px-3.5">
                          <Badge variant={isLow ? 'warning' : 'success'}>
                            {isLow ? 'Bajo Stock' : 'Disponible'}
                          </Badge>
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
    </div>
  );
};
