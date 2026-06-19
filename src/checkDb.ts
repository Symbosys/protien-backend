import prisma from "./config/prisma.js";

async function main() {
  const categories = await prisma.category.findMany({
    include: { subCategories: true }
  });
  const attributes = await prisma.attribute.findMany({
    include: { values: true }
  });
  console.log("=== CATEGORIES ===");
  console.log(JSON.stringify(categories, null, 2));
  console.log("=== ATTRIBUTES ===");
  console.log(JSON.stringify(attributes, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
