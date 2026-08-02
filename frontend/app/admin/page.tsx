'use client';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/store';
import Link from 'next/link';

export default function AdminPage() {
  const { user: localUser, init } = useAuth();
  const [freshUser, setFreshUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [tab, setTab] = useState<'pending' | 'stats' | 'users' | 'reports'>('pending');
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => { init(); }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await api.get('/auth/me');
        setFreshUser(res.data);
      } catch (e) {
        setFreshUser(null);
      } finally {
        setChecking(false);
      }
    };
    checkAdmin();
  }, []);

  const load = async () => {
    try {
      const [s, p, u, r] = await Promise.all([api.get('/admin/stats'), api.get('/admin/listings/pending'), api.get('/admin/users'), api.get('/admin/reports')]);
      setStats(s.data); setPending(p.data); setUsers(u.data); setReports(r.data);
    } catch (e: any) { console.error(e); }
  };

  useEffect(() => {
    if (freshUser?.role === 'ADMIN') load();
  }, [freshUser]);

  if (checking) return <div className="card p-8 text-center">Vérification rôle admin...</div>;

  const effectiveUser = freshUser || localUser;

  if (effectiveUser?.role !== 'ADMIN') {
    return (
      <div className="card p-8 text-center space-y-3">
        <div className="text-lg font-semibold">Accès admin requis 🔒</div>
        <div className="text-sm text-gray-600">Connecté en tant que: {effectiveUser?.phone || 'non connecté'} - Rôle: {effectiveUser?.role || 'aucun'}</div>
        <div className="text-xs text-gray-500">Comptes admin: +22670000099 (Admin Faso) et +22601831421 (JM Nombo). Déconnecte-toi et reconnecte-toi pour rafraîchir le rôle.</div>
        <div className="flex justify-center gap-2 mt-4">
          <Link href="/login" className="btn-primary">Se connecter admin</Link>
          <button onClick={() => { localStorage.clear(); location.reload(); }} className="btn-secondary text-sm">Forcer déconnexion</button>
        </div>
      </div>
    );
  }

  const validate = async (id: string, status: string) => {
    await api.patch(`/admin/listings/${id}/validate`, { status });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin • Faso Élevage</h1>
        <div className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">Connecté: {effectiveUser.name} ({effectiveUser.role})</div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {(['pending','stats','users','reports'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === t ? 'bg-primary text-white' : 'bg-white border'}`}>{t}</button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card p-4"><div className="text-xs text-gray-500">Utilisateurs</div><div className="text-2xl font-bold">{stats.totalUsers}</div></div>
          <div className="card p-4"><div className="text-xs text-gray-500">Annonces totales</div><div className="text-2xl font-bold">{stats.totalListings}</div></div>
          <div className="card p-4"><div className="text-xs text-gray-500">En attente</div><div className="text-2xl font-bold text-amber-600">{stats.pending}</div></div>
          <div className="card p-4"><div className="text-xs text-gray-500">Aujourd hui</div><div className="text-2xl font-bold text-green-600">{stats.todayListings}</div></div>
          <div className="card p-4 col-span-2">
            <h3 className="font-semibold">Par espèce</h3>
            <div className="mt-2 space-y-1">{stats.byEspece?.map((e:any) => <div key={e.espece} className="flex justify-between text-sm"><span>{e.espece}</span><span>{e._count.espece}</span></div>)}</div>
          </div>
          <div className="card p-4 col-span-2">
            <h3 className="font-semibold">Par ville</h3>
            <div className="mt-2 space-y-1">{stats.byVille?.map((e:any) => <div key={e.ville} className="flex justify-between text-sm"><span>{e.ville}</span><span>{e._count.ville}</span></div>)}</div>
          </div>
        </div>
      )}

      {tab === 'pending' && (
        <div className="grid md:grid-cols-2 gap-4">
          {pending.map(l => (
            <div key={l.id} className="card p-4">
              <img src={l.photos[0]} className="h-48 w-full object-cover rounded-xl" />
              <div className="mt-2 font-semibold">{l.race} • {l.prixFcfa.toLocaleString()} FCFA</div>
              <div className="text-xs text-gray-500">{l.espece} • {l.ville} • {l.user.name} • {l.user.phone}</div>
              <p className="text-sm mt-2">{l.description}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => validate(l.id, 'APPROUVEE')} className="btn-primary flex-1 py-2 text-sm">✅ Approuver (1 clic)</button>
                <button onClick={() => validate(l.id, 'REJETEE')} className="btn-secondary flex-1 py-2 text-sm">❌ Rejeter</button>
              </div>
            </div>
          ))}
          {pending.length === 0 && <div className="col-span-2 card p-8 text-center text-gray-500">Aucune annonce en attente 🎉</div>}
        </div>
      )}

      {tab === 'users' && (
        <div className="card p-0 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="p-3 text-left">Nom</th><th>Téléphone</th><th>Ville</th><th>Rôle</th><th>Annonces</th><th>Action</th></tr></thead>
            <tbody>{users.map(u => <tr key={u.id} className="border-t"><td className="p-3">{u.name}</td><td>{u.phone}</td><td>{u.ville}</td><td><span className={`px-2 py-1 rounded text-xs ${u.role==='ADMIN'?'bg-amber-100 text-amber-700':'bg-gray-100'}`}>{u.role}</span></td><td>{u._count.listings}</td><td><button onClick={async () => { await api.patch(`/admin/users/${u.id}/block`, { isBlocked: !u.isBlocked }); load(); }} className="text-xs px-2 py-1 rounded bg-gray-100">{u.isBlocked ? 'Débloquer' : 'Bloquer'}</button></td></tr>)}</tbody>
          </table>
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-3">
          {reports.map((r:any) => (
            <div key={r.id} className="card p-4 flex justify-between">
              <div><div className="font-semibold">{r.motif} • {r.listing.espece} {r.listing.prixFcfa}F</div><div className="text-xs text-gray-500">Reporté par {r.reporter?.name} • {r.description}</div></div>
              <button onClick={async () => { await api.patch(`/admin/reports/${r.id}/resolve`); load(); }} className="btn-secondary text-xs">Résoudre</button>
            </div>
          ))}
          {reports.length === 0 && <div className="card p-8 text-center text-gray-500">Pas de signalements</div>}
        </div>
      )}
    </div>
  );
}
