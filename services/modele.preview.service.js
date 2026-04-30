import puppeteer from 'puppeteer';
import pool from '../config/db.js';
import * as articleModel from '../models/modele_article.model.js';
import * as vuModel from '../models/modele_vu.model.js';
import { sanitizeArticleHtml } from './html_sanitize.js';

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const notFound = (msg = 'Modèle introuvable') => {
  const err = new Error(msg);
  err.status = 404;
  return err;
};

const getModeleHeader = async (modeleId) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT modele_id AS id, nom, titre FROM convention_modeles WHERE modele_id = ?',
      [modeleId]
    );
    return rows[0] ?? null;
  } finally {
    conn.release();
  }
};

const buildHtml = ({ titre, nom, vus, articles }) => {
  const displayedTitle = (titre && String(titre).trim()) || nom || 'Convention';

  const vusHtml = vus
    .map((v) => `<div class="vu">${sanitizeArticleHtml(v.contenu)}</div>`)
    .join('');

  const articlesHtml = articles
    .map(
      (a) => `<section class="article">
        <div class="article-titre">${escapeHtml(a.titre)}</div>
        <div class="article-contenu">${sanitizeArticleHtml(a.contenu)}</div>
      </section>`
    )
    .join('');

  // Filigrane "Aperçu" : SVG inline en background-image sur la page,
  // recentré et incliné. Le repeat-y assure une présence sur chaque page A4.
  // 595x842 = dimensions A4 en points (1pt = 1/72 inch).
  const watermarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="595" height="842"><text x="297.5" y="421" font-family="Arial, sans-serif" font-size="180" font-weight="700" fill="rgba(0,0,0,0.07)" text-anchor="middle" dominant-baseline="middle" transform="rotate(-45 297.5 421)">Aperçu</text></svg>`;
  const watermarkUrl = `data:image/svg+xml;utf8,${encodeURIComponent(watermarkSvg)}`;

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Aperçu — ${escapeHtml(displayedTitle)}</title>
  <style>
    @page { size: A4; margin: 20mm 18mm; }
    * { box-sizing: border-box; }
    html, body {
      font-family: 'Marianne', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.4;
      color: #161616;
      margin: 0;
      padding: 0;
    }
    body {
      background-image: url("${watermarkUrl}");
      background-repeat: repeat-y;
      background-position: center top;
      background-size: 100% auto;
    }
    .header { text-align: center; font-weight: 700; margin-bottom: 16pt; }
    .header .titre { font-size: 12pt; }
    .header .numero { font-size: 11pt; }
    .entre p { margin: 6pt 0; }
    .right { text-align: right; }
    .convenu { text-align: center; font-weight: 700; text-decoration: underline; margin: 18pt 0; }
    .vu { margin: 6pt 0; text-align: justify; }
    .vu p { margin: 0; }
    .article { margin-top: 8pt; page-break-inside: avoid; }
    .article-titre { font-weight: 700; text-decoration: underline; margin-top: 12pt; margin-bottom: 4pt; }
    .article-contenu p { margin: 4pt 0; text-align: justify; }
    .article-contenu ul, .article-contenu ol { margin: 4pt 0 4pt 20pt; }
    .article-contenu table { border-collapse: collapse; margin: 6pt 0; width: 100%; }
    .article-contenu table td, .article-contenu table th { border: 1px solid #444; padding: 4px 8px; vertical-align: top; }
  </style>
</head>
<body>
  <div class="header">
    <div class="titre">${escapeHtml(displayedTitle)}</div>
    <div class="numero">N° [%NumeroConv%]</div>
  </div>

  <div class="entre">
    <p>ENTRE</p>
    <p><strong>L'ETAT,</strong><br>
    représenté par le préfet de la région Hauts-de-France, et par délégation, le directeur régional de l'économie, de l'emploi, du travail et des solidarités Hauts-de-France</p>
    <p class="right">D'une part,</p>

    <p><strong>ET</strong></p>

    <p><strong>[%Sigle%]</strong><br>
    Statut : [%StatutJuridique%]<br>
    Adresse : [%Adresse%]<br>
    SIRET : [%Siret%]<br>
    Représenté par [%Représentant%], [%QualitéReprésentant%]<br>
    Ci-après dénommé le bénéficiaire, d'autre part,</p>
    <p class="right">D'autre part</p>
  </div>

  ${vusHtml}

  <div class="convenu">IL A ETE CONVENU CE QU'IL SUIT :</div>

  ${articlesHtml}
</body>
</html>`;
};

export const generatePreviewPDF = async (modeleId) => {
  const modele = await getModeleHeader(modeleId);
  if (!modele) throw notFound();

  const [vusRows, articleRows] = await Promise.all([
    vuModel.listByModele(modeleId),
    articleModel.listByModele(modeleId),
  ]);

  const html = buildHtml({
    titre: modele.titre,
    nom: modele.nom,
    vus: vusRows.map((v) => ({ contenu: v.contenu ?? '' })),
    articles: articleRows.map((a) => ({
      titre: a.titre ?? '',
      contenu: a.contenu ?? '',
    })),
  });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate:
        '<div style="font-size:8pt;width:100%;text-align:center;color:#888;padding:0 18mm;"><span class="pageNumber"></span>/<span class="totalPages"></span></div>',
      margin: { top: '20mm', bottom: '20mm', left: '18mm', right: '18mm' },
    });
    const safeName = (modele.nom || 'modele').replace(/[^A-Za-z0-9._-]+/g, '_');
    return { buffer, filename: `apercu-${safeName}.pdf` };
  } finally {
    await browser.close();
  }
};
