import { useEffect, useState } from "react";
import { usePage } from "../App";
import BotPreview from "./BotPreview";

const FrontPage = () => {
	const {backendURI} = usePage();
	const [newBots, setNewBots] = useState([] as BotPreviewType[]);
	const [popularBots, setPopularBots] = useState([] as BotPreviewType[]);

	useEffect(() => {
		getBots()
			.then((res : BotPreviewType[]) => setPopularBots(res));
		getBots('activeSince')
			.then((res : BotPreviewType[]) => setNewBots(res));

	}, []);

	const getBots = async (sort? : string, limit = 10) => {
		let queryString = '';
		if (sort === 'activeSince') {
			queryString += '&sort=activeSince';
		}
		queryString += '&count=' + limit;
		const res = await fetch( backendURI + '?mode=list' + queryString );
		const json = await res.json();
		return json.data;
	}

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
			<p className="back"><button onClick={() => setPage('demo')}>View a demo</button></p>
			{
				popularBots.length ?
				<>
					<h2>Popular BBDQ bots</h2>
					{popularBots.map(el => <BotPreview element={el} />)}
					<p><em>(Follower counts are updated once an hour.)</em></p>
					<h2>New BBDQ bots</h2>
					{newBots.map(el => <BotPreview element={el} />)}
					<p><em>(Display names and avatars are retrieved/updated once an hour.)</em></p>
				</>
				:
				null
			}
		</main>
	)
}

export type BotPreviewType = {
	name? : string,
	did : string,
	identifier : string,
	lastPostText? : string,
	thumb? : string,
	script? : string,
}

export default FrontPage;