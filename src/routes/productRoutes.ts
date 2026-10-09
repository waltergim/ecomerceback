import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProductBySlug,
  getProducts,
  getProductsAdmin,
  updateProduct,
} from '../controllers/productController';
import { requireAdmin, requireAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { createProductSchema, updateProductSchema } from '../validators/productValidator';

const router = Router();

router.get('/', asyncHandler(getProducts));
router.get('/admin', requireAuth, requireAdmin, asyncHandler(getProductsAdmin));
router.get('/slug/:slug', asyncHandler(getProductBySlug));
router.get('/:id', asyncHandler(getProductById));

router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate(createProductSchema),
  asyncHandler(createProduct)
);
router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(updateProductSchema),
  asyncHandler(updateProduct)
);
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(deleteProduct));

export default router;