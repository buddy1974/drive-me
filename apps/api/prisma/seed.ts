import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('ChangeMe2025!', 12)

  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@drive-me.cm' },
    update: {},
    create: {
      email: 'admin@drive-me.cm',
      passwordHash,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  })

  console.log(`AdminUser seeded: ${admin.email} (${admin.role}) — id: ${admin.id}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
