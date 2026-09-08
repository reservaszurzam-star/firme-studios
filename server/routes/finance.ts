import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import { CashTransaction, ExpenseRecord } from '../../src/types';

const router = Router();

// --- Cash Register ---
router.get('/register', (req: Request, res: Response) => {
  const register = store.getCashRegister();
  res.json({ success: true, data: register });
});

router.post('/register/toggle', (req: Request, res: Response) => {
  const register = store.toggleCashRegister();
  res.json({
    success: true,
    data: register,
    message: register.isOpen ? 'Caja diaria abierta' : 'Caja diaria cerrada con cuadre',
  });
});

// --- Transactions (Ingresos) ---
router.get('/transactions', (req: Request, res: Response) => {
  const { paymentMethod, category, date } = req.query;
  let txs = store.getTransactions();

  if (paymentMethod) {
    txs = txs.filter((t) => t.paymentMethod === paymentMethod);
  }
  if (category) {
    txs = txs.filter((t) => t.category === category);
  }
  if (date) {
    txs = txs.filter((t) => t.date === date);
  }

  const totalAmount = txs.reduce((sum, t) => sum + t.amount, 0);

  res.json({ success: true, data: txs, totalAmount, count: txs.length });
});

router.post('/transactions', (req: Request, res: Response) => {
  const { concept, category, amount, paymentMethod, clientName, receiptNumber, date, time, notes } = req.body;

  if (!concept || amount === undefined || !paymentMethod) {
    return res.status(400).json({ success: false, error: 'Concepto, monto y método de pago son requeridos' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Monto inválido' });
  }

  const now = new Date();
  const dateStr = date || now.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = time || now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  const autoReceipt = receiptNumber || `B001-${Math.floor(1000 + Math.random() * 9000)}`;

  const newTx: CashTransaction = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: 'ingreso',
    concept,
    category: category || 'membresia',
    amount: numAmount,
    paymentMethod,
    clientName: clientName || 'Cliente Mostrador',
    receiptNumber: autoReceipt,
    date: dateStr,
    time: timeStr,
    notes: notes || '',
  };

  const created = store.addTransaction(newTx);
  res.status(201).json({ success: true, data: created, message: 'Cobro registrado correctamente' });
});

router.put('/transactions/:id', (req: Request, res: Response) => {
  const updated = store.updateTransaction(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Transacción no encontrada para actualizar' });
  }
  res.json({ success: true, data: updated, message: 'Transacción actualizada' });
});

router.delete('/transactions/:id', (req: Request, res: Response) => {
  const deleted = store.deleteTransaction(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Transacción no encontrada para eliminar' });
  }
  res.json({ success: true, message: 'Movimiento anulado/eliminado' });
});

// --- Expenses (Egresos) ---
router.get('/expenses', (req: Request, res: Response) => {
  const { category, status } = req.query;
  let exps = store.getExpenses();

  if (category) {
    exps = exps.filter((e) => e.category === category);
  }
  if (status) {
    exps = exps.filter((e) => e.status === status);
  }

  const totalAmount = exps.reduce((sum, e) => sum + e.amount, 0);

  res.json({ success: true, data: exps, totalAmount, count: exps.length });
});

router.post('/expenses', (req: Request, res: Response) => {
  const { description, concept, category, amount, date, status, recipient, voucherNumber, receiptNumber, paymentMethod } = req.body;

  const desc = description || concept;
  if (!desc || amount === undefined || !category) {
    return res.status(400).json({ success: false, error: 'Descripción, monto y categoría son requeridos' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Monto inválido' });
  }

  const now = new Date();
  const dateStr = date || now.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const newExp: ExpenseRecord = {
    id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    description: desc,
    category,
    amount: numAmount,
    date: dateStr,
    status: status || 'pagado',
    recipient: recipient || 'Proveedor General',
    paymentMethod: paymentMethod || 'transferencia',
    receiptNumber: receiptNumber || voucherNumber || `E001-${Math.floor(100 + Math.random() * 900)}`,
  };

  const created = store.addExpense(newExp);
  res.status(201).json({ success: true, data: created, message: 'Gasto registrado correctamente' });
});

router.put('/expenses/:id', (req: Request, res: Response) => {
  const updated = store.updateExpense(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Gasto no encontrado para actualizar' });
  }
  res.json({ success: true, data: updated, message: 'Gasto actualizado' });
});

router.delete('/expenses/:id', (req: Request, res: Response) => {
  const deleted = store.deleteExpense(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Gasto no encontrado para eliminar' });
  }
  res.json({ success: true, message: 'Gasto eliminado' });
});

export default router;
