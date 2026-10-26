/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Commandes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[prestationId]` on the table `Commandes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Fournitures` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `LogHistoriques` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Prestations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `TransactionCaisses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[commandeId]` on the table `TransactionCaisses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `TypePrestations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `VenteFournitures` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Commandes_id_key` ON `Commandes`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `Commandes_prestationId_key` ON `Commandes`(`prestationId`);

-- CreateIndex
CREATE UNIQUE INDEX `Fournitures_id_key` ON `Fournitures`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `LogHistoriques_id_key` ON `LogHistoriques`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `Prestations_id_key` ON `Prestations`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `TransactionCaisses_id_key` ON `TransactionCaisses`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `TransactionCaisses_commandeId_key` ON `TransactionCaisses`(`commandeId`);

-- CreateIndex
CREATE UNIQUE INDEX `TypePrestations_id_key` ON `TypePrestations`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `Users_id_key` ON `Users`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `VenteFournitures_id_key` ON `VenteFournitures`(`id`);
