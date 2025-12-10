/*
  Warnings:

  - You are about to alter the column `otp` on the `member` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `member` MODIFY `otp` INTEGER NULL;
