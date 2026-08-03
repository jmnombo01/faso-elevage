'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Listing } from '../../lib/api';
import { useAuth } from '../../lib/store';
import { Flame, BadgeCheck } from 'lucide-react';

export default function MesAnnoncesPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [pricing, setPricing] = useState<any>(null);
  const { isAuth } = useAuth();

  const load = () => {
    api.get('/users/me/listings').then(r => setListings(r.data)).catch(console.error);
    api.get('/payments/pricing').then(r => setPricing(r.data)).catch(()=>{});
  };
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

  const boost = async (id: string, days: number) => {
    if (!confirm(`Booster cette annonce ${days} jours ? ${pricing?.boost[days]?.amount}F via Mobile Money`)) return;
    try {
      const res = await api.post('/payments/init-boost', { listingId: id, durationDays: days });
      window.open(res.data.paymentUrl, '_blank');
      alert(`Paiement ${res.data.payment.amountFcfa}F initié - Redirection CinetPay. Après paiement, ton annonce remonte en tête!`);
    } catch (e: any) { alert(e.response?.data?.error || 'Erreur boost'); }
  };

  if (!isAuth) return <div className="card p-8 text-center"><p>Connecte-toi pour voir tes annonces</p><Link href="/login" className="btn-primary mt-4 inline-block">Connexion</Link></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Mes annonces ({listings.length})</h1><Link href="/publier" className="btn-primary">+ Nouvelle</Link></div>
      <div className="grid md:grid-cols-3 gap-4">
        {listings.map(l => {
          const isBoosted = (l as any).isBoosted && (l as any).boostedUntil && new Date((l as any).boostedUntil) > new Date();
          return (
            <div key={l.id} className={`card p-4 ${isBoosted ? 'ring-2 ring-amber-400' : ''}`}>
              <img src={l.photos[0] || ''} className="h-40 w-full object-cover rounded-xl" />
              <div className="mt-3 flex justify-between"><span className="font-semibold flex items-center gap-1">{l.race || l.espece} {isBoosted && <Flame className="w-4 h-4 text-amber-500" />}</span><span className="text-primary font-bold">{l.prixFcfa.toLocaleString()} F</span></div>
              <div className="text-xs mt-1 flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full ${l.statut === 'APPROUVEE' ? 'bg-green-50 text-green-700' : l.statut === 'EN_ATTENTE' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100'}`}>{l.statut}</span> 
                {isBoosted && <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs">🔥 Boosté jusqu'au {new Date((l as any).boostedUntil).toLocaleDateString('fr-FR')}</span>}
                <span>• {l.ville}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <Link href={`/annonces/${l.id}`} className="btn-secondary py-2 text-xs text-center">Voir</Link>
                <button onClick={() => markSold(l.id)} className="btn-secondary py-2 text-xs">Vendue</button>
                <button onClick={() => remove(l.id)} className="btn-secondary py-2 text-xs text-red-600">Suppr</button>
              </div>
              {l.statut === 'APPROUVEE' && (
                <div className="mt-3 border-t pt-3">
                  <div className="text-xs font-semibold flex items-center gap-1"><Flame className="w-3 h-3 text-amber-500" /> Booster (Phase 2)</div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {pricing && [3,7,30].map(d => (
                      <button key={d} onClick={() => boost(l.id, d)} className="text-xs bg-amber-50 text-amber-700 px-2 py-2 rounded-xl hover:bg-amber-100 font-medium">
                        {d}j<br/>{pricing.boost[d].amount}F
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Via CinetPay: Orange, Moov, Telecel, Wave</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
