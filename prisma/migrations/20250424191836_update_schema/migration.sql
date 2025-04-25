-- CreateTable
CREATE TABLE "Nomination" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "designation" TEXT NOT NULL,
    "residentialAddr" TEXT NOT NULL,
    "postalAddr" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "aadhaarNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nomination_pkey" PRIMARY KEY ("id")
);
