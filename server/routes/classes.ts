import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import { ClassSession } from '../../src/types';

const router = Router();

// GET /api/classes - List all classes or filter by day
router.get('/', (req: Request, res: Response) => {
  const { day, instructor, level } = req.query;
  let classes = store.getClasses();

  if (day) {
    classes = classes.filter((c) => c.day === day);
  }
  if (instructor) {
    classes = classes.filter((c) => c.instructor.toLowerCase().includes(String(instructor).toLowerCase()));
  }
  if (level) {
    classes = classes.filter((c) => c.level === level);
  }

  res.json({ success: true, data: classes, count: classes.length });
});

// GET /api/classes/:id - Get specific class
router.get('/:id', (req: Request, res: Response) => {
  const session = store.getClassById(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Clase no encontrada' });
  }
  res.json({ success: true, data: session });
});

// POST /api/classes - Create new class session
router.post('/', (req: Request, res: Response) => {
  const { name, instructor, time, duration, totalSpots, day, level, classType, focus, description } = req.body;

  if (!name || !instructor || !time || !day || !level || !classType) {
    return res.status(400).json({ success: false, error: 'Faltan campos requeridos para la sesión' });
  }

  const newClass: ClassSession = {
    id: `cls-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name,
    instructor,
    time,
    duration: duration || '50 min',
    totalSpots: Number(totalSpots) || 8,
    occupiedSpots: 0,
    day,
    level,
    classType,
    focus: focus || '',
    description: description || '',
  };

  const created = store.addClass(newClass);
  res.status(201).json({ success: true, data: created, message: 'Sesión programada con éxito' });
});

// PUT /api/classes/:id - Update class
router.put('/:id', (req: Request, res: Response) => {
  const updated = store.updateClass(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: 'Clase no encontrada para actualizar' });
  }
  res.json({ success: true, data: updated, message: 'Sesión actualizada correctamente' });
});

// DELETE /api/classes/:id - Delete class
router.delete('/:id', (req: Request, res: Response) => {
  const deleted = store.deleteClass(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Clase no encontrada para eliminar' });
  }
  res.json({ success: true, message: 'Sesión eliminada de la agenda' });
});

export default router;
