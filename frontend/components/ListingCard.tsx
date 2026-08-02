import Link from 'next/link';
import { MapPin, Eye } from 'lucide-react';
import { Listing } from '../lib/api';

const especeEmoji: Record<string, string> = {
  POULET: '🐔', PINTADE: '🦃', LAPIN: '🐰', BOVIN: '🐄', OVIN: '🐑', CAPRIN: '🐐', PORCIN: '🐖'
};

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/annonces/${listing.id}`} className="card group hover:shadow-md transition">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img src={listing.photos[0] || 'https://picsum.photos/seed/faso/600/400'} alt={listing.race} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          {especeEmoji[listing.espece] || '🐾'} {listing.espece}
        </span>
        <span className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <Eye className="w-3 h-3" /> {listing.vues}
        </span>
        {listing.statut === 'VENDUE' && (
          <span className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">VENDUE</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold line-clamp-1">{listing.race || listing.espece}</h3>
          <span className="font-bold text-primary whitespace-nowrap">{listing.prixFcfa.toLocaleString('fr-FR')} FCFA</span>
        </div>
        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {listing.ville} {listing.quartier ? `• ${listing.quartier}` : ''}</p>
        <div className="flex gap-2 mt-2 text-xs text-gray-500">
          <span className="bg-gray-50 px-2 py-1 rounded-full">Qté: {listing.quantite}</span>
          {listing.poidsKg && <span className="bg-gray-50 px-2 py-1 rounded-full">{listing.poidsKg} kg</span>}
          {listing.ageMois && <span className="bg-gray-50 px-2 py-1 rounded-full">{listing.ageMois} mois</span>}
        </div>
      </div>
    </Link>
  );
}
