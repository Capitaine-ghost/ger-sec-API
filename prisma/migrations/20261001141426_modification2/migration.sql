-- AlterTable
ALTER TABLE `commandes` ADD COLUMN `prixUnitaireConclu` DOUBLE NULL,
    ADD COLUMN `quantite` INTEGER NOT NULL DEFAULT 1;
