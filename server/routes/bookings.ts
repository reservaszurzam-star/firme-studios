import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import { BookingRecord } from '../../src/types';

const router = Router();

// GET /api/bookings - List bookings (optionally filter by classId or clientEmail)
router.get('/', (req: Request, res: Response) => {
  const { classId, clientEmail, status } = req.query;
  let bookings = store.getBookings();

  if (classId) {
    bookings = bookings.filter((b) => b.classId === classId);
  }
  if (clientEmail) {
    bookings = bookings.filter((b) => b.clientEmail.toLowerCase() === String(clientEmail).toLowerCase());
  }
  if (status) {
    bookings = bookings.filter((b) => b.status === status);
  }

  res.json({ success: true, data: bookings, count: bookings.length });
});

// POST /api/bookings - Make a new reservation
router.post('/', (req: Request, res: Response) => {
  const { classId, className, classTime, classDay, instructor, clientName, clientEmail, clientPhone } = req.body;

  if (!classId || !clientName || !clientEmail) {
    return res.status(400).json({ success: false, error: 'Faltan campos obligatorios para la reserva' });
  }

  // Check spot availability in the class
  const classSession = store.getClassById(classId);
  if (classSession && classSession.occupiedSpots >= classSession.totalSpots) {
    return res.status(400).json({
      success: false,
      error: 'La clase ya no tiene cupos disponibles (capacidad máxima: ' + classSession.totalSpots + ')',
    });
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  const newBooking: BookingRecord = {
    id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    classId,
    className: className || classSession?.name || 'Clase Reformer',
    classTime: classTime || classSession?.time || '08:00',
    classDay: classDay || classSession?.day || 'lun',
    instructor: instructor || classSession?.instructor || 'Instructor FIRME',
    clientName,
    clientEmail,
    clientPhone: clientPhone || '+51 900 000 000',
    status: 'confirmada',
    bookedAt: `${dateStr} ${timeStr}`,
  };

  const created = store.addBooking(newBooking);

  // If client exists in CRM, update attended or check profile
  const existingClient = store.getClients().find((c) => c.email.toLowerCase() === clientEmail.toLowerCase());
  if (existingClient) {
    if (existingClient.creditsLeft > 0 && existingClient.planType === 'pack') {
      store.updateClient(existingClient.id, { creditsLeft: existingClient.creditsLeft - 1 });
    }
  }

  res.status(201).json({
    success: true,
    data: created,
    message: 'Reserva confirmada exitosamente. ¡Te esperamos en FIRME STUDIO!',
  });
});

// PATCH /api/bookings/:id/status - Update booking status (confirmada, asistio, cancelada, lista_espera)
router.patch('/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, error: 'El estado es requerido' });
  }

  const updated = store.updateBookingStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Reserva no encontrada' });
  }

  res.json({ success: true, data: updated, message: `Estado actualizado a ${status}` });
});

// POST /api/bookings/:id/check-in - Check-in Express at reception or by instructor
router.post('/:id/check-in', (req: Request, res: Response) => {
  const { bedNumber } = req.body;
  const updated = store.checkInBooking(req.params.id, bedNumber !== undefined ? Number(bedNumber) : undefined);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Reserva no encontrada para check-in' });
  }
  res.json({
    success: true,
    data: updated,
    message: `¡Check-in confirmado para ${updated.clientName}! Cama asignada: Reformer #${updated.bedNumber || 'Sin asignar'}.`,
  });
});

// POST /api/bookings/:id/assign-bed - Assign or change Reformer bed number (1-8)
router.post('/:id/assign-bed', (req: Request, res: Response) => {
  const { bedNumber } = req.body;
  if (bedNumber === undefined || Number(bedNumber) < 1 || Number(bedNumber) > 8) {
    return res.status(400).json({ success: false, error: 'El número de cama debe estar entre 1 y 8' });
  }

  const updated = store.assignBed(req.params.id, Number(bedNumber));
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Reserva no encontrada' });
  }

  res.json({
    success: true,
    data: updated,
    message: `Cama Reformer #${bedNumber} asignada correctamente a ${updated.clientName}`,
  });
});

// POST /api/bookings/:id/cancel-with-refund - Studio fair cancellation with credit refund and waitlist notification trigger
router.post('/:id/cancel-with-refund', (req: Request, res: Response) => {
  const booking = store.getBookings().find((b) => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, error: 'Reserva no encontrada' });
  }

  // Update booking to cancelada
  const updated = store.updateBookingStatus(req.params.id, 'cancelada');

  // Find if client has pack and refund credit
  const client = store.getClients().find((c) => c.email.toLowerCase() === booking.clientEmail.toLowerCase());
  let refunded = false;
  if (client && client.planType === 'pack') {
    store.updateClient(client.id, { creditsLeft: client.creditsLeft + 1 });
    refunded = true;
  }

  // Check if waitlist exists for this class
  const waitlistCandidates = store.getLeads().filter((l) => l.status === 'nuevo' || l.status === 'contactado' || l.status === 'prueba_agendada');
  const nextCandidate = waitlistCandidates.length > 0 ? waitlistCandidates[0] : null;

  res.json({
    success: true,
    data: updated,
    refunded,
    nextWaitlistCandidate: nextCandidate,
    message: `Reserva de ${booking.clientName} cancelada. ${refunded ? '1 crédito devuelto al pack de la alumna.' : ''} Cupo liberado en sala.`,
  });
});

// DELETE /api/bookings/:id - Cancel/delete booking
router.delete('/:id', (req: Request, res: Response) => {
  const deleted = store.deleteBooking(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Reserva no encontrada' });
  }
  res.json({ success: true, message: 'Reserva eliminada con éxito' });
});

export default router;
