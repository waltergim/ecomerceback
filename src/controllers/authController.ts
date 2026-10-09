import { Request, Response } from 'express';
import { User, toPublicUser } from '../models/User';
import { ApiError } from '../middlewares/error';
import { clearAuthCookie, generateToken, setAuthCookie } from '../utils/token';
import type { LoginInput, RegisterInput } from '../validators/authValidator';

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body as RegisterInput;

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, 'El email ya está registrado');

  const user = await User.create({ name, email, password });
  setAuthCookie(res, generateToken({ id: user.id, role: user.role }));

  res.status(201).json({ message: 'Cuenta creada exitosamente', user: toPublicUser(user) });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Email o contraseña incorrectos');
  }

  setAuthCookie(res, generateToken({ id: user.id, role: user.role }));

  res.json({ message: 'Sesión iniciada', user: toPublicUser(user) });
};

export const logout = async (_req: Request, res: Response) => {
  clearAuthCookie(res);
  res.json({ message: 'Sesión cerrada' });
};

export const me = async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(401, 'Sesión inválida');

  res.json({ user: toPublicUser(user) });
};