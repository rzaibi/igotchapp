BEGIN TRANSACTION;
CREATE TABLE `users` (
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`name`	TEXT,
	`username`	TEXT NOT NULL UNIQUE,
	`password`	TEXT,
	`active`	INTEGER DEFAULT 1,
	`last_login`	INTEGER
);
CREATE TABLE `games` (
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`name`	TEXT NOT NULL,
	`description`	TEXT
);
CREATE TABLE "feedback" (
	`id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`game_id`	INTEGER NOT NULL,
	`user_id`	INTEGER NOT NULL,
	`rating`	INTEGER NOT NULL,
	`feedback`	TEXT,
	`timestamp`	TEXT DEFAULT (strftime('%Y%m%d%H%M%S',datetime('now','localtime')))
);
CREATE INDEX `feedback_ndx` ON `feedback` (`game_id` ,`user_id` ,`timestamp` )
;
COMMIT;
