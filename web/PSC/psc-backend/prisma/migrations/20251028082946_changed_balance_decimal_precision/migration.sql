/*
  Warnings:

  - You are about to alter the column `Balance` on the `member` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(20,2)`.

*/
-- AlterTable
ALTER TABLE `member` MODIFY `Balance` DECIMAL(20, 2) NOT NULL DEFAULT 0.00;
