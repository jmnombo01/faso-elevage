'use client';
import { useEffect, useState } from 'react';
import { api, Listing } from '../../lib/api';
import ListingCard from '../../components/ListingCard';
import { useAuth } from '../../lib/store';
import Link from 'next/link';

export default function FavorisPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const { isAuth } = useAuth();
  useEffect(() => { if (isAuth) api.get('/favorites').then(r => setListings(r.data)).catch(()=>{}); }, [isAuth]);
  if (!isAuth) return <div className="card p-8 text-center">Connecte-toi pour voir tes favoris <Link href="/login" className="btn-primary ml-2">Connexion</Link></div>;
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Mes favoris ({listings.length})</h1><div className="grid md:grid-cols-3 gap-4">{listings.map(l => <ListingCard key={l.id} listing={l} />)}</div></div>;
}
