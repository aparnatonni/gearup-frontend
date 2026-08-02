export type Role = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status?: 'ACTIVE' | 'SUSPENDED';
  createdAt?: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};