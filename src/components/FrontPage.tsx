import { usePage } from "../App";

const FrontPage = () => {
	const {setPage} = usePage(); 
	return (
		<main className="front-page">
			<div className="front-page-info">
				<p>Create your own Bluesky bot! This site will help you make a bot for Bluesky using Tracery, a tool for writing generative grammars created by <a href="https://galaxykate.com" target="_blank">Kate Compton</a>. It is completely free and relatively easy to use.</p>
				<p>This site is run by <a href="https://olafmoriarty.com">Olaf Moriarty Solstrand</a> and based on the original magnificent twitterbot tool <a href="https://cheapbotsdonequick.com"><em>Cheap Bots, Done Quick</em></a> by the  awesome <a href="https://v21.io" target="_blank">v buckenham</a>. If you have any problems using this site, you can contact me at <a href="mailto:olafmoriarty@gmail.com">olafmoriarty at gmail dot com</a>, or <a href="https://github.com/olafmoriarty/blue-bots-done-quick/issues" target="_blank">post an issue in the project's GitHub repo.</a></p>

			</div>
			<section className="buttons">
				<button onClick={() => setPage('create')}>Create a Bluesky bot</button>
				<button onClick={() => setPage('login')}>Edit your bot</button>
			</section>
			<h2>Popular BBDQ bots</h2>
			<h2>New BBDQ bots</h2>
		</main>
	)
}

export default FrontPage;