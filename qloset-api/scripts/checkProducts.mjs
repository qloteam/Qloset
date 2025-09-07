// scripts/checkProducts.mjs
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  const rows = await prisma.product.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { variants: { take: 3 } },
  });
  console.log({
    count,
    sample: rows.map(p => ({
      id: p.id,
      title: p.title,
      variants: p.variants.length
    }))
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  