-- CreateTable
CREATE TABLE `students` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `nationality` VARCHAR(191) NOT NULL,
    `idType` VARCHAR(191) NOT NULL,
    `idTypeOther` VARCHAR(191) NULL,
    `idNumber` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `alternativePhone` VARCHAR(191) NULL,
    `emailAddress` VARCHAR(191) NOT NULL,
    `residentialAddress` VARCHAR(191) NOT NULL,
    `cityTown` VARCHAR(191) NOT NULL,
    `highestEducation` VARCHAR(191) NOT NULL,
    `highestEducationOther` VARCHAR(191) NULL,
    `fieldOfStudy` VARCHAR(191) NOT NULL,
    `employmentStatus` VARCHAR(191) NOT NULL,
    `organizationName` VARCHAR(191) NULL,
    `jobTitle` VARCHAR(191) NULL,
    `yearsOfExperience` VARCHAR(191) NULL,
    `courseTitle` VARCHAR(191) NOT NULL,
    `courseCategory` VARCHAR(191) NOT NULL,
    `courseCategoryOther` VARCHAR(191) NULL,
    `computerLiteracy` VARCHAR(191) NOT NULL,
    `relevantSkills` VARCHAR(191) NULL,
    `emergencyName` VARCHAR(191) NOT NULL,
    `emergencyRelationship` VARCHAR(191) NOT NULL,
    `emergencyPhone` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `admins_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
