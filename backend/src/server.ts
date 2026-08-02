import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Faso Élevage API démarrée sur http://localhost:${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
});
