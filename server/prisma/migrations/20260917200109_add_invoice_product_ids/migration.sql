-- AlterTable
ALTER TABLE `course_fees` ADD COLUMN `invoiceBranchCode` VARCHAR(191) NULL,
    ADD COLUMN `invoiceProductId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `students` ADD COLUMN `courseId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `course_fees_invoiceProductId_key` ON `course_fees`(`invoiceProductId`);

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

