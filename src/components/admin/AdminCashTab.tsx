import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  ArrowDownLeft,
  DollarSign,
  Printer,
  FileCheck,
  CheckCircle2,
  Lock,
  Unlock,
  CreditCard,
  Smartphone,
  Building2,
  X,
  Share2,
  Pencil,
  Trash2,
  Check,
  Download,
} from 'lucide-react';
import {
  CashTransaction,
  CashRegisterState,
  PaymentMethod,
} from '../../types';

interface AdminCashTabProps {
  transactions: CashTransaction[];
  cashRegister: CashRegisterState;
  onAddTransaction: (tx: Omit<CashTransaction, 'id'>) => void;
  onUpdateTransaction?: (tx: CashTransaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onToggleRegister: () => void;
}

const METHOD_LABELS: Record<PaymentMethod, { label: string; icon: any }> = {
  yape: { label: 'Yape', icon: Smartphone },
  plin: { label: 'Plin', icon: Smartphone },
  tarjeta_pos: { label: 'Tarjeta POS', icon: CreditCard },
  efectivo: { label: 'Efectivo', icon: DollarSign },
  transferencia_bcp: { label: 'BCP Transferencia', icon: Building2 },
  transferencia_bbva: { label: 'BBVA Transferencia', icon: Building2 },
};

export const AdminCashTab: React.FC<AdminCashTabProps> = ({
  transactions,
  cashRegister,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onToggleRegister,
}) => {
  const [showNewTxModal, setShowNewTxModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<CashTransaction | null>(null);

  // Form state for new charge
  const [formData, setFormData] = useState<{
    concept: string;
    category: CashTransaction['category'];
    amount: string;
    paymentMethod: PaymentMethod;
    clientName: string;
    notes: string;
  }>({
    concept: 'Membresía Ilimitada Reformer Mensual',
    category: 'membresia',
    amount: '890',
    paymentMethod: 'yape',
    clientName: '',
    notes: '',
  });

  // Edit form state
  const [editingTx, setEditingTx] = useState<CashTransaction | null>(null);
  const [editTxForm, setEditTxForm] = useState<{
    concept: string;
    category: CashTransaction['category'];
    amount: string;
    paymentMethod: PaymentMethod;
    clientName: string;
    receiptNumber: string;
    date: string;
    time: string;
    notes: string;
  }>({
    concept: '',
    category: 'membresia',
    amount: '',
    paymentMethod: 'yape',
    clientName: '',
    receiptNumber: '',
    date: '',
    time: '',
    notes: '',
  });

  const handleStartEditTx = (tx: CashTransaction) => {
    setEditingTx(tx);
    setEditTxForm({
      concept: tx.concept,
      category: tx.category,
      amount: tx.amount.toString(),
      paymentMethod: tx.paymentMethod,
      clientName: tx.clientName || '',
      receiptNumber: tx.receiptNumber,
      date: tx.date,
      time: tx.time,
      notes: tx.notes || '',
    });
  };

  const handleSaveEditTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !editTxForm.concept.trim()) return;
    const amt = parseFloat(editTxForm.amount);
    if (isNaN(amt) || amt <= 0) return;

    const updated: CashTransaction = {
      ...editingTx,
      concept: editTxForm.concept.trim(),
      category: editTxForm.category,
      amount: amt,
      paymentMethod: editTxForm.paymentMethod,
      clientName: editTxForm.clientName.trim() || 'Cliente Mostrador',
      receiptNumber: editTxForm.receiptNumber.trim() || editingTx.receiptNumber,
      date: editTxForm.date || editingTx.date,
      time: editTxForm.time || editingTx.time,
      notes: editTxForm.notes.trim() || undefined,
    };

    onUpdateTransaction?.(updated);
    setEditingTx(null);
  };

  const handleDeleteTx = (id: string, receiptNumber: string) => {
    if (window.confirm(`¿Estás seguro de anular/eliminar el movimiento con boleta ${receiptNumber}? Esta acción no se puede deshacer.`)) {
      onDeleteTransaction?.(id);
    }
  };

  // Calculate totals
  const todayStr = '02/09/2026';
  const todayTx = transactions.filter((t) => t.date === todayStr);

  const totalToday = todayTx.reduce((sum, t) => sum + t.amount, 0);

  // Breakdown by method
  const methodTotals: Record<PaymentMethod, number> = {
    yape: 0,
    plin: 0,
    tarjeta_pos: 0,
    efectivo: 0,
    transferencia_bcp: 0,
    transferencia_bbva: 0,
  };

