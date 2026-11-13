import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Spinner } from '../components/common/Spinner';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { ventaService } from '../services/ventaService';
import { productoService } from '../services/productoService';
import type { Venta } from '../types';
import { ArrowLeft, Ban, Printer, Calendar, User, DollarSign } from 'lucide-react';

export const DetalleVenta: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [venta, setVenta] = useState<Venta | null>(null);
  const [productosMap, setProductosMap] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAnularModalOpen, setIsAnularModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchVenta = async () => {
      setIsLoading(true);
      try {
        const [data, prods] = await Promise.all([
          ventaService.obtenerVentaPorId(Number(id)),
          productoService.obtenerProductos().catch(() => []),
        ]);
        const map: Record<number, string> = {};
        prods.forEach((p) => {
          map[p.id] = p.nombre;
        });
        setProductosMap(map);
        setVenta(data);
      } catch (err) {
        toast.error((err as Error)?.message || 'No se pudo cargar el detalle de la venta');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVenta();
  }, [id, toast]);

  const handleAnular = async () => {
    if (!venta) return;
    setIsSubmitting(true);
    try {
      await ventaService.anularVenta(venta.id);
      toast.success(`Venta #${venta.id} anulada exitosamente.`);
      setIsAnularModalOpen(false);
      // Reload updated status
      const updated = await ventaService.obtenerVentaPorId(venta.id);
      setVenta(updated);
    } catch (err) {
      toast.error((err as Error)?.message || 'Error al anular la venta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="py-16">
        <Spinner size="lg" label="Cargando comprobante..." />
      </div>
    );
  }

  if (!venta) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-slate-800">Comprobante no encontrado</h3>
        <p className="text-sm text-slate-500 mt-1 mb-4">El documento solicitado no existe en el sistema.</p>
        <Link to="/ventas">
          <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Volver a Ventas
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/ventas')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-bold text-slate-800">Comprobante #{venta.id}</h2>
              <Badge variant={venta.estado === 'ANULADO' ? 'danger' : 'success'} size="md">
                {venta.estado || 'REGISTRADO'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Detalle tributario y desglose de productos</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Imprimir Comprobante
          </Button>
          {venta.estado !== 'ANULADO' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsAnularModalOpen(true)}
              leftIcon={<Ban className="w-4 h-4" />}
            >
              Anular Venta
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Fecha de Emisión</p>
            <p className="text-sm font-bold text-slate-800">{venta.fechaCreacion || 'Fecha actual'}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Cliente Asignado</p>
            <p className="text-sm font-bold text-slate-800">
              {venta.nombreCliente || `Cliente #${venta.clienteId}`}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Operador de Caja</p>
            <p className="text-sm font-bold text-slate-800">{venta.usuarioId || 'ADMIN01'}</p>
          </div>
        </Card>
      </div>

      <Card title="Ítems del Comprobante" subtitle="Listado de productos y cantidades procesadas">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5">#</th>
                <th className="py-3 px-3.5">Producto</th>
                <th className="py-3 px-3.5 text-center">Cantidad</th>
                <th className="py-3 px-3.5 text-right">Precio Unitario</th>
                <th className="py-3 px-3.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(venta.detalles && venta.detalles.length > 0) ? (
                venta.detalles.map((d, index) => (
                  <tr key={index} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3.5 text-xs text-slate-400">{index + 1}</td>
                    <td className="py-3 px-3.5 font-medium text-slate-800">
                      {d.nombreProducto || productosMap[d.productoId] || `Producto ID #${d.productoId}`}
                    </td>
                    <td className="py-3 px-3.5 text-center font-semibold text-slate-700">{d.cantidad}</td>
                    <td className="py-3 px-3.5 text-right text-xs">S/ {d.precioUnitario?.toFixed(2)}</td>
                    <td className="py-3 px-3.5 text-right font-bold text-slate-900">
                      S/ {((d.cantidad || 0) * (d.precioUnitario || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 px-3.5 text-xs text-slate-400">1</td>
                  <td className="py-3 px-3.5 font-medium text-slate-800">Operación Comercial Principal</td>
                  <td className="py-3 px-3.5 text-center font-semibold text-slate-700">1</td>
                  <td className="py-3 px-3.5 text-right text-xs">S/ {(venta.subtotal || 0).toFixed(2)}</td>
                  <td className="py-3 px-3.5 text-right font-bold text-slate-900">S/ {(venta.subtotal || 0).toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col items-end gap-1.5 text-sm text-slate-600">
          <div className="flex justify-between w-64">
            <span>Subtotal Op. Gravada:</span>
            <span className="font-semibold text-slate-800">S/ {(venta.subtotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between w-64">
            <span>IGV (18%):</span>
            <span className="font-semibold text-slate-800">S/ {(venta.igv || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between w-64 pt-2 border-t border-slate-200 text-base font-bold text-slate-900">
            <span>Total Pagado:</span>
            <span className="text-indigo-600 font-extrabold">S/ {(venta.total || 0).toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={isAnularModalOpen}
        onClose={() => setIsAnularModalOpen(false)}
        title="Confirmar Anulación de Comprobante"
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
              Confirmar Anulación
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          ¿Estás seguro de que deseas anular el comprobante <strong>#{venta.id}</strong>?
        </p>
        <p className="text-xs text-rose-600 mt-2 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
          Esta acción cambiará el estado a ANULADO y retornará automáticamente los productos al stock del inventario.
        </p>
      </Modal>
    </div>
  );
};
