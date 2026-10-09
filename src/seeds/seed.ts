import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Product } from '../models/Product';
import { User } from '../models/User';

const ADMIN_EMAIL = 'admin@ecomer.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'admin1234';

const users = [
  {
    name: 'Administrador',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin' as const,
  },
  {
    name: 'Cliente Demo',
    email: 'cliente@ecomer.com',
    password: 'cliente1234',
    role: 'customer' as const,
  },
];

const products = [
  {
    name: 'Auriculares Inalámbricos Pro',
    slug: 'auriculares-inalambricos-pro',
    description:
      'Auriculares con cancelación de ruido activa, 30 horas de batería y conexión Bluetooth 5.3.',
    price: 59999,
    stock: 25,
    category: 'electronica',
    images: [],
  },
  {
    name: 'Smartwatch Series X',
    slug: 'smartwatch-series-x',
    description:
      'Reloj inteligente con GPS, monitor de ritmo cardíaco y pantalla AMOLED de 1.43".',
    price: 129999,
    stock: 15,
    category: 'electronica',
    images: [],
  },
  {
    name: 'Remera Algodón Premium',
    slug: 'remera-algodon-premium',
    description: 'Remera de algodón peinado 100%, corte unisex y colores vivos.',
    price: 14999,
    stock: 60,
    category: 'ropa',
    images: [],
  },
  {
    name: 'Zapatillas Urban Runner',
    slug: 'zapatillas-urban-runner',
    description: 'Zapatillas livianas con suela de alto agarre, ideales para uso diario.',
    price: 45999,
    stock: 30,
    category: 'ropa',
    images: [],
  },
  {
    name: 'Cafetera Espresso Manual',
    slug: 'cafetera-espresso-manual',
    description: 'Cafetera de 15 bares con vaporizador de leche y filtro doble.',
    price: 89999,
    stock: 10,
    category: 'hogar',
    images: [],
  },
  {
    name: 'Mochila Térmica 25L',
    slug: 'mochila-termica-25l',
    description: 'Mochila térmica impermeable con compartimento acolchado para laptop.',
    price: 24999,
    stock: 40,
    category: 'deportes',
    images: [],
  },
];

const run = async () => {
  await connectDB();

  for (const user of users) {
    const exists = await User.findOne({ email: user.email });
    if (exists) {
      console.log(`Usuario ya existente: ${user.email}`);
      continue;
    }
    await User.create(user);
    console.log(`Usuario creado: ${user.email}`);
  }

  let created = 0;
  for (const product of products) {
    const exists = await Product.findOne({ slug: product.slug });
    if (exists) continue;
    await Product.create(product);
    created += 1;
  }

  console.log(`Productos creados: ${created} de ${products.length}`);
  console.log(`Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log('Seed finalizado');

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error('Error en el seed:', error);
  process.exit(1);
});