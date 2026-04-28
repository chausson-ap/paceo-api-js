import * as modeleArticleService from '../services/modele_article.service.js';

export const list = async (req, res) => {
  console.log('[ctrl] modele_article.list entered');
  try {
    const articles = await modeleArticleService.listArticles(req.params.modeleId);
    res.json(articles);
  } catch (err) {
    console.error('[ctrl] modele_article.list err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  console.log('[ctrl] modele_article.create entered');
  try {
    const article = await modeleArticleService.createArticle(req.params.modeleId, req.body || {});
    res.status(201).json(article);
  } catch (err) {
    console.error('[ctrl] modele_article.create err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 400).json({ error: err.message });
  }
};

export const update = async (req, res) => {
  console.log('[ctrl] modele_article.update entered');
  try {
    const article = await modeleArticleService.updateArticle(req.params.articleId, req.body || {});
    res.json(article);
  } catch (err) {
    console.error('[ctrl] modele_article.update err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 400).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  console.log('[ctrl] modele_article.remove entered');
  try {
    const result = await modeleArticleService.deleteArticle(req.params.articleId);
    res.json(result);
  } catch (err) {
    console.error('[ctrl] modele_article.remove err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 400).json({ error: err.message });
  }
};

export const reorder = async (req, res) => {
  console.log('[ctrl] modele_article.reorder entered');
  try {
    const orderedIds = req.body?.ordre;
    const result = await modeleArticleService.reorderArticles(req.params.modeleId, orderedIds);
    res.json(result);
  } catch (err) {
    console.error('[ctrl] modele_article.reorder err:', err);
    if (err.cause) console.error('[ctrl] cause:', err.cause);
    res.status(err.status || 400).json({ error: err.message });
  }
};
