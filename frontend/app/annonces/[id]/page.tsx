'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Phone, MessageCircle, Heart, Flag, Eye, Calendar } from 'lucide-react';
import { api, Listing } from '../../../lib/api';
import { useAuth } from '../../../lib/store';

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const { isAuth } = useAuth();

  useEffect(() => {
    api.get(`/listings/${id}`).then(r => setListing(r.data)).catch(console.error);
  }, [id]);

  const toggleFav = async () => {
    if (!isAuth) return alert('Connecte-toi pour ajouter aux favoris');
    try {
      if (isFav) await api.delete(`/favorites/${id}`);
      else await api.post(`/favorites/${id}`);
      setIsFav(!isFav);
    } catch (e) { console.error(e); }
  };

  const report = async () => {
    const motif = prompt('Motif? ARNAQUE, PRIX_ABUSIF, PHOTO_TROMPEUSE, ANIMAL_MALADE, AUTRE');
    if (!motif) return;
    try {
      await api.post('/reports', { listingId: id, motif, description: 'Signalement depuis fiche' });
      alert('Signalement envoyé, merci!');
    } catch { alert('Erreur signalement'); }
  };

  if (!listing) return <div className="card p-12 text-center animate-pulse">Chargement...</div>;

  const phoneClean = listing.user.phone.replace('+226', '');
  const waMessage = encodeURIComponent(`Bonjour ${listing.user.name}, je suis intéressé par votre annonce ${listing.race || listing.espece} à ${listing.prixFcfa.toLocaleString()} FCFA sur Faso Élevage. Toujours disponible?`);

  return (
    <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6">
      <div className="space-y-4">
        <div className="card overflow-hidden">
          <div className="h-[380px] bg-gray-100">
            <img src={listing.photos[selectedPhoto] || listing.photos[0] || 'https://picsum.photos/600/400'} className="w-full h-full object-cover" alt={listing.race} />
          </div>
          <div className="flex gap-2 p-3 overflow-auto">
            {listing.photos.map((p, i) => (
              <button key={i} onClick={() => setSelectedPhoto(i)} className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 ${selectedPhoto === i ? 'border-primary' : 'border-transparent'}`}>
                <img src={p} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h1 className="text-2xl font-bold">{listing.race || (listing.espece === 'AUTRE' ? (listing as any).especeCustom : listing.espece) || listing.espece} • {listing.quantite} disponible(s)</h1>
          <div className="flex flex-wrap gap-2 mt-3 text-sm">
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">{listing.espece === 'AUTRE' ? ((listing as any).especeCustom || 'AUTRE') : listing.espece}</span>
            <span className="bg-gray-50 px-3 py-1 rounded-full flex items-center gap-1"><MapPin className="w-3 h-3" /> {listing.ville} {listing.quartier && `• ${listing.quartier}`}</span>
            <span className="bg-gray-50 px-3 py-1 rounded-full flex items-center gap-1"><Eye className="w-3 h-3" /> {listing.vues} vues</span>
            <span className="bg-gray-50 px-3 py-1 rounded-full flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(listing.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div><div className="text-xs text-gray-500">Prix</div><div className="font-bold text-lg text-primary">{listing.prixFcfa.toLocaleString('fr-FR')} FCFA</div></div>
            <div><div className="text-xs text-gray-500">Poids</div><div className="font-semibold">{listing.poidsKg ? `${listing.poidsKg} kg` : '-'}</div></div>
            <div><div className="text-xs text-gray-500">Âge</div><div className="font-semibold">{listing.ageMois ? `${listing.ageMois} mois` : '-'}</div></div>
          </div>
          {listing.description && <p className="mt-6 text-gray-700 leading-relaxed whitespace-pre-line">{listing.description}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-5">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">{listing.user.name[0]}</div>
            <div><div className="font-semibold">{listing.user.name}</div><div className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {listing.user.ville} {listing.user.quartier && `• ${listing.user.quartier}`}</div></div>
          </div>

          <div className="mt-5 space-y-3">
            <a href={`tel:${listing.user.phone}`} className="btn-primary w-full flex items-center justify-center gap-2"><Phone className="w-4 h-4" /> Appeler {phoneClean}</a>
            <a href={`https://wa.me/${listing.user.phone.replace('+', '')}?text=${waMessage}`} target="_blank" className="btn-secondary w-full flex items-center justify-center gap-2 bg-green-500 text-white border-green-500 hover:bg-green-600"><MessageCircle className="w-4 h-4" /> WhatsApp direct</a>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={toggleFav} className={`btn-secondary text-sm flex items-center justify-center gap-1 ${isFav ? 'bg-pink-50 border-pink-200 text-pink-600' : ''}`}><Heart className={`w-4 h-4 ${isFav ? 'fill-pink-600' : ''}`} /> {isFav ? 'Favori' : 'Favoris'}</button>
            <button onClick={report} className="btn-secondary text-sm flex items-center justify-center gap-1"><Flag className="w-4 h-4" /> Signaler</button>
          </div>

          <div className="mt-4 text-xs text-gray-500 p-3 bg-amber-50 rounded-xl">⚠️ Rencontrez-vous en lieu public, vérifiez l animal avant paiement. Faso Élevage valide les annonces mais ne gère pas les paiements en Phase 1.</div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold">Vendeur info</h3>
          <ul className="mt-3 text-sm space-y-2 text-gray-600">
            <li>• Membre vérifié téléphone</li>
            <li>• Annonces modérées manuellement</li>
            <li>• Contact direct sans commission (MVP gratuit)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
