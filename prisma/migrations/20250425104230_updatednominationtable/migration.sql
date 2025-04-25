/*
  Warnings:

  - Added the required column `email` to the `Nomination` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Nomination" ADD COLUMN     "email" TEXT NOT NULL,
ALTER COLUMN "designation" DROP NOT NULL,
ALTER COLUMN "residentialAddr" DROP NOT NULL,
ALTER COLUMN "postalAddr" DROP NOT NULL,
ALTER COLUMN "phoneNumber" DROP NOT NULL,
ALTER COLUMN "aadhaarNumber" DROP NOT NULL;
