import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import listingsRoutes from './modules/listings/listings.routes';
import favoritesRoutes from './modules/favorites/favorites.routes';
import reportsRoutes from './modules/reports/reports.routes';
import adminRoutes from './modules/admin/admin.routes';
import usersRoutes from './modules/users/users.routes';
import paymentsRoutes from './modules/payments/payments.routes';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => res.json({
  message: 'Faso Élevage API - Phase 2 Monétisation 🇧🇫',
  frontend: process.env.FRONTEND_URL || 'https://frontend-teal-xi-19.vercel.app',
  health: '/health',
  phase: '2 - Boost + Badge via CinetPay',
  endpoints: {
    listings: '/api/listings?ville=Ouagadougou&espece=POULET',
    auth: '/api/auth/request-otp',
    admin: '/api/admin/stats',
    payments: '/api/payments/pricing',
    boost: '/api/payments/init-boost',
    badge: '/api/payments/init-badge'
  },
  docs: 'https://github.com/jmnombo01/faso-elevage/blob/main/API_DOC.md'
}));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'faso-elevage-api', phase: '2-MVP', boost_pricing: { '3j': 500, '7j': 1000, '30j': 2000 } }));

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/payments', paymentsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} non trouvée` });
});

export default app;
