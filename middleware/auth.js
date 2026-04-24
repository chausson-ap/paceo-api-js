import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (payload.scope !== 'fo') {
      return res.status(401).json({ error: 'Token invalide' });
    }
    req.user = { id: payload.id };
    next();
  } catch (err) {
    console.error('[auth] verify err:', err.message);
    return res.status(401).json({ error: 'Token invalide' });
  }
};
