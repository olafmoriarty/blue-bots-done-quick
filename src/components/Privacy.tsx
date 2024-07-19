const Privacy = () => {
	return (
		<main>
			<h2>Terms of use</h2>
			<p>Follow the terms of Bluesky. Don't be an asshole. Don't use this tool to be an asshole. Use common sense. Apart from that, have fun!</p>
			<h2>Cookies</h2>
			<p>No cookies are used on this website.</p>
			<h2>Privacy</h2>
			<p>This website is run by <a href="https://olafmoriarty.com" target="_blank">Olaf Moriarty Solstrand</a> (olafmoriarty@gmail.com).</p>
			<p>Like any other web server, this website has access logs. Should I decide to actually look at those logs, they hold information about your IP address, at what time you visited the website, what browser you're using, and which website you came here from.</p>
			<p>If you create a bot, all information you enter about this bot will be stored in a database. This includes:</p>
			<ul>
				<li>your Bluesky handle, provider, DID, display name, avatar URL, password (encrypted - see below) and number of followers</li>
				<li>your bot's Tracery code, and which Tracery rules will be used to generate posts and replies</li>
				<li>whether your bot is active, and at what time  you activated it for the first time</li>
				
				<li>which language the bot is posting in</li>
				<li>how often your bot is posting</li>
				<li>the last post that was generated, and at what time it was generated</li>
				<li>the last time your bot got a Bluesky notification</li>
				<li>whether you've allowed other users to read your source code</li>
			</ul>
			<p>Your app password will be encrypted, so if anyone manages to get a hold of the database and looks through the information stored there, they can't see your password. <strong>However,</strong> since the bot needs to read your password to post to your account, the password is <strong>not</strong> hashed, only encrypted, meaning that anyone with access to the BBDQ server (and by "anyone" I really mean me, it's just me) can find the encryption key and in theory use it to gain access to your Bluesky account, which includes seeing what e-mail address you've used to create the bot. I wouldn't do that, of course, but it's theoretically possible.</p>
			<p>You can delete the bot at any time by logging in and clicking "Delete bot". If you do so, all information about your bot is permanently deleted. From your bot's Bluesky settings you can also delete the app password so that BBDQ loses all access you your Bluesky account.</p>
			<h3>Third parties</h3>
			<p><a href="https://bsky.social/about/support/privacy-policy" target="_blank">Bluesky's privacy policy</a></p>
		</main>
	)
}

export default Privacy;