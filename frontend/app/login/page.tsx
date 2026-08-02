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
  const [whatsappLink, setWhatsappLink] = useState('');
  const [whatsappProvider, setWhatsappProvider] = useState('');
  const router = useRouter();
  const { setAuth } = useAuth();

  const requestOtp = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/request-otp', { phone });
      setDebugOtp(res.data.debugOtp || '');
      setWhatsappLink(res.data.whatsappLink || '');
      setWhatsappProvider(res.data.whatsappStatus?.provider || 'mock');
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
      <p className="text-sm text-gray-500 mt-1">Par numéro de téléphone + OTP WhatsApp 🇧🇫 (gratuit en MVP)</p>

      {step === 'phone' && (
        <div className="mt-6 space-y-4">
          <div><label className="text-sm font-medium">Numéro BF (WhatsApp)</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="70123456 ou +22670123456" className="input mt-1" /></div>
          <button onClick={requestOtp} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">💬 {loading ? 'Envoi WhatsApp...' : 'Recevoir code via WhatsApp'}</button>
          <p className="text-xs text-gray-400">Code envoyé via WhatsApp. En MVP, affiché directement ici pour tests sans coût SMS.</p>
        </div>
      )}

      {step === 'otp' && (
        <div className="mt-6 space-y-4">
          <div className="text-sm">Code envoyé au <b>{phone}</b> via WhatsApp</div>
          {whatsappProvider && <div className="text-xs text-gray-500">Provider: {whatsappProvider} {whatsappProvider.startsWith('mock') ? '(Phase 1 mock)' : '✅'}</div>}
          {debugOtp && (
            <div className="p-4 bg-green-50 border-2 border-green-300 rounded-xl text-center">
              <div className="text-xs text-green-700 uppercase tracking-wide font-semibold">Code WhatsApp (MVP)</div>
              <div className="text-3xl font-black tracking-[0.3em] mt-1 text-green-800">{debugOtp}</div>
              <div className="text-xs text-green-600 mt-2">Valable 5 min • Ne partage pas</div>
            </div>
          )}
          {whatsappLink && (
            <a href={whatsappLink} target="_blank" className="btn-secondary w-full text-sm flex items-center justify-center gap-2 bg-green-500 text-white border-green-500 hover:bg-green-600">
              📱 Ouvrir WhatsApp avec le code
            </a>
          )}
          <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Code 6 chiffres" className="input text-center tracking-[0.5em] text-lg font-bold" autoFocus />
          <button onClick={verifyOtp} disabled={loading} className="btn-primary w-full">{loading ? 'Vérif...' : 'Vérifier & se connecter'}</button>
          <button onClick={() => setStep('phone')} className="btn-secondary w-full text-sm">Changer numéro</button>
          <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-800">
            <b>Pas reçu sur WhatsApp ?</b> En Phase 1 MVP, le vrai envoi WhatsApp nécessite config Meta Cloud API (WHATSAPP_TOKEN). Pour tests, utilise le code affiché ci-dessus. En prod Phase 2, on activera Orange Money SMS + WhatsApp Business API.
          </div>
        </div>
      )}

      {step === 'signup' && (
        <div className="mt-6 space-y-4">
          <div className="text-sm">Nouveau numéro WhatsApp! Crée ton profil éleveur.</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom complet" className="input" />
          <select value={ville} onChange={e => setVille(e.target.value)} className="input">
            {['Ouagadougou','Bobo-Dioulasso','Koudougou','Ouahigouya','Kaya','Banfora','Dédougou',"Fada N'Gourma",'Tenkodogo','Houndé'].map(v => <option key={v}>{v}</option>)}
          </select>
          <div><label className="text-sm">OTP WhatsApp déjà reçu</label><input value={otp} onChange={e => setOtp(e.target.value)} placeholder="6 chiffres" className="input mt-1" /></div>
          <button onClick={verifyOtp} disabled={loading} className="btn-primary w-full">Créer compte & se connecter</button>
        </div>
      )}
    </div>
  );
}
