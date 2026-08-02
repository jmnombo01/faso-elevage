import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import listingsRoutes from './modules/listings/listings.routes';
import favoritesRoutes from './modules/favorites/favorites.routes';
import reportsRoutes from './modules/reports/reports.routes';
import adminRoutes from './modules/admin/admin.routes';
import usersRoutes from './modules/users/users.routes';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => res.json({
  message: 'Faso Élevage API - Phase 1 MVP 🇧🇫',
  frontend: process.env.FRONTEND_URL || 'https://frontend-teal-xi-19.vercel.app',
  health: '/health',
  endpoints: {
    listings: '/api/listings?ville=Ouagadougou&espece=POULET',
    auth: '/api/auth/request-otp',
    admin: '/api/admin/stats'
  },
  docs: 'https://github.com/jmnombo01/faso-elevage/blob/main/API_DOC.md'
}));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'faso-elevage-api', phase: '1-MVP' }));

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} non trouvée` });
});

export default app;
