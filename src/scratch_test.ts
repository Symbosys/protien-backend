import prisma from "./config/prisma";

async function main() {
  try {
    console.log("Testing database connection...");
    const count = await prisma.category.count();
    console.log("Category count:", count);
    const categories = await prisma.category.findMany({
      include: { subCategories: true }
    });
    console.log("Categories found:", categories);
  } catch (error: any) {
    console.error("Prisma error:", error);
  } finally {
    process.exit();
  }
}

main();
