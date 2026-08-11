import {
  calculateTax,
  getTaxRate,
  provinceFromLocation,
} from './canadian-tax';

describe('canadian-tax', () => {
  describe('provinceFromLocation', () => {
    it('reads a trailing province code', () => {
      expect(provinceFromLocation('Toronto, ON')).toBe('ON');
      expect(provinceFromLocation('Vancouver, BC')).toBe('BC');
      expect(provinceFromLocation('Calgary, AB')).toBe('AB');
    });

    it('reads a full province name', () => {
      expect(provinceFromLocation('Vancouver, British Columbia')).toBe('BC');
      expect(provinceFromLocation('Montréal, Québec')).toBe('QC');
    });

    it('is case-insensitive', () => {
      expect(provinceFromLocation('toronto, on')).toBe('ON');
    });

    it('defaults to Ontario when the province is unknown or missing', () => {
      expect(provinceFromLocation('Somewhere')).toBe('ON');
      expect(provinceFromLocation('')).toBe('ON');
      expect(provinceFromLocation(null)).toBe('ON');
      expect(provinceFromLocation(undefined)).toBe('ON');
    });
  });

  describe('getTaxRate', () => {
    it('applies HST in HST provinces', () => {
      expect(getTaxRate('ON').rate).toBe(0.13);
      expect(getTaxRate('NS').rate).toBe(0.14);
      expect(getTaxRate('NB').rate).toBe(0.15);
    });

    it('applies GST only in GST provinces', () => {
      expect(getTaxRate('AB').rate).toBe(0.05);
      expect(getTaxRate('BC').rate).toBe(0.05);
    });

    it('applies combined GST+QST in Quebec', () => {
      expect(getTaxRate('QC').rate).toBeCloseTo(0.14975, 5);
    });

    it('falls back to the default for an unknown code', () => {
      expect(getTaxRate('XX').rate).toBe(0.13);
    });
  });

  describe('calculateTax', () => {
    it('computes Ontario HST on a round amount', () => {
      const t = calculateTax(100, 'Toronto, ON');
      expect(t.subtotal).toBe(100);
      expect(t.taxAmount).toBe(13);
      expect(t.total).toBe(113);
      expect(t.province).toBe('ON');
      expect(t.taxLabel).toBe('HST (13%)');
    });

    it('computes Alberta GST', () => {
      const t = calculateTax(200, 'Calgary, AB');
      expect(t.taxAmount).toBe(10);
      expect(t.total).toBe(210);
    });

    it('rounds to cents rather than leaving float drift', () => {
      const t = calculateTax(245, 'Toronto, ON');
      expect(t.taxAmount).toBe(31.85);
      expect(t.total).toBe(276.85);
      // Values carry at most 2 decimal places. (Multiplying back by 100 is
      // itself lossy in IEEE-754 — 276.85 * 100 is 27684.999… — so compare
      // the rendered value instead.)
      expect(t.taxAmount.toFixed(2)).toBe('31.85');
      expect(t.total.toFixed(2)).toBe('276.85');
    });

    it('never produces more than two decimal places', () => {
      for (const amount of [33.33, 99.99, 1, 7.77]) {
        const t = calculateTax(amount, 'Montréal, QC');
        expect(t.taxAmount).toBe(Number(t.taxAmount.toFixed(2)));
        expect(t.total).toBe(Number(t.total.toFixed(2)));
      }
    });

    it('handles a zero subtotal', () => {
      const t = calculateTax(0, 'Toronto, ON');
      expect(t.taxAmount).toBe(0);
      expect(t.total).toBe(0);
    });

    it('always satisfies total = subtotal + tax', () => {
      for (const amount of [45, 90.5, 217.33, 1234.99]) {
        for (const loc of ['Toronto, ON', 'Calgary, AB', 'Montréal, QC']) {
          const t = calculateTax(amount, loc);
          expect(t.total).toBeCloseTo(t.subtotal + t.taxAmount, 2);
        }
      }
    });
  });
});
