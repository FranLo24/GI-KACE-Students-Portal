-- AlterTable
ALTER TABLE `students`
  ADD COLUMN `paymentToken` VARCHAR(191) NULL,
  ADD COLUMN `feeAmountPesewas` INT NULL,
  ADD COLUMN `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'unpaid',
  ADD COLUMN `paymentReference` VARCHAR(191) NULL,
  ADD COLUMN `paystackTransactionId` VARCHAR(191) NULL,
  ADD COLUMN `paidAt` DATETIME(3) NULL,
  ADD COLUMN `admissionStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
  ADD COLUMN `admittedAt` DATETIME(3) NULL,
  ADD COLUMN `admissionSmsStatus` VARCHAR(191) NULL,
  ADD COLUMN `admissionEmailStatus` VARCHAR(191) NULL;

-- Backfill a unique token for any pre-existing rows (no-op on a fresh database)
UPDATE `students` SET `paymentToken` = MD5(CONCAT(RAND(), id, NOW(6))) WHERE `paymentToken` IS NULL;

-- Enforce NOT NULL + uniqueness now that every row has a value
ALTER TABLE `students` MODIFY `paymentToken` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `students_paymentToken_key` ON `students`(`paymentToken`);

-- CreateIndex
CREATE UNIQUE INDEX `students_paymentReference_key` ON `students`(`paymentReference`);
