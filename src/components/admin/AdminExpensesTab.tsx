import React, { useState } from 'react';
import {
  TrendingDown,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Building,
  Users,
  Wrench,
  Wifi,
  Megaphone,
  Sparkles,
  X,
  FileText,
  Pencil,
  Trash2,
  Check,
} from 'lucide-react';
import {
  ExpenseRecord,
  ExpenseCategory,
  PaymentMethod,
} from '../../types';

interface AdminExpensesTabProps {
  expenses: ExpenseRecord[];
  onAddExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
  onUpdateExpense?: (expense: ExpenseRecord) => void;
  onDeleteExpense?: (id: string) => void;
  onUpdateExpenseStatus: (id: string, status: 'pagado' | 'pendiente') => void;
}

const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; icon: any; color: string }
> = {
  alquiler_local: { label: 'Alquiler Sede SJL', icon: Building, color: 'text-purple-700 bg-purple-50' },
  pago_instructores: { label: 'Pago a Instructores', icon: Users, color: 'text-blue-700 bg-blue-50' },
  mantenimiento_reformers: { label: 'Mantenimiento Allegro 2', icon: Wrench, color: 'text-amber-700 bg-amber-50' },
  servicios_luz_agua_wifi: { label: 'Luz, Agua & Fibra', icon: Wifi, color: 'text-emerald-700 bg-emerald-50' },
  marketing_redes: { label: 'Marketing Meta Ads', icon: Megaphone, color: 'text-rose-700 bg-rose-50' },
  insumos_limpieza: { label: 'Insumos & Limpieza', icon: Sparkles, color: 'text-cyan-700 bg-cyan-50' },
  otros: { label: 'Otros Gastos', icon: FileText, color: 'text-zinc-700 bg-zinc-50' },
};

