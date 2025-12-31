/*
  Warnings:

  - You are about to drop the column `approvedDate` on the `affiliatedclubrequest` table. All the data in the column will be lost.
  - You are about to drop the column `guestCount` on the `affiliatedclubrequest` table. All the data in the column will be lost.
  - You are about to drop the column `purpose` on the `affiliatedclubrequest` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedDate` on the `affiliatedclubrequest` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `affiliatedclubrequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `affiliatedclubrequest` DROP COLUMN `approvedDate`,
    DROP COLUMN `guestCount`,
    DROP COLUMN `purpose`,
    DROP COLUMN `rejectedDate`,
    DROP COLUMN `status`;

-- AlterTable
ALTER TABLE `sport` ADD COLUMN `donts` LONGTEXT NULL,
    ADD COLUMN `dos` LONGTEXT NULL,
    ADD COLUMN `dressCodeDonts` LONGTEXT NULL,
    ADD COLUMN `dressCodeDos` LONGTEXT NULL,
    ADD COLUMN `images` JSON NOT NULL,
    ADD COLUMN `timing` JSON NULL,
    ADD COLUMN `timingLadies` JSON NULL;
