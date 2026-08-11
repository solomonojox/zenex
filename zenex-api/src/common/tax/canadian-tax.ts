/**
 * Canadian GST/HST rates by province.
 *
 * ⚠ These are standard published rates and are provided as a sensible default —
 * they are NOT tax advice. Verify with an accountant before charging real
 * customers, and note that registration is generally required once revenue
 * exceeds $30,000 over four consecutive quarters.
 *
 * Notes:
 *  - HST provinces charge a single blended tax (ON 13%, NS 14%, NB/NL/PE 15%).
 *  - GST-only provinces charge 5% federally. Provincial sales taxes (BC PST,
 *    SK PST, MB RST) generally do not apply to residential cleaning labour,
 *    so they're excluded here.
 *  - Quebec is GST 5% + QST 9.975% = 14.975% combined.
 */

export interface TaxRate {
  /** Combined rate as a decimal, e.g. 0.13 for 13%. */
  rate: number;
  /** Display label, e.g. "HST (13%)". */
  label: string;
}

const RATES: Record<string, TaxRate> = {
  AB: { rate: 0.05, label: 'GST (5%)' },
  BC: { rate: 0.05, label: 'GST (5%)' },
  MB: { rate: 0.05, label: 'GST (5%)' },
  NB: { rate: 0.15, label: 'HST (15%)' },
  NL: { rate: 0.15, label: 'HST (15%)' },
  NS: { rate: 0.14, label: 'HST (14%)' },
  NT: { rate: 0.05, label: 'GST (5%)' },
  NU: { rate: 0.05, label: 'GST (5%)' },
  ON: { rate: 0.13, label: 'HST (13%)' },
  PE: { rate: 0.15, label: 'HST (15%)' },
  QC: { rate: 0.14975, label: 'GST + QST (14.975%)' },
  SK: { rate: 0.05, label: 'GST (5%)' },
  YT: { rate: 0.05, label: 'GST (5%)' },
};

const DEFAULT_PROVINCE = 'ON';

/** Map common province spellings/abbreviations to a two-letter code. */
const ALIASES: Record<string, string> = {
  ALBERTA: 'AB',
  'BRITISH COLUMBIA': 'BC',
  MANITOBA: 'MB',
  'NEW BRUNSWICK': 'NB',
  NEWFOUNDLAND: 'NL',
  'NEWFOUNDLAND AND LABRADOR': 'NL',
  'NOVA SCOTIA': 'NS',
  'NORTHWEST TERRITORIES': 'NT',
  NUNAVUT: 'NU',
  ONTARIO: 'ON',
  'PRINCE EDWARD ISLAND': 'PE',
  QUEBEC: 'QC',
  'QUÉBEC': 'QC',
  SASKATCHEWAN: 'SK',
  YUKON: 'YT',
};

/**
 * Resolve a province code from a free-text location such as
 * "Toronto, ON" or "Vancouver, British Columbia".
 */
export function provinceFromLocation(location?: string | null): string {
  if (!location) return DEFAULT_PROVINCE;
  const upper = location.toUpperCase();

  // Try the trailing token first ("Toronto, ON" → "ON").
  const parts = upper.split(',').map((p) => p.trim());
  const last = parts[parts.length - 1];
  if (RATES[last]) return last;
  if (ALIASES[last]) return ALIASES[last];

  // Fall back to scanning the whole string for a known name/code.
  for (const [name, code] of Object.entries(ALIASES)) {
    if (upper.includes(name)) return code;
  }
  for (const code of Object.keys(RATES)) {
    if (new RegExp(`\\b${code}\\b`).test(upper)) return code;
  }
  return DEFAULT_PROVINCE;
}

export function getTaxRate(province: string): TaxRate {
  return RATES[province?.toUpperCase()] ?? RATES[DEFAULT_PROVINCE];
}

export interface TaxedTotal {
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  taxLabel: string;
  province: string;
  total: number;
}

/** Round to cents to avoid floating-point drift in money maths. */
function money(n: number) {
  return Math.round(n * 100) / 100;
}

/** Compute tax on a subtotal for a given province (or free-text location). */
export function calculateTax(subtotal: number, location?: string | null): TaxedTotal {
  const province = provinceFromLocation(location);
  const { rate, label } = getTaxRate(province);
  const taxAmount = money(subtotal * rate);
  return {
    subtotal: money(subtotal),
    taxAmount,
    taxRate: rate,
    taxLabel: label,
    province,
    total: money(subtotal + taxAmount),
  };
}
