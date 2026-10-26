/*
  Warnings:

  - You are about to drop the column `prestationId` on the `commandes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[typePrestationId]` on the table `Commandes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `typePrestationId` to the `Commandes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `commandes` DROP FOREIGN KEY `Commandes_prestationId_fkey`;

-- DropIndex
DROP INDEX `Commandes_prestationId_key` ON `commandes`;

-- AlterTable
ALTER TABLE `commandes` DROP COLUMN `prestationId`,
    ADD COLUMN `typePrestationId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Commandes_typePrestationId_key` ON `Commandes`(`typePrestationId`);

-- AddForeignKey
ALTER TABLE `Commandes` ADD CONSTRAINT `Commandes_typePrestationId_fkey` FOREIGN KEY (`typePrestationId`) REFERENCES `TypePrestations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
