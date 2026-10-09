import { Request, Response } from 'express';
import { Model, Schema, HydratedDocument, model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserAddress {
  _id?: string;
  street: string;
  city: string;
  province: string;
  zipCode: string;
  phone?: string;
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  addresses: IUserAddress[];
}

interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser, Model<IUser, {}, IUserMethods>, IUserMethods>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    addresses: [
      {
        street: { type: String, required: true },
        city: { type: String, required: true },
        province: { type: String, required: true },
        zipCode: { type: String, required: true },
        phone: String,
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export type UserDocument = HydratedDocument<IUser, IUserMethods>;
export const User = model<IUser, Model<IUser, {}, IUserMethods>>('User', userSchema);

export const toPublicUser = (user: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  addresses?: IUserAddress[];
  createdAt?: Date;
}) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  addresses: user.addresses ?? [],
  createdAt: user.createdAt,
});