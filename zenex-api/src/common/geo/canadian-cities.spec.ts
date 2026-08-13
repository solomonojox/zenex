import { distanceKm, isWithinRadius, resolveCity } from './canadian-cities';

describe('resolveCity', () => {
  it('resolves a plain city name', () => {
    expect(resolveCity('Toronto, ON')).toEqual({
      lat: 43.6532,
      lng: -79.3832,
    });
  });

  it('is case-insensitive', () => {
    expect(resolveCity('MISSISSAUGA, on')).toEqual(resolveCity('Mississauga'));
  });

  it('prefers the longest matching name', () => {
    // "Richmond Hill, ON" contains "richmond" as a substring. Matching that
    // first would place an Ontario provider in British Columbia.
    const hill = resolveCity('Richmond Hill, ON');
    const bc = resolveCity('Richmond, BC');
    expect(hill).not.toEqual(bc);
    expect(hill!.lng).toBeCloseTo(-79.44, 1);
  });

  it('picks the district out of a district-plus-city string', () => {
    expect(resolveCity('Scarborough, Toronto, ON')).toEqual(
      resolveCity('Scarborough'),
    );
  });

  it('returns null for anything it does not know', () => {
    expect(resolveCity('Moose Factory, ON')).toBeNull();
    expect(resolveCity('')).toBeNull();
    expect(resolveCity(undefined)).toBeNull();
    expect(resolveCity(null)).toBeNull();
  });
});

describe('distanceKm', () => {
  const at = (name: string) => resolveCity(name)!;

  it('is zero for the same point', () => {
    expect(distanceKm(at('Toronto'), at('Toronto'))).toBeCloseTo(0, 5);
  });

  it('is symmetric', () => {
    const a = distanceKm(at('Toronto'), at('Vancouver'));
    const b = distanceKm(at('Vancouver'), at('Toronto'));
    expect(a).toBeCloseTo(b, 6);
  });

  it('matches known real-world distances', () => {
    // Straight-line references, ±5%.
    expect(distanceKm(at('Toronto'), at('Mississauga'))).toBeCloseTo(22, -1);
    expect(distanceKm(at('Toronto'), at('Hamilton'))).toBeCloseTo(58, -1);
    expect(distanceKm(at('Toronto'), at('Montreal'))).toBeCloseTo(505, -2);
    expect(distanceKm(at('Toronto'), at('Vancouver'))).toBeCloseTo(3350, -2);
  });
});

describe('isWithinRadius', () => {
  it('includes a neighbouring city inside the default 25km radius', () => {
    // The case that motivated this: Mississauga cleaner, Toronto client.
    expect(isWithinRadius('Mississauga, ON', 'Toronto, ON', 25)).toBe(true);
  });

  it('excludes a city beyond the radius', () => {
    expect(isWithinRadius('Hamilton, ON', 'Toronto, ON', 25)).toBe(false);
    expect(isWithinRadius('Vancouver, BC', 'Toronto, ON', 25)).toBe(false);
  });

  it('respects a provider willing to travel further', () => {
    expect(isWithinRadius('Hamilton, ON', 'Toronto, ON', 25)).toBe(false);
    expect(isWithinRadius('Hamilton, ON', 'Toronto, ON', 75)).toBe(true);
  });

  it('keeps Toronto districts mutually reachable at the default radius', () => {
    for (const district of [
      'Scarborough, Toronto, ON',
      'North York, Toronto, ON',
      'Etobicoke, Toronto, ON',
    ]) {
      expect(isWithinRadius(district, 'Toronto, ON', 25)).toBe(true);
    }
  });

  it('returns null when either side is unrecognised, so callers can fall back', () => {
    expect(isWithinRadius('Moose Factory, ON', 'Toronto, ON', 25)).toBeNull();
    expect(isWithinRadius('Toronto, ON', 'Nowheresville', 25)).toBeNull();
    expect(isWithinRadius(null, 'Toronto, ON', 25)).toBeNull();
  });
});
