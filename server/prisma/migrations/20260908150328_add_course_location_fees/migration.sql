/*
  Warnings:

  - You are about to drop the column `fee` on the `courses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `courses` DROP COLUMN `fee`;

-- CreateTable
CREATE TABLE `course_fees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `courseId` INTEGER NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `fee` DOUBLE NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `course_fees_courseId_location_key`(`courseId`, `location`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course_fees` ADD CONSTRAINT `course_fees_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
