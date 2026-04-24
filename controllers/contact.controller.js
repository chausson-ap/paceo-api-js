import * as contactService from '../services/contact.service.js';

export const list = async (req, res) => {
  console.log('[ctrl] contact.list entered');
  try {
    const contacts = await contactService.listContacts(req.params.structureId, req.user.id);
    res.json(contacts);
  } catch (err) {
    console.error('[ctrl] contact.list err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const contact = await contactService.createContact(req.params.structureId, req.body, req.user.id);
    res.status(201).json(contact);
  } catch (err) {
    console.error('[ctrl] contact.create err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const contact = await contactService.updateContact(req.params.contactId, req.body, req.user.id);
    res.json(contact);
  } catch (err) {
    console.error('[ctrl] contact.update err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const affected = await contactService.deleteContact(req.params.contactId, req.user.id);
    res.json({ affected });
  } catch (err) {
    console.error('[ctrl] contact.remove err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};
