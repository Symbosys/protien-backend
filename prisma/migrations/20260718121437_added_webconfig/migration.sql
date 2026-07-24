/*
  Warnings:

  - You are about to alter the column `paymentMethod` on the `order` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(4))`.

*/
-- AlterTable
ALTER TABLE `order` MODIFY `paymentMethod` ENUM('COD', 'CARD') NULL;

-- CreateTable
CREATE TABLE `blogs` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `excerpt` TEXT NULL,
    `image` LONGTEXT NULL,
    `author` VARCHAR(191) NOT NULL DEFAULT 'Admin',
    `tags` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `viewsCount` INTEGER NOT NULL DEFAULT 0,
    `readTime` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blogs_slug_key`(`slug`),
    INDEX `blogs_slug_idx`(`slug`),
    INDEX `blogs_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `web_configs` (
    `id` VARCHAR(191) NOT NULL,
    `storeName` VARCHAR(191) NOT NULL DEFAULT 'Vendor Store',
    `businessEmail` VARCHAR(191) NOT NULL DEFAULT 'vendor@store.com',
    `phoneNumber` VARCHAR(191) NOT NULL DEFAULT '+1 234 567 890',
    `website` VARCHAR(191) NULL,
    `storeDescription` TEXT NULL,
    `logo` LONGTEXT NULL,
    `bankName` VARCHAR(191) NULL,
    `accountHolderName` VARCHAR(191) NULL,
    `accountNumber` VARCHAR(191) NULL,
    `routingNumber` VARCHAR(191) NULL,
    `gstNumber` VARCHAR(191) NULL,
    `panNumber` VARCHAR(191) NULL,
    `registeredBusinessName` VARCHAR(191) NULL,
    `pickupAddresses` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
