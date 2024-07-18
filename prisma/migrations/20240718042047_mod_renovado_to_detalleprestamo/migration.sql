/*
  Warnings:

  - You are about to alter the column `Renovado` on the `detalleprestamo` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `detalleprestamo` MODIFY `Renovado` VARCHAR(191) NOT NULL;
