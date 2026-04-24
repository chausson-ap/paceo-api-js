import * as boAuthService from '../services/bo.auth.service.js';

export const register = async (req, res) => {
  console.log('[ctrl] bo.register entered');
  try {
    const result = await boAuthService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error('[ctrl] bo.register err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  console.log('[ctrl] bo.login entered');
  try {
    const result = await boAuthService.login(req.body);
    res.json(result);
  } catch (err) {
    console.error('[ctrl] bo.login err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 401).json({ error: err.message });
  }
};

export const me = async (req, res) => {
  try {
    const result = await boAuthService.me(req.agent.id);
    res.json(result);
  } catch (err) {
    console.error('[ctrl] bo.me err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 401).json({ error: err.message });
  }
};
