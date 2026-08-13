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
    // ZeptoMail (Zoho) send-mail token, from Agents > SMTP/API > Send Mail Token.
    // Absent means log mode: emails are written to the server log, not sent.
    //
    // ZEPTO_API_TOKEN / ZEPTO_API_KEY are accepted as aliases because that is
    // how Zoho's own setup screen labels them, and having the deploy fail over
    // a variable name is a waste of everyone's afternoon. MailService strips a
    // leading "Zoho-enczapikey " if the value was copied with the prefix.
    token:
      process.env.ZEPTOMAIL_TOKEN ||
      process.env.ZEPTO_API_TOKEN ||
      process.env.ZEPTO_API_KEY ||
      '',
    // Regional endpoint. Use api.zeptomail.eu or api.zeptomail.in if the Zoho
    // account was created in the EU or India data centre — sending to the wrong
    // region fails authentication with a token that is otherwise valid.
    apiUrl:
      process.env.ZEPTOMAIL_API_URL || 'https://api.zeptomail.com/v1.1/email',
    // Either "no-reply@zenex.ca" or "Zenex <no-reply@zenex.ca>". The domain
    // must be verified in the ZeptoMail agent or every send is rejected.
    from: process.env.MAIL_FROM || process.env.ZEPTO_SENDER_EMAIL || '',
    fromName: process.env.MAIL_FROM_NAME || 'Zenex',
    // Where replies land. Worth setting: no-reply addresses that bounce are a
    // deliverability signal, and clients do reply to booking emails.
    replyTo: process.env.MAIL_REPLY_TO || '',
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
