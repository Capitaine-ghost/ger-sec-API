/*
  Warnings:

  - Added the required column `uniteMesure` to the `Approvisionnement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `approvisionnement` ADD COLUMN `uniteMesure` VARCHAR(191) NOT NULL;
