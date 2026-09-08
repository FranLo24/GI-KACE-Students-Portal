-- AlterTable
ALTER TABLE `students` ADD COLUMN `attendanceStatus` VARCHAR(191) NOT NULL DEFAULT 'not_marked',
    ADD COLUMN `completedAt` DATETIME(3) NULL,
    ADD COLUMN `courseCompletionStatus` VARCHAR(191) NOT NULL DEFAULT 'not_completed';

