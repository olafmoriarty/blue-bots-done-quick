import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePage } from "../context/PageContext";
import BotPreviewType from "../types/BotPreviewType";

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

	useEffect(() => {
		console.log(popularBots);
	}, [popularBots]);

	const getBots = async (sort? : string, limit = 20) => {
		let queryString = '';
		if (sort === 'activeSince') {
			queryString += '&sort=activeSince';
		}
		queryString += '&count=' + limit;
		const res = await fetch( backendURI + '?mode=list' + queryString );
		const json = await res.json();
		return json.data;
	}

	const BotList = (botListProps : { list : BotPreviewType[] }) => {
		return (
		<ol>
		{botListProps.list.map(el => <li key={el.identifier} className="bluesky-post-top-row">
				<a href={`https://bsky.app/profile/${el.did}`} target="_blank">{el.thumb ? <img src={el.thumb} alt={el.identifier} className="bluesky-post-avatar" /> : <div className="bluesky-post-avatar no-avatar" />}</a>
				<div className="bluesky-post-name-and-handle">
					<p className="bluesky-post-name"><a href={`https://bsky.app/profile/${el.did}`} target="_blank">{el.name || el.identifier}</a></p>
					<p className="bluesky-post-handle"><a href={`https://bsky.app/profile/${el.did}`} target="_blank">{el.identifier}</a></p>
					{el.script ? <p className="bluesky-post-source-link"><Link to={`/bots/${el.identifier}`}>View source ...</Link></p> : null}
				</div>

		</li>)}
		</ol>
		);

	}

	return (
		<main className="front-page">
			<div className="front-page-info">
				<p>Create your own Bluesky bot! This site will help you make a bot for Bluesky using Tracery, a tool for writing generative grammars created by <a href="https://galaxykate.com" target="_blank">Kate Compton</a>. It is completely free and relatively easy to use.</p>
				<p>This site is run by <a href="https://olafmoriarty.com">Olaf Moriarty Solstrand</a> and based on the original magnificent twitterbot tool <a href="https://cheapbotsdonequick.com"><em>Cheap Bots, Done Quick</em></a> by the  awesome <a href="https://v21.io" target="_blank">v buckenham</a>. If you have any problems using this site, you can contact me at <a href="mailto:olafmoriarty@gmail.com">olafmoriarty at gmail dot com</a>, or <a href="https://github.com/olafmoriarty/blue-bots-done-quick/issues" target="_blank">post an issue in the project's GitHub repo.</a></p>

			</div>
			<section className="buttons">
				<Link to="/create" className="button">Create a Bluesky bot</Link>
				<Link to="/edit" className="button">Edit your bot</Link>
			</section>
			<p className="back"><Link to="/demo">View a demo</Link></p>
			{
				popularBots.length ?
				<>
					<div className="front-page-columns">

					<section className="bot-grid">
					<h2>Popular BBDQ bots</h2>
					<p className="view-all"><Link to="/bots">View all ...</Link></p>
					<BotList list={popularBots} />
					</section>

					<section className="bot-grid">
					<h2>New BBDQ bots</h2>
					<p className="view-all"><Link to="/bots?sort=activeSince">View all ...</Link></p>
					<ol>
					<BotList list={newBots} />
					</ol>
					</section>

					</div>
				</>
				:
				null
			}
		</main>
	)
}

export default FrontPage;