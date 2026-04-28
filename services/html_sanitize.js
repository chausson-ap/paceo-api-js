import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'code', 'pre', 'hr',
  'a', 'sub', 'sup',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
];

const ALLOWED_ATTRIBUTES = {
  a: ['href', 'title', 'target', 'rel'],
  table: ['style'],
  th: ['scope', 'colspan', 'rowspan', 'style'],
  td: ['colspan', 'rowspan', 'style'],
  colgroup: ['style', 'span'],
  col: ['style', 'span'],
};

const ALLOWED_SCHEMES = ['http', 'https', 'mailto'];

const ALLOWED_STYLES = {
  '*': {
    'text-align': [/^(left|right|center|justify)$/],
    'width': [/^\d+(?:\.\d+)?(?:px|%|em|rem)$/],
    'min-width': [/^\d+(?:\.\d+)?(?:px|%|em|rem)$/],
  },
};

export const sanitizeArticleHtml = (html) => {
  if (html == null) return '';
  const input = String(html);
  return sanitizeHtml(input, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ALLOWED_SCHEMES,
    allowedStyles: ALLOWED_STYLES,
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const out = { ...attribs };
        const href = out.href || '';
        const isExternal = /^https?:\/\//i.test(href);
        if (isExternal) {
          out.rel = 'noopener noreferrer';
          if (!out.target) out.target = '_blank';
        }
        return { tagName: 'a', attribs: out };
      },
    },
  });
};
