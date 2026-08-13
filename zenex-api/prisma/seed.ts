/**
 * Seed script — ports the frontend mock data (lib/data.ts) into the DB
 * so the API returns realistic data from day one.
 *
 * Run with: npm run prisma:seed
 */
import { BookingStatus, PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { calculateTax } from '../src/common/tax/canadian-tax';

const prisma = new PrismaClient();

const PROVIDERS = [
  {
    firstName: 'Maria',
    lastName: 'Santos',
    title: 'Home Cleaning Specialist',
    location: 'Toronto, ON',
    rating: 4.97,
    reviewsCount: 312,
    hourlyRate: 45,
    verified: true,
    elite: true,
    instant: true,
    tags: ['Deep Clean', 'Move-in/out', 'Recurring'],
    completions: 847,
    responseTime: '< 1 hr',
    languages: ['English', 'Portuguese'],
    bio: 'Professional cleaner with 8+ years of experience.',
    aiMatch: 98,
    services: [
      { name: 'Standard Clean', duration: '2–3 hrs', price: 90, description: 'Kitchen, bathrooms, bedrooms, living areas' },
      { name: 'Deep Clean', duration: '4–6 hrs', price: 180, description: 'Everything in Standard + appliances, baseboards' },
      { name: 'Move In/Out', duration: '5–7 hrs', price: 220, description: 'Full property clean for moving transitions' },
    ],
  },
  {
    firstName: 'James',
    lastName: 'Kowalski',
    title: 'Commercial & Residential Pro',
    location: 'Vancouver, BC',
    rating: 4.94,
    reviewsCount: 218,
    hourlyRate: 52,
    verified: true,
    elite: false,
    instant: true,
    tags: ['Office', 'Commercial', 'Home'],
    completions: 503,
    responseTime: '< 2 hr',
    languages: ['English', 'Polish'],
    bio: 'Owner of Sparkling Clean Co. serving Vancouver since 2015.',
    aiMatch: 91,
    services: [
      { name: 'Standard Clean', duration: '2–3 hrs', price: 95, description: 'Kitchen, bathrooms, bedrooms, living areas' },
      { name: 'Commercial Clean', duration: '3–5 hrs', price: 210, description: 'Office and commercial space cleaning' },
    ],
  },
  {
    firstName: 'David',
    lastName: 'Chen',
    title: 'Eco-Friendly Cleaning Expert',
    location: 'Calgary, AB',
    rating: 4.92,
    reviewsCount: 174,
    hourlyRate: 48,
    verified: true,
    elite: true,
    instant: false,
    tags: ['Eco', 'Pet-friendly', 'Deep Clean'],
    completions: 421,
    responseTime: '< 30 min',
    languages: ['English', 'Mandarin'],
    bio: 'All products are non-toxic, eco-certified, and safe for children and pets.',
    aiMatch: 87,
    services: [
      { name: 'Eco Standard Clean', duration: '2–3 hrs', price: 96, description: 'Non-toxic products' },
      { name: 'Eco Deep Clean', duration: '4–6 hrs', price: 190, description: 'Full eco-certified deep clean' },
    ],
  },

  // ── Greater Toronto Area roster ──
  // Written as "<District>, Toronto, ON" because North York, Scarborough and
  // Etobicoke are districts *within* the City of Toronto. That matters
  // mechanically, not just cosmetically: findMatches() filters on
  // `location contains <city>`, so this format keeps them discoverable to a
  // client searching "Toronto" while still showing a recognisable
  // neighbourhood on the card.
  {
    firstName: 'Priya',
    lastName: 'Sharma',
    title: 'Residential Cleaning Professional',
    location: 'Scarborough, Toronto, ON',
    rating: 4.96,
    reviewsCount: 143,
    hourlyRate: 42,
    verified: true,
    elite: true,
    instant: true,
    tags: ['Recurring', 'Standard Clean', 'Condo'],
    completions: 389,
    responseTime: '< 30 min',
    languages: ['English', 'Hindi', 'Punjabi'],
    bio: 'Six years cleaning homes and condos across east Toronto. Most of my clients book me every second week — I learn how you like things done and keep it that way.',
    aiMatch: 95,
    services: [
      { name: 'Standard Clean', duration: '2–3 hrs', price: 88, description: 'Kitchen, bathrooms, bedrooms, living areas' },
      { name: 'Condo Clean', duration: '1.5–2 hrs', price: 72, description: 'Compact one and two-bedroom units' },
      { name: 'Deep Clean', duration: '4–5 hrs', price: 175, description: 'Standard plus appliances, baseboards and cabinet interiors' },
    ],
  },
  {
    firstName: 'Amara',
    lastName: 'Okafor',
    title: 'Deep Clean & Sanitisation Specialist',
    location: 'North York, Toronto, ON',
    rating: 4.89,
    reviewsCount: 96,
    hourlyRate: 46,
    verified: true,
    elite: false,
    instant: true,
    tags: ['Deep Clean', 'Sanitisation', 'Pet-friendly'],
    completions: 214,
    responseTime: '< 1 hr',
    languages: ['English', 'Igbo'],
    bio: 'Hospital-grade sanitisation background. Comfortable in homes with pets, allergies or anyone immunocompromised.',
    aiMatch: 93,
    services: [
      { name: 'Standard Clean', duration: '2–3 hrs', price: 92, description: 'Kitchen, bathrooms, bedrooms, living areas' },
      { name: 'Deep Clean & Sanitise', duration: '4–6 hrs', price: 195, description: 'Deep clean plus full sanitisation of high-touch surfaces' },
    ],
  },
  {
    firstName: 'Sofia',
    lastName: 'Rossi',
    title: 'Post-Renovation & Move-Out Clean',
    location: 'Toronto, ON',
    rating: 4.88,
    reviewsCount: 91,
    hourlyRate: 55,
    verified: true,
    elite: false,
    instant: true,
    tags: ['Post-reno', 'Move-in/out', 'Deep Clean'],
    completions: 176,
    responseTime: '< 2 hr',
    languages: ['English', 'Italian'],
    bio: 'I handle the cleans other people turn down — construction dust, paint splatter, empty units that need to pass a landlord inspection.',
    aiMatch: 88,
    services: [
      { name: 'Post-Renovation Clean', duration: '5–8 hrs', price: 280, description: 'Construction dust, residue and debris removal' },
      { name: 'Move In/Out', duration: '5–7 hrs', price: 235, description: 'Inspection-ready clean inside every cupboard and appliance' },
    ],
  },
  {
    firstName: 'Luc',
    lastName: 'Tremblay',
    title: 'Condo & Apartment Specialist',
    location: 'Etobicoke, Toronto, ON',
    rating: 4.81,
    reviewsCount: 67,
    hourlyRate: 40,
    verified: true,
    elite: false,
    instant: false,
    tags: ['Condo', 'Standard Clean', 'Move-in/out'],
    completions: 158,
    responseTime: '< 3 hr',
    languages: ['English', 'French'],
    bio: 'Condos and apartments are all I do. Bilingual — happy to work in French or English.',
    aiMatch: 84,
    services: [
      { name: 'Condo Clean', duration: '1.5–2 hrs', price: 70, description: 'Studio to two-bedroom units' },
      { name: 'Standard Clean', duration: '2–3 hrs', price: 85, description: 'Kitchen, bathrooms, bedrooms, living areas' },
    ],
  },
  {
    // Deliberately unverified and low-volume: exercises the "pending
    // verification" badge, the verified-first ordering in findMatches(), and
    // the empty state a genuinely new provider sees on their dashboard.
    firstName: 'Daniel',
    lastName: 'Mensah',
    title: 'Office & Small Business Cleaning',
    location: 'Mississauga, ON',
    rating: 4.74,
    reviewsCount: 38,
    hourlyRate: 44,
    verified: false,
    elite: false,
    instant: false,
    tags: ['Office', 'Commercial', 'Evening'],
    completions: 52,
    responseTime: '< 4 hr',
    languages: ['English', 'Twi'],
    bio: 'Evening and weekend cleaning for small offices, clinics and studios around Mississauga.',
    aiMatch: 76,
    services: [
      { name: 'Small Office Clean', duration: '2–3 hrs', price: 110, description: 'Desks, kitchenette, washrooms and common areas' },
      { name: 'Commercial Deep Clean', duration: '4–6 hrs', price: 240, description: 'Quarterly deep clean for commercial premises' },
    ],
  },
];

// ─────────────── Review data ───────────────
//
// `rating` and `reviewsCount` on ProviderProfile are denormalised columns.
// Filling them with invented figures makes a profile announce "143 reviews"
// while the Reviews tab underneath sits empty — a contradiction any client
// sees the moment they click through, and one that reads as a broken site.
//
// So every review below hangs off a real COMPLETED booking, and after seeding
// the headline rating and count are recomputed from the rows that actually
// exist. The numbers are smaller than the placeholders they replace. They are
// also true, which matters more: inflated review counts on a live marketplace
// are a misleading-representation risk under the Competition Act, and worth
// raising with whoever reviews your legal pages.

/** Extra client accounts, so reviews come from a spread of people. */
const CLIENTS = [
  { firstName: 'Nadia', lastName: 'Haddad', city: 'Toronto' },
  { firstName: 'Owen', lastName: 'Fitzgerald', city: 'Toronto' },
  { firstName: 'Mei', lastName: 'Lin', city: 'Scarborough' },
  { firstName: 'Grace', lastName: 'Adeyemi', city: 'North York' },
  { firstName: 'Tomas', lastName: 'Novak', city: 'Etobicoke' },
  { firstName: 'Rachel', lastName: 'Boucher', city: 'Mississauga' },
  { firstName: 'Ibrahim', lastName: 'Farah', city: 'Toronto' },
  { firstName: 'Hannah', lastName: 'Whitfield', city: 'Vancouver' },
  { firstName: 'Colin', lastName: 'Reid', city: 'Calgary' },
];

/** [rating, comment, daysAgo] keyed by provider first name. */
const REVIEWS: Record<string, Array<[number, string, number]>> = {
  Maria: [
    [5, 'Maria has cleaned our place monthly for over a year. I have never once had to point anything out — she just knows.', 12],
    [5, 'Booked a deep clean before my in-laws arrived. The oven looked new. Worth every dollar.', 34],
    [5, 'Punctual, thorough, and genuinely lovely to deal with.', 58],
    [4, 'Great clean overall. Only note is that she arrived about twenty minutes late, though she did message ahead.', 79],
    [5, 'Move-out clean — the landlord returned our full deposit without a word.', 103],
    [5, 'Second time booking her. Consistent, which is the thing I actually care about.', 141],
    [5, 'Very thorough with the bathrooms. The grout looks completely different.', 168],
  ],
  James: [
    [5, 'Cleans our office every Friday evening. Reliable and completely unobtrusive.', 9],
    [5, 'Booked him for a post-party disaster. He did not blink.', 41],
    [4, 'Good work on the commercial space. Would have liked a bit more attention to the windows.', 66],
    [5, 'Professional, and quick to reply to messages.', 95],
    [5, 'He has keys to our unit and we trust him entirely. That says it all.', 132],
  ],
  David: [
    [5, 'The eco products matter to us — two kids and a dog. No harsh smells at all.', 15],
    [5, 'David explained exactly which products he uses and why. Impressed.', 47],
    [5, 'Deep clean with no chemical headache afterwards. Rare.', 72],
    [4, 'Lovely work, though scheduling took a couple of messages to pin down.', 110],
    [5, 'Our cat has allergies and this is the first cleaner who has not set her off.', 155],
  ],
  Priya: [
    [5, 'Every second Tuesday for eight months now. Priya is the reason I stopped cleaning on weekends.', 7],
    [5, 'She remembers that I like the cushions a certain way. Small thing, but it is the difference.', 28],
    [5, 'Condo looked better than the day I moved in.', 52],
    [5, 'Fast, quiet, and she works around me when I am on calls.', 88],
    [4, 'Very good. Missed under the bed the first time, sorted immediately when I mentioned it.', 119],
    [5, 'Booked her for my mother’s place as well. Same standard.', 147],
  ],
  Amara: [
    [5, 'My partner is immunocompromised and Amara took that seriously without me having to explain twice.', 11],
    [5, 'Sanitising clean after we all had the flu. Felt like a different flat.', 38],
    [5, 'Thorough well beyond what I expected at this price.', 63],
    [5, 'Great with our two dogs — did not rush them or leave the gate open.', 97],
    [4, 'Solid deep clean. Ran slightly over the estimate, but she stayed to finish it properly.', 128],
  ],
  Sofia: [
    [5, 'Post-renovation dust everywhere. Sofia got it out of places I had not thought to look.', 19],
    [5, 'Landlord inspection passed first time after her move-out clean.', 44],
    [5, 'She takes the jobs other cleaners quote high on and then cancel.', 81],
    [4, 'Excellent result. Pricier than others, but nobody else would take the job.', 116],
  ],
  Luc: [
    [5, 'Bilingual and easy to deal with. Apartment spotless.', 22],
    [4, 'Good standard clean for the price. Nothing flashy, just done properly.', 55],
    [5, 'Studio done in ninety minutes and it looked immaculate.', 91],
    [5, 'Reliable for a small place. Exactly what I needed.', 134],
  ],
  Daniel: [
    [5, 'Cleans our clinic after hours. No disruption to patients at all.', 16],
    [4, 'Decent job on the office. Still finding his feet on the bigger spaces, but the price is fair.', 49],
    [5, 'Responsive and willing to work late evenings, which nobody else offered.', 87],
  ],
};

async function main() {
  console.log('Seeding…');

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: { slug: 'demo', name: 'Zenex Demo' },
  });

  const passwordHash = await argon2.hash('password123');

  // Demo client
  const demoClient = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'client@zenex.ca' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'client@zenex.ca',
      passwordHash,
      firstName: 'Alexandra',
      lastName: 'Park',
      role: Role.CLIENT,
      clientProfile: { create: { city: 'Toronto' } },
      wallet: { create: {} },
    },
    include: { clientProfile: true },
  });

  // Providers
  for (const [i, p] of PROVIDERS.entries()) {
    const email = `${p.firstName.toLowerCase()}@zenex.ca`;
    await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email } },
      update: {},
      create: {
        tenantId: tenant.id,
        email,
        passwordHash,
        firstName: p.firstName,
        lastName: p.lastName,
        role: Role.PROVIDER,
        wallet: { create: {} },
        providerProfile: {
          create: {
            tenantId: tenant.id,
            title: p.title,
            location: p.location,
            bio: p.bio,
            hourlyRate: p.hourlyRate,
            rating: p.rating,
            reviewsCount: p.reviewsCount,
            completions: p.completions,
            responseTime: p.responseTime,
            languages: p.languages,
            tags: p.tags,
            verified: p.verified,
            elite: p.elite,
            instant: p.instant,
            aiMatch: p.aiMatch,
            services: {
              create: p.services.map((s) => ({
                ...s,
                tenant: { connect: { id: tenant.id } },
              })),
            },
          },
        },
      },
    });
    console.log(`  provider ${i + 1}/${PROVIDERS.length}: ${p.firstName}`);
  }

  // Admin
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@zenex.ca' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@zenex.ca',
      passwordHash,
      firstName: 'Zenex',
      lastName: 'Admin',
      role: Role.ADMIN,
      wallet: { create: {} },
    },
  });

  // ── Reviewer accounts ──
  // Alexandra goes in the pool too, so the demo login has real history on its
  // dashboard rather than an empty state.
  const clientPool: { id: string; city: string }[] = demoClient.clientProfile
    ? [{ id: demoClient.clientProfile.id, city: 'Toronto' }]
    : [];

  for (const c of CLIENTS) {
    const email = `${c.firstName.toLowerCase()}.${c.lastName.toLowerCase()}@example.ca`;
    const u = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email } },
      update: {},
      create: {
        tenantId: tenant.id,
        email,
        passwordHash,
        firstName: c.firstName,
        lastName: c.lastName,
        role: Role.CLIENT,
        clientProfile: { create: { city: c.city } },
        wallet: { create: {} },
      },
      include: { clientProfile: true },
    });
    if (u.clientProfile) clientPool.push({ id: u.clientProfile.id, city: c.city });
  }
  console.log(`  ${clientPool.length} client accounts available as reviewers`);

  // ── Completed bookings + the reviews that hang off them ──
  // References are prefixed BK-S so seeded history is trivially distinguishable
  // from real bookings, and both writes upsert so re-running changes nothing.
  let ref = 9000;
  let reviewsSeeded = 0;

  for (const p of PROVIDERS) {
    const rows = REVIEWS[p.firstName] ?? [];
    if (!rows.length || !clientPool.length) continue;

    // Reviewers should live where the cleaner works. Assigning them
    // round-robin produced a Vancouver client reviewing a Scarborough cleaner
    // on the landing page — obviously fake to anyone reading it.
    const providerLocation = p.location.toLowerCase();
    const local = clientPool.filter((c) =>
      providerLocation.includes(c.city.toLowerCase()),
    );
    const pool = local.length ? local : clientPool;

    const profile = await prisma.providerProfile.findFirst({
      where: {
        tenantId: tenant.id,
        user: { email: `${p.firstName.toLowerCase()}@zenex.ca` },
      },
      include: { services: true },
    });
    if (!profile) continue;

    for (const [rating, comment, daysAgo] of rows) {
      ref += 1;
      const reference = `BK-S${ref}`;
      // Deterministic rotation within the local pool: the same run always
      // produces the same pairing, so screenshots and tests stay stable.
      const clientId = pool[(ref - 9001) % pool.length].id;
      const service = profile.services[0];
      const basePrice = service?.price ?? profile.hourlyRate * 2;
      // Same tax engine the live booking path uses, so seeded totals are
      // consistent with anything created through the API.
      const tax = calculateTax(basePrice, profile.location);

      const scheduledFor = new Date(Date.now() - daysAgo * 86_400_000);
      scheduledFor.setUTCHours(10, 0, 0, 0);

      const booking = await prisma.booking.upsert({
        where: { reference },
        update: {},
        create: {
          reference,
          tenantId: tenant.id,
          clientId,
          providerId: profile.id,
          serviceId: service?.id,
          scheduledFor,
          durationMins: 120,
          timeSlot: '10:00 AM – 12:00 PM',
          status: BookingStatus.COMPLETED,
          basePrice: tax.subtotal,
          taxAmount: tax.taxAmount,
          taxRate: tax.taxRate,
          taxLabel: tax.taxLabel,
          province: tax.province,
          totalPrice: tax.total,
        },
      });

      await prisma.review.upsert({
        where: { bookingId: booking.id },
        update: {},
        create: {
          bookingId: booking.id,
          clientId,
          providerId: profile.id,
          rating,
          comment,
          // Reviews land the day after the job, not the day of the seed.
          createdAt: new Date(scheduledFor.getTime() + 86_400_000),
        },
      });
      reviewsSeeded += 1;
    }

    // Headline figures recomputed from the rows that exist, rather than
    // trusted from the fixture above.
    const agg = await prisma.review.aggregate({
      where: { providerId: profile.id },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.providerProfile.update({
      where: { id: profile.id },
      data: {
        rating: Math.round((agg._avg.rating ?? 0) * 100) / 100,
        reviewsCount: agg._count,
      },
    });
  }
  console.log(
    `  ${reviewsSeeded} reviews on ${reviewsSeeded} completed bookings; ratings recomputed from real rows`,
  );

  // Default weekly availability for every provider: Mon–Sat, 8:00–18:00.
  const allProviders = await prisma.providerProfile.findMany({
    where: { tenantId: tenant.id },
    select: { id: true },
  });
  for (const p of allProviders) {
    const existing = await prisma.availabilityRule.count({
      where: { providerId: p.id },
    });
    if (existing === 0) {
      await prisma.availabilityRule.createMany({
        data: [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
          providerId: p.id,
          dayOfWeek,
          startMinute: 8 * 60,
          endMinute: 18 * 60,
        })),
      });
    }
  }
  console.log(`  availability set for ${allProviders.length} providers`);

  // Instant-quote pricing: price from property size, no browsing required.
  const pricingCount = await prisma.pricingRule.count({
    where: { tenantId: tenant.id },
  });
  if (pricingCount === 0) {
    await prisma.pricingRule.createMany({
      data: [
        {
          tenantId: tenant.id,
          key: 'standard',
          label: 'Standard Clean',
          description:
            'Kitchen, bathrooms, bedrooms and living areas — dusted, vacuumed and wiped down.',
          basePrice: 89,
          perBedroom: 20,
          perBathroom: 25,
          baseMinutes: 120,
          minsPerBedroom: 30,
          minsPerBathroom: 30,
          popular: true,
          sortOrder: 1,
        },
        {
          tenantId: tenant.id,
          key: 'deep',
          label: 'Deep Clean',
          description:
            'Everything in Standard plus appliances, baseboards, window sills and interior cabinets.',
          basePrice: 169,
          perBedroom: 30,
          perBathroom: 35,
          baseMinutes: 240,
          minsPerBedroom: 45,
          minsPerBathroom: 40,
          sortOrder: 2,
        },
        {
          tenantId: tenant.id,
          key: 'move',
          label: 'Move In / Out',
          description:
            'Full property clean for moving transitions — inspection ready, inside everything.',
          basePrice: 209,
          perBedroom: 35,
          perBathroom: 40,
          baseMinutes: 300,
          minsPerBedroom: 45,
          minsPerBathroom: 45,
          sortOrder: 3,
        },
      ],
    });
    console.log('  seeded 3 instant pricing rules');
  }

  // Subscription plans (only if none exist for this tenant yet)
  const planCount = await prisma.subscriptionPlan.count({
    where: { tenantId: tenant.id },
  });
  if (planCount === 0) {
    await prisma.subscriptionPlan.createMany({
      data: [
        {
          tenantId: tenant.id,
          name: 'Starter',
          frequency: 'Monthly',
          price: 129,
          savesPercent: 15,
          features: [
            '1 standard clean/month',
            'Priority booking',
            '10% extras discount',
          ],
        },
        {
          tenantId: tenant.id,
          name: 'Regular',
          frequency: 'Bi-weekly',
          price: 219,
          savesPercent: 20,
          features: [
            '2 standard cleans/month',
            'Priority booking',
            '15% extras discount',
            'Dedicated cleaner',
          ],
          popular: true,
        },
        {
          tenantId: tenant.id,
          name: 'Premium',
          frequency: 'Weekly',
          price: 379,
          savesPercent: 25,
          features: [
            '4 standard cleans/month',
            'Priority booking',
            '20% extras discount',
            'Dedicated cleaner',
            'Same-day guarantee',
          ],
        },
      ],
    });
    console.log('  seeded 3 subscription plans');
  }

  console.log(
    `\nSeed complete — ${PROVIDERS.length} providers on tenant "${tenant.slug}".`,
  );
  console.log('All logins use password123:');
  console.log('  client@zenex.ca   (client)');
  console.log('  admin@zenex.ca    (admin)');
  console.log(
    `  providers:        ${PROVIDERS.map((p) => `${p.firstName.toLowerCase()}@zenex.ca`).join(', ')}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
