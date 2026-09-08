import { Router, Request, Response } from 'express';
import { store } from '../data/store';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const stats = store.getStats();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'FIRME STUDIO Backend API',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    studio: {
      name: 'FIRME STUDIO — Pilates Reformer & Boutique',
      location: 'San Juan de Lurigancho, Lima - Perú',
      capacityPerClass: 8,
    },
    metrics: stats,
  });
});

export default router;
