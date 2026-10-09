import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'El slug solo admite minúsculas, números y guiones'
    )
    .optional(),
  description: z.string().default(''),
  price: z
    .number({
      invalid_type_error: 'El precio debe ser un número',
      required_error: 'El precio es obligatorio',
    })
    .min(0, 'El precio no puede ser negativo'),
  stock: z
    .number({ invalid_type_error: 'El stock debe ser un número' })
    .int('El stock debe ser entero')
    .min(0, 'El stock no puede ser negativo')
    .default(0),
  images: z.array(z.string()).default([]),
  category: z.string().trim().min(1, 'La categoría es obligatoria'),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;