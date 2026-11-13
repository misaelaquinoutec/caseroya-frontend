import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Spinner } from '../components/common/Spinner';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Alert } from '../components/common/Alert';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { compraService, productoService, proveedorService } from '../services/productoService';
import type { DocumentoCompra, Producto, Proveedor } from '../types';
import {
  Truck,
  Plus,
  Trash2,
  ShoppingBag,
  Building2,
  Edit2,
  Search,
  Ban,
} from 'lucide-react';

interface ItemCompra {
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  stockActual: number;
}

export const ComprasProveedores: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'compras' | 'proveedores'>('compras');
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado de Nueva Compra
  const [proveedorId, setProveedorId] = useState<number>(1);
  const [monedaId, setMonedaId] = useState<number>(5);
  const [numeroDocCompra, setNumeroDocCompra] = useState<string>(
    () => `FC01-${String(Math.floor(10000 + Math.random() * 90000))}`
  );
  const [items, setItems] = useState<ItemCompra[]>([]);
  const [isSubmittingCompra, setIsSubmittingCompra] = useState(false);
  const [errorCompra, setErrorCompra] = useState<string | null>(null);
  const [comprasRecientes, setComprasRecientes] = useState<DocumentoCompra[]>([]);

  // Consulta de Compra por ID
  const [consultaId, setConsultaId] = useState<string>('');
  const [isSearchingCompra, setIsSearchingCompra] = useState(false);

  // Modal Proveedor CRUD
  const [isProvModalOpen, setIsProvModalOpen] = useState(false);
  const [editingProv, setEditingProv] = useState<Proveedor | null>(null);
  const [isSavingProv, setIsSavingProv] = useState(false);
  const [provForm, setProvForm] = useState({
    razonSocial: '',
    ruc: '',
    tipoDocumentoId: 2,
    telefono: '',
    direccion: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [provs, prods] = await Promise.all([
        proveedorService.obtenerProveedores().catch(() => [] as Proveedor[]),
        productoService.obtenerProductos().catch(() => [] as Producto[]),
      ]);

      setProveedores(Array.isArray(provs) ? provs : []);
      if (Array.isArray(provs) && provs.length > 0) {
        setProveedorId(provs[0].id);
      }

      setProductos(Array.isArray(prods) ? prods : []);
      if (Array.isArray(prods) && prods.length > 0 && items.length === 0) {
        const first = prods[0];
        const costo = Number(first.precioCompra ?? Number(first.precioVenta ?? 10) * 0.7);
        setItems([
          {
            productoId: first.id,
            nombre: first.nombre,
            cantidad: 10,
            precioUnitario: Number(costo.toFixed(2)),
            stockActual: Number(first.stockActual ?? 0),
          },
        ]);
      }
    } catch (err) {
      toast.error((err as Error)?.message || 'Error al cargar datos de abastecimiento');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddItem = () => {
    if (productos.length === 0) return;
    const used = new Set(items.map((i) => i.productoId));
    const candidate = productos.find((p) => !used.has(p.id)) || productos[0];
    const costo = Number(candidate.precioCompra ?? Number(candidate.precioVenta ?? 10) * 0.7);
    setItems([
      ...items,
      {
        productoId: candidate.id,
        nombre: candidate.nombre,
        cantidad: 10,
        precioUnitario: Number(costo.toFixed(2)),
        stockActual: Number(candidate.stockActual ?? 0),
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSelectProducto = (idx: number, prodId: number) => {
    const found = productos.find((p) => Number(p.id) === Number(prodId));
    if (!found) return;
    const costo = Number(found.precioCompra ?? Number(found.precioVenta ?? 10) * 0.7);
    const updated = [...items];
    updated[idx] = {
      productoId: found.id,
      nombre: found.nombre,
      cantidad: updated[idx].cantidad,
      precioUnitario: Number(costo.toFixed(2)),
      stockActual: Number(found.stockActual ?? 0),
    };
    setItems(updated);
  };

  const totalCompra = items.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0);
  const subtotalCompra = totalCompra / 1.18;
  const igvCompra = totalCompra - subtotalCompra;
  const simbolo = monedaId === 6 ? 'US$' : 'S/';

  const handleRegistrarCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCompra(null);

    if (!proveedorId) {
      setErrorCompra('Selecciona o registra un proveedor válido.');
      return;
    }

    setIsSubmittingCompra(true);
    try {
      const created = await compraService.registrarCompra({
        numeroDocumento:
          numeroDocCompra.trim() || `FC01-${String(Math.floor(10000 + Math.random() * 90000))}`,
        proveedorId: Number(proveedorId),
        usuarioId: user?.codigoUsuario || 'ADMIN01',
        monedaId: Number(monedaId),
        detalles: items.map((i) => ({
          productoId: Number(i.productoId),
          cantidad: Number(i.cantidad),
          precioUnitario: Number(i.precioUnitario),
        })),
      });

      toast.success(
        `¡Compra #${created.id} registrada! El stock de los productos se incrementó automáticamente.`
      );
      setComprasRecientes((prev) => [created, ...prev]);
      setNumeroDocCompra(`FC01-${String(Math.floor(10000 + Math.random() * 90000))}`);
      await loadData();
    } catch (err) {
      const msg = (err as Error)?.message || 'Error al registrar la orden de compra';
      setErrorCompra(msg);
      toast.error(msg);
    } finally {
      setIsSubmittingCompra(false);
    }
  };

  const handleBuscarCompraPorId = async (e: React.FormEvent) => {
    e.preventDefault();
    const idNum = Number(consultaId);
    if (!idNum || idNum < 1) {
      toast.error('Ingresa un ID numérico de compra válido (ej. 1).');
      return;
    }
    setIsSearchingCompra(true);
    try {
      const found = await compraService.obtenerCompraPorId(idNum);
      setComprasRecientes((prev) => {
        const filtered = prev.filter((c) => c.id !== found.id);
        return [found, ...filtered];
      });
      toast.info(`Compra #${found.id} (${found.numeroDocumento}) cargada.`);
    } catch (err) {
      toast.error((err as Error)?.message || `No se encontró la compra con ID #${idNum}`);
    } finally {
      setIsSearchingCompra(false);
    }
  };

  const handleAnularCompra = async (id: number) => {
    try {
      await compraService.anularCompra(id);
      toast.success(`Compra #${id} anulada y stock revertido.`);
      const updated = await compraService.obtenerCompraPorId(id);
      setComprasRecientes((prev) => prev.map((c) => (c.id === id ? updated : c)));
      await loadData();
    } catch (err) {
      toast.error((err as Error)?.message || 'Error al anular la compra');
    }
  };

  const openNewProvModal = () => {
    setEditingProv(null);
    setProvForm({
      razonSocial: '',
      ruc: '',
      tipoDocumentoId: 2,
      telefono: '',
      direccion: '',
    });
    setIsProvModalOpen(true);
  };

  const openEditProvModal = (p: Proveedor) => {
    setEditingProv(p);
    setProvForm({
      razonSocial: p.razonSocial || '',
      ruc: p.ruc || '',
      tipoDocumentoId: p.tipoDocumentoId || 2,
      telefono: p.telefono || '',
      direccion: p.direccion || '',
    });
    setIsProvModalOpen(true);
  };

  const handleSaveProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provForm.razonSocial.trim() || !provForm.ruc.trim()) {
      toast.error('Completa la Razón Social y el RUC del proveedor.');
      return;
    }
    setIsSavingProv(true);
    try {
      const payload = {
        razonSocial: provForm.razonSocial.trim(),
        ruc: provForm.ruc.trim(),
        tipoDocumentoId: Number(provForm.tipoDocumentoId),
        telefono: provForm.telefono.trim() || '014000000',
        direccion: provForm.direccion.trim() || 'Lima',
      };
      if (editingProv) {
        await proveedorService.actualizarProveedor(editingProv.id, payload);
        toast.success(`Proveedor "${payload.razonSocial}" actualizado.`);
      } else {
        const created = await proveedorService.crearProveedor(payload);
        toast.success(`Proveedor "${payload.razonSocial}" registrado.`);
        if (created?.id) setProveedorId(created.id);
      }
      setIsProvModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error((err as Error)?.message || 'Error al guardar proveedor');
    } finally {
      setIsSavingProv(false);
    }
  };

  const handleDeleteProveedor = async (p: Proveedor) => {
    try {
      await proveedorService.eliminarProveedor(p.id);
      toast.success(`Proveedor "${p.razonSocial}" inactivado.`);
      await loadData();
    } catch (err) {
      toast.error((err as Error)?.message || 'Error al inactivar proveedor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Compras & Proveedores</h2>
          <p className="text-sm text-slate-500">
            Abastecimiento de mercadería (incrementa el stock automáticamente) y directorio de proveedores con RUC
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'compras' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('compras')}
            leftIcon={<ShoppingBag className="w-4 h-4" />}
          >
            Órdenes de Compra
          </Button>
          <Button
            variant={activeTab === 'proveedores' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('proveedores')}
            leftIcon={<Building2 className="w-4 h-4" />}
          >
            Proveedores ({proveedores.length})
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <Spinner size="lg" label="Cargando proveedores y catálogo..." />
        </Card>
      ) : activeTab === 'compras' ? (
        <div className="space-y-6">
          {errorCompra && (
            <Alert type="error" message={errorCompra} onClose={() => setErrorCompra(null)} />
          )}

          <form onSubmit={handleRegistrarCompra} className="space-y-6">
            <Card title="Registrar Ingreso de Mercadería (Compra a Proveedor)">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700">Proveedor</label>
                    <button
                      type="button"
                      onClick={openNewProvModal}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      + Nuevo Proveedor
                    </button>
                  </div>
                  <select
                    value={proveedorId}
                    onChange={(e) => setProveedorId(Number(e.target.value))}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {proveedores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.razonSocial} (RUC: {p.ruc})
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="N° Factura / Guía Proveedor"
                  value={numeroDocCompra}
                  onChange={(e) => setNumeroDocCompra(e.target.value)}
                  required
                />

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
                  label="Responsable de Almacén"
                  value={user?.codigoUsuario || 'ADMIN01'}
                  disabled
                />
              </div>
            </Card>

            <Card
              title="Productos Adquiridos"
              subtitle="Al guardar la compra, las unidades ingresadas se suman automáticamente al stock disponible"
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
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-12 items-end gap-3 p-3.5 bg-slate-50/80 rounded-lg border border-slate-200"
                  >
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Producto #{idx + 1}{' '}
                        <span className="text-emerald-600 font-semibold">
                          (Stock actual: {it.stockActual} uds.)
                        </span>
                      </label>
                      <select
                        value={it.productoId}
                        onChange={(e) => handleSelectProducto(idx, Number(e.target.value))}
                        className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                      >
                        {productos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} (Stock: {p.stockActual ?? 0})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <Input
                        label="Cantidad a Ingresar"
                        type="number"
                        min="1"
                        step="1"
                        value={it.cantidad}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].cantidad = Math.max(1, Number(e.target.value));
                          setItems(updated);
                        }}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Input
                        label={`Costo Unit. (${simbolo})`}
                        type="number"
                        min="0.10"
                        step="0.01"
                        value={it.precioUnitario}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].precioUnitario = Math.max(0.01, Number(e.target.value));
                          setItems(updated);
                        }}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Input
                        label="Importe"
                        value={`${simbolo} ${(it.cantidad * it.precioUnitario).toFixed(2)}`}
                        disabled
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end pb-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-slate-600 space-y-1">
                  <div>
                    Subtotal: <strong>{simbolo} {subtotalCompra.toFixed(2)}</strong> | IGV (18%):{' '}
                    <strong>{simbolo} {igvCompra.toFixed(2)}</strong>
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    Total Orden de Compra:{' '}
                    <span className="text-indigo-600">
                      {simbolo} {totalCompra.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmittingCompra}
                  leftIcon={<Truck className="w-4 h-4" />}
                >
                  Registrar Compra y Sumar Stock
                </Button>
              </div>
            </Card>
          </form>

          {/* Consulta y listado de Compras */}
          <Card
            title="Consultar / Anular Compras Registradas"
            subtitle="Busca una compra por su ID (ej. 1, 2) o revisa las compras emitidas en esta sesión"
          >
            <form onSubmit={handleBuscarCompraPorId} className="flex items-end gap-3 mb-4 max-w-md">
              <Input
                label="Buscar Compra por ID"
                type="number"
                min="1"
                placeholder="Ej. 1"
                value={consultaId}
                onChange={(e) => setConsultaId(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
              <Button type="submit" variant="outline" isLoading={isSearchingCompra}>
                Consultar
              </Button>
            </form>

            {comprasRecientes.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">
                Aún no has consultado o registrado compras en esta vista. Prueba buscando el ID #1 o
                registrando una nueva compra arriba.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3.5">ID</th>
                      <th className="py-3 px-3.5">Documento</th>
                      <th className="py-3 px-3.5">Fecha</th>
                      <th className="py-3 px-3.5">Total</th>
                      <th className="py-3 px-3.5">Estado</th>
                      <th className="py-3 px-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {comprasRecientes.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3.5 font-semibold text-slate-800">#{c.id}</td>
                        <td className="py-3 px-3.5 font-mono text-xs">{c.numeroDocumento}</td>
                        <td className="py-3 px-3.5 text-xs">{c.fechaEmision || 'Hoy'}</td>
                        <td className="py-3 px-3.5 font-bold text-slate-900">
                          S/ {Number(c.total || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-3.5">
                          <Badge variant={c.anulado ? 'danger' : 'success'}>
                            {c.anulado ? 'ANULADO' : 'REGISTRADO'}
                          </Badge>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          {!c.anulado && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleAnularCompra(c.id)}
                              leftIcon={<Ban className="w-3.5 h-3.5" />}
                            >
                              Anular
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      ) : (
        /* Pestaña Directorio de Proveedores */
        <Card
          title="Directorio de Proveedores"
          subtitle="Empresas mayoristas y distribuidores registrados"
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={openNewProvModal}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Nuevo Proveedor
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">ID</th>
                  <th className="py-3 px-3.5">RUC</th>
                  <th className="py-3 px-3.5">Razón Social</th>
                  <th className="py-3 px-3.5">Teléfono</th>
                  <th className="py-3 px-3.5">Dirección</th>
                  <th className="py-3 px-3.5">Estado</th>
                  <th className="py-3 px-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proveedores.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3.5 font-mono text-xs">#{p.id}</td>
                    <td className="py-3 px-3.5 font-mono text-xs font-semibold text-indigo-600">
                      {p.ruc}
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-slate-800">{p.razonSocial}</td>
                    <td className="py-3 px-3.5 text-xs">{p.telefono || '-'}</td>
                    <td className="py-3 px-3.5 text-xs">{p.direccion || '-'}</td>
                    <td className="py-3 px-3.5">
                      <Badge variant={p.activo === false ? 'danger' : 'success'}>
                        {p.activo === false ? 'INACTIVO' : 'ACTIVO'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditProvModal(p)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                          title="Editar proveedor"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProveedor(p)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                          title="Inactivar proveedor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Crear / Editar Proveedor */}
      <Modal
        isOpen={isProvModalOpen}
        onClose={() => setIsProvModalOpen(false)}
        title={editingProv ? `Editar Proveedor: ${editingProv.razonSocial}` : 'Nuevo Proveedor'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsProvModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSaveProveedor} isLoading={isSavingProv}>
              {editingProv ? 'Guardar Cambios' : 'Registrar Proveedor'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveProveedor} className="space-y-4">
          <Input
            label="RUC (11 dígitos)"
            placeholder="Ej. 20100055237"
            value={provForm.ruc}
            onChange={(e) => setProvForm({ ...provForm, ruc: e.target.value })}
            required
          />
          <Input
            label="Razón Social"
            placeholder="Ej. Alicorp S.A.A."
            value={provForm.razonSocial}
            onChange={(e) => setProvForm({ ...provForm, razonSocial: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Teléfono"
              placeholder="Ej. 01-3150800"
              value={provForm.telefono}
              onChange={(e) => setProvForm({ ...provForm, telefono: e.target.value })}
            />
            <Input
              label="Dirección"
              placeholder="Ej. Av. Argentina 4793, Callao"
              value={provForm.direccion}
              onChange={(e) => setProvForm({ ...provForm, direccion: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
