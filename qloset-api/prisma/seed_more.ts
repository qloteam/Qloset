import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const more = [
  { title: 'Wrap Midi Dress', slug: 'wrap-midi-dress', color: 'Red', mrp: 2299, sale: 1799, img: 'https://via.placeholder.com/300x400.png?text=Wrap+Midi' },
  { title: 'Satin Slip Dress', slug: 'satin-slip-dress', color: 'Champagne', mrp: 2799, sale: 2399, img: 'https://via.placeholder.com/300x400.png?text=Satin+Slip' },
  { title: 'Anarkali Kurta Dress', slug: 'anarkali-kurta-dress', color: 'Teal', mrp: 2499, sale: 1999, img: 'https://via.placeholder.com/300x400.png?text=Anarkali' },
  { title: 'Denim Shirt Dress', slug: 'denim-shirt-dress', color: 'Blue', mrp: 1999, sale: 1599, img: 'https://via.placeholder.com/300x400.png?text=Denim+Shirt' },
  { title: 'Sequin Party Dress', slug: 'sequin-party-dress', color: 'Gold', mrp: 3499, sale: 2999, img: 'https://via.placeholder.com/300x400.png?text=Sequin+Party' },
  { title: 'Linen Summer Dress', slug: 'linen-summer-dress', color: 'Beige', mrp: 2199, sale: 1699, img: 'https://via.placeholder.com/300x400.png?text=Linen+Summer' },
  { title: 'Pleated Skater Dress', slug: 'pleated-skater-dress', color: 'Pink', mrp: 2399, sale: 1899, img: 'https://via.placeholder.com/300x400.png?text=Pleated+Skater' },
  { title: 'Velvet Bodycon Dress', slug: 'velvet-bodycon-dress', color: 'Maroon', mrp: 3199, sale: 2699, img: 'https://via.placeholder.com/300x400.png?text=Velvet+Bodycon' },
  { title: 'A-Line Evening Gown', slug: 'a-line-evening-gown', color: 'Navy', mrp: 3999, sale: 3399, img: 'https://via.placeholder.com/300x400.png?text=A-Line+Gown' },
  { title: 'Cotton Fit & Flare Dress', slug: 'cotton-fit-and-flare-dress', color: 'Yellow', mrp: 1899, sale: 1499, img: 'https://via.placeholder.com/300x400.png?text=Fit+%26+Flare' }
];

async function upsertProduct(p:{title:string;slug:string;color:string;mrp:number;sale:number;img:string}) {
  const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
  if (existing) return;
  await prisma.product.create({
    data: {
      title: p.title,
      slug: p.slug,
      description: `${p.title} from Qloset.`,
      brand: 'Qloset',
      color: p.color,
      priceMrp: p.mrp,
      priceSale: p.sale,
      images: [p.img],
      variants: { create: [
        { size: 'S', sku: `${p.slug}-S`, stockQty: 5 },
        { size: 'M', sku: `${p.slug}-M`, stockQty: 6 },
        { size: 'L', sku: `${p.slug}-L`, stockQty: 4 },
        { size: 'XL', sku: `${p.slug}-XL`, stockQty: 3 },
      ] }
    }
  });
}

async function main() {
  for (const p of more) await upsertProduct(p);
  console.log('✅ Added more demo products (append).');
}

main().finally(() => prisma.$disconnect());
