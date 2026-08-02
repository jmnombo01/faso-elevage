'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/store';

export default function PublierPage() {
  const { isAuth } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ espece: 'POULET', race: '', ageMois: '', poidsKg: '', quantite: '1', prixFcfa: '', ville: 'Ouagadougou', quartier: '', description: '' });
  const [photos, setPhotos] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  if (typeof window !== 'undefined' && !isAuth) { router.push('/login'); return null; }

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (photos) { Array.from(photos).slice(0,5).forEach(f => fd.append('photos', f)); }
      const res = await api.post('/listings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Annonce créée! En attente de validation admin (1 clic).');
      router.push(`/mes-annonces`);
    } catch (err: any) { alert(err.response?.data?.error || 'Erreur'); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto card p-6">
      <h1 className="text-2xl font-bold">Publier une annonce</h1>
      <p className="text-sm text-gray-500">Gratuit en Phase 1 • En moins de 2 minutes depuis ton téléphone</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Espèce*</label>
            <select value={form.espece} onChange={e => setForm({ ...form, espece: e.target.value })} className="input mt-1">
              {['POULET','PINTADE','LAPIN','BOVIN','OVIN','CAPRIN','PORCIN'].map(s => <option key={s}>{s}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Prix FCFA*</label><input required type="number" value={form.prixFcfa} onChange={e => setForm({ ...form, prixFcfa: e.target.value })} placeholder="3500" className="input mt-1" /></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm">Race</label><input value={form.race} onChange={e => setForm({ ...form, race: e.target.value })} placeholder="Ex: Bali-Bali, Goudali" className="input mt-1" /></div>
          <div><label className="text-sm">Quantité*</label><input required type="number" value={form.quantite} onChange={e => setForm({ ...form, quantite: e.target.value })} className="input mt-1" /></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm">Âge (mois)</label><input type="number" value={form.ageMois} onChange={e => setForm({ ...form, ageMois: e.target.value })} className="input mt-1" /></div>
          <div><label className="text-sm">Poids kg</label><input type="number" step="0.1" value={form.poidsKg} onChange={e => setForm({ ...form, poidsKg: e.target.value })} className="input mt-1" /></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm">Ville*</label>
            <select value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })} className="input mt-1">
              {['Ouagadougou','Bobo-Dioulasso','Koudougou','Ouahigouya','Kaya','Banfora','Dédougou',"Fada N'Gourma",'Tenkodogo','Houndé'].map(v => <option key={v}>{v}</option>)}
            </select></div>
          <div><label className="text-sm">Quartier</label><input value={form.quartier} onChange={e => setForm({ ...form, quartier: e.target.value })} placeholder="Tanghin" className="input mt-1" /></div>
        </div>

        <div><label className="text-sm">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Vaccinés, nourris au local, dispo immédiatement..." className="input mt-1" /></div>

        <div><label className="text-sm">Photos (max 5, moins de 5MB chacune)</label><input type="file" multiple accept="image/*" onChange={e => setPhotos(e.target.files)} className="input mt-1" /></div>

        <button disabled={loading} className="btn-primary w-full py-4 text-lg">{loading ? 'Publication...' : 'Publier gratuitement'}</button>
        <p className="text-xs text-center text-gray-400">Ton annonce sera validée manuellement pour éviter arnaques.</p>
      </form>
    </div>
  );
}
