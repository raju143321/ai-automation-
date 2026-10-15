import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';
  const code = err.code || (status === 404 ? 'NOT_FOUND' : status === 403 ? 'FORBIDDEN' : status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR');

  console.error(`[API Error] [${req.requestId}] ${req.method} ${req.originalUrl}:`, err);

  res.status(status).json({
    error: {
      code,
      message,
      details: err.details || undefined,
      requestId: req.requestId
    }
  });
}
