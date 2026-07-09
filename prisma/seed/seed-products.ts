import prisma from "../../src/config/prisma.js";

const categoriesData = [
  { name: 'Creatine', image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600' },
  { name: 'Whey Protein', image: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=600' },
  { name: 'Whey Protein Isolate', image: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=600' },
  { name: 'Glutathione', image: 'https://images.unsplash.com/photo-1584308666744-24d5e4a5d8e7?w=600' },
  { name: 'Collagen', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600' },
  { name: 'Fish Oil', image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=600' },
  { name: 'ZMA', image: 'https://images.unsplash.com/photo-1505576399279-0d06b2000e39?w=600' },
  { name: 'L-Carnitine', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600' },
  { name: 'Multivitamins', image: 'https://images.unsplash.com/photo-1584308666744-24d5e4a5d8e7?w=600' },
  { name: 'Peanut Butter', image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600' },
  { name: 'High Protein Oats/Muesli', image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=600' },
  { name: 'Joint Support', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600' },
  { name: 'BCAA', image: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=600' },
  { name: 'L-Arginine', image: 'https://images.unsplash.com/photo-1505576399279-0d06b2000e39?w=600' },
  { name: 'Pre Workout', image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=600' },
];

const brandsData = [
  'Optimum Nutrition',
  'Muscletech',
  'Muscle Blaze',
  'Pintola',
  'Wellversed',
  'HK Vitals',
  'Avvatar',
];

const productsData = [
  {
    id: '1',
    name: '100% Gold Standard Whey',
    price: 3499,
    originalPrice: 4200,
    description: 'Premium whey protein isolate loaded with 24g of protein per serving to help build muscle and recover faster after workouts.',
    images: [
      'https://images.unsplash.com/photo-1579722820308-d74e571900a9?w=800',
    ],
    category: 'Whey Protein',
    brand: 'Optimum Nutrition',
    rating: 4.9,
    reviews: 128,
    sizes: ['2 lbs', '5 lbs', '10 lbs'],
    colors: [
      { name: 'Double Rich Chocolate', hex: '#3B2F2F' },
      { name: 'Vanilla Ice Cream', hex: '#F3E5AB' },
    ],
    tags: ['protein', 'whey', 'muscle', 'recovery'],
    inStock: true,
    isNew: true,
    netWeight: '5 lbs',
  },
  {
    id: '2',
    name: 'Creatine Monohydrate',
    price: 999,
    originalPrice: 1299,
    description: 'Pure micronized creatine monohydrate to increase strength, power, and muscle mass during high-intensity training.',
    images: [
      'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800',
    ],
    category: 'Creatine',
    brand: 'Muscletech',
    rating: 4.8,
    reviews: 212,
    sizes: ['300g', '500g'],
    colors: [
      { name: 'Unflavored', hex: '#FFFFFF' },
    ],
    tags: ['creatine', 'strength', 'power'],
    inStock: true,
    netWeight: '300g',
  },
  {
    id: '3',
    name: 'C4 Explosive Pre-Workout',
    price: 2499,
    originalPrice: 2999,
    description: 'Advanced pre-workout formula engineered for explosive energy, laser focus, and skin-tearing pumps.',
    images: [
      'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800',
    ],
    category: 'Pre Workout',
    brand: 'Muscle Blaze',
    rating: 4.7,
    reviews: 89,
    sizes: ['30 Servings', '60 Servings'],
    colors: [
      { name: 'Fruit Punch', hex: '#FF0033' },
      { name: 'Blue Raspberry', hex: '#0066FF' },
    ],
    tags: ['pre-workout', 'energy', 'pump'],
    inStock: true,
    isSale: true,
    netWeight: '390g',
  },
  {
    id: '4',
    name: 'Essential Amino Acids (EAA)',
    price: 1899,
    description: 'Comprehensive blend of all 9 essential amino acids to support muscle protein synthesis and prevent catabolism.',
    images: [
      'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800',
    ],
    category: 'BCAA',
    brand: 'Optimum Nutrition',
    rating: 5.0,
    reviews: 44,
    sizes: ['30 Servings'],
    colors: [
      { name: 'Watermelon', hex: '#FC6C85' },
    ],
    tags: ['eaa', 'amino acids', 'recovery'],
    inStock: true,
    isNew: true,
    netWeight: '450g',
  },
  {
    id: '5',
    name: 'Serious Mass Gainer',
    price: 4500,
    originalPrice: 5200,
    description: 'High-calorie mass gainer packed with 50g protein and 1,250 calories per serving to help hardgainers bulk up quickly.',
    images: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    ],
    category: 'Whey Protein',
    brand: 'Avvatar',
    rating: 4.6,
    reviews: 156,
    sizes: ['6 lbs', '12 lbs'],
    colors: [
      { name: 'Chocolate', hex: '#3B2F2F' },
    ],
    tags: ['gainer', 'mass', 'calories'],
    inStock: true,
    isSale: true,
    netWeight: '12 lbs',
  },
  {
    id: '6',
    name: 'Opti-Men Multivitamin',
    price: 1599,
    description: 'Comprehensive daily multivitamin specifically formulated for active men to support immune health and cellular energy.',
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5e4a5d8e7?w=800',
    ],
    category: 'Multivitamins',
    brand: 'HK Vitals',
    rating: 4.9,
    reviews: 320,
    sizes: ['90 Tablets', '150 Tablets'],
    colors: [
      { name: 'Standard', hex: '#FFCC00' },
    ],
    tags: ['vitamins', 'health', 'immunity'],
    inStock: true,
    netWeight: '100g',
  },
  {
    id: '7',
    name: 'All Natural Peanut Butter',
    price: 599,
    originalPrice: 799,
    description: 'High-protein crunchy peanut butter with no added sugar, preservatives or hydrogenated oils.',
    images: [
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800',
    ],
    category: 'Peanut Butter',
    brand: 'Pintola',
    rating: 4.7,
    reviews: 540,
    sizes: ['400g', '1kg'],
    colors: [
      { name: 'Crunchy', hex: '#C4922A' },
      { name: 'Smooth', hex: '#D4A84B' },
    ],
    tags: ['peanut butter', 'protein', 'snacks'],
    inStock: true,
    netWeight: '1kg',
  },
  {
    id: '8',
    name: 'Dynamite Pre-Workout',
    price: 1299,
    originalPrice: 1599,
    description: 'Explosive pre-workout formula with beta-alanine, caffeine and citrulline for unmatched gym performance.',
    images: [
      'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800',
    ],
    category: 'Pre Workout',
    brand: 'Wellversed',
    rating: 4.5,
    reviews: 78,
    sizes: ['420g'],
    colors: [
      { name: 'Original', hex: '#FF4500' },
    ],
    tags: ['pre-workout', 'energy', 'focus'],
    inStock: true,
    isNew: true,
    netWeight: '420g',
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function main() {
  console.log('Seeding mock categories, brands, and products...');

  // 1. Seed Categories
  const categoryMap = new Map<string, string>(); // name -> id
  for (const cat of categoriesData) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name },
    });
    if (existing) {
      categoryMap.set(cat.name, existing.id);
    } else {
      const created = await prisma.category.create({
        data: {
          name: cat.name,
          image: cat.image,
          slug: slugify(cat.name),
        },
      });
      categoryMap.set(cat.name, created.id);
    }
  }

  // 2. Seed Brands
  const brandMap = new Map<string, string>(); // name -> id
  for (const bName of brandsData) {
    const existing = await prisma.brand.findUnique({
      where: { name: bName },
    });
    if (existing) {
      brandMap.set(bName, existing.id);
    } else {
      const created = await prisma.brand.create({
        data: {
          name: bName,
          slug: slugify(bName),
          isActive: true,
        },
      });
      brandMap.set(bName, created.id);
    }
  }

  // 3. Seed Products
  for (const p of productsData) {
    const categoryId = categoryMap.get(p.category);
    if (!categoryId) {
      console.warn(`Category not found for product ${p.name}: ${p.category}`);
      continue;
    }
    const brandId = p.brand ? brandMap.get(p.brand) : null;

    const existingProduct = await prisma.product.findUnique({
      where: { id: p.id },
    });

    if (existingProduct) {
      console.log(`Product "${p.name}" (ID: ${p.id}) already exists. Updating...`);
      await prisma.product.update({
        where: { id: p.id },
        data: {
          name: p.name,
          price: p.price,
          discountPrice: p.originalPrice || null, // map originalPrice to discountPrice if applicable
          description: p.description,
          image: p.images[0] || '',
          images: p.images,
          sizes: p.sizes,
          colors: p.colors,
          categoryId,
          brandId,
          quantity: 50,
          rating: p.rating,
          numReviews: p.reviews,
        },
      });
    } else {
      console.log(`Creating product "${p.name}" (ID: ${p.id})...`);
      await prisma.product.create({
        data: {
          id: p.id,
          name: p.name,
          price: p.price,
          discountPrice: p.originalPrice || null,
          description: p.description,
          image: p.images[0] || '',
          images: p.images,
          sizes: p.sizes,
          colors: p.colors,
          categoryId,
          brandId,
          quantity: 50,
          rating: p.rating,
          numReviews: p.reviews,
        },
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
