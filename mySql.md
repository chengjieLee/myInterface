# 启动 / 关闭  /Centos
1.启动：/etc/init.d/mysqld start
2.停止：/etc/init.d/mysqld stop
3.重启：/etc/init.d/mysqld restart
# 建库 user
CREATE DATABASE user

# 建表 users
```
  CREATE TABLE users (id int(10) primary key auto_increment,name varchar(20),password varchar(20));
```
name 用户名   password 密码

# 建表 blogs

```
  CREATE TABLE blogs (id int(10) primary key auto_increment,user varchar(20),blogcontent mediumtext, blogtitle varchar(20), createtime varchar(20), blogauthor varchar(20), isdelete int(10));

```
blogs 中包含 主键 id  user 用户名 blogcontent 博客内容 blogtitle 博客标题 createtime 创建时间 blogauthor 自定义的博客作者 isdelete 用于软删除



# 建表 resumes
 CREATE TABLE resumes (
   resumeid int(10) primary key auto_increment, 
   user varchar(10),
   avatar varchar(255),
   education varchar(10), 
   profession varchar(20),
   skills text, 
   workexperience text, 
   project text,
   name varchar(10) 
  );--- //这条是后来插入的
 
resumes 表用来存储个人信息简历 应包含 id 姓名 string  头像 url string 学历: string 职位string  技能[{skillname:, skillProgress} {}],  工作经历[{start: ,end: ,company:,job:, desc:} ,{}] , 项目经验 [{}, {}]

### 向表中插入一条新字段 
alter table resumes add name varchar(10);

### 更新表中某个字段属性
 alter table resumes change avatar avatar varchar(255);
 >alter table 表名称 change 字段原名称 字段新名称 字段类型 [是否允许非空];
### 更新语句
update tableName set 表字段名=(values) where 条件;

### 插入语句
insert into 表名 (字段1,字段2) VALUES (字段1 value, 字段2 value);

# 设置默认字符集

ALTER TABLE logtest(表名) CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;

### 建表 experience_project
###      experience_work

```
  CREATE TABLE experience_work(
    experience_id int(10) primary key auto_increment,
    user varchar(255),
    experience_name varchar(255),
    timeRange varchar(255),
    workPosition varchar(255),
    description text
  ) default charset=utf8;
 ```