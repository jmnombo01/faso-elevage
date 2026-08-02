'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Listing } from '../../lib/api';
import { useAuth } from '../../lib/store';

export default function MesAnnoncesPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const { isAuth } = useAuth();

  const load = () => api.get('/users/me/listings').then(r => setListings(r.data)).catch(console.error);
  useEffect(() => { if (isAuth) load(); }, [isAuth]);

  const markSold = async (id: string) => {
    if (!confirm('Marquer comme vendue?')) return;
    await api.patch(`/listings/${id}/sold`);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm('Supprimer?')) return;
    await api.delete(`/listings/${id}`);
    load();
  };

  if (!isAuth) return <div className="card p-8 text-center"><p>Connecte-toi pour voir tes annonces</p><Link href="/login" className="btn-primary mt-4 inline-block">Connexion</Link></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Mes annonces ({listings.length})</h1><Link href="/publier" className="btn-primary">+ Nouvelle</Link></div>
      <div className="grid md:grid-cols-3 gap-4">
        {listings.map(l => (
          <div key={l.id} className="card p-4">
            <img src={l.photos[0] || ''} className="h-40 w-full object-cover rounded-xl" />
            <div className="mt-3 flex justify-between"><span className="font-semibold">{l.race || l.espece}</span><span className="text-primary font-bold">{l.prixFcfa.toLocaleString()} F</span></div>
            <div className="text-xs mt-1"><span className={`px-2 py-1 rounded-full ${l.statut === 'APPROUVEE' ? 'bg-green-50 text-green-700' : l.statut === 'EN_ATTENTE' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100'}`}>{l.statut}</span> • {l.ville}</div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <Link href={`/annonces/${l.id}`} className="btn-secondary py-2 text-xs text-center">Voir</Link>
              <button onClick={() => markSold(l.id)} className="btn-secondary py-2 text-xs">Vendue</button>
              <button onClick={() => remove(l.id)} className="btn-secondary py-2 text-xs text-red-600">Suppr</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
