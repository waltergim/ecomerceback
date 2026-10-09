import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController';
import { requireAdmin, requireAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/orderValidator';

const router = Router();

router.use(requireAuth);

router.post('/', validate(createOrderSchema), asyncHandler(createOrder));
router.get('/mine', asyncHandler(getMyOrders));
router.get('/', requireAdmin, asyncHandler(getAllOrders));
router.get('/:id', asyncHandler(getOrderById));
router.patch(
  '/:id/status',
  requireAdmin,
  validate(updateOrderStatusSchema),
  asyncHandler(updateOrderStatus)
);

export default router;