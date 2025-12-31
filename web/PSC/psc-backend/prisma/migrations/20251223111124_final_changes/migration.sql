-- AlterTable
ALTER TABLE `admin` ADD COLUMN `permissions` JSON NULL;

-- AlterTable
ALTER TABLE `member` ADD COLUMN `bookingAmountDue` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `bookingAmountPaid` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `bookingBalance` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `crAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN `drAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN `lastBookingDate` DATETIME(3) NULL,
    ADD COLUMN `totalBookings` INTEGER NOT NULL DEFAULT 0,
    MODIFY `Balance` DECIMAL(20, 2) NULL DEFAULT 0.00;

-- CreateTable
CREATE TABLE `RoomBooking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `Membership_No` VARCHAR(191) NOT NULL,
    `roomId` INTEGER NOT NULL,
    `checkIn` DATETIME(3) NOT NULL,
    `checkOut` DATETIME(3) NOT NULL,
    `totalPrice` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `paymentStatus` ENUM('UNPAID', 'HALF_PAID', 'PAID', 'TO_BILL') NOT NULL DEFAULT 'UNPAID',
    `pricingType` VARCHAR(191) NOT NULL,
    `paidAmount` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `pendingAmount` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `numberOfAdults` INTEGER NOT NULL DEFAULT 1,
    `numberOfChildren` INTEGER NOT NULL DEFAULT 0,
    `guestName` TEXT NULL,
    `guestContact` TEXT NULL,
    `paidBy` ENUM('MEMBER', 'GUEST') NOT NULL DEFAULT 'MEMBER',
    `specialRequests` TEXT NULL,
    `remarks` TEXT NULL,
    `refundAmount` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `refundReturned` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HallBooking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `hallId` INTEGER NOT NULL,
    `bookingDate` DATETIME(3) NOT NULL,
    `totalPrice` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `paymentStatus` ENUM('UNPAID', 'HALF_PAID', 'PAID', 'TO_BILL') NOT NULL DEFAULT 'UNPAID',
    `pricingType` VARCHAR(191) NOT NULL,
    `paidAmount` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `pendingAmount` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `eventType` VARCHAR(255) NOT NULL,
    `numberOfGuests` INTEGER NOT NULL DEFAULT 0,
    `bookingTime` ENUM('MORNING', 'EVENING', 'NIGHT') NOT NULL DEFAULT 'NIGHT',
    `guestName` TEXT NULL,
    `guestContact` TEXT NULL,
    `paidBy` ENUM('MEMBER', 'GUEST') NOT NULL DEFAULT 'MEMBER',
    `remarks` TEXT NULL,
    `refundAmount` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `refundReturned` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LawnBooking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `lawnId` INTEGER NOT NULL,
    `bookingDate` DATETIME(3) NOT NULL,
    `eventType` VARCHAR(255) NULL,
    `bookingTime` ENUM('MORNING', 'EVENING', 'NIGHT') NOT NULL DEFAULT 'NIGHT',
    `guestsCount` INTEGER NOT NULL,
    `totalPrice` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `paymentStatus` ENUM('UNPAID', 'HALF_PAID', 'PAID', 'TO_BILL') NOT NULL DEFAULT 'UNPAID',
    `pricingType` VARCHAR(191) NOT NULL,
    `paidAmount` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `pendingAmount` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `guestName` TEXT NULL,
    `guestContact` TEXT NULL,
    `paidBy` ENUM('MEMBER', 'GUEST') NOT NULL DEFAULT 'MEMBER',
    `refundAmount` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `refundReturned` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PhotoshootBooking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `photoshootId` INTEGER NOT NULL,
    `bookingDate` DATETIME(3) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `totalPrice` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `paymentStatus` ENUM('UNPAID', 'HALF_PAID', 'PAID', 'TO_BILL') NOT NULL DEFAULT 'UNPAID',
    `pricingType` VARCHAR(191) NOT NULL,
    `paidAmount` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `pendingAmount` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `guestName` TEXT NULL,
    `guestContact` TEXT NULL,
    `paidBy` ENUM('MEMBER', 'GUEST') NOT NULL DEFAULT 'MEMBER',
    `refundAmount` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `refundReturned` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SportSubscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `sportId` INTEGER NOT NULL,
    `chargeType` ENUM('PER_DAY', 'PER_MONTH', 'PER_GAME', 'PER_HOUR') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `totalPaid` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentVoucher` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `voucher_no` VARCHAR(191) NOT NULL,
    `booking_type` ENUM('ROOM', 'HALL', 'LAWN', 'PHOTOSHOOT') NOT NULL,
    `booking_id` INTEGER NOT NULL,
    `membership_no` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `payment_mode` ENUM('CASH', 'ONLINE') NOT NULL DEFAULT 'CASH',
    `channel` ENUM('ADMIN_PORTAL', 'KUICKPAY') NULL,
    `invoice_no` VARCHAR(191) NULL,
    `transaction_id` VARCHAR(191) NULL,
    `consumer_id` VARCHAR(191) NULL,
    `gateway_meta` JSON NULL,
    `remarks` VARCHAR(191) NULL,
    `voucher_type` ENUM('FULL_PAYMENT', 'HALF_PAYMENT', 'REFUND', 'ADJUSTMENT') NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `issued_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `issued_by` VARCHAR(191) NULL,

    UNIQUE INDEX `PaymentVoucher_voucher_no_key`(`voucher_no`),
    INDEX `PaymentVoucher_booking_type_booking_id_idx`(`booking_type`, `booking_id`),
    INDEX `PaymentVoucher_membership_no_idx`(`membership_no`),
    INDEX `PaymentVoucher_voucher_no_idx`(`voucher_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoomType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(50) NOT NULL,
    `priceMember` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `priceGuest` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `images` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RoomType_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoomReservation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `reservedFrom` DATETIME(3) NOT NULL,
    `reservedTo` DATETIME(3) NOT NULL,
    `reservedBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RoomReservation_roomId_idx`(`roomId`),
    INDEX `RoomReservation_reservedFrom_reservedTo_idx`(`reservedFrom`, `reservedTo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Room` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomNumber` VARCHAR(50) NOT NULL,
    `roomTypeId` INTEGER NOT NULL,
    `description` VARCHAR(300) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isReserved` BOOLEAN NOT NULL DEFAULT false,
    `isBooked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Room_id_key`(`id`),
    UNIQUE INDEX `Room_roomNumber_key`(`roomNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roomHoldings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `onHold` BOOLEAN NOT NULL DEFAULT false,
    `holdExpiry` DATETIME(3) NULL,
    `holdBy` VARCHAR(191) NULL,
    `roomId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roomHoldings_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoomOutOfOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `reason` VARCHAR(300) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RoomOutOfOrder_id_key`(`id`),
    INDEX `RoomOutOfOrder_roomId_idx`(`roomId`),
    INDEX `RoomOutOfOrder_startDate_idx`(`startDate`),
    INDEX `RoomOutOfOrder_endDate_idx`(`endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Hall` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `capacity` INTEGER NOT NULL,
    `chargesMembers` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `chargesGuests` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `images` JSON NOT NULL,
    `isBooked` BOOLEAN NOT NULL DEFAULT false,
    `isReserved` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Hall_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hallHoldings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `onHold` BOOLEAN NOT NULL DEFAULT false,
    `holdExpiry` DATETIME(3) NULL,
    `holdBy` VARCHAR(191) NULL,
    `hallId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hallHoldings_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HallOutOfOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hallId` INTEGER NOT NULL,
    `reason` VARCHAR(300) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `HallOutOfOrder_id_key`(`id`),
    INDEX `HallOutOfOrder_hallId_idx`(`hallId`),
    INDEX `HallOutOfOrder_startDate_idx`(`startDate`),
    INDEX `HallOutOfOrder_endDate_idx`(`endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HallReservation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hallId` INTEGER NOT NULL,
    `reservedFrom` DATETIME(3) NOT NULL,
    `reservedTo` DATETIME(3) NOT NULL,
    `reservedBy` INTEGER NOT NULL,
    `timeSlot` VARCHAR(20) NOT NULL DEFAULT 'MORNING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `HallReservation_hallId_idx`(`hallId`),
    INDEX `HallReservation_reservedFrom_reservedTo_idx`(`reservedFrom`, `reservedTo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LawnOutOfOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lawnId` INTEGER NOT NULL,
    `reason` VARCHAR(300) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LawnOutOfOrder_id_key`(`id`),
    INDEX `LawnOutOfOrder_lawnId_idx`(`lawnId`),
    INDEX `LawnOutOfOrder_startDate_idx`(`startDate`),
    INDEX `LawnOutOfOrder_endDate_idx`(`endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lawn` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(200) NOT NULL,
    `lawnCategoryId` INTEGER NOT NULL,
    `minGuests` INTEGER NULL DEFAULT 0,
    `maxGuests` INTEGER NOT NULL DEFAULT 0,
    `memberCharges` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `guestCharges` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isBooked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lawnHoldings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `onHold` BOOLEAN NOT NULL DEFAULT false,
    `holdExpiry` DATETIME(3) NULL,
    `holdBy` VARCHAR(191) NULL,
    `lawnId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lawnHoldings_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LawnCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` VARCHAR(200) NOT NULL,
    `images` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LawnCategory_id_key`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Photoshoot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(200) NOT NULL,
    `memberCharges` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `guestCharges` DECIMAL(30, 2) NOT NULL DEFAULT 0.00,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isBooked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Photoshoot_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `activity` VARCHAR(100) NOT NULL,
    `description` VARCHAR(300) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Sport_id_key`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SportCharge` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `activityId` INTEGER NOT NULL,
    `chargeType` ENUM('PER_DAY', 'PER_MONTH', 'PER_GAME', 'PER_HOUR') NOT NULL,
    `memberCharges` DECIMAL(30, 2) NULL DEFAULT 0.00,
    `spouseCharges` DECIMAL(30, 2) NULL DEFAULT 0.00,
    `childrenCharges` DECIMAL(30, 2) NULL DEFAULT 0.00,
    `guestCharges` DECIMAL(30, 2) NULL DEFAULT 0.00,
    `affiliatedClubCharges` DECIMAL(30, 2) NULL DEFAULT 0.00,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SportCharge_id_key`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AffiliatedClub` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NOT NULL,
    `location` VARCHAR(300) NULL,
    `contactNo` VARCHAR(50) NULL,
    `email` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `image` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AffiliatedClubRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `membershipNo` VARCHAR(191) NOT NULL,
    `affiliatedClubId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `guestCount` INTEGER NULL DEFAULT 0,
    `purpose` TEXT NULL,
    `requestedDate` DATETIME(3) NOT NULL,
    `approvedDate` DATETIME(3) NULL,
    `rejectedDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AffiliatedClubRequest_membershipNo_idx`(`membershipNo`),
    INDEX `AffiliatedClubRequest_affiliatedClubId_idx`(`affiliatedClubId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `images` JSON NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `time` VARCHAR(191) NULL,
    `venue` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClubRule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` LONGTEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Announcement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `date` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AboutUs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clubInfo` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClubHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` TEXT NOT NULL,
    `image` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PromotionalAd` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `image` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deliveredNotis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `notificationId` INTEGER NOT NULL,
    `seen` BOOLEAN NOT NULL DEFAULT false,
    `member` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `delivered` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RoomBooking` ADD CONSTRAINT `RoomBooking_Membership_No_fkey` FOREIGN KEY (`Membership_No`) REFERENCES `Member`(`Membership_No`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomBooking` ADD CONSTRAINT `RoomBooking_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HallBooking` ADD CONSTRAINT `HallBooking_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`Sno`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HallBooking` ADD CONSTRAINT `HallBooking_hallId_fkey` FOREIGN KEY (`hallId`) REFERENCES `Hall`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LawnBooking` ADD CONSTRAINT `LawnBooking_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`Sno`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LawnBooking` ADD CONSTRAINT `LawnBooking_lawnId_fkey` FOREIGN KEY (`lawnId`) REFERENCES `Lawn`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PhotoshootBooking` ADD CONSTRAINT `PhotoshootBooking_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`Sno`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PhotoshootBooking` ADD CONSTRAINT `PhotoshootBooking_photoshootId_fkey` FOREIGN KEY (`photoshootId`) REFERENCES `Photoshoot`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SportSubscription` ADD CONSTRAINT `SportSubscription_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`Sno`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SportSubscription` ADD CONSTRAINT `SportSubscription_sportId_fkey` FOREIGN KEY (`sportId`) REFERENCES `Sport`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentVoucher` ADD CONSTRAINT `PaymentVoucher_membership_no_fkey` FOREIGN KEY (`membership_no`) REFERENCES `Member`(`Membership_No`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomReservation` ADD CONSTRAINT `RoomReservation_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomReservation` ADD CONSTRAINT `RoomReservation_reservedBy_fkey` FOREIGN KEY (`reservedBy`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_roomTypeId_fkey` FOREIGN KEY (`roomTypeId`) REFERENCES `RoomType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roomHoldings` ADD CONSTRAINT `roomHoldings_holdBy_fkey` FOREIGN KEY (`holdBy`) REFERENCES `Member`(`Membership_No`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roomHoldings` ADD CONSTRAINT `roomHoldings_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomOutOfOrder` ADD CONSTRAINT `RoomOutOfOrder_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hallHoldings` ADD CONSTRAINT `hallHoldings_holdBy_fkey` FOREIGN KEY (`holdBy`) REFERENCES `Member`(`Membership_No`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hallHoldings` ADD CONSTRAINT `hallHoldings_hallId_fkey` FOREIGN KEY (`hallId`) REFERENCES `Hall`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HallOutOfOrder` ADD CONSTRAINT `HallOutOfOrder_hallId_fkey` FOREIGN KEY (`hallId`) REFERENCES `Hall`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HallReservation` ADD CONSTRAINT `HallReservation_hallId_fkey` FOREIGN KEY (`hallId`) REFERENCES `Hall`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HallReservation` ADD CONSTRAINT `HallReservation_reservedBy_fkey` FOREIGN KEY (`reservedBy`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LawnOutOfOrder` ADD CONSTRAINT `LawnOutOfOrder_lawnId_fkey` FOREIGN KEY (`lawnId`) REFERENCES `Lawn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lawn` ADD CONSTRAINT `Lawn_lawnCategoryId_fkey` FOREIGN KEY (`lawnCategoryId`) REFERENCES `LawnCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lawnHoldings` ADD CONSTRAINT `lawnHoldings_holdBy_fkey` FOREIGN KEY (`holdBy`) REFERENCES `Member`(`Membership_No`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lawnHoldings` ADD CONSTRAINT `lawnHoldings_lawnId_fkey` FOREIGN KEY (`lawnId`) REFERENCES `Lawn`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SportCharge` ADD CONSTRAINT `SportCharge_activityId_fkey` FOREIGN KEY (`activityId`) REFERENCES `Sport`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AffiliatedClubRequest` ADD CONSTRAINT `AffiliatedClubRequest_affiliatedClubId_fkey` FOREIGN KEY (`affiliatedClubId`) REFERENCES `AffiliatedClub`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deliveredNotis` ADD CONSTRAINT `deliveredNotis_notificationId_fkey` FOREIGN KEY (`notificationId`) REFERENCES `Notification`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deliveredNotis` ADD CONSTRAINT `deliveredNotis_member_fkey` FOREIGN KEY (`member`) REFERENCES `Member`(`Sno`) ON DELETE RESTRICT ON UPDATE CASCADE;
