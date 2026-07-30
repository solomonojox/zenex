// Mirrors the Prisma `Role` enum so guards/decorators can reference it
// without importing from @prisma/client everywhere.
export enum Role {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
}
