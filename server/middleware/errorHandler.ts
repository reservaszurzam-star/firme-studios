import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Error interno del servidor',
    timestamp: new Date().toISOString(),
  });
}
