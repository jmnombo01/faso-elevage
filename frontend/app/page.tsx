'use client';
import { useEffect, useState } from 'react';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { api, Listing } from '../lib/api';
import ListingCard from '../components/ListingCard';

const villesBF = ['Toutes', 'Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', 'Kaya', 'Banfora', 'Dédougou', "Fada N'Gourma", 'Tenkodogo', 'Houndé'];
const especes = ['Toutes', 'POULET', 'PINTADE', 'LAPIN', 'BOVIN', 'OVIN', 'CAPRIN', 'PORCIN', 'AUTRE'];

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [ville, setVille] = useState('Toutes');
  const [espece, setEspece] = useState('Toutes');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [q, setQ] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (ville !== 'Toutes') params.ville = ville;
      if (espece !== 'Toutes') params.espece = espece;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (q) params.q = q;
      const res = await api.get('/listings', { params });
      setListings(res.data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  return (
    <div className="space-y-6">
      {/* Hero search */}
      <div className="card p-6 bg-gradient-to-br from-green-600 to-green-700 text-white">
        <h1 className="text-2xl md:text-3xl font-bold">Trouvez votre élevage au Burkina 🇧🇫</h1>
        <p className="mt-2 text-green-50">Poulets, bovins, moutons, chèvres, porcs, lapins • Direct éleveur • WhatsApp</p>

        <div className="mt-6 grid md:grid-cols-[1fr_auto_auto_auto] gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Race, description... ex: Bali-Bali" className="input pl-10 text-gray-900" />
          </div>
          <select value={ville} onChange={e => setVille(e.target.value)} className="input text-gray-900">
            {villesBF.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <select value={espece} onChange={e => setEspece(e.target.value)} className="input text-gray-900">
            {especes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={fetch} className="bg-white text-green-700 px-6 py-3 rounded-xl font-bold hover:bg-green-50">Rechercher</button>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
            <input type="number" placeholder="Min FCFA" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="bg-transparent w-24 outline-none placeholder:text-green-200" />
            <span className="text-green-200">-</span>
            <input type="number" placeholder="Max FCFA" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="bg-transparent w-24 outline-none placeholder:text-green-200" />
          </div>
          <span className="text-xs bg-white/15 px-3 py-2 rounded-full">💡 Annonces vérifiées manuellement</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {especes.slice(1).map(sp => (
          <button key={sp} onClick={() => { setEspece(sp); setTimeout(fetch, 0); }} className={`card p-3 text-center hover:shadow ${espece === sp ? 'ring-2 ring-primary' : ''}`}>
            <div className="text-2xl">{sp === 'POULET' ? '🐔' : sp === 'BOVIN' ? '🐄' : sp === 'OVIN' ? '🐑' : sp === 'CAPRIN' ? '🐐' : sp === 'PORCIN' ? '🐖' : sp === 'LAPIN' ? '🐰' : sp === 'AUTRE' ? '🦄' : '🦃'}</div>
            <div className="text-xs font-semibold mt-1">{sp}</div>
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-lg">{listings.length} annonces {ville !== 'Toutes' ? `à ${ville}` : 'au Burkina'}</h2>
        <button onClick={fetch} className="text-sm text-gray-500 flex items-center gap-1"><SlidersHorizontal className="w-4 h-4" /> Actualiser</button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="card h-64 animate-pulse bg-gray-100" />)}</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          {listings.length === 0 && <div className="col-span-3 text-center py-12 text-gray-500">Aucune annonce trouvée. Essaie d élargir les filtres.</div>}
        </div>
      )}
    </div>
  );
}
