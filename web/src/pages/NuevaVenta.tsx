import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Alert } from '../components/common/Alert';
import { Spinner } from '../components/common/Spinner';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { ventaService } from '../services/ventaService';
import { clienteService, productoService } from '../services/productoService';
import { useAuth } from '../context/AuthContext';
import type { Cliente, Producto, RegistrarVentaDto } from '../types';
import { Plus, Trash2, ShoppingCart, ArrowLeft, UserPlus } from 'lucide-react';

interface ItemForm {
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  stockDisponible: number;
}

export const NuevaVenta: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState<number>(1);
  const [monedaId, setMonedaId] = useState<number>(5); // 5 = PEN (Soles), 6 = USD (Dólares)
  const [serieComprobante, setSerieComprobante] = useState<'B001' | 'F001'>('B001');
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  const [items, setItems] = useState<ItemForm[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal de creación rápida de cliente
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [clientForm, setClientForm] = useState({
    tipoDocumentoId: 1, // 1 = DNI, 2 = RUC
    numeroDocumento: '',
    nombre: '',
    telefono: '',
    direccion: '',
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingData(true);
      try {
        const [prods, clis] = await Promise.all([
          productoService.obtenerProductos(),
          clienteService.obtenerClientes().catch(() => [] as Cliente[]),
        ]);

        if (Array.isArray(clis) && clis.length > 0) {
          setClientes(clis);
          setClienteId(clis[0].id);
        }

        if (Array.isArray(prods) && prods.length > 0) {
          setProductosDisponibles(prods);
          // Seleccionar por defecto el primer producto con stock > 0 (o el primero de la lista)
          const firstAvailable = prods.find((p) => (p.stockActual ?? 0) > 0) || prods[0];
          const unitPrice = Number(firstAvailable.precioVenta ?? firstAvailable.precioBase ?? 0);
          setItems([
            {
              productoId: firstAvailable.id,
              nombre: firstAvailable.nombre,
              cantidad: 1,
              precioUnitario: unitPrice,
              stockDisponible: Number(firstAvailable.stockActual ?? 0),
            },
          ]);
        }
      } catch (err: unknown) {
        setError((err as Error)?.message || 'Error al cargar catálogo de productos');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleAddItem = () => {
    if (productosDisponibles.length === 0) return;
    // Buscar un producto que aún no esté en la lista o usar el primero disponible
    const usedIds = new Set(items.map((it) => it.productoId));
    const candidate =
      productosDisponibles.find((p) => !usedIds.has(p.id) && (p.stockActual ?? 0) > 0) ||
      productosDisponibles[0];

    const unitPrice = Number(candidate.precioVenta ?? candidate.precioBase ?? 0);

    setItems([
      ...items,
      {
        productoId: candidate.id,
        nombre: candidate.nombre,
        cantidad: 1,
        precioUnitario: unitPrice,
        stockDisponible: Number(candidate.stockActual ?? 0),
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index: number, newProductoId: number) => {
    const selected = productosDisponibles.find((p) => Number(p.id) === Number(newProductoId));
    if (!selected) return;

    const unitPrice = Number(selected.precioVenta ?? selected.precioBase ?? 0);
    const maxStock = Number(selected.stockActual ?? 0);

    const updated = [...items];
    updated[index] = {
      productoId: selected.id,
      nombre: selected.nombre,
      cantidad: maxStock > 0 ? Math.min(updated[index].cantidad, maxStock) : 1,
      precioUnitario: unitPrice,
      stockDisponible: maxStock,
    };
    setItems(updated);
  };

  const handleQuantityChange = (index: number, newCantidad: number) => {
    const cant = Number.isNaN(newCantidad) || newCantidad < 1 ? 1 : Math.floor(newCantidad);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      cantidad: cant,
    };
    setItems(updated);
  };

  const simboloMoneda = monedaId === 6 ? 'US$' : 'S/';
  const total = items.reduce((acc, it) => acc + it.cantidad * it.precioUnitario, 0);
  const subtotal = total / 1.18;
  const igv = total - subtotal;

  const handleSaveNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.nombre.trim() || !clientForm.numeroDocumento.trim()) {
      toast.error('Completa el Nombre y Número de Documento del cliente.');
      return;
    }
    setIsSavingClient(true);
    try {
      const created = await clienteService.crearCliente({
        nombre: clientForm.nombre.trim(),
        numeroDocumento: clientForm.numeroDocumento.trim(),
        tipoDocumentoId: Number(clientForm.tipoDocumentoId),
        telefono: clientForm.telefono.trim() || '999999999',
        direccion: clientForm.direccion.trim() || 'Lima',
      });
      const updatedClients = await clienteService.obtenerClientes();
      setClientes(updatedClients);
      if (created?.id) {
        setClienteId(created.id);
      }
      toast.success(`Cliente "${created.nombre}" registrado y seleccionado.`);
      setIsNewClientModalOpen(false);
      setClientForm({
        tipoDocumentoId: 1,
        numeroDocumento: '',
        nombre: '',
        telefono: '',
        direccion: '',
      });
    } catch (err: unknown) {
      toast.error((err as Error)?.message || 'Error al registrar el cliente');
    } finally {
      setIsSavingClient(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Debes agregar al menos un producto a la venta.');
      return;
    }

    for (const it of items) {
      if (it.cantidad <= 0) {
        setError(`La cantidad de "${it.nombre}" debe ser al menos 1.`);
        return;
      }
      if (it.stockDisponible < it.cantidad) {
        setError(
          `Stock insuficiente para "${it.nombre}" (Solicitado: ${it.cantidad}, Disponible: ${it.stockDisponible}). Puedes agregar más stock en la pestaña Inventario.`
        );
        return;
      }
    }

    const numeroGen = `${serieComprobante}-${String(Math.floor(100000 + Math.random() * 900000))}`;

    const payload: RegistrarVentaDto = {
      numeroDocumento: numeroGen,
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
          <p className="text-sm text-slate-500">
            Precios asignados automáticamente del catálogo y cálculo dinámico por cantidad
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {isLoadingData ? (
        <Card>
          <Spinner size="lg" label="Cargando productos y precios del catálogo..." />
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card title="Datos Generales del Comprobante">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">Cliente</label>
                  <button
                    type="button"
                    onClick={() => setIsNewClientModalOpen(true)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> + Nuevo Cliente
                  </button>
                </div>
                {clientes.length > 0 ? (
                  <select
                    value={clienteId}
                    onChange={(e) => setClienteId(Number(e.target.value))}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre || c.nombreRazonSocial} ({c.numeroDocumento})
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    type="number"
                    min="1"
                    value={clienteId}
                    onChange={(e) => setClienteId(Number(e.target.value))}
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tipo de Comprobante
                </label>
                <select
                  value={serieComprobante}
                  onChange={(e) => setSerieComprobante(e.target.value as 'B001' | 'F001')}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="B001">Boleta de Venta (B001)</option>
                  <option value="F001">Factura Electrónica (F001)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Moneda</label>
                <select
                  value={monedaId}
                  onChange={(e) => setMonedaId(Number(e.target.value))}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={5}>Soles (PEN - S/)</option>
                  <option value={6}>Dólares (USD - US$)</option>
                </select>
              </div>

              <Input
                label="Cajero / Operador"
                value={user?.codigoUsuario || 'ADMIN01'}
                disabled
                helperText="Usuario autenticado actual"
              />
            </div>
          </Card>

          <Card
            title="Detalle de Productos"
            subtitle="Al elegir un producto su precio unitario se asigna automáticamente y el importe sube con la cantidad"
            action={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddItem}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Agregar Producto
              </Button>
            }
          >
            <div className="space-y-3">
              {items.map((item, index) => {
                const importeItem = item.cantidad * item.precioUnitario;
                const sinStock = item.stockDisponible < item.cantidad;

                return (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-12 items-end gap-3 p-3.5 bg-slate-50/80 rounded-lg border border-slate-200"
                  >
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Producto #{index + 1}{' '}
                        <span
                          className={`ml-1 font-semibold ${
                            sinStock ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          (Stock: {item.stockDisponible} uds.)
                        </span>
                      </label>
                      <select
                        value={item.productoId}
                        onChange={(e) => handleProductSelect(index, Number(e.target.value))}
                        className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {productosDisponibles.map((p) => {
                          const unitP = Number(p.precioVenta ?? p.precioBase ?? 0);
                          const st = Number(p.stockActual ?? 0);
                          return (
                            <option key={p.id} value={p.id}>
                              {p.nombre} — S/ {unitP.toFixed(2)} ({st} disp.)
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <Input
                        label="Cantidad"
                        type="number"
                        min="1"
                        max={item.stockDisponible > 0 ? item.stockDisponible : undefined}
                        step="1"
                        value={item.cantidad}
                        onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Input
                        label={`Precio Unit. (${simboloMoneda})`}
                        value={`${simboloMoneda} ${item.precioUnitario.toFixed(2)}`}
                        disabled
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Input
                        label={`Precio (${item.cantidad} x ${simboloMoneda}${item.precioUnitario.toFixed(2)})`}
                        value={`${simboloMoneda} ${importeItem.toFixed(2)}`}
                        disabled
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end pb-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length <= 1}
                        className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                        title="Quitar producto"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col items-end gap-1.5 text-sm text-slate-600">
              <div>
                Op. Gravada (Subtotal):{' '}
                <span className="font-semibold text-slate-800">{simboloMoneda} {subtotal.toFixed(2)}</span>
              </div>
              <div>
                IGV (18%): <span className="font-semibold text-slate-800">{simboloMoneda} {igv.toFixed(2)}</span>
              </div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                Total a Pagar:{' '}
                <span className="text-indigo-600 font-extrabold">{simboloMoneda} {total.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/ventas')}>
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
      )}

      <Modal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        title="Registrar Nuevo Cliente"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsNewClientModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveNewClient}
              isLoading={isSavingClient}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Guardar y Seleccionar
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveNewClient} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tipo de Documento
              </label>
              <select
                value={clientForm.tipoDocumentoId}
                onChange={(e) =>
                  setClientForm({ ...clientForm, tipoDocumentoId: Number(e.target.value) })
                }
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1}>DNI (Persona Natural)</option>
                <option value={2}>RUC (Empresa / Jurídica)</option>
                <option value={3}>Carné de Extranjería (CE)</option>
              </select>
            </div>
            <Input
              label="Número de Documento"
              placeholder={clientForm.tipoDocumentoId === 2 ? 'Ej. 20100123456' : 'Ej. 74859612'}
              value={clientForm.numeroDocumento}
              onChange={(e) => setClientForm({ ...clientForm, numeroDocumento: e.target.value })}
              required
            />
          </div>
          <Input
            label="Nombre Completo o Razón Social"
            placeholder="Ej. María Gómez Pérez"
            value={clientForm.nombre}
            onChange={(e) => setClientForm({ ...clientForm, nombre: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Teléfono"
              placeholder="Ej. 987654321"
              value={clientForm.telefono}
              onChange={(e) => setClientForm({ ...clientForm, telefono: e.target.value })}
            />
            <Input
              label="Dirección"
              placeholder="Ej. Av. Arequipa 1250, Lima"
              value={clientForm.direccion}
              onChange={(e) => setClientForm({ ...clientForm, direccion: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
