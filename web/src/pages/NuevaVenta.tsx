import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Alert } from '../components/common/Alert';
import { useToast } from '../context/ToastContext';
import { ventaService } from '../services/ventaService';
import { productoService } from '../services/productoService';
import { useAuth } from '../context/AuthContext';
import type { Producto, RegistrarVentaDto } from '../types';
import { Plus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';

interface ItemForm {
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export const NuevaVenta: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [clienteId, setClienteId] = useState<number>(1);
  const [monedaId] = useState<number>(1);
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  const [items, setItems] = useState<ItemForm[]>([
    { productoId: 1, nombre: 'Producto Principal', cantidad: 1, precioUnitario: 10.0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const prods = await productoService.obtenerProductos();
        if (Array.isArray(prods) && prods.length > 0) {
          setProductosDisponibles(prods);
        }
      } catch {
        setProductosDisponibles([
          { id: 1, nombre: 'Gaseosa 3L', precioBase: 12.5 },
          { id: 2, nombre: 'Arroz 1kg', precioBase: 4.8 },
          { id: 3, nombre: 'Aceite 1L', precioBase: 8.5 },
        ]);
      }
    };
    fetchProductos();
  }, []);

  const handleAddItem = () => {
    const firstProd = productosDisponibles[0] || { id: 1, nombre: 'Producto', precioBase: 10.0 };
    setItems([
      ...items,
      {
        productoId: firstProd.id,
        nombre: firstProd.nombre,
        cantidad: 1,
        precioUnitario: firstProd.precioBase || 10.0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: 'productoId' | 'cantidad' | 'precioUnitario',
    value: number
  ) => {
    const updated = [...items];
    if (field === 'productoId') {
      const selected = productosDisponibles.find((p) => p.id === value);
      updated[index] = {
        ...updated[index],
        productoId: value,
        nombre: selected?.nombre || `Producto #${value}`,
        precioUnitario: selected?.precioBase || updated[index].precioUnitario,
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
    }
    setItems(updated);
  };

  const total = items.reduce((acc, it) => acc + (it.cantidad * it.precioUnitario), 0);
  const subtotal = total / 1.18;
  const igv = total - subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Debes agregar al menos un producto a la venta.');
      return;
    }

    const invalidItem = items.find((it) => it.cantidad <= 0 || it.precioUnitario <= 0);
    if (invalidItem) {
      setError('La cantidad y precio de cada producto deben ser mayores a 0.');
      return;
    }

    const payload: RegistrarVentaDto = {
      clienteId: Number(clienteId),
      usuarioId: user?.codigoUsuario || 'ADMIN01',
      monedaId: Number(monedaId),
      detalles: items.map((it) => ({
        productoId: Number(it.productoId),
        cantidad: Number(it.cantidad),
        precioUnitario: Number(it.precioUnitario),
      })),
    };

    setIsSubmitting(true);
    try {
      const res = await ventaService.registrarVenta(payload);
      toast.success(`¡Venta #${res.id || ''} registrada exitosamente!`);
      navigate(`/ventas/${res.id || ''}`);
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Error al registrar venta';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/ventas')}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Registrar Nueva Venta</h2>
          <p className="text-sm text-slate-500">Emisión de comprobante electrónico con cálculo automático</p>
        </div>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Datos Generales">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="ID de Cliente"
              type="number"
              min="1"
              value={clienteId}
              onChange={(e) => setClienteId(Number(e.target.value))}
              required
            />
            <Input
              label="Usuario Operador"
              value={user?.codigoUsuario || 'ADMIN01'}
              disabled
              helperText="Usuario autenticado actual"
            />
            <Input
              label="Moneda"
              value="Soles (PEN)"
              disabled
            />
          </div>
        </Card>

        <Card
          title="Detalle de Productos"
          subtitle="Agrega los ítems que conformarán la venta"
          action={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddItem}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Agregar Ítem
            </Button>
          }
        >
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-end gap-3 p-3 bg-slate-50/80 rounded-lg border border-slate-200"
              >
                <div className="flex-1 w-full">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Producto #{index + 1}
                  </label>
                  <select
                    value={item.productoId}
                    onChange={(e) =>
                      handleItemChange(index, 'productoId', Number(e.target.value))
                    }
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {productosDisponibles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} (S/ {p.precioBase?.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-28">
                  <Input
                    label="Cantidad"
                    type="number"
                    min="1"
                    step="1"
                    value={item.cantidad}
                    onChange={(e) =>
                      handleItemChange(index, 'cantidad', Number(e.target.value))
                    }
                  />
                </div>

                <div className="w-full sm:w-32">
                  <Input
                    label="Precio Unit."
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.precioUnitario}
                    onChange={(e) =>
                      handleItemChange(index, 'precioUnitario', Number(e.target.value))
                    }
                  />
                </div>

                <div className="w-full sm:w-28 text-right sm:text-left">
                  <span className="block text-xs text-slate-400 mb-1">Subtotal</span>
                  <span className="block py-2 text-sm font-semibold text-slate-800">
                    S/ {(item.cantidad * item.precioUnitario).toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  disabled={items.length <= 1}
                  className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col items-end gap-1.5 text-sm text-slate-600">
            <div>
              Subtotal: <span className="font-semibold text-slate-800">S/ {subtotal.toFixed(2)}</span>
            </div>
            <div>
              IGV (18%): <span className="font-semibold text-slate-800">S/ {igv.toFixed(2)}</span>
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              Total a Pagar: <span className="text-indigo-600 font-extrabold">S/ {total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/ventas')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            leftIcon={<ShoppingCart className="w-4 h-4" />}
          >
            Finalizar y Guardar Venta
          </Button>
        </div>
      </form>
    </div>
  );
};
