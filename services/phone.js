// Normalisation stricte des numéros de téléphone.
//
// Format retenu (hybride FR + E.164) :
//  - FR        -> 0XXXXXXXXX (10 chiffres, commence par 0)
//  - International -> +XXXXXXXXX... (E.164, 8 à 15 chiffres après le +)
// Distinction : si la chaîne commence par '+' c'est de l'international,
// sinon c'est du FR.

const badRequest = (msg) => {
  const err = new Error(msg);
  err.status = 400;
  return err;
};

export const normalizePhone = (input) => {
  if (input == null) return '';
  const raw = String(input);
  if (raw === '') return '';

  // Retire tout ce qui n'est ni chiffre ni '+'
  const cleaned = raw.replace(/[^\d+]/g, '');
  if (cleaned === '') return '';

  if (cleaned.startsWith('+')) {
    // International : E.164 -> 8 à 15 chiffres après le +
    if (!/^\+\d{8,15}$/.test(cleaned)) {
      throw badRequest('Téléphone international invalide');
    }
    // Cas particulier français : si +33 suivi de 10 chiffres dont le premier est 0,
    // on retire ce 0 (forme courante : +330612345678 -> +33612345678).
    if (/^\+33\d{10}$/.test(cleaned) && cleaned[3] === '0') {
      const fixed = '+33' + cleaned.slice(4);
      // Re-vérifie la longueur après suppression
      if (!/^\+\d{8,15}$/.test(fixed)) {
        throw badRequest('Téléphone international invalide');
      }
      return fixed;
    }
    return cleaned;
  }

  // FR : exactement 10 chiffres commençant par 0
  if (!/^0\d{9}$/.test(cleaned)) {
    throw badRequest('Téléphone FR invalide (10 chiffres commençant par 0)');
  }
  return cleaned;
};
