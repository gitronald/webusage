
-- Create user and password for python access

-- select user,host,plugin,authentication_string from user;

USE mysql;
DROP USER IF EXISTS 'python'@'localhost';
CREATE USER 'python'@'localhost' IDENTIFIED BY 'redacted_pw';
-- UPDATE USER SET plugin='caching_sha2_password' WHERE User='python';
GRANT ALL PRIVILEGES ON extension.* TO 'python'@'localhost';
FLUSH PRIVILEGES;
exit;
