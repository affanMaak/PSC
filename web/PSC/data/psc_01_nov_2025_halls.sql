-- MySQL dump 10.13  Distrib 8.0.41, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: psc_01_nov_2025
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `halls`
--

DROP TABLE IF EXISTS `halls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `halls` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hall_name` varchar(70) NOT NULL,
  `charges_for_members` int NOT NULL,
  `charges_for_guest` int NOT NULL,
  `charges_for_corporates` int NOT NULL,
  `is_active` int NOT NULL DEFAULT '1',
  `is_deleted` int NOT NULL DEFAULT '0',
  `inserted_by_user_id` int NOT NULL,
  `updated_by_user_id` int NOT NULL,
  `insertion_date_time` datetime NOT NULL,
  `updation_date_time` datetime NOT NULL,
  `description` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hall_name` (`hall_name`),
  KEY `fk_halls_inserted_by_user_id` (`inserted_by_user_id`),
  KEY `fk_halls_updated_by_user_id` (`updated_by_user_id`),
  CONSTRAINT `fk_halls_inserted_by_user_id` FOREIGN KEY (`inserted_by_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_halls_updated_by_user_id` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `halls`
--

LOCK TABLES `halls` WRITE;
/*!40000 ALTER TABLE `halls` DISABLE KEYS */;
INSERT INTO `halls` VALUES (1,'Banquet Hall (Complete)',65000,95000,125000,1,0,1,49,'2017-04-05 10:21:49','2023-08-15 09:42:26','the complete equiped banquet hall'),(2,'Main Hall',40000,60000,90000,1,0,1,49,'2017-04-05 10:31:58','2023-08-15 09:43:02','Main hall'),(3,'Sub Hall',30000,40000,50000,1,0,1,49,'2017-04-05 10:31:58','2023-08-15 09:43:24','sub hall'),(4,'Conference Hall',0,0,20000,1,0,1,49,'2017-04-05 10:31:59','2023-08-15 09:46:41','Conference hall'),(5,'Dining Hall',15000,20000,40000,1,0,1,49,'2017-04-05 10:31:59','2023-08-15 09:44:31','Dining Hall'),(6,'Irvine Lounge',10000,15000,25000,1,0,1,49,'2017-04-05 10:31:59','2023-08-15 09:45:38','Irvine Lounge'),(7,'Swimming Pool Day Time',60000,80000,90000,1,0,1,49,'2017-04-05 10:31:59','2023-08-15 09:49:44','Swimming Pool Day Time Event'),(8,'Guest Rooms Lawn',100000,150000,300000,1,0,1,16,'2017-04-05 10:31:59','2017-04-05 10:31:59','Guest Rooms Lawn'),(9,'Swimming Pool Night Time',90000,110000,120000,0,0,16,49,'2018-04-19 13:54:52','2023-08-15 09:50:49','Swimming Pool Night Event'),(10,'Ball Room',30000,40000,60000,1,0,49,49,'2018-12-20 13:23:00','2023-08-15 09:44:05','Shawal Hall'),(11,'Engle Bright',20000,30000,50000,1,0,49,49,'2018-12-28 10:58:24','2018-12-28 10:58:24',''),(12,'BBQ Lawn',10000,15000,20000,1,0,49,49,'2021-02-09 12:14:52','2021-02-09 12:14:52','New Location Added');
/*!40000 ALTER TABLE `halls` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-22 14:27:08