  todayTx.forEach((t) => {
    methodTotals[t.paymentMethod] = (methodTotals[t.paymentMethod] || 0) + t.amount;
  });

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) return;

    const receiptNum = `B001-00${840 + transactions.length + 1}`;

    onAddTransaction({
      type: 'ingreso',
      concept: formData.concept,
      category: formData.category,
      amount: amt,
      paymentMethod: formData.paymentMethod,
      clientName: formData.clientName.trim() || 'Cliente Mostrador',
      receiptNumber: receiptNum,
      date: todayStr,
      time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      notes: formData.notes.trim(),
    });

    setFormData({
      concept: 'Membresía Ilimitada Reformer Mensual',
      category: 'membresia',
      amount: '890',
      paymentMethod: 'yape',
      clientName: '',
      notes: '',
    });
    setShowNewTxModal(false);
  };

  const handleExportCashReport = () => {
    const headers = ['N° Recibo', 'Fecha', 'Hora', 'Concepto', 'Categoría', 'Cliente', 'Método de Pago', 'Monto (S/.)', 'Notas'];
    const rows = transactions.map((t) => [
      t.receiptNumber,
      t.date,
      t.time,
      `"${(t.concept || '').replace(/"/g, '""')}"`,
      t.category,
      `"${(t.clientName || 'Cliente Mostrador').replace(/"/g, '""')}"`,
      METHOD_LABELS[t.paymentMethod]?.label || t.paymentMethod,
      t.amount.toFixed(2),
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cuadre_caja_firme_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Cash Register Status */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                cashRegister.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B655C]">
              {cashRegister.isOpen ? 'Caja Operativa Abierta' : 'Caja Cerrada'}
            </span>
          </div>
          <h2 className="font-fraunces text-xl font-medium text-[#1A1815] mt-0.5">
            Caja Diaria & Cobranzas · Sede SJL
          </h2>
          <p className="text-xs text-[#6B655C] mt-0.5">
            Apertura: {cashRegister.openedAt} · Base inicial: S/. {cashRegister.openingAmount} en efectivo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCashReport}
            className="bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#1A1815] border border-[#E4DED4] px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            title="Descargar reporte en formato CSV compatible con Excel"
          >
            <Download className="w-3.5 h-3.5 text-[#B5654A]" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={onToggleRegister}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors border cursor-pointer inline-flex items-center gap-1.5 ${
              cashRegister.isOpen
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                : 'bg-emerald-600 text-[#FAF8F5] border-emerald-700 hover:bg-emerald-700'
            }`}
          >
            {cashRegister.isOpen ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{cashRegister.isOpen ? 'Hacer Cierre de Caja' : 'Abrir Turno de Caja'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewTxModal(true)}
            className="bg-[#B5654A] hover:bg-[#9A5340] text-[#FAF8F5] px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Registrar Cobro</span>
          </button>
        </div>
      </div>

      {/* Breakdown by Payment Methods */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(Object.keys(methodTotals) as PaymentMethod[]).map((method) => {
          const info = METHOD_LABELS[method];
          const Icon = info.icon;
          const val = methodTotals[method];
          return (
            <div
              key={method}
              className="bg-[#FAF8F5] border border-[#E4DED4] p-3.5 rounded-xl shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[#6B655C]">
                <span className="text-[11px] font-medium">{info.label}</span>
                <Icon className="w-3.5 h-3.5 text-[#B5654A]" />
              </div>
              <div className="mt-2 font-bold text-sm text-[#1A1815]">
                S/. {val.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Income Banner for Today */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <span className="text-xs text-[#6B655C] font-semibold uppercase tracking-wider">
            Total Recaudado Hoy ({todayStr})
          </span>
          <div className="text-3xl font-bold text-emerald-800 mt-0.5">
            S/. {totalToday.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="text-right text-xs text-[#6B655C]">
          <span>Efectivo en gaveta: </span>
          <strong className="text-[#1A1815]">
            S/. {(cashRegister.openingAmount + methodTotals.efectivo).toFixed(2)}
          </strong>{' '}
          (incluye base de S/. {cashRegister.openingAmount})
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 bg-[#F1ECE5] border-b border-[#E4DED4] flex items-center justify-between">
          <h3 className="font-fraunces text-base font-medium text-[#1A1815]">
            Movimientos y Boletas de Pago
          </h3>
          <span className="text-xs text-[#6B655C]">
            Mostrando {transactions.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#6B655C] font-semibold uppercase tracking-wider border-b border-[#E4DED4] text-[10px]">
              <tr>
                <th className="py-3 px-4">Comprobante</th>
                <th className="py-3 px-4">Concepto / Detalle</th>
                <th className="py-3 px-4">Alumno / Cliente</th>
                <th className="py-3 px-4">Método de Pago</th>
                <th className="py-3 px-4">Fecha & Hora</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DED4] text-[#1A1815]">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#F1ECE5]/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#B5654A] text-xs">
                    {tx.receiptNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-xs block">{tx.concept}</span>
                    {tx.notes && <span className="text-[10px] text-[#6B655C]">{tx.notes}</span>}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#1A1815]">
                    {tx.clientName || 'Cliente Mostrador'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E4DED4] text-[#1A1815]">
                      {METHOD_LABELS[tx.paymentMethod]?.label || tx.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-[#6B655C]">
                    {tx.date} · {tx.time}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-sm text-emerald-800">
                    + S/. {tx.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(tx)}
                        className="p-1.5 rounded text-[#6B655C] hover:text-[#1A1815] hover:bg-[#E4DED4] transition-colors cursor-pointer"
                        title="Ver Boleta / Recibo"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartEditTx(tx)}
                        className="p-1.5 rounded text-[#6B655C] hover:text-[#B5654A] hover:bg-[#E4DED4] transition-colors cursor-pointer"
                        title="Editar Cobro"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTx(tx.id, tx.receiptNumber)}
                        className="p-1.5 rounded text-[#6B655C] hover:text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Eliminar Movimiento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Charge Modal */}
      {showNewTxModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form
            onSubmit={handleCreateTransaction}
            className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E4DED4]">
              <h3 className="font-fraunces text-lg font-medium text-[#1A1815]">
                Registrar Nuevo Cobro en Recepción
              </h3>
              <button
                type="button"
                onClick={() => setShowNewTxModal(false)}
                className="p-1 text-[#6B655C] hover:text-[#1A1815]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                  Concepto / Paquete *
                </label>
                <select
                  value={formData.concept}
                  onChange={(e) => {
                    const c = e.target.value;
                    let amt = '890';
                    let cat: CashTransaction['category'] = 'membresia';
                    if (c.includes('Pack 8')) {
                      amt = '680';
                      cat = 'pack_clases';
                    } else if (c.includes('Clase Suelta')) {
                      amt = '95';
                      cat = 'clase_suelta';
                    } else if (c.includes('Calcetines')) {
                      amt = '45';
                      cat = 'tienda_calcetines';
                    } else if (c.includes('Bebida')) {
                      amt = '12';
                      cat = 'bebidas';
                    }
                    setFormData({ ...formData, concept: c, amount: amt, category: cat });
                  }}
                  className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                >
                  <option value="Membresía Ilimitada Reformer Mensual">Membresía Ilimitada Reformer Mensual (S/. 890)</option>
                  <option value="Pack 8 Clases Reformer & Mat">Pack 8 Clases Reformer & Mat (S/. 680)</option>
                  <option value="Clase Suelta Reformer">Clase Suelta Reformer (S/. 95)</option>
                  <option value="Calcetines Grip Firme Studio">Calcetines Grip Firme Studio (S/. 45)</option>
                  <option value="Bebida Isotónica / Agua San Mateo">Bebida Isotónica / Agua (S/. 12)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Monto en Soles (S/.) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Método de Pago *
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                  >
                    <option value="yape">Yape</option>
                    <option value="plin">Plin</option>
                    <option value="tarjeta_pos">Tarjeta POS (Izipay/Niubiz)</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia_bcp">BCP Transferencia</option>
                    <option value="transferencia_bbva">BBVA Transferencia</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                  Nombre del Alumno / Cliente
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Ej. Valeria Mendoza..."
                  className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                  Notas / N° de Operación
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ej. Operación Yape #182910..."
                  className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E4DED4]">
              <button
                type="button"
                onClick={() => setShowNewTxModal(false)}
                className="px-3 py-1.5 text-xs text-[#6B655C] hover:text-[#1A1815]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Confirmar Cobro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Receipt Ticket Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 animate-in fade-in text-[#1A1815]">
            <div className="text-center border-b border-[#E4DED4] pb-3">
              <span className="font-fraunces text-xl font-bold tracking-tight block">
                FIRME STUDIO
              </span>
              <span className="text-[10px] text-[#6B655C] uppercase tracking-widest block">
                Pilates Reformer & Mat · Sede Lima SJL
              </span>
              <span className="text-[10px] text-[#6B655C] block">
                RUC: 20609823142
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6B655C]">Comprobante:</span>
                <span className="font-mono font-bold text-[#B5654A]">{selectedReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B655C]">Fecha & Hora:</span>
                <span>{selectedReceipt.date} {selectedReceipt.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B655C]">Cliente:</span>
                <span className="font-semibold">{selectedReceipt.clientName || 'Cliente'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B655C]">Método de Pago:</span>
                <span className="uppercase font-semibold text-[11px]">
                  {METHOD_LABELS[selectedReceipt.paymentMethod]?.label || selectedReceipt.paymentMethod}
                </span>
              </div>
            </div>

            <div className="py-2.5 border-y border-[#E4DED4] space-y-1 text-xs">
              <div className="flex justify-between font-semibold">
                <span>{selectedReceipt.concept}</span>
                <span>S/. {selectedReceipt.amount.toFixed(2)}</span>
              </div>
              {selectedReceipt.notes && (
                <span className="text-[10px] text-[#6B655C] block italic">{selectedReceipt.notes}</span>
              )}
            </div>

            <div className="flex justify-between text-sm font-bold pt-1">
              <span>TOTAL PAGADO:</span>
              <span className="text-[#B5654A]">S/. {selectedReceipt.amount.toFixed(2)}</span>
            </div>

            <div className="text-center pt-2 text-[10px] text-[#6B655C]">
              ¡Gracias por entrenar con precisión en FIRME STUDIO!
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E4DED4]">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-3 py-1.5 text-xs text-[#6B655C] hover:text-[#1A1815]"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-3.5 py-1.5 bg-[#1A1815] hover:bg-black text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Recibo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEditTx}
            className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DED4]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#B5654A]/10 text-[#B5654A]">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-fraunces text-lg font-medium text-[#1A1815]">
                    Editar Registro de Cobro
                  </h3>
                  <p className="text-xs text-[#6B655C]">
                    Comprobante {editingTx.receiptNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="p-1.5 text-[#6B655C] hover:text-[#1A1815] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                  Concepto / Detalle *
                </label>
                <input
                  type="text"
                  required
                  value={editTxForm.concept}
                  onChange={(e) => setEditTxForm({ ...editTxForm, concept: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Categoría
                  </label>
                  <select
                    value={editTxForm.category}
                    onChange={(e) => setEditTxForm({ ...editTxForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  >
                    <option value="membresia">Membresía Mensual</option>
                    <option value="pack_clases">Pack de Clases</option>
                    <option value="clase_suelta">Clase Suelta</option>
                    <option value="tienda_calcetines">Tienda / Calcetines</option>
                    <option value="bebidas">Bebidas / Snacks</option>
                    <option value="otros">Otros Ingresos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Monto (S/.) *
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={editTxForm.amount}
                    onChange={(e) => setEditTxForm({ ...editTxForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815] font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={editTxForm.paymentMethod}
                    onChange={(e) => setEditTxForm({ ...editTxForm, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  >
                    <option value="yape">Yape</option>
                    <option value="plin">Plin</option>
                    <option value="tarjeta_pos">Tarjeta POS (Visa/MC)</option>
                    <option value="efectivo">Efectivo en Caja</option>
                    <option value="transferencia_bcp">Transferencia BCP</option>
                    <option value="transferencia_bbva">Transferencia BBVA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    N° Comprobante
                  </label>
                  <input
                    type="text"
                    value={editTxForm.receiptNumber}
                    onChange={(e) => setEditTxForm({ ...editTxForm, receiptNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815] font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                  Nombre Alumno / Cliente
                </label>
                <input
                  type="text"
                  value={editTxForm.clientName}
                  onChange={(e) => setEditTxForm({ ...editTxForm, clientName: e.target.value })}
                  placeholder="Ej. Valeria Rivas"
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Fecha (DD/MM/AAAA)
                  </label>
                  <input
                    type="text"
                    value={editTxForm.date}
                    onChange={(e) => setEditTxForm({ ...editTxForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Hora
                  </label>
                  <input
                    type="text"
                    value={editTxForm.time}
                    onChange={(e) => setEditTxForm({ ...editTxForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                  Notas / N° de Operación Bancaria
                </label>
                <input
                  type="text"
                  value={editTxForm.notes}
                  onChange={(e) => setEditTxForm({ ...editTxForm, notes: e.target.value })}
                  placeholder="Ej. Op Yape #948271"
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E4DED4]">
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="px-4 py-2 text-xs text-[#6B655C] hover:text-[#1A1815] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Actualizar Cobro</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
