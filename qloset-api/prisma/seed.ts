import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();

  // Create sample products
  const products = [
    {
      title: 'Floral Summer Dress',
      slug: 'floral-summer-dress',
      description: 'Lightweight cotton floral dress for casual outings.',
      brand: 'Qloset',
      color: 'Floral',
      priceMrp: 1999,
      priceSale: 1499,
      images: ['https://via.placeholder.com/300x400.png?text=Floral+Dress'],
      variants: {
        create: [
          { size: 'S', sku: 'FLORAL-S', stockQty: 5 },
          { size: 'M', sku: 'FLORAL-M', stockQty: 5 },
          { size: 'L', sku: 'FLORAL-L', stockQty: 5 }
        ]
      }
    },
    {
      title: 'Black Cocktail Dress',
      slug: 'black-cocktail-dress',
      description: 'Elegant black dress perfect for evening wear.',
      brand: 'Qloset',
      color: 'Black',
      priceMrp: 2999,
      priceSale: 2599,
      images: ['https://via.placeholder.com/300x400.png?text=Black+Dress'],
      variants: {
        create: [
          { size: 'S', sku: 'BLACK-S', stockQty: 3 },
          { size: 'M', sku: 'BLACK-M', stockQty: 4 },
          { size: 'L', sku: 'BLACK-L', stockQty: 2 }
        ]
      }
    },
    {
      title: 'Casual Shirt Dress',
      slug: 'casual-shirt-dress',
      description: 'Everyday casual shirt dress with a relaxed fit.',
      brand: 'Qloset',
      color: 'Blue',
      priceMrp: 1799,
      priceSale: 1299,
      images: ['https://via.placeholder.com/300x400.png?text=Shirt+Dress'],
      variants: {
        create: [
          { size: 'S', sku: 'SHIRT-S', stockQty: 6 },
          { size: 'M', sku: 'SHIRT-M', stockQty: 6 },
          { size: 'L', sku: 'SHIRT-L', stockQty: 6 }
        ]
      }
    }
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('✅ Seed data inserted.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
