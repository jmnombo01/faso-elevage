'use client';
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: any | null;
  isAuth: boolean;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
  init: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuth: false,
  setAuth: (token, user) => {
    localStorage.setItem('faso_token', token);
    localStorage.setItem('faso_user', JSON.stringify(user));
    set({ token, user, isAuth: true });
  },
  logout: () => {
    localStorage.removeItem('faso_token');
    localStorage.removeItem('faso_user');
    set({ token: null, user: null, isAuth: false });
  },
  init: () => {
    const token = localStorage.getItem('faso_token');
    const userStr = localStorage.getItem('faso_user');
    if (token && userStr) {
      try {
        set({ token, user: JSON.parse(userStr), isAuth: true });
      } catch {}
    }
  },
}));
