import { Schema, model, InferSchemaType } from 'mongoose';

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 }, // en pesos
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: { type: [String], default: [] },
    category: { type: String, required: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Permite buscar por texto en nombre y descripción
productSchema.index({ name: 'text', description: 'text' });

export type IProduct = InferSchemaType<typeof productSchema>;
export const Product = model('Product', productSchema);