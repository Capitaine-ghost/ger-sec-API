-- DropForeignKey
ALTER TABLE `typeprestationfourniture` DROP FOREIGN KEY `TypePrestationFourniture_typePrestationId_fkey`;

-- DropIndex
DROP INDEX `TypePrestationFourniture_typePrestationId_key` ON `typeprestationfourniture`;

-- AddForeignKey
ALTER TABLE `LogHistoriques` ADD CONSTRAINT `LogHistoriques_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
