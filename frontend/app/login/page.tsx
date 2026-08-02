'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/store';

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp' | 'signup'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [ville, setVille] = useState('Ouagadougou');
  const [loading, setLoading] = useState(false);
  const [debugOtp, setDebugOtp] = useState('');
  const router = useRouter();
  const { setAuth } = useAuth();

  const requestOtp = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/request-otp', { phone });
      setDebugOtp(res.data.debugOtp || '');
      setStep('otp');
    } catch (e: any) { alert(e.response?.data?.error || 'Erreur'); }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp, name: name || undefined, ville: ville || undefined });
      if (res.data.needSignup) { setStep('signup'); setLoading(false); return; }
      setAuth(res.data.token, res.data.user);
      router.push('/');
    } catch (e: any) { alert(e.response?.data?.error || 'OTP invalide'); }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto card p-8 mt-10">
      <h1 className="text-2xl font-bold">Connexion / Inscription</h1>
      <p className="text-sm text-gray-500 mt-1">Par numéro de téléphone + OTP SMS (gratuit en MVP)</p>

      {step === 'phone' && (
        <div className="mt-6 space-y-4">
          <div><label className="text-sm font-medium">Numéro BF</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="70123456 ou +22670123456" className="input mt-1" /></div>
          <button onClick={requestOtp} disabled={loading} className="btn-primary w-full">{loading ? 'Envoi...' : 'Recevoir code OTP'}</button>
          <p className="text-xs text-gray-400">En dev, le code s affiche ici pour les tests.</p>
        </div>
      )}

      {step === 'otp' && (
        <div className="mt-6 space-y-4">
          <div className="text-sm">Code envoyé au <b>{phone}</b></div>
          {debugOtp && <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm">Mode DEV OTP: <b className="text-lg">{debugOtp}</b></div>}
          <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Code 6 chiffres" className="input text-center tracking-[0.5em] text-lg font-bold" />
          <button onClick={verifyOtp} disabled={loading} className="btn-primary w-full">{loading ? 'Vérif...' : 'Vérifier'}</button>
          <button onClick={() => setStep('phone')} className="btn-secondary w-full text-sm">Changer numéro</button>
        </div>
      )}

      {step === 'signup' && (
        <div className="mt-6 space-y-4">
          <div className="text-sm">Nouveau numéro! Crée ton profil éleveur.</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom complet" className="input" />
          <select value={ville} onChange={e => setVille(e.target.value)} className="input">
            {['Ouagadougou','Bobo-Dioulasso','Koudougou','Ouahigouya','Kaya','Banfora','Dédougou',"Fada N'Gourma",'Tenkodogo','Houndé'].map(v => <option key={v}>{v}</option>)}
          </select>
          <div><label className="text-sm">OTP déjà reçu</label><input value={otp} onChange={e => setOtp(e.target.value)} placeholder="6 chiffres" className="input mt-1" /></div>
          <button onClick={verifyOtp} disabled={loading} className="btn-primary w-full">Créer compte & se connecter</button>
        </div>
      )}
    </div>
  );
}
