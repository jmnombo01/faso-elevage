'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from '../lib/store';
import { Heart, User, Plus, LogOut } from 'lucide-react';

export default function Header() {
  const { isAuth, user, init, logout } = useAuth();
  useEffect(() => { init(); }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 h-[64px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-black">F</div>
          <span className="font-bold text-xl tracking-tight">Faso Élevage</span>
          <span className="hidden md:inline ml-2 text-xs bg-green-50 text-primary px-2 py-1 rounded-full">MVP</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/favoris" className="p-2.5 rounded-xl hover:bg-gray-50" title="Favoris">
            <Heart className="w-5 h-5" />
          </Link>

          {isAuth ? (
            <>
              <Link href="/publier" className="hidden md:flex btn-primary py-2.5 text-sm items-center gap-2">
                <Plus className="w-4 h-4" /> Publier
              </Link>
              <Link href="/mes-annonces" className="p-2.5 rounded-xl hover:bg-gray-50" title="Mes annonces">
                <User className="w-5 h-5" />
              </Link>
              {/* Bouton Déconnexion - visible partout (mobile + desktop) */}
              <button onClick={logout} className="p-2.5 rounded-xl hover:bg-gray-50 text-gray-600 hover:text-red-600" title="Déconnexion">
                <LogOut className="w-5 h-5" />
              </button>
              {/* Nom affiché seulement desktop */}
              <div className="hidden md:flex items-center gap-2 ml-1">
                <span className="px-3 py-2 rounded-xl bg-gray-50 text-sm font-medium">
                  {user?.name?.split(' ')[0]}
                </span>
              </div>
            </>
          ) : (
            <Link href="/login" className="btn-primary py-2.5 text-sm">Connexion</Link>
          )}
        </div>
      </div>
      {/* Mobile bottom CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-2 z-50">
        <Link href="/" className="flex-1 btn-secondary text-center text-sm">Explorer</Link>
        <Link href="/publier" className="flex-1 btn-primary text-center text-sm flex items-center justify-center gap-1"><Plus className="w-4 h-4"/> Vendre</Link>
      </div>
    </header>
  );
}
