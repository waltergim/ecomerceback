import { Request, Response } from 'express';
import mongoose, { FilterQuery } from 'mongoose';
import { Order, IOrder } from '../models/orden';
import { Product } from '../models/Product';
import { ApiError } from '../middlewares/error';
import type { CreateOrderInput } from '../validators/orderValidator';

const FREE_SHIPPING_MIN = Number(process.env.FREE_SHIPPING_MIN ?? 0);
const SHIPPING_COST = Number(process.env.SHIPPING_COST ?? 0);

export const createOrder = async (req: Request, res: Response) => {
  const { items, shippingAddress } = req.body as CreateOrderInput;
  const userId = req.user!.id;

  const products = await Product.find({
    _id: { $in: items.map((item) => item.product) },
    isActive: true,
  });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const orderItems: {
    product: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
  }[] = [];

  for (const item of items) {
    const product = byId.get(item.product);
    if (!product) throw new ApiError(400, 'Uno de los productos del pedido no existe');
    if (product.stock < item.quantity) {
      throw new ApiError(
        409,
        `Stock insuficiente para "${product.name}" (disponible: ${product.stock})`
      );
    }
    orderItems.push({
      product: product._id as mongoose.Types.ObjectId,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    });
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost =
    FREE_SHIPPING_MIN > 0 && subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;

  const reserved: { product: mongoose.Types.ObjectId; quantity: number }[] = [];
  try {
    for (const item of orderItems) {
      const result = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
      if (result.modifiedCount === 0) {
        throw new ApiError(409, `Stock insuficiente para "${item.name}"`);
      }
      reserved.push({ product: item.product, quantity: item.quantity });
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      shippingCost,
      total,
      status: 'pending',
      payment: { provider: process.env.PAYMENT_PROVIDER ?? 'mercadopago' },
    });

    res.status(201).json({ message: 'Pedido creado exitosamente', order });
  } catch (error) {
    await Promise.all(
      reserved.map((entry) =>
        Product.updateOne({ _id: entry.product }, { $inc: { stock: entry.quantity } })
      )
    );
    throw error;
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user!.id }).sort({ createdAt: -1 });
  res.json({ items: orders, total: orders.length });
};

export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'ID inválido');

  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, 'Pedido no encontrado');

  const isOwner = String(order.user) === req.user!.id;
  if (!isOwner && req.user!.role !== 'admin') {
    throw new ApiError(403, 'No tenés permiso para ver este pedido');
  }

  res.json({ order });
};

export const getAllOrders = async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const filter: FilterQuery<IOrder> = {};

  const status = typeof req.query.status === 'string' ? req.query.status : '';
  if (status) filter.status = status as IOrder['status'];

  const [items, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name email'),
    Order.countDocuments(filter),
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'ID inválido');

  const order = await Order.findByIdAndUpdate(
    id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );
  if (!order) throw new ApiError(404, 'Pedido no encontrado');

  res.json({ message: 'Estado actualizado', order });
};