import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Spinner } from '../components/common/Spinner';
import { Input } from '../components/common/Input';
import { useToast } from '../context/ToastContext';
import { ventaService } from '../services/ventaService';
import type { Venta } from '../types';
import { Calendar, Filter, DollarSign, ShoppingBag, TrendingUp, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Reportes: React.FC = () => {
  const toast = useToast();
  const today = new Date().toISOString().split('T')[0];
  const startOfYear = `${new Date().getFullYear()}-01-01`;

  const [desde, setDesde] = useState(startOfYear);
  const [hasta, setHasta] = useState(today);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReporte = async () => {
    setIsLoading(true);
    try {
      const data = await ventaService.obtenerReporte(desde, hasta);
      if (Array.isArray(data)) {
        setVentas(data);
      } else {
        setVentas([]);
      }
      toast.info(`Reporte actualizado: ${data?.length || 0} operaciones encontradas.`);
    } catch {
      // Fallback: load general sales if custom report endpoint is restricted
      try {
        const general = await ventaService.obtenerVentas(0, 100);
        if (Array.isArray(general)) {
          setVentas(general);
        } else if (general && 'content' in general && Array.isArray(general.content)) {
          setVentas(general.content);
        }
      } catch (e) {
        toast.error((e as Error)?.message || 'Error al obtener reporte');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReporte();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalRecaudado = ventas
    .filter((v) => v.estado !== 'ANULADO')
    .reduce((acc, v) => acc + (v.total || 0), 0);

  const ventasValidas = ventas.filter((v) => v.estado !== 'ANULADO').length;
  const ticketPromedio = ventasValidas > 0 ? totalRecaudado / ventasValidas : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reporte de Ventas por Fechas</h2>
          <p className="text-sm text-slate-500">Métricas analíticas consolidadas por rango temporal</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Exportar / Imprimir
        </Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full sm:w-48">
            <Input
              label="Fecha Desde"
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
          </div>
          <div className="w-full sm:w-48">
            <Input
              label="Fecha Hasta"
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
          </div>
          <Button
            variant="primary"
            onClick={fetchReporte}
            isLoading={isLoading}
            leftIcon={<Filter className="w-4 h-4" />}
          >
            Filtrar Reporte
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Facturación en el Período</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">S/ {totalRecaudado.toFixed(2)}</h3>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Ventas netas válidas
              </p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Comprobantes Emitidos</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{ventas.length}</h3>
              <p className="text-xs text-slate-400 mt-1">{ventasValidas} activas, {ventas.length - ventasValidas} anuladas</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Ticket Promedio</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">S/ {ticketPromedio.toFixed(2)}</h3>
              <p className="text-xs text-purple-600 mt-1">Promedio por operación</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      <Card title="Detalle Consolidado de Transacciones">
        {isLoading ? (
          <Spinner size="md" label="Generando reporte analítico..." />
        ) : ventas.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">
            No se encontraron transacciones en el rango de fechas seleccionado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">ID</th>
                  <th className="py-3 px-3.5">Fecha</th>
                  <th className="py-3 px-3.5">Cliente ID</th>
                  <th className="py-3 px-3.5">Usuario</th>
                  <th className="py-3 px-3.5">Subtotal</th>
                  <th className="py-3 px-3.5">IGV</th>
                  <th className="py-3 px-3.5">Total</th>
                  <th className="py-3 px-3.5">Estado</th>
                  <th className="py-3 px-3.5 text-right">Ver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ventas.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3.5 font-semibold text-slate-800">#{v.id}</td>
                    <td className="py-3 px-3.5 text-xs text-slate-500">{v.fechaCreacion || 'Hoy'}</td>
                    <td className="py-3 px-3.5">{v.nombreCliente || `Cliente #${v.clienteId}`}</td>
                    <td className="py-3 px-3.5 text-xs">{v.usuarioId}</td>
                    <td className="py-3 px-3.5 text-xs">S/ {(v.subtotal || 0).toFixed(2)}</td>
                    <td className="py-3 px-3.5 text-xs">S/ {(v.igv || 0).toFixed(2)}</td>
                    <td className="py-3 px-3.5 font-bold text-slate-900">S/ {(v.total || 0).toFixed(2)}</td>
                    <td className="py-3 px-3.5">
                      <Badge variant={v.estado === 'ANULADO' ? 'danger' : 'success'}>
                        {v.estado || 'REGISTRADO'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <Link
                        to={`/ventas/${v.id}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Ver Detalle →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
