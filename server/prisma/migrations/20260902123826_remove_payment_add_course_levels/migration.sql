-- DropIndex
ALTER TABLE `students` DROP INDEX `students_paymentToken_key`;

-- DropIndex
ALTER TABLE `students` DROP INDEX `students_paymentReference_key`;

-- AlterTable
ALTER TABLE `students`
  DROP COLUMN `paymentToken`,
  DROP COLUMN `feeAmountPesewas`,
  DROP COLUMN `paymentStatus`,
  DROP COLUMN `paymentReference`,
  DROP COLUMN `paystackTransactionId`,
  DROP COLUMN `paidAt`;

-- CreateTable
CREATE TABLE `course_levels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `course_levels_category_key`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
