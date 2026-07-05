/*
  Warnings:

  - You are about to alter the column `subtotal` on the `order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.
  - You are about to alter the column `discount` on the `order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.
  - You are about to alter the column `shippingCharge` on the `order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.
  - You are about to alter the column `tax` on the `order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.
  - You are about to alter the column `totalAmount` on the `order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.
  - You are about to alter the column `unitPrice` on the `orderitem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.
  - You are about to alter the column `totalPrice` on the `orderitem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.
  - You are about to drop the column `brand` on the `product` table. All the data in the column will be lost.
  - You are about to alter the column `discountPrice` on the `product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.
  - You are about to alter the column `price` on the `product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.
  - You are about to alter the column `revenue` on the `product_analytics` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.
  - You are about to alter the column `price` on the `productvariant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.
  - You are about to alter the column `discountPrice` on the `productvariant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.
  - You are about to alter the column `totalSales` on the `store_analytics` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(15,2)`.

*/
-- DropForeignKey
ALTER TABLE `cartitem` DROP FOREIGN KEY `CartItem_productId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_productId_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_subCategoryId_fkey`;

-- AlterTable
ALTER TABLE `category` MODIFY `image` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `order` MODIFY `subtotal` DECIMAL(15, 2) NOT NULL,
    MODIFY `discount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    MODIFY `shippingCharge` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    MODIFY `tax` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    MODIFY `totalAmount` DECIMAL(15, 2) NOT NULL;

-- AlterTable
ALTER TABLE `orderitem` MODIFY `productImage` LONGTEXT NOT NULL,
    MODIFY `unitPrice` DECIMAL(15, 2) NOT NULL,
    MODIFY `totalPrice` DECIMAL(15, 2) NOT NULL;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `brand`,
    ADD COLUMN `brandId` VARCHAR(191) NULL,
    ADD COLUMN `cost` DECIMAL(15, 2) NULL,
    ADD COLUMN `lowStockThreshold` INTEGER NOT NULL DEFAULT 10,
    ADD COLUMN `seoDescription` TEXT NULL,
    ADD COLUMN `seoKeywords` VARCHAR(191) NULL,
    ADD COLUMN `seoTitle` VARCHAR(191) NULL,
    ADD COLUMN `shippingRequired` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `sku` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    ADD COLUMN `taxable` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `weight` DECIMAL(15, 2) NULL,
    ADD COLUMN `weightUnit` VARCHAR(191) NOT NULL DEFAULT 'kg',
    MODIFY `image` LONGTEXT NOT NULL,
    MODIFY `discountPrice` DECIMAL(15, 2) NULL,
    MODIFY `price` DECIMAL(15, 2) NOT NULL;

-- AlterTable
ALTER TABLE `product_analytics` MODIFY `revenue` DECIMAL(15, 2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE `productvariant` MODIFY `price` DECIMAL(15, 2) NOT NULL,
    MODIFY `discountPrice` DECIMAL(15, 2) NULL,
    MODIFY `image` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `store_analytics` MODIFY `totalSales` DECIMAL(15, 2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE `subcategory` MODIFY `image` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `password` VARCHAR(191) NULL,
    ADD COLUMN `role` ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    MODIFY `phoneNumber` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `brands` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `logo` LONGTEXT NULL,
    `website` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `brands_name_key`(`name`),
    UNIQUE INDEX `brands_slug_key`(`slug`),
    INDEX `brands_slug_idx`(`slug`),
    INDEX `brands_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventories` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `lowStockAlert` INTEGER NOT NULL DEFAULT 10,
    `warehouseLoc` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `inventories_productId_key`(`productId`),
    INDEX `inventories_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupons` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `discountType` ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    `discountValue` DECIMAL(15, 2) NOT NULL,
    `minOrderAmount` DECIMAL(15, 2) NULL,
    `maxDiscount` DECIMAL(15, 2) NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `usageLimit` INTEGER NULL,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `coupons_code_key`(`code`),
    INDEX `coupons_code_idx`(`code`),
    INDEX `coupons_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `banners` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `imageUrl` LONGTEXT NOT NULL,
    `linkUrl` VARCHAR(191) NULL,
    `position` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `banners_isActive_idx`(`isActive`),
    INDEX `banners_position_idx`(`position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `chat_sessions_userId_idx`(`userId`),
    INDEX `chat_sessions_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_messages` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `sender` ENUM('USER', 'AGENT', 'SYSTEM') NOT NULL,
    `text` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `chat_messages_sessionId_idx`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NOT NULL,
    `reply` TEXT NULL,
    `status` ENUM('REPLIED', 'UNREPLIED') NOT NULL DEFAULT 'UNREPLIED',
    `userId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Review_productId_idx`(`productId`),
    INDEX `Review_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Offer` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `offerType` ENUM('FLAT_DISCOUNT', 'PERCENTAGE_DISCOUNT', 'MAKING_CHARGE_DISCOUNT', 'FREE_GIFT', 'CASHBACK', 'EXCHANGE', 'FESTIVAL', 'BUY_ONE_GET_ONE_FREE', 'GOLD_SAVINGS', 'LOYALTY_REWARD') NOT NULL,
    `discountValue` DECIMAL(15, 2) NULL,
    `minPurchase` DECIMAL(15, 2) NULL,
    `giftDescription` VARCHAR(191) NULL,
    `cashbackDetails` VARCHAR(191) NULL,
    `exchangeDetails` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_OfferToProduct` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_OfferToProduct_AB_unique`(`A`, `B`),
    INDEX `_OfferToProduct_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Product_brandId_idx` ON `Product`(`brandId`);

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `SubCategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventories` ADD CONSTRAINT `inventories_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_sessions` ADD CONSTRAINT `chat_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `chat_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OfferToProduct` ADD CONSTRAINT `_OfferToProduct_A_fkey` FOREIGN KEY (`A`) REFERENCES `Offer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OfferToProduct` ADD CONSTRAINT `_OfferToProduct_B_fkey` FOREIGN KEY (`B`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
