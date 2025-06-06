import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BotPreviewType from "../types/BotPreviewType";
import { usePage } from "../context/PageContext";
import BotPreview from "./BotPreview";
import Title from "./Title";

const Source = () => {
	const params = useParams();
	const {identifier} = params;
	const [data, setData] = useState(undefined as BotPreviewType[]|undefined);
	const {backendURI} = usePage();

	useEffect(() => {
		if (!identifier) {
			return;
		}
		getBot(identifier)
		.then((res : BotPreviewType[]) => {
			setData(res);
		});

	}, [identifier]);

	const getBot = async (handle : string) => {
		const res = await fetch( backendURI + '?mode=list&handle=' + encodeURIComponent(handle) );
		const json = await res.json();
		return json.data;
	}

	if (!identifier) {
		return <main>
			<Title>Bot not found</Title>
			<h2>What are you looking for?</h2>
			<p>No bot identifier specified.</p>
			<p><Link to="/bots/">Back to bot list</Link></p>
			<p><Link to="/">Back to front page</Link></p>
		</main>
	}
	
	if (data === undefined) {
		return <main>
			<Title>{identifier}</Title>
			<h2>{identifier}</h2>
			<p className="loading">Loading information...</p>
		</main>
	}

	if (data.length < 1) {
		return <main>
			<Title>Bot not found</Title>
			<p>Sorry, I could not find a bot with the handle <strong>{identifier}</strong>.</p>
			<p><Link to="/bots/">Back to bot list</Link></p>
			<p><Link to="/">Back to front page</Link></p>
		</main>
	}

	const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	const el = data[0];
	const created = new Date(el.activeSince);

	return (
		<main>
			<Title>{el.name || identifier}</Title>
			<h2>{el.name || identifier}</h2>
			<p><a href={`https://bsky.app/profile/${el.did}`} className="button" target="_blank">{identifier}</a></p>
			<h3>Last post generated</h3>
			<BotPreview element={el} />
			<h3>Metadata</h3>
			<ul>
			<li>This bot has <strong>{el.followers}</strong> followers. <em>(updated hourly)</em></li>
			<li>This bot was created <strong>{`${monthNames[created.getMonth()]} ${created.getDate()} ${created.getFullYear()}, ${created.getHours()}:${created.getMinutes()}`}</strong>.</li>
			</ul>

			<h3>Source code</h3>
			{el.script ? <div className="source-code">{el.script}</div> : <p>Sorry, the source code of this bot is not public.</p>}
			<p className="back"><Link to="/bots/">Back to bot list</Link></p>

		</main>
	);
}

export default Source;