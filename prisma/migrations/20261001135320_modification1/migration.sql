-- AlterTable
ALTER TABLE `transactioncaisses` ADD COLUMN `commandeId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Commandes` (
    `id` VARCHAR(191) NOT NULL,
    `creeLe` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `prestationId` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_fourniturePrestations` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_fourniturePrestations_AB_unique`(`A`, `B`),
    INDEX `_fourniturePrestations_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TransactionCaisses` ADD CONSTRAINT `TransactionCaisses_commandeId_fkey` FOREIGN KEY (`commandeId`) REFERENCES `Commandes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commandes` ADD CONSTRAINT `Commandes_prestationId_fkey` FOREIGN KEY (`prestationId`) REFERENCES `Prestations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_fourniturePrestations` ADD CONSTRAINT `_fourniturePrestations_A_fkey` FOREIGN KEY (`A`) REFERENCES `Fournitures`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_fourniturePrestations` ADD CONSTRAINT `_fourniturePrestations_B_fkey` FOREIGN KEY (`B`) REFERENCES `TypePrestations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
