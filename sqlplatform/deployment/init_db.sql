-- Drop existing and create new database with modern encoding for emojis
DROP DATABASE IF EXISTS extension;
CREATE DATABASE extension CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;