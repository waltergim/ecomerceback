import { Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import type { Role } from '../types';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Falta la variable de entorno JWT_SECRET');
}

const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const generateToken = (payload: { id: string; role: Role }) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN } as SignOptions);

export const verifyToken = (token: string) =>
  jwt.verify(token, JWT_SECRET) as { id: string; role: Role };

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE_MS,
    path: '/',
  });
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie('token', { path: '/' });
};