-- AlterTable
ALTER TABLE `user` MODIFY `firstName` VARCHAR(191) NULL,
    MODIFY `lastName` VARCHAR(191) NULL,
    MODIFY `dateOfBirth` DATETIME(3) NULL,
    MODIFY `gender` ENUM('FEMALE', 'MALE', 'OTHER') NULL;

-- CreateTable
CREATE TABLE `otps` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `otp` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `lastAttemptedAt` DATETIME(3) NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `otps_phoneNumber_key`(`phoneNumber`),
    INDEX `otps_phoneNumber_idx`(`phoneNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `size` VARCHAR(191) NOT NULL,
    `colour` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `quantiity` VARCHAR(191) NOT NULL,
    `rating` VARCHAR(191) NOT NULL,
    `wishlist` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
