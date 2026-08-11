/**
 * Seed script — ports the frontend mock data (lib/data.ts) into the DB
 * so the API returns realistic data from day one.
 *
 * Run with: npm run prisma:seed
 */
import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

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
];

async function main() {
  console.log('Seeding…');

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: { slug: 'demo', name: 'Zenex Demo' },
  });

  const passwordHash = await argon2.hash('password123');

  // Demo client
  await prisma.user.upsert({
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

  console.log('Seed complete. Logins (password123): client@zenex.ca, maria@zenex.ca, admin@zenex.ca');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
