import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Spinner } from '../components/common/Spinner';
import { Modal } from '../components/common/Modal';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';
import { Input } from '../components/common/Input';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import { useToast } from '../context/ToastContext';
import { ventaService } from '../services/ventaService';
import type { Venta } from '../types';
import { PlusCircle, Search, Ban, Eye, FileText } from 'lucide-react';

export const Ventas: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const initialSearch = searchParams.get('search') || '';
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialSize = Number(searchParams.get('size')) || 10;

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [isAnularModalOpen, setIsAnularModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const loadVentas = async () => {
    setIsLoading(true);
    try {
      const data = await ventaService.obtenerVentas(0, 100);
      if (Array.isArray(data)) {
        setVentas(data);
      } else if (data && 'content' in data && Array.isArray(data.content)) {
        setVentas(data.content);
      }
    } catch (err) {
      toast.error((err as Error)?.message || 'Error al obtener listado de ventas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVentas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredVentas = useMemo(() => {
    if (!debouncedSearch) return ventas;
    const term = debouncedSearch.toLowerCase();
    return ventas.filter(
      (v) =>
        v.id.toString().includes(term) ||
        (v.clienteId && v.clienteId.toString().includes(term)) ||
        (v.usuarioId && v.usuarioId.toLowerCase().includes(term)) ||
        (v.estado && v.estado.toLowerCase().includes(term))
    );
  }, [ventas, debouncedSearch]);

  const {
    currentPage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    setPageSize,
  } = usePagination({
    totalItems: filteredVentas.length,
    initialPage: initialPage,
    initialPageSize: initialSize,
  });

  // Sync state to URL Query Params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (currentPage > 1) params.page = currentPage.toString();
    if (pageSize !== 10) params.size = pageSize.toString();
    if (debouncedSearch) params.search = debouncedSearch;
    setSearchParams(params, { replace: true });
  }, [currentPage, pageSize, debouncedSearch, setSearchParams]);

  const paginatedVentas = filteredVentas.slice(startIndex, endIndex);

  const handleAnular = async () => {
    if (!selectedVenta) return;
    setIsSubmitting(true);
    try {
      await ventaService.anularVenta(selectedVenta.id);
      toast.success(`Venta #${selectedVenta.id} anulada exitosamente y stock reincorporado.`);
      setIsAnularModalOpen(false);
      setSelectedVenta(null);
      loadVentas();
    } catch (err) {
      toast.error((err as Error)?.message || 'No se pudo anular la venta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Ventas</h2>
          <p className="text-sm text-slate-500">Historial completo, anulación y emisión de comprobantes</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/reportes">
            <Button variant="outline" size="md" leftIcon={<FileText className="w-4 h-4" />}>
              Reportes
            </Button>
          </Link>
          <Link to="/ventas/nueva">
            <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Registrar Venta
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className="mb-4 max-w-sm">
          <Input
            placeholder="Buscar por ID, Cliente, Usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {isLoading ? (
          <Spinner size="lg" label="Cargando ventas del servidor..." />
        ) : filteredVentas.length === 0 ? (
          <EmptyState
            title="No se encontraron ventas"
            description="No hay transacciones registradas o no coinciden con tu criterio de búsqueda."
            actionText="Crear Nueva Venta"
            onAction={() => window.location.assign('/ventas/nueva')}
          />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">ID</th>
                    <th className="py-3 px-3.5">Fecha</th>
                    <th className="py-3 px-3.5">Cliente</th>
                    <th className="py-3 px-3.5">Operador</th>
                    <th className="py-3 px-3.5">Subtotal</th>
                    <th className="py-3 px-3.5">IGV</th>
                    <th className="py-3 px-3.5">Total</th>
                    <th className="py-3 px-3.5">Estado</th>
                    <th className="py-3 px-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedVentas.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5 font-semibold text-slate-800">
                        <Link to={`/ventas/${v.id}`} className="text-indigo-600 hover:underline">
                          #{v.id}
                        </Link>
                      </td>
                      <td className="py-3 px-3.5 text-xs text-slate-500">{v.fechaCreacion || 'Hoy'}</td>
                      <td className="py-3 px-3.5 font-medium text-slate-700">
                        {v.nombreCliente || `Cliente #${v.clienteId}`}
                      </td>
                      <td className="py-3 px-3.5 text-xs font-mono">{v.usuarioId}</td>
                      <td className="py-3 px-3.5 text-xs">S/ {(v.subtotal || 0).toFixed(2)}</td>
                      <td className="py-3 px-3.5 text-xs">S/ {(v.igv || 0).toFixed(2)}</td>
                      <td className="py-3 px-3.5 font-bold text-slate-900">S/ {(v.total || 0).toFixed(2)}</td>
                      <td className="py-3 px-3.5">
                        <Badge variant={v.estado === 'ANULADO' ? 'danger' : 'success'}>
                          {v.estado || 'REGISTRADO'}
                        </Badge>
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/ventas/${v.id}`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Ver Detalle de Venta"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {v.estado !== 'ANULADO' && (
                            <button
                              onClick={() => {
                                setSelectedVenta(v);
                                setIsAnularModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Anular venta"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredVentas.length}
              pageSize={pageSize}
              onPageChange={goToPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </Card>

      <Modal
        isOpen={isAnularModalOpen}
        onClose={() => setIsAnularModalOpen(false)}
        title="Confirmar Anulación de Venta"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAnularModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleAnular}
              isLoading={isSubmitting}
            >
              Sí, Anular Venta
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          ¿Estás seguro de que deseas anular la <strong>Venta #{selectedVenta?.id}</strong> por el monto total de <strong>S/ {selectedVenta?.total?.toFixed(2)}</strong>?
        </p>
        <p className="text-xs text-rose-600 mt-2 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
          Esta acción revertirá la transacción y reincorporará automáticamente las cantidades al inventario de stock.
        </p>
      </Modal>
    </div>
  );
};