export const AdminExpensesTab: React.FC<AdminExpensesTabProps> = ({
  expenses,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onUpdateExpenseStatus,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Form state
  const [formData, setFormData] = useState<{
    description: string;
    category: ExpenseCategory;
    amount: string;
    recipient: string;
    paymentMethod: PaymentMethod;
    status: 'pagado' | 'pendiente';
    receiptNumber: string;
  }>({
    description: '',
    category: 'insumos_limpieza',
    amount: '',
    recipient: '',
    paymentMethod: 'transferencia_bcp',
    status: 'pagado',
    receiptNumber: '',
  });

  // Edit form state
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [editExpenseForm, setEditExpenseForm] = useState<{
    description: string;
    category: ExpenseCategory;
    amount: string;
    recipient: string;
    paymentMethod: PaymentMethod;
    status: 'pagado' | 'pendiente';
    receiptNumber: string;
    date: string;
  }>({
    description: '',
    category: 'otros',
    amount: '',
    recipient: '',
    paymentMethod: 'efectivo',
    status: 'pagado',
    receiptNumber: '',
    date: '',
  });

  const handleStartEditExpense = (expense: ExpenseRecord) => {
    setEditingExpense(expense);
    setEditExpenseForm({
      description: expense.description,
      category: expense.category,
      amount: expense.amount.toString(),
      recipient: expense.recipient,
      paymentMethod: expense.paymentMethod,
      status: expense.status,
      receiptNumber: expense.receiptNumber || '',
      date: expense.date,
    });
  };

  const handleSaveEditExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !editExpenseForm.description.trim()) return;
    const amt = parseFloat(editExpenseForm.amount);
    if (isNaN(amt) || amt <= 0) return;

    const updated: ExpenseRecord = {
      ...editingExpense,
      description: editExpenseForm.description.trim(),
      category: editExpenseForm.category,
      amount: amt,
      recipient: editExpenseForm.recipient.trim() || 'No especificado',
      paymentMethod: editExpenseForm.paymentMethod,
      status: editExpenseForm.status,
      receiptNumber: editExpenseForm.receiptNumber.trim() || undefined,
      date: editExpenseForm.date || editingExpense.date,
    };

    onUpdateExpense?.(updated);
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: string, description: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el egreso "${description}"? Esta acción no se puede deshacer.`)) {
      onDeleteExpense?.(id);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPaid = expenses.filter((e) => e.status === 'pagado').reduce((sum, e) => sum + e.amount, 0);
  const totalPending = expenses.filter((e) => e.status === 'pendiente').reduce((sum, e) => sum + e.amount, 0);

  const filteredExpenses = expenses.filter((e) => {
    const matchesCat = selectedCategory === 'todas' || e.category === selectedCategory;
    const matchesStatus = statusFilter === 'todos' || e.status === statusFilter;
    return matchesCat && matchesStatus;
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0 || !formData.description.trim()) return;

    onAddExpense({
      description: formData.description.trim(),
      category: formData.category,
      amount: amt,
      date: new Date().toLocaleDateString('es-PE'),
      recipient: formData.recipient.trim() || 'Proveedor',
      paymentMethod: formData.paymentMethod,
      status: formData.status,
      receiptNumber: formData.receiptNumber.trim() || 'Recibo Interno',
    });

    setFormData({
      description: '',
      category: 'insumos_limpieza',
      amount: '',
      recipient: '',
      paymentMethod: 'transferencia_bcp',
      status: 'pagado',
      receiptNumber: '',
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-fraunces text-xl font-medium text-[#1A1815]">
            Control de Gastos & Costos Operativos
          </h2>
          <p className="text-xs text-[#6B655C] mt-0.5">
            Registro de alquiler de local, honorarios a profesores, mantenimiento de muelles e insumos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="bg-[#B5654A] hover:bg-[#9A5340] text-[#FAF8F5] px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Registrar Nuevo Gasto</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FAF8F5] border border-[#E4DED4] p-4 rounded-xl shadow-xs">
          <span className="text-xs text-[#6B655C] font-medium block">Total Egresos Registrados</span>
          <span className="text-2xl font-bold text-rose-700 mt-1 block">
            S/. {totalExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-[#6B655C] mt-1 block">
            {expenses.length} conceptos presupuestados
          </span>
        </div>

        <div className="bg-[#FAF8F5] border border-[#E4DED4] p-4 rounded-xl shadow-xs">
          <span className="text-xs text-[#6B655C] font-medium block">Pagados / Al Día</span>
          <span className="text-2xl font-bold text-zinc-800 mt-1 block">
            S/. {totalPaid.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Egresos conciliados
          </span>
        </div>

        <div className="bg-[#FAF8F5] border border-[#E4DED4] p-4 rounded-xl shadow-xs">
          <span className="text-xs text-[#6B655C] font-medium block">Por Pagar / Pendientes</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">
            S/. {totalPending.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Facturas o insumos por cancelar
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#6B655C] font-medium">Categoría:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-xs px-2.5 py-1.5 text-[#1A1815]"
          >
            <option value="todas">Todas las Categorías</option>
            {Object.entries(CATEGORY_META).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs text-[#6B655C] font-medium">Estado:</span>
          {(['todos', 'pagado', 'pendiente'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#1A1815] text-[#FAF8F5]'
                  : 'bg-[#F1ECE5] text-[#6B655C] hover:text-[#1A1815]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F1ECE5] text-[#6B655C] font-semibold uppercase tracking-wider border-b border-[#E4DED4] text-[10px]">
              <tr>
                <th className="py-3 px-4">Concepto del Gasto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Proveedor / Beneficiario</th>
                <th className="py-3 px-4">Fecha & Comprobante</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DED4] text-[#1A1815]">
              {filteredExpenses.map((exp) => {
                const meta = CATEGORY_META[exp.category] || CATEGORY_META.otros;
                const Icon = meta.icon;
                return (
                  <tr key={exp.id} className="hover:bg-[#F1ECE5]/40 transition-colors">
                    <td className="py-3 px-4 font-medium">
                      <span className="font-semibold text-xs block text-[#1A1815]">
                        {exp.description}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${meta.color}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{meta.label}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#6B655C]">
                      {exp.recipient}
                    </td>

                    <td className="py-3 px-4 text-[11px] text-[#6B655C]">
                      <div>{exp.date}</div>
                      <div className="font-mono text-[10px] text-[#1A1815]">{exp.receiptNumber}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          exp.status === 'pagado'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {exp.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-sm text-rose-700">
                      - S/. {exp.amount.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {exp.status === 'pendiente' ? (
                          <button
                            type="button"
                            onClick={() => onUpdateExpenseStatus(exp.id, 'pagado')}
                            className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-[#FAF8F5] rounded transition-colors cursor-pointer"
                          >
                            Pagar
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-semibold px-1.5 py-0.5 bg-emerald-50 rounded border border-emerald-200">
                            Pagado ✓
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleStartEditExpense(exp)}
                          className="p-1.5 rounded bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#1A1815] transition-colors cursor-pointer border border-[#DDD5C9]"
                          title="Editar gasto"
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#B5654A]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(exp.id, exp.description)}
                          className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer border border-rose-200"
                          title="Eliminar gasto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form
            onSubmit={handleCreateExpense}
            className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E4DED4]">
              <h3 className="font-fraunces text-lg font-medium text-[#1A1815]">
                Registrar Egreso / Gasto del Estudio
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-[#6B655C] hover:text-[#1A1815]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                  Concepto del Gasto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej. Reemplazo de muelles Reformer Allegro 2..."
                  className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                  >
                    {Object.entries(CATEGORY_META).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Monto (S/.) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="Ej. 450.00"
                    className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815] font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Beneficiario / Proveedor
                  </label>
                  <input
                    type="text"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    placeholder="Ej. Técnica Pilates Pro..."
                    className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    N° Factura / Boleta / Recibo
                  </label>
                  <input
                    type="text"
                    value={formData.receiptNumber}
                    onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                    placeholder="Ej. FACT-001-921"
                    className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                  >
                    <option value="transferencia_bcp">BCP Transferencia</option>
                    <option value="transferencia_bbva">BBVA Transferencia</option>
                    <option value="yape">Yape</option>
                    <option value="plin">Plin</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta_pos">Tarjeta POS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pagado' | 'pendiente' })}
                    className="w-full px-3 py-1.5 bg-[#F1ECE5] border border-[#E4DED4] rounded-lg text-[#1A1815]"
                  >
                    <option value="pagado">Pagado</option>
                    <option value="pendiente">Pendiente por Pagar</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E4DED4]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-[#6B655C] hover:text-[#1A1815]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Guardar Gasto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEditExpense}
            className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E4DED4]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#B5654A]/10 text-[#B5654A]">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-fraunces text-lg font-medium text-[#1A1815]">
                    Editar Egreso / Gasto
                  </h3>
                  <p className="text-xs text-[#6B655C]">
                    Modifica concepto, monto, categoría o comprobante.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="p-1.5 text-[#6B655C] hover:text-[#1A1815] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                  Concepto del Gasto *
                </label>
                <input
                  type="text"
                  required
                  value={editExpenseForm.description}
                  onChange={(e) => setEditExpenseForm({ ...editExpenseForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Categoría
                  </label>
                  <select
                    value={editExpenseForm.category}
                    onChange={(e) =>
                      setEditExpenseForm({ ...editExpenseForm, category: e.target.value as ExpenseCategory })
                    }
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  >
                    <option value="alquiler_local">Alquiler Sede SJL</option>
                    <option value="pago_instructores">Pago a Instructores</option>
                    <option value="mantenimiento_reformers">Mantenimiento Allegro 2</option>
                    <option value="servicios_luz_agua_wifi">Luz, Agua & Wifi</option>
                    <option value="marketing_redes">Marketing Meta Ads</option>
                    <option value="insumos_limpieza">Insumos & Limpieza</option>
                    <option value="otros">Otros Gastos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Monto (S/.) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editExpenseForm.amount}
                    onChange={(e) => setEditExpenseForm({ ...editExpenseForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                  Beneficiario / Proveedor / Personal
                </label>
                <input
                  type="text"
                  value={editExpenseForm.recipient}
                  onChange={(e) => setEditExpenseForm({ ...editExpenseForm, recipient: e.target.value })}
                  placeholder="Ej. Inmobiliaria, Instructor Luis, etc."
                  className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={editExpenseForm.paymentMethod}
                    onChange={(e) =>
                      setEditExpenseForm({ ...editExpenseForm, paymentMethod: e.target.value as PaymentMethod })
                    }
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  >
                    <option value="transferencia_bcp">Transferencia BCP</option>
                    <option value="transferencia_interbank">Interbank</option>
                    <option value="yape">Yape</option>
                    <option value="plin">Plin</option>
                    <option value="tarjeta_credito">Tarjeta Crédito/Débito</option>
                    <option value="efectivo">Efectivo Caja Chica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    N° Boleta / Operación
                  </label>
                  <input
                    type="text"
                    value={editExpenseForm.receiptNumber}
                    onChange={(e) => setEditExpenseForm({ ...editExpenseForm, receiptNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Fecha Registrada
                  </label>
                  <input
                    type="text"
                    value={editExpenseForm.date}
                    onChange={(e) => setEditExpenseForm({ ...editExpenseForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B655C] mb-1">
                    Estado del Pago
                  </label>
                  <select
                    value={editExpenseForm.status}
                    onChange={(e) =>
                      setEditExpenseForm({ ...editExpenseForm, status: e.target.value as 'pagado' | 'pendiente' })
                    }
                    className="w-full px-3 py-2 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl text-[#1A1815]"
                  >
                    <option value="pagado">Pagado</option>
                    <option value="pendiente">Pendiente por Pagar</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E4DED4]">
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="px-4 py-2 text-xs text-[#6B655C] hover:text-[#1A1815] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Actualizar Gasto</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
