import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Spinner } from '../components/common/Spinner';
import { ventaService } from '../services/ventaService';
import type { Venta } from '../types';
import { DollarSign, ShoppingCart, TrendingUp, Package, PlusCircle, ArrowRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await ventaService.obtenerVentas(0, 5);
        if (Array.isArray(data)) {
          setVentas(data);
        } else if (data && 'content' in data && Array.isArray(data.content)) {
          setVentas(data.content);
        }
      } catch (err) {
        console.error('Error al cargar ventas en dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const totalVendido = ventas
    .filter((v) => v.estado !== 'ANULADO')
    .reduce((acc, v) => acc + (v.total || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Panel Principal</h2>
          <p className="text-sm text-slate-500">Resumen operativo y métricas en tiempo real</p>
        </div>
        <Link to="/ventas/nueva">
          <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Nueva Venta
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Ingresos Totales</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">S/ {totalVendido.toFixed(2)}</h3>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Ventas activas
              </p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Total Operaciones</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{ventas.length}</h3>
              <p className="text-xs text-slate-400 mt-1">Comprobantes emitidos</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Inventario Activo</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">Sincronizado</h3>
              <p className="text-xs text-amber-600 mt-1">Stock en línea</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Eventos Asíncronos</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">Activo</h3>
              <p className="text-xs text-purple-600 mt-1">Notificaciones Mail</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Últimas Ventas Registradas"
        subtitle="Monitoreo de transacciones recientes"
        action={
          <Link to="/ventas" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        {isLoading ? (
          <Spinner size="md" label="Cargando ventas recientes..." />
        ) : ventas.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No hay ventas registradas aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Cliente ID</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ventas.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">#{v.id}</td>
                    <td className="py-2.5 px-3 text-xs">{v.fechaCreacion || 'Hoy'}</td>
                    <td className="py-2.5 px-3">{v.nombreCliente || `Cliente #${v.clienteId}`}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">S/ {(v.total || 0).toFixed(2)}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant={v.estado === 'ANULADO' ? 'danger' : 'success'}>
                        {v.estado || 'REGISTRADO'}
                      </Badge>
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
