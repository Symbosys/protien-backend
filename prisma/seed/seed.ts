import prisma from "../../src/config/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");

  const adminEmail = "admin@symbosys.com";
  const adminPassword = "AdminPassword@123";
  const adminPhone = "+1234567890";

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: adminEmail },
        { phoneNumber: adminPhone }
      ]
    }
  });

  if (existingAdmin) {
    console.log(`Admin user already exists with ID: ${existingAdmin.id}. Ensuring role is ADMIN...`);
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        role: "ADMIN"
      }
    });
    console.log("Admin role updated/verified successfully.");
  } else {
    console.log("Creating new admin user...");
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
      data: {
        firstName: "System",
        lastName: "Admin",
        email: adminEmail,
        phoneNumber: adminPhone,
        password: hashedPassword,
        role: "ADMIN",
        gender: "MALE"
      }
    });

    console.log("Admin user created successfully!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
