-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 22, 2026 at 02:17 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.4.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `student_portal`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(191) NOT NULL,
  `passwordHash` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `passwordHash`) VALUES
(1, 'admin', '$2a$10$8WH99NXJCtY2EdOLpnsHcOJhjIxAInU9u66U0fZKLRftgSWsMBIuO');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `fullName` varchar(191) NOT NULL,
  `gender` varchar(191) NOT NULL,
  `nationality` varchar(191) NOT NULL,
  `idType` varchar(191) NOT NULL,
  `idTypeOther` varchar(191) DEFAULT NULL,
  `idNumber` varchar(191) NOT NULL,
  `phoneNumber` varchar(191) NOT NULL,
  `alternativePhone` varchar(191) DEFAULT NULL,
  `emailAddress` varchar(191) NOT NULL,
  `residentialAddress` varchar(191) NOT NULL,
  `cityTown` varchar(191) NOT NULL,
  `highestEducation` varchar(191) NOT NULL,
  `highestEducationOther` varchar(191) DEFAULT NULL,
  `fieldOfStudy` varchar(191) NOT NULL,
  `employmentStatus` varchar(191) NOT NULL,
  `organizationName` varchar(191) DEFAULT NULL,
  `jobTitle` varchar(191) DEFAULT NULL,
  `yearsOfExperience` varchar(191) DEFAULT NULL,
  `courseTitle` varchar(191) NOT NULL,
  `courseCategory` varchar(191) NOT NULL,
  `courseCategoryOther` varchar(191) DEFAULT NULL,
  `computerLiteracy` varchar(191) NOT NULL,
  `relevantSkills` varchar(191) DEFAULT NULL,
  `emergencyName` varchar(191) NOT NULL,
  `emergencyRelationship` varchar(191) NOT NULL,
  `emergencyPhone` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `createdAt`, `updatedAt`, `fullName`, `gender`, `nationality`, `idType`, `idTypeOther`, `idNumber`, `phoneNumber`, `alternativePhone`, `emailAddress`, `residentialAddress`, `cityTown`, `highestEducation`, `highestEducationOther`, `fieldOfStudy`, `employmentStatus`, `organizationName`, `jobTitle`, `yearsOfExperience`, `courseTitle`, `courseCategory`, `courseCategoryOther`, `computerLiteracy`, `relevantSkills`, `emergencyName`, `emergencyRelationship`, `emergencyPhone`) VALUES
(1, '2026-04-22 07:50:18.130', '2026-04-22 07:51:12.398', 'Francis Lomotey', 'Male', 'Ghanaian', 'Ghana Card', NULL, '7124897235', '0595692903', NULL, 'francislomotey123@gmail.com', 'GA-473-5106', 'Accra', 'Bachelor\'s Degree', NULL, 'Computer Science', 'Employed', 'GI-KACE', NULL, NULL, 'Certificate in Software Development', 'Certificate in Software Development', NULL, 'Beginner', NULL, 'Fredrick Lomotey', 'Sibling', '0262904579'),
(2, '2026-04-22 07:58:30.081', '2026-04-22 07:58:30.081', 'makeba', 'Female', 'Ghanaian', 'Ghana Card', NULL, 'GHA-0002223456-2', '0242300125', NULL, 'makeba@gmail.com', 'GA-3245-2', 'Accra', 'Bachelor\'s Degree', NULL, 'computer science', 'Employed', 'GI-KACE', 'NSS Personnel', '2', 'CCNA', 'CCNA', NULL, 'Intermediate', NULL, 'connie', 'parent', '0244444401'),
(3, '2026-04-22 08:15:25.031', '2026-04-22 08:15:25.031', 'Fredrick George ', 'Male', 'Ghanaian', 'Ghana Card', NULL, 'GHA-002536472-1', '0262904579', NULL, 'fredrick@gmail.com', 'Dansoman Estate', 'Accra', 'Bachelor\'s Degree', NULL, 'Information Studies', 'Employed', 'Ghana Football Association', 'Director', '2', 'Corporate Trainings', 'Corporate Trainings', NULL, 'Beginner', NULL, 'Francis Lomotey', 'Sibling', '0595692903');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('b4c62ed5-051d-4f4e-8b2b-f6413bf7e90b', '020382e746b4e553590de4a8774d60c000cfed81c9fc9869e71b67470752b38b', '2026-04-19 07:09:48.973', '20260419070948_init', NULL, NULL, '2026-04-19 07:09:48.927', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admins_username_key` (`username`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
