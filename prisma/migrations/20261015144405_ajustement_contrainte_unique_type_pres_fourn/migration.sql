-- DropForeignKey
ALTER TABLE `typeprestationfourniture` DROP FOREIGN KEY `TypePrestationFourniture_fournitureId_fkey`;

-- DropIndex
DROP INDEX `TypePrestationFourniture_fournitureId_key` ON `typeprestationfourniture`;

-- -- AddForeignKey
-- ALTER TABLE `VenteFournitures` ADD CONSTRAINT `VenteFournitures_fournitureId_fkey` FOREIGN KEY (`fournitureId`) REFERENCES `Fournitures`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
