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
