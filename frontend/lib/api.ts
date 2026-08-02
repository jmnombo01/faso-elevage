import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('faso_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Listing {
  id: string;
  espece: string;
  race?: string;
  ageMois?: number;
  poidsKg?: number;
  quantite: number;
  prixFcfa: number;
  ville: string;
  quartier?: string;
  description?: string;
  photos: string[];
  statut: string;
  vues: number;
  createdAt: string;
  user: { name: string; phone: string; ville: string; quartier?: string; id?: string };
}

export interface User {
  id: string;
  phone: string;
  name: string;
  ville: string;
  role: string;
}
