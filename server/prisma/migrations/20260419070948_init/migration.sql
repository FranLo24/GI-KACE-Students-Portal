-- CreateTable
CREATE TABLE `students` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `fullName` VARCHAR(255) NOT NULL,
    `gender` VARCHAR(255) NOT NULL,
    `nationality` VARCHAR(255) NOT NULL,
    `idType` VARCHAR(255) NOT NULL,
    `idTypeOther` VARCHAR(255) NULL,
    `idNumber` VARCHAR(255) NOT NULL,
    `phoneNumber` VARCHAR(255) NOT NULL,
    `alternativePhone` VARCHAR(255) NULL,
    `emailAddress` VARCHAR(255) NOT NULL,
    `residentialAddress` VARCHAR(255) NOT NULL,
    `cityTown` VARCHAR(255) NOT NULL,
    `highestEducation` VARCHAR(255) NOT NULL,
    `highestEducationOther` VARCHAR(255) NULL,
    `fieldOfStudy` VARCHAR(255) NOT NULL,
    `employmentStatus` VARCHAR(255) NOT NULL,
    `organizationName` VARCHAR(255) NULL,
    `jobTitle` VARCHAR(255) NULL,
    `yearsOfExperience` VARCHAR(255) NULL,
    `courseTitle` VARCHAR(255) NOT NULL,
    `courseCategory` VARCHAR(255) NOT NULL,
    `courseCategoryOther` VARCHAR(255) NULL,
    `computerLiteracy` VARCHAR(255) NOT NULL,
    `relevantSkills` VARCHAR(255) NULL,
    `emergencyName` VARCHAR(255) NOT NULL,
    `emergencyRelationship` VARCHAR(255) NOT NULL,
    `emergencyPhone` VARCHAR(255) NOT NULL,

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
