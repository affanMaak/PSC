/*
  Warnings:

  - The primary key for the `member` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `memberID` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `member` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Membership_No]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Email]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Contact_No]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Membership_No` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Name` to the `Member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Sno` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Member_email_key` ON `member`;

-- DropIndex
DROP INDEX `Member_memberID_key` ON `member`;

-- DropIndex
DROP INDEX `Member_phone_key` ON `member`;

-- AlterTable
ALTER TABLE `member` DROP PRIMARY KEY,
    DROP COLUMN `email`,
    DROP COLUMN `memberID`,
    DROP COLUMN `name`,
    DROP COLUMN `phone`,
    DROP COLUMN `status`,
    ADD COLUMN `Balance` DECIMAL(65, 30) NOT NULL DEFAULT 0.0,
    ADD COLUMN `Contact_No` VARCHAR(191) NULL,
    ADD COLUMN `Email` VARCHAR(191) NULL,
    ADD COLUMN `Membership_No` VARCHAR(191) NOT NULL,
    ADD COLUMN `Name` VARCHAR(191) NOT NULL,
    ADD COLUMN `Other_Details` VARCHAR(191) NULL,
    ADD COLUMN `Sno` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `Status` ENUM('ACTIVE', 'DEACTIVATED', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
    ADD PRIMARY KEY (`Sno`);

-- CreateIndex
CREATE UNIQUE INDEX `Member_Membership_No_key` ON `Member`(`Membership_No`);

-- CreateIndex
CREATE UNIQUE INDEX `Member_Email_key` ON `Member`(`Email`);

-- CreateIndex
CREATE UNIQUE INDEX `Member_Contact_No_key` ON `Member`(`Contact_No`);
