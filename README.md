# Blue Bots, Done Quick!

A CBDQ clone for Bluesky by [Olaf Moriarty Solstrand](https://olafmoriarty.com).

The project is based on [Cheap Bots, Done Quick](https://cheapbotsdonequick.com) by [v buckenham](https://v21.com).

Live version: https://bluebotsdonequick.com - go there to build your own bot if you want to. It's free and easy (if you know Tracery)!

Think you can do better? You probably can! Feel free to borrow or steal as much of this code as you want to.

## Installation
The frontend is written in React using TypeScript and Vite. The backend is written in PHP with a MySQL database.

### Backend
In the `backend` folder, create a file named `secrets.php`. For security reasons this file is not included in the repo, but you can use the `secrets-template.php` file as a template on how to fill it in.

Set up a MySQL database and add its hostname, database name, username and password to `secrets.php`. After doing that, open `backend/install-mysql.php` in a browser to generate the MySQL table used in the bot. This file should be run on first install and whenever you update BBDQ to a newer version.

Set up a cron job that runs `bot.php` every five minutes, another cron job that runs `reply-bot.php` every five minutes, a third cron job that runs `profiler-bot.php` as often as you wish to fetch avatars, display names and follower counts (mine runs once an hour).

Install ImageMagick, imagick and an RSVG library. These are required to convert user-generated SVG images to Bluesky-friendly PNGs.

It may be a good idea to increase the max_execution_time in your PHP.ini.

### Frontend
Install dependencies using `npm install` and then build it like you normally would.

Set the variable `backendURI` in the `src/App.tsx` file to the correct path to your backend script.
