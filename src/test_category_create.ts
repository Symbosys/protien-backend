import prisma from "./config/prisma";

async function main() {
  try {
    console.log("Attempting to insert test category...");
    const category = await prisma.category.create({
      data: {
        name: "Test Category " + Date.now(),
        slug: "test-category-" + Date.now(),
      }
    });
    console.log("Successfully created category:", category);
  } catch (error: any) {
    console.error("Prisma Error during create:", error);
  } finally {
    process.exit();
  }
}

main();
