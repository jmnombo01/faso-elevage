'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/store';
import Link from 'next/link';
import { BadgeCheck, Flame, History } from 'lucide-react';

export default function ProfilPage() {
  const { isAuth, user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any>(null);
  const [freshUser, setFreshUser] = useState<any>(null);

  useEffect(() => {
    if (isAuth) {
      api.get('/auth/me').then(r => setFreshUser(r.data)).catch(()=>{});
      api.get('/payments/my').then(r => setPayments(r.data)).catch(()=>{});
      api.get('/payments/pricing').then(r => setPricing(r.data)).catch(()=>{});
    }
  }, [isAuth]);

  if (!isAuth) return <div className="card p-8 text-center">Connecte-toi pour voir ton profil <Link href="/login" className="btn-primary ml-2">Connexion</Link></div>;

  const effectiveUser = freshUser || user;
  const isVerified = effectiveUser?.isVerified && effectiveUser?.verifiedUntil && new Date(effectiveUser.verifiedUntil) > new Date();

  const buyBadge = async (days: number) => {
    if (!confirm(`Acheter badge vérifié ${days} jours ? Paiement Mobile Money via CinetPay (Orange, Moov, Telecel)`)) return;
    try {
      const res = await api.post('/payments/init-badge', { durationDays: days });
      window.open(res.data.paymentUrl, '_blank');
      alert(`Paiement initié ${res.data.payment.amountFcfa}F - Tu vas être redirigé vers CinetPay. Après paiement, ton badge sera activé automatiquement.`);
    } catch (e: any) { alert(e.response?.data?.error || 'Erreur'); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center font-bold text-2xl text-green-700">{effectiveUser?.name?.[0]}</div>
          <div>
            <div className="font-bold text-xl flex items-center gap-2">{effectiveUser?.name} {isVerified && <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> Vérifié</span>}</div>
            <div className="text-sm text-gray-500">{effectiveUser?.phone} • {effectiveUser?.ville}</div>
            {isVerified && effectiveUser?.verifiedUntil && <div className="text-xs text-blue-600">Badge jusqu'au {new Date(effectiveUser.verifiedUntil).toLocaleDateString('fr-FR')}</div>}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-lg flex items-center gap-2"><BadgeCheck className="w-5 h-5 text-blue-500" /> Badge Vendeur Vérifié</h2>
        <p className="text-sm text-gray-600 mt-2">Le badge vérifié augmente la confiance acheteurs de 3x. Idéal pour gros éleveurs.</p>
        {isVerified ? (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl text-sm text-blue-800">✅ Tu es déjà vérifié jusqu'au {new Date(effectiveUser.verifiedUntil).toLocaleDateString('fr-FR')}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-3 mt-4">
            {pricing && Object.entries(pricing.badge).map(([days, p]: any) => (
              <div key={days} className="border rounded-xl p-4 text-center hover:shadow">
                <div className="font-bold">{days} jours</div>
                <div className="text-2xl font-bold text-primary mt-1">{p.amount.toLocaleString()} F</div>
                <div className="text-xs text-gray-500 mt-1">{p.label}</div>
                <button onClick={() => buyBadge(Number(days))} className="btn-primary w-full mt-3 py-2 text-sm">Acheter via Mobile Money</button>
              </div>
            ))}
          </div>
        )}
        <div className="text-xs text-gray-400 mt-3">Paiement via CinetPay: Orange Money (*144*4*6*100#), Moov Money (*555*6#), Telecel, Wave. 100% sécurisé.</div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-lg flex items-center gap-2"><History className="w-5 h-5" /> Historique paiements</h2>
        <div className="mt-4 space-y-2">
          {payments.length === 0 && <div className="text-sm text-gray-500">Aucun paiement encore</div>}
          {payments.map(p => (
            <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl text-sm">
              <div><span className={`px-2 py-1 rounded text-xs ${p.type==='BOOST'?'bg-amber-100 text-amber-700':'bg-blue-100 text-blue-700'}`}>{p.type}</span> {p.amountFcfa}F • {p.durationDays}j • {p.listing?.race || p.listing?.espece || 'Badge'}</div>
              <span className={`px-2 py-1 rounded-full text-xs ${p.status==='SUCCESS'?'bg-green-100 text-green-700': p.status==='PENDING'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}`}>{p.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
