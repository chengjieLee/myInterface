# 建库 user
CREATE DATABASE user

# 建表 users
```
  CREATE TABLE users (id int(10) primary key auto_increment,name varchar(20),password varchar(20));
```
# 建表 blogs

```
  CREATE TABLE blogs (id int(10) primary key auto_increment,user varchar(20),blogcontent mediumtext, blogtitle varchar(20), createtime varchar(20), blogauthor varchar(20), isdelete int(10));

```
