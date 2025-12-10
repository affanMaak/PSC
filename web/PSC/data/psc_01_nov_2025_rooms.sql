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
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_number` varchar(50) NOT NULL,
  `room_type_id` varchar(30) NOT NULL,
  `per_day_charges_mess` int NOT NULL,
  `per_day_charges_regular` int NOT NULL,
  `per_day_charges_guest` int NOT NULL,
  `is_active` int NOT NULL DEFAULT '1',
  `is_deleted` int NOT NULL DEFAULT '0',
  `inserted_by_user_id` int NOT NULL,
  `updated_by_user_id` int NOT NULL,
  `insertion_date_time` datetime NOT NULL,
  `updation_date_time` datetime NOT NULL,
  `description` varchar(300) DEFAULT NULL,
  `is_out_of_order` int NOT NULL DEFAULT '0',
  `ooo_from_date` datetime DEFAULT NULL,
  `ooo_to_date` datetime DEFAULT NULL,
  `ooo_inserted_by_user_id` int NOT NULL DEFAULT '0',
  `ooo_updated_by_user_id` int NOT NULL DEFAULT '0',
  `ooo_insertion_date_time` datetime DEFAULT NULL,
  `ooo_updation_date_time` datetime DEFAULT NULL,
  `ooo_description` varchar(300) DEFAULT NULL,
  `per_day_charges_corporate` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_rooms_inserted_by_user_id` (`inserted_by_user_id`),
  KEY `fk_rooms_updated_by_user_id` (`updated_by_user_id`),
  KEY `fk_rooms_room_type_id` (`room_type_id`),
  CONSTRAINT `fk_rooms_inserted_by_user_id` FOREIGN KEY (`inserted_by_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_rooms_room_type_id` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`),
  CONSTRAINT `fk_rooms_updated_by_user_id` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,'401','STANDARD',5000,6500,9500,1,0,1,21,'2017-04-05 10:03:03','2019-10-30 15:29:22','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,'2018-07-06 00:00:00','2018-07-07 00:00:00',19,0,'2018-07-06 18:11:24',NULL,'wite wash',8000),(2,'402','STANDARD',5000,6500,9500,1,0,1,21,'2017-04-05 10:03:03','2019-10-30 15:30:19','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,'2018-07-06 00:00:00','2018-07-08 00:00:00',19,0,'2018-07-06 18:12:37',NULL,'wite wash',8000),(3,'403','STANDARD',5000,6500,9500,1,0,1,21,'2017-04-05 10:03:03','2019-10-30 15:31:35','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,'2018-07-06 00:00:00','2018-07-07 00:00:00',18,18,'2018-07-06 21:29:12','2018-07-06 21:28:27','wite wash',8000),(4,'404','STANDARD',5000,6500,9500,1,0,1,21,'2017-04-05 10:03:04','2019-10-30 15:32:20','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,8000),(5,'405','STANDARD',5000,6500,9500,0,0,1,21,'2017-04-05 10:03:04','2019-10-30 15:33:14','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,8000),(6,'406','STANDARD',5000,6500,9500,0,0,1,21,'2017-04-05 10:03:04','2019-10-30 15:33:59','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,8000),(7,'407','STANDARD',5000,6500,9500,0,0,1,21,'2017-04-05 10:03:04','2019-10-30 15:35:07','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,8000),(8,'408','STANDARD',5000,6500,9500,1,0,1,21,'2017-04-05 10:03:04','2019-10-30 15:37:44','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,8000),(9,'409','STANDARD',5000,6500,9500,1,0,1,21,'2017-04-05 10:03:04','2019-10-30 15:38:33','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,8000),(10,'410','STANDARD',5000,6500,9500,1,0,1,21,'2017-04-05 10:03:04','2019-10-30 15:39:18','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,8000),(11,'101','SUITE',9000,11000,16500,0,0,1,21,'2017-04-05 10:06:57','2019-10-30 16:08:41','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,15000),(12,'102','SUITE',9000,11000,16500,1,0,1,21,'2017-04-05 10:06:57','2019-10-30 16:09:43','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,15000),(13,'103','SUITE',9000,11000,16500,1,0,1,21,'2017-04-05 10:06:57','2019-10-30 16:10:54','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,15000),(14,'104','SUITE',9000,11000,16500,1,0,1,21,'2017-04-05 10:06:57','2019-10-30 16:11:46','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,15000),(15,'105','SUITE',9000,11000,16500,1,0,1,21,'2017-04-05 10:06:57','2019-10-30 16:13:12','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,15000),(16,'106','SUITE',9000,11000,16500,0,0,1,21,'2017-04-05 10:06:57','2019-10-30 16:14:01','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,15000),(17,'107','SUITE',9000,11000,16500,0,0,1,21,'2017-04-05 10:06:57','2019-10-30 16:14:40','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,15000),(18,'201','DELUXE',6500,7500,10500,1,0,1,21,'2017-04-05 10:09:33','2019-10-30 13:55:59','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,'2017-12-04 00:00:00','2017-12-06 00:00:00',14,14,'2017-12-04 10:59:50','2017-12-04 11:00:21','in order',10000),(19,'202','DELUXE',6500,7500,10500,1,0,1,21,'2017-04-05 10:09:33','2019-10-30 15:08:21','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,10000),(20,'203','DELUXE',6500,7500,10500,1,0,1,21,'2017-04-05 10:09:33','2019-10-30 15:17:26','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,10000),(21,'204','DELUXE',6500,7500,10500,1,0,1,21,'2017-04-05 10:09:33','2019-10-30 15:18:32','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,10000),(22,'205','DELUXE',6500,7500,10500,1,0,1,21,'2017-04-05 10:09:33','2019-10-30 15:19:23','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,10000),(23,'206','DELUXE',6500,7500,10500,1,0,1,21,'2017-04-05 10:09:34','2019-10-30 15:19:58','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,10000),(24,'207','DELUXE',6500,7500,10500,1,0,1,21,'2017-04-05 10:09:34','2019-10-30 15:20:37','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,'2018-01-01 00:00:00','2018-01-31 00:00:00',19,19,'2018-01-01 15:32:03','2017-12-25 19:32:03','washroom disorder',10000),(25,'208','DELUXE',6500,7500,10500,1,0,1,21,'2017-04-05 10:09:34','2019-10-30 15:21:27','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,10000),(26,'209','DELUXE',6500,7500,10500,0,0,1,21,'2017-04-05 10:09:34','2019-10-30 15:22:18','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,10000),(27,'210','DELUXE',6500,7500,10500,1,0,1,21,'2017-04-05 10:09:34','2019-10-30 15:23:08','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,'2018-05-13 00:00:00','2018-12-31 00:00:00',19,19,'2018-05-13 15:13:11','2017-12-25 19:11:21','washroom disorder',10000),(28,'211','DELUXE',6500,7500,10500,1,0,1,21,'2017-04-05 10:09:34','2019-10-30 15:24:17','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,'2018-05-13 00:00:00','2018-12-31 00:00:00',19,19,'2018-05-13 15:13:37','2017-12-25 19:10:47','washroom disorder',10000),(29,'212','DELUXE',6500,7500,10500,0,0,1,21,'2017-04-05 10:09:34','2019-10-30 15:25:15','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,10000),(30,'213','DELUXE',6500,7500,10500,0,0,1,21,'2017-04-05 10:09:34','2019-10-30 15:25:46','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,10000),(31,'214','DELUXE',6500,7500,10500,0,0,1,21,'2017-04-05 10:09:34','2019-10-30 15:26:32','Room rates revised w.e.f 19th Oct, 2019. Approved by Management Committee (Meeting held on 19th Oct, 2019)',0,NULL,NULL,0,0,NULL,NULL,NULL,10000);
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
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
