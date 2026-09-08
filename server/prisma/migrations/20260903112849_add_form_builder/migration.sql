-- AlterTable
ALTER TABLE `students` ADD COLUMN `customFields` JSON NULL;

-- CreateTable
CREATE TABLE `form_sections` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `form_sections_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form_fields` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sectionId` INTEGER NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `placeholder` VARCHAR(191) NULL,
    `required` BOOLEAN NOT NULL DEFAULT false,
    `options` JSON NULL,
    `validation` JSON NULL,
    `conditionalOn` JSON NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `isBuiltIn` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `form_fields_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form_settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `heroImageUrl` VARCHAR(191) NULL,
    `fontFamily` VARCHAR(191) NOT NULL DEFAULT '''Trebuchet MS'', ''Segoe UI'', sans-serif',
    `baseFontSize` INTEGER NOT NULL DEFAULT 16,
    `headingScale` DOUBLE NOT NULL DEFAULT 1,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `form_fields` ADD CONSTRAINT `form_fields_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `form_sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
