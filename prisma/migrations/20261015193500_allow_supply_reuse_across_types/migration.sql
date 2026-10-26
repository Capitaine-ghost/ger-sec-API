-- DropForeignKey
ALTER TABLE `typeprestationfourniture` DROP FOREIGN KEY `TypePrestationFourniture_fournitureId_fkey`;

-- DropIndex
DROP INDEX `TypePrestationFourniture_fournitureId_key` ON `typeprestationfourniture`;

-- Restore the type relation, which was removed by the preceding migration.
ALTER TABLE `TypePrestationFourniture` ADD CONSTRAINT `TypePrestationFourniture_typePrestationId_fkey` FOREIGN KEY (`typePrestationId`) REFERENCES `TypePrestations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
