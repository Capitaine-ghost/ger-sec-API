-- CreateTable
CREATE TABLE `Users` (
    `id` VARCHAR(191) NOT NULL,
    `nomUtilisateur` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `motDePasse` VARCHAR(191) NOT NULL,
    `secretQuestion` VARCHAR(191) NULL,
    `secretReponse` VARCHAR(191) NULL,
    `profilImg` VARCHAR(191) NULL,

    UNIQUE INDEX `Users_nomUtilisateur_key`(`nomUtilisateur`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EtablissementSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `adresse` VARCHAR(191) NULL,
    `contact` VARCHAR(12) NOT NULL,
    `autreContact` VARCHAR(12) NOT NULL,
    `lienLogo` TEXT NOT NULL,
    `etabSlogan` VARCHAR(191) NULL,

    UNIQUE INDEX `EtablissementSettings_id_key`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fournitures` (
    `id` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 1,
    `prixAchat` DOUBLE NOT NULL,
    `prixUnitVente` DOUBLE NOT NULL,
    `uniteMesure` VARCHAR(191) NOT NULL,
    `dateAppro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TypePrestations` (
    `id` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NOT NULL,
    `quantiteMin` INTEGER NOT NULL,
    `prixUnit` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prestations` (
    `id` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NOT NULL,
    `creeLe` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `quantite` INTEGER NOT NULL DEFAULT 1,
    `prixUnit` DOUBLE NOT NULL,
    `typePrestationId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransactionCaisses` (
    `id` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `montant` DOUBLE NOT NULL,
    `creeLe` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `prestationId` VARCHAR(191) NULL,
    `venteId` VARCHAR(191) NULL,

    UNIQUE INDEX `TransactionCaisses_prestationId_key`(`prestationId`),
    UNIQUE INDEX `TransactionCaisses_venteId_key`(`venteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VenteFournitures` (
    `id` VARCHAR(191) NOT NULL,
    `creeLe` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `quantite` DOUBLE NOT NULL,
    `prixVente` DOUBLE NULL,
    `fournitureId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogHistoriques` (
    `id` VARCHAR(191) NOT NULL,
    `creeLe` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `action` VARCHAR(191) NOT NULL,
    `objetId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Prestations` ADD CONSTRAINT `Prestations_typePrestationId_fkey` FOREIGN KEY (`typePrestationId`) REFERENCES `TypePrestations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionCaisses` ADD CONSTRAINT `TransactionCaisses_prestationId_fkey` FOREIGN KEY (`prestationId`) REFERENCES `Prestations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionCaisses` ADD CONSTRAINT `TransactionCaisses_venteId_fkey` FOREIGN KEY (`venteId`) REFERENCES `VenteFournitures`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VenteFournitures` ADD CONSTRAINT `VenteFournitures_fournitureId_fkey` FOREIGN KEY (`fournitureId`) REFERENCES `Fournitures`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogHistoriques` ADD CONSTRAINT `LogHistoriques_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
