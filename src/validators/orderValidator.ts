import { z } from 'zod';

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'ID inválido');

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product: objectId,
        quantity: z
          .number({ invalid_type_error: 'La cantidad debe ser un número' })
          .int('La cantidad debe ser entera')
          .min(1, 'La cantidad mínima es 1'),
      })
    )
    .min(1, 'El pedido debe tener al menos un producto'),
  shippingAddress: z.object({
    street: z.string().trim().min(1, 'La calle es obligatoria'),
    city: z.string().trim().min(1, 'La ciudad es obligatoria'),
    province: z.string().trim().min(1, 'La provincia es obligatoria'),
    zipCode: z.string().trim().min(1, 'El código postal es obligatorio'),
    phone: z.string().trim().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled'], {
    errorMap: () => ({ message: 'Estado inválido' }),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;