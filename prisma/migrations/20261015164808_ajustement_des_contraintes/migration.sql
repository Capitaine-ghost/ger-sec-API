/*
  Warnings:

  - A unique constraint covering the columns `[fournitureId]` on the table `TypePrestationFourniture` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `TypePrestationFourniture_fournitureId_key` ON `TypePrestationFourniture`(`fournitureId`);

-- AddForeignKey
ALTER TABLE `TypePrestationFourniture` ADD CONSTRAINT `TypePrestationFourniture_fournitureId_fkey` FOREIGN KEY (`fournitureId`) REFERENCES `Fournitures`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
