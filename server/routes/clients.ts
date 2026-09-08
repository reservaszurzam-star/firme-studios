import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import { ClientProfile } from '../../src/types';

const router = Router();

// GET /api/clients - List all clients or filter
router.get('/', (req: Request, res: Response) => {
  const { search, status, planType } = req.query;
  let clients = store.getClients();

  if (search) {
    const q = String(search).toLowerCase();
    clients = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.dni.includes(q) ||
        c.phone.includes(q)
    );
  }

  if (status) {
    clients = clients.filter((c) => c.status === status);
  }

  if (planType) {
    clients = clients.filter((c) => c.planType === planType);
  }

  res.json({ success: true, data: clients, count: clients.length });
});

// GET /api/clients/:id - Get client by ID
router.get('/:id', (req: Request, res: Response) => {
  const client = store.getClientById(req.params.id);
  if (!client) {
    return res.status(404).json({ success: false, error: 'Cliente no encontrado' });
  }
  res.json({ success: true, data: client });
});

// POST /api/clients - Create new client
router.post('/', (req: Request, res: Response) => {
  const { name, dni, phone, email, currentPlan, planType, creditsLeft, emergencyContact, medicalNotes } = req.body;

  if (!name || !dni || !phone || !email) {
    return res.status(400).json({ success: false, error: 'Nombre, DNI, teléfono y correo son obligatorios' });
  }

  const nowStr = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const newClient: ClientProfile = {
    id: `cli-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name,
    dni,
    phone,
    email,
    currentPlan: currentPlan || 'Pack 8 Clases',
    planType: planType || 'pack',
    creditsLeft: Number(creditsLeft) || 8,
    totalAttended: 0,
    status: 'activo',
    joinDate: nowStr,
    lastVisit: nowStr,
    emergencyContact: emergencyContact || '',
    medicalNotes: medicalNotes || '',
  };

  const created = store.addClient(newClient);
  res.status(201).json({ success: true, data: created, message: 'Cliente registrado exitosamente' });
});

// PUT /api/clients/:id - Update client
router.put('/:id', (req: Request, res: Response) => {
  const updated = store.updateClient(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Cliente no encontrado para actualizar' });
  }
  res.json({ success: true, data: updated, message: 'Ficha de cliente actualizada' });
});

// DELETE /api/clients/:id - Delete client
router.delete('/:id', (req: Request, res: Response) => {
  const deleted = store.deleteClient(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Cliente no encontrado para eliminar' });
  }
  res.json({ success: true, message: 'Cliente eliminado correctamente' });
});

export default router;
