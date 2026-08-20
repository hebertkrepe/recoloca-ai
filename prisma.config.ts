import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'

// Carrega .env.local primeiro (Next.js), depois .env
config({ path: '.env.local' })
config({ path: '.env' })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
