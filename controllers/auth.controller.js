import * as authService from '../services/auth.service.js';

export const register = async (req, res) => {
  console.log('[ctrl] register entered');
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error('[ctrl] register err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  console.log('[ctrl] login entered');
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    console.error('[ctrl] login err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 401).json({ error: err.message });
  }
};

export const me = async (req, res) => {
  try {
    const result = await authService.me(req.user.id);
    res.json(result);
  } catch (err) {
    console.error('[ctrl] me err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 401).json({ error: err.message });
  }
};
