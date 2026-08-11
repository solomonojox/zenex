export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim()),

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  tenancy: {
    header: (process.env.TENANT_HEADER || 'x-tenant').toLowerCase(),
    defaultTenant: process.env.DEFAULT_TENANT || 'demo',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    platformFeePercent: parseInt(
      process.env.STRIPE_PLATFORM_FEE_PERCENT || '15',
      10,
    ),
  },

  booking: {
    // Cancellations made at least this many hours ahead are refunded in full.
    freeCancelHours: parseInt(process.env.FREE_CANCEL_HOURS || '24', 10),
    // Percentage refunded for late cancellations (0–100).
    lateCancelRefundPercent: parseInt(
      process.env.LATE_CANCEL_REFUND_PERCENT || '50',
      10,
    ),
  },

  // APP_URL is the public address of the frontend — used for email links and
  // Stripe redirects. Must be set in production.
  appUrl: process.env.APP_URL || 'http://localhost:3000',

  mail: {
    apiKey: process.env.RESEND_API_KEY || '',
    from: process.env.MAIL_FROM || 'Zenex <onboarding@resend.dev>',
    appUrl: process.env.APP_URL || 'http://localhost:3000',
  },

  supabase: {
    url: process.env.SUPABASE_URL || '',
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || '',
    secretKey: process.env.SUPABASE_SECRET_KEY || '',
    jwksUrl: process.env.SUPABASE_JWKS_URL || '',
  },

  storage: {
    bucket: process.env.STORAGE_BUCKET || '',
    region: process.env.STORAGE_REGION || 'us-east-1',
    accessKey: process.env.STORAGE_ACCESS_KEY || '',
    secretKey: process.env.STORAGE_SECRET_KEY || '',
    endpoint: process.env.STORAGE_ENDPOINT || '',
  },
});
