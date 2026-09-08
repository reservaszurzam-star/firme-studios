import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import healthRouter from './server/routes/health';
import classesRouter from './server/routes/classes';
import bookingsRouter from './server/routes/bookings';
import clientsRouter from './server/routes/clients';
import financeRouter from './server/routes/finance';
import leadsRouter from './server/routes/leads';
import aiRouter from './server/routes/ai';
import whatsappRouter from './server/routes/whatsapp';
import { errorHandler } from './server/middleware/errorHandler';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Basic API request logging
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toLocaleTimeString('es-PE')}] ${req.method} ${req.path}`);
    }
    next();
  });

  // API Routes
  app.use('/api/health', healthRouter);
  app.use('/api/classes', classesRouter);
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/clients', clientsRouter);
  app.use('/api/finance', financeRouter);
  app.use('/api/leads', leadsRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/whatsapp', whatsappRouter);

  // Error Handler for API routes
  app.use('/api', errorHandler);

  // Vite middleware for development vs Static file serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ FIRME STUDIO Full-Stack Backend active on port ${PORT}`);
  });
}

startServer();
