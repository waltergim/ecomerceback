import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().trim().toLowerCase().email('El email no es válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('El email no es válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .optional(),
});

export const addressSchema = z.object({
  street: z.string().trim().min(1, 'La calle es obligatoria'),
  city: z.string().trim().min(1, 'La ciudad es obligatoria'),
  province: z.string().trim().min(1, 'La provincia es obligatoria'),
  zipCode: z.string().trim().min(1, 'El código postal es obligatorio'),
  phone: z.string().trim().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddressInput = z.infer<typeof addressSchema>;