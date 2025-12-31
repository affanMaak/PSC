-- AlterTable
ALTER TABLE `lawn` ADD COLUMN `isReserved` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `photoshoot` ADD COLUMN `isReserved` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `LawnReservation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lawnId` INTEGER NOT NULL,
    `reservedFrom` DATETIME(3) NOT NULL,
    `reservedTo` DATETIME(3) NOT NULL,
    `timeSlot` VARCHAR(20) NOT NULL DEFAULT 'MORNING',
    `reservedBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LawnReservation_lawnId_idx`(`lawnId`),
    INDEX `LawnReservation_reservedFrom_reservedTo_idx`(`reservedFrom`, `reservedTo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PhotoshootReservation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `photoshootId` INTEGER NOT NULL,
    `reservedFrom` DATETIME(3) NOT NULL,
    `reservedTo` DATETIME(3) NOT NULL,
    `timeSlot` VARCHAR(20) NOT NULL DEFAULT 'MORNING',
    `reservedBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PhotoshootReservation_photoshootId_idx`(`photoshootId`),
    INDEX `PhotoshootReservation_reservedFrom_reservedTo_idx`(`reservedFrom`, `reservedTo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LawnReservation` ADD CONSTRAINT `LawnReservation_lawnId_fkey` FOREIGN KEY (`lawnId`) REFERENCES `Lawn`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LawnReservation` ADD CONSTRAINT `LawnReservation_reservedBy_fkey` FOREIGN KEY (`reservedBy`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PhotoshootReservation` ADD CONSTRAINT `PhotoshootReservation_photoshootId_fkey` FOREIGN KEY (`photoshootId`) REFERENCES `Photoshoot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PhotoshootReservation` ADD CONSTRAINT `PhotoshootReservation_reservedBy_fkey` FOREIGN KEY (`reservedBy`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
