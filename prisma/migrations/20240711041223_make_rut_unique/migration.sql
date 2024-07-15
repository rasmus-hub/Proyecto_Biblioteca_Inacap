/*
  Warnings:

  - A unique constraint covering the columns `[Rut]` on the table `Bibliotecario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Rut]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Bibliotecario_Rut_key` ON `Bibliotecario`(`Rut`);

-- CreateIndex
CREATE UNIQUE INDEX `Usuario_Rut_key` ON `Usuario`(`Rut`);
