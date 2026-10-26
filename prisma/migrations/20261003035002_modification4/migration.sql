/*
  Warnings:

  - Added the required column `dateLivraison` to the `Commandes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `commandes` ADD COLUMN `dateLivraison` DATETIME(3) NOT NULL,
    ADD COLUMN `estActif` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `fournitures` ADD COLUMN `estActif` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `prestations` ADD COLUMN `estActif` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `transactioncaisses` ADD COLUMN `estActif` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `typeprestations` ADD COLUMN `estActif` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `estActif` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `ventefournitures` ADD COLUMN `estActif` BOOLEAN NOT NULL DEFAULT true;
