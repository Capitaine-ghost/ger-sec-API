/*
  Warnings:

  - You are about to drop the column `dateAppro` on the `fournitures` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `fournitures` DROP COLUMN `dateAppro`;

-- CreateTable
CREATE TABLE `Approvisionnement` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `quantite` INTEGER NOT NULL,
    `fournitureId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Approvisionnement` ADD CONSTRAINT `Approvisionnement_fournitureId_fkey` FOREIGN KEY (`fournitureId`) REFERENCES `Fournitures`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
