export type Role = 'customer' | 'admin';

export interface AuthUser {
  id: string;
  role: Role;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}