import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) return next(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: 'Identificador inválido' });
  }

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'JSON mal formado' });
  }

  console.error('Error no controlado:', err);
  const message = err instanceof Error ? err.message : 'Error interno del servidor';
  res.status(500).json({ message });
};