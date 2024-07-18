/*
  Warnings:

  - You are about to drop the column `Dias_Atraso` on the `detalleprestamo` table. All the data in the column will be lost.
  - Added the required column `Dias_Atraso` to the `Multa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `detalleprestamo` DROP COLUMN `Dias_Atraso`;

-- AlterTable
ALTER TABLE `multa` ADD COLUMN `Dias_Atraso` INTEGER NOT NULL;
