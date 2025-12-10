/*
  Warnings:

  - You are about to drop the column `uniqueNo` on the `member` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[memberID]` on the table `Member` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `memberID` to the `Member` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Member_uniqueNo_key` ON `member`;

-- AlterTable
ALTER TABLE `member` DROP COLUMN `uniqueNo`,
    ADD COLUMN `memberID` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Member_memberID_key` ON `Member`(`memberID`);
