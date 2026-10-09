import { Router } from 'express';
import {
  addAddress,
  getAddresses,
  getProfile,
  removeAddress,
  updateProfile,
} from '../controllers/userController';
import { requireAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { addressSchema, updateProfileSchema } from '../validators/authValidator';

const router = Router();

router.use(requireAuth);

router.get('/me', asyncHandler(getProfile));
router.put('/me', validate(updateProfileSchema), asyncHandler(updateProfile));

router.get('/addresses', asyncHandler(getAddresses));
router.post('/addresses', validate(addressSchema), asyncHandler(addAddress));
router.delete('/addresses/:id', asyncHandler(removeAddress));

export default router;