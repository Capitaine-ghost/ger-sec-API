/*
  Warnings:

  - You are about to drop the `_fournitureprestations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_fournitureprestations` DROP FOREIGN KEY `_fourniturePrestations_A_fkey`;

-- DropForeignKey
ALTER TABLE `_fournitureprestations` DROP FOREIGN KEY `_fourniturePrestations_B_fkey`;

-- DropTable
DROP TABLE `_fournitureprestations`;

-- CreateTable
CREATE TABLE `TypePrestationFourniture` (
    `id` VARCHAR(191) NOT NULL,
    `quantite` INTEGER NOT NULL DEFAULT 1,
    `typePrestationId` VARCHAR(191) NOT NULL,
    `fournitureId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `TypePrestationFourniture_typePrestationId_key`(`typePrestationId`),
    UNIQUE INDEX `TypePrestationFourniture_fournitureId_key`(`fournitureId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TypePrestationFourniture` ADD CONSTRAINT `TypePrestationFourniture_typePrestationId_fkey` FOREIGN KEY (`typePrestationId`) REFERENCES `TypePrestations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TypePrestationFourniture` ADD CONSTRAINT `TypePrestationFourniture_fournitureId_fkey` FOREIGN KEY (`fournitureId`) REFERENCES `Fournitures`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
