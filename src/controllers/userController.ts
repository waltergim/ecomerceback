import { Request, Response } from 'express';
import { User, toPublicUser } from '../models/User';
import { ApiError } from '../middlewares/error';
import type { AddressInput } from '../validators/authValidator';

export const getProfile = async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(401, 'Sesión inválida');

  res.json({ user: toPublicUser(user) });
};

export const updateProfile = async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(401, 'Sesión inválida');

  const { name } = req.body as { name?: string };
  if (name) user.name = name;

  await user.save();

  res.json({ message: 'Perfil actualizado', user: toPublicUser(user) });
};

export const getAddresses = async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id).select('addresses');
  if (!user) throw new ApiError(401, 'Sesión inválida');

  res.json({ addresses: user.addresses });
};

export const addAddress = async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(401, 'Sesión inválida');

  user.addresses.push(req.body as AddressInput);
  await user.save();

  res.status(201).json({ message: 'Dirección agregada', addresses: user.addresses });
};

export const removeAddress = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(401, 'Sesión inválida');

  const index = user.addresses.findIndex((address) => String(address._id) === id);
  if (index === -1) throw new ApiError(404, 'Dirección no encontrada');

  user.addresses.splice(index, 1);
  await user.save();

  res.json({ message: 'Dirección eliminada', addresses: user.addresses });
};