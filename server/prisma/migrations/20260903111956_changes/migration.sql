/*
  Warnings:

  - You are about to alter the column `fullName` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `gender` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `nationality` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `idType` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `idTypeOther` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `idNumber` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `phoneNumber` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `alternativePhone` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `emailAddress` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `residentialAddress` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `cityTown` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `highestEducation` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `highestEducationOther` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `fieldOfStudy` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `employmentStatus` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `organizationName` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `jobTitle` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `yearsOfExperience` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `courseTitle` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `courseCategory` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `courseCategoryOther` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `computerLiteracy` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `relevantSkills` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `emergencyName` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `emergencyRelationship` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `emergencyPhone` on the `students` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - A unique constraint covering the columns `[phoneNumber]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emailAddress]` on the table `students` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `students` MODIFY `fullName` VARCHAR(191) NOT NULL,
    MODIFY `gender` VARCHAR(191) NOT NULL,
    MODIFY `nationality` VARCHAR(191) NOT NULL,
    MODIFY `idType` VARCHAR(191) NOT NULL,
    MODIFY `idTypeOther` VARCHAR(191) NULL,
    MODIFY `idNumber` VARCHAR(191) NOT NULL,
    MODIFY `phoneNumber` VARCHAR(191) NOT NULL,
    MODIFY `alternativePhone` VARCHAR(191) NULL,
    MODIFY `emailAddress` VARCHAR(191) NOT NULL,
    MODIFY `residentialAddress` VARCHAR(191) NOT NULL,
    MODIFY `cityTown` VARCHAR(191) NOT NULL,
    MODIFY `highestEducation` VARCHAR(191) NOT NULL,
    MODIFY `highestEducationOther` VARCHAR(191) NULL,
    MODIFY `fieldOfStudy` VARCHAR(191) NOT NULL,
    MODIFY `employmentStatus` VARCHAR(191) NOT NULL,
    MODIFY `organizationName` VARCHAR(191) NULL,
    MODIFY `jobTitle` VARCHAR(191) NULL,
    MODIFY `yearsOfExperience` VARCHAR(191) NULL,
    MODIFY `courseTitle` VARCHAR(191) NOT NULL,
    MODIFY `courseCategory` VARCHAR(191) NOT NULL,
    MODIFY `courseCategoryOther` VARCHAR(191) NULL,
    MODIFY `computerLiteracy` VARCHAR(191) NOT NULL,
    MODIFY `relevantSkills` VARCHAR(191) NULL,
    MODIFY `emergencyName` VARCHAR(191) NOT NULL,
    MODIFY `emergencyRelationship` VARCHAR(191) NOT NULL,
    MODIFY `emergencyPhone` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `students_phoneNumber_key` ON `students`(`phoneNumber`);

-- CreateIndex
CREATE UNIQUE INDEX `students_emailAddress_key` ON `students`(`emailAddress`);
