import { Request, Response } from 'express';
import mongoose, { FilterQuery } from 'mongoose';
import { IProduct, Product } from '../models/Product';
import { ApiError } from '../middlewares/error';
import { slugify } from '../utils/slugify';
import type {
  CreateProductInput,
  UpdateProductInput,
} from '../validators/productValidator';

const parseListQuery = (req: Request) => {
  const page = Math.max(1, Math.trunc(toSafeNumber(req.query.page, 1)));
  const limit = Math.min(50, Math.max(1, Math.trunc(toSafeNumber(req.query.limit, 12))));
  return { page, limit, skip: (page - 1) * limit };
};

const toSafeNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getProducts = async (req: Request, res: Response) => {
  const { page, limit, skip } = parseListQuery(req);
  const filter: FilterQuery<IProduct> = { isActive: true };

  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
  if (category) filter.category = category;

  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (q) filter.$text = { $search: q };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
};

export const getProductsAdmin = async (req: Request, res: Response) => {
  const { page, limit, skip } = parseListQuery(req);
  const filter: FilterQuery<IProduct> = {};

  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (q) filter.$text = { $search: q };

  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'ID inválido');

  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, 'Producto no encontrado');

  res.json({ product });
};

export const getProductBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  if (!slug) throw new ApiError(404, 'Producto no encontrado');

  const product = await Product.findOne({ slug: slug.toLowerCase() });
  if (!product) throw new ApiError(404, 'Producto no encontrado');

  res.json({ product });
};

export const createProduct = async (req: Request, res: Response) => {
  const body = req.body as CreateProductInput;
  const slug = body.slug ?? slugify(body.name);

  const duplicated = await Product.exists({ slug });
  if (duplicated) throw new ApiError(409, 'Ya existe un producto con ese slug');

  const product = await Product.create({ ...body, slug });

  res.status(201).json({ message: 'Producto creado exitosamente', product });
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'ID inválido');

  const body = req.body as UpdateProductInput;
  if (body.slug) {
    const duplicated = await Product.exists({ slug: body.slug, _id: { $ne: id } });
    if (duplicated) throw new ApiError(409, 'Ya existe un producto con ese slug');
  }

  const product = await Product.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, 'Producto no encontrado');

  res.json({ message: 'Producto actualizado exitosamente', product });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'ID inválido');

  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new ApiError(404, 'Producto no encontrado');

  res.json({ message: 'Producto eliminado exitosamente' });
};