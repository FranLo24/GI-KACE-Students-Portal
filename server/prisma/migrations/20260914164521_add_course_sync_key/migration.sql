-- AlterTable
ALTER TABLE `courses` ADD COLUMN `syncKey` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `courses_syncKey_key` ON `courses`(`syncKey`);
