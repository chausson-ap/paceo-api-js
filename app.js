import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import structureRoutes from './routes/structure.route.js';
import authRoutes from './routes/auth.route.js';
import { contactsByStructureRouter, contactsFlatRouter } from './routes/contact.route.js';
import { ribsByStructureRouter, ribsFlatRouter } from './routes/rib.route.js';
import pieceJointeRoutes from './routes/piece_jointe.route.js';
import boAuthRoutes from './routes/bo.auth.route.js';
import boConventionRoutes from './routes/bo.convention.route.js';
import boModeleRoutes from './routes/bo.modele.route.js';
import boAnnexeRoutes from './routes/bo.annexe.route.js';
import boEvenementRoutes from './routes/bo.evenement.route.js';
import boStructureRoutes from './routes/bo.structure.route.js';

// Fail-fast : refuse de démarrer si JWT_SECRET est absent ou trop faible.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error(
    'FATAL: JWT_SECRET manquant ou trop court (< 32 caractères). ' +
    'Générer une valeur aléatoire forte, p.ex. : ' +
    'node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64\'))"'
  );
  process.exit(1);
}

const app = express();

app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    // Autorise requêtes same-origin (sans header Origin, ex. curl, same-origin fetch)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Origine non autorisée: ' + origin));
  },
  credentials: false,
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/structures', structureRoutes);
app.use('/api/structures/:structureId/contacts', contactsByStructureRouter);
app.use('/api/contacts', contactsFlatRouter);
app.use('/api/structures/:structureId/ribs', ribsByStructureRouter);
app.use('/api/ribs', ribsFlatRouter);
app.use('/api/piece_jointes', pieceJointeRoutes);
app.use('/api/bo/auth', boAuthRoutes);
app.use('/api/bo/conventions/modeles', boModeleRoutes);
app.use('/api/bo/conventions', boConventionRoutes);
app.use('/api/bo/structures', boStructureRoutes);
app.use('/api/bo/annexes', boAnnexeRoutes);
app.use('/api/bo/evenements', boEvenementRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Erreur serveur' });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

app.listen(3000, () => console.log('API démarrée sur le port 3000'));
