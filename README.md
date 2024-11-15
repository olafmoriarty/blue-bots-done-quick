# Blue Bots, Done Quick!

A CBDQ clone for Bluesky by [Olaf Moriarty Solstrand](https://olafmoriarty.com).

The project is based on [Cheap Bots, Done Quick](https://cheapbotsdonequick.com) by [v buckenham](https://v21.com).

Live version: https://bluebotsdonequick.com - go there to build your own bot if you want to. It's free and easy (if you know Tracery)!

Think you can do better? You probably can! Feel free to borrow or steal as much of this code as you want to.

## To do-list
- Allow users to turn off automatic replies
- Add an FAQ
- Adding a Tracery tutorial would be nice ...

(Suggestions are welcome!)

Note that while I do believe this code is functional, it is not fully tested. I guess you could call it a public beta?

## Installation
The frontend is written in React using TypeScript and Vite. The backend is written in PHP with a MySQL database.

### Database setup
Create a MySQL database and install the following table:

```
CREATE TABLE `bbdq` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `active` smallint(1) NOT NULL DEFAULT 0,
  `provider` varchar(255) NOT NULL,
  `did` varchar(255) NOT NULL,
  `identifier` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `accessJwt` TEXT NULL,
  `accessJwt_time` DATETIME NULL,
  `refreshJwt` TEXT NULL,
  `refreshJwt_time` DATETIME NULL,
  `iv` varchar(32) NOT NULL,
  `script` mediumtext DEFAULT NULL,
  `language` varchar(2) NOT NULL DEFAULT 'en',
  `lastPost` datetime NOT NULL DEFAULT '2000-01-01 00:00:00',
  `lastPostText` text DEFAULT NULL,
  `lastNotification` varchar(32) NOT NULL DEFAULT '',
  `minutesBetweenPosts` int(10) DEFAULT NULL,
  `msg` varchar(255) DEFAULT NULL,
  `reply` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `thumb` varchar(255) DEFAULT NULL,
  `followers` int(10) DEFAULT NULL,
  `activeSince` datetime DEFAULT NULL,
  `actionIfLong` smallint(1) NOT NULL DEFAULT 0,
  `showSource` smallint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `did` (`did`),
  KEY `identifier` (`identifier`,`provider`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_danish_ci
```

(You can use a differend utf8mb4 collation if you want to, of course.)

### Backend
In the `backend` folder, create a file named `secrets.php`. For security reasons this file is not included in the repo, but you can use the `secrets-template.php` file as a template on how to fill it in.

Set up a cron job that runs `bot.php` every five minutes, and another cron job that runs `profiler-bot.php` as often as you wish to fetch avatars, display names and follower counts (mine runs once an hour).

Install ImageMagick, imagick and an RSVG library. These are required to convert user-generated SVG images to Bluesky-friendly PNGs.

It may be a good idea to increase the max_execution_time in your PHP.ini.

### Frontend
Install dependencies using `npm install` and then build it like you normally would.

Set the variable `backendURI` in the `src/App.tsx` file to the correct path to your backend script.
