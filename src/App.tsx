import './App.css'
import { useState, useEffect } from 'react';
import tracery from 'tracery-grammar';

function App() {

	const defaultCode = JSON.stringify({
		"animal": ["dog", "cat", "squirrel", "fox", "bear", "pig", "seagull"],
		"adj": ["quick", "slow", "brown", "dark", "mysterious", "magical", "explosive", "foreign", "invisible"],
		"verbed": ["jumped", "stepped", "bounced", "flew", "soared"],
		"origin": ["The #adj# #adj# #animal# #verbed# over the #adj# #adj# #animal#."]
	})
	.replace(/^{/, "{\n")
	.replace(/"([^"]+)":(\[[^\]]*\])}$/,  "\t\"$1\": $2\n}")
	.replace(/"([^"]+)":(\[[^\]]+\]\,)/g, "\t\"$1\": $2\n")
	.replace(/"\,"/g, "\", \"");

	const [grammar, setGrammar] = useState( null as ReturnType<typeof tracery.createGrammar> | null );
	const [traceryCode, setTraceryCode] = useState(defaultCode);
	const [parsingError, setParsingError] = useState(false);
	const [origin, setOrigin] = useState('origin');

	useEffect(() => {
		updateTraceryCode(defaultCode);
	}, []);

	const updateTraceryCode = (text : string) => {
		setTraceryCode(text);

		try {
			const grammar = tracery.createGrammar(JSON.parse(text));
			console.log( grammar.flatten('#origin#') )
			setGrammar( grammar );
			setParsingError(false);
		}
		catch {
			setParsingError(true);
		}
	}

	return (
		<>
		<header>
			<h1>Blue Bots, Done Quick</h1>
		</header>
    <div className="wrapper">
		<main className="main-content">
		<section className="tracery-input">
			<h2>Your bot's Tracery code</h2>
			<textarea value={traceryCode} onChange={(ev) => updateTraceryCode(ev.target.value)} />
		</section>
		<section className="trace">
			{parsingError ? null : <>
				<h2>Symbol to expand</h2>
				<select value={origin} onChange={(ev) => setOrigin(ev.target.value)}>{Object.keys(JSON.parse(traceryCode)).map((el) => <option>{el}</option>)}</select>
			</>}

		</section>
		<section className="preview">
			<h2>Preview</h2>
			{parsingError ? <p><strong>Error:</strong> The JSON code you've entered is not valid.</p> : <>
			<p className="floff">{grammar?.flatten(`#${origin}#`)}</p>
			<p className="floff">{grammar?.flatten(`#${origin}#`)}</p>
			<p className="floff">{grammar?.flatten(`#${origin}#`)}</p>
			</>}
		</section>
		<section className="settings">
			<h2>Settings</h2>
			<p>Posting frequency</p>
			<select>
				<option value={10}>Every 10 minutes</option>
				<option value={30}>Every 30 minutes</option>
				<option value={60}>Every hour</option>
				<option value={120}>Every 2 hours</option>
				<option value={360}>Every 6 hours</option>
				<option value={720}>Every 12 hours</option>
				<option value={1440}>Every 24 hours</option>
				<option value={2880}>Every 48 hours</option>
			</select>

		</section>
		<section className="settings">
			<h2>Authentication</h2>

			<p>Service (example: bsky.social)</p>
			<input type="text" value="bsky.social" />

			<p>Handle/username (example: thisismybot.bsky.social)</p>
			<input type="text" />

			<p>App password (for Bluesky, get one <a href="">here</a>)</p>
			<input type="password" />



		</section>
		</main>
    </div>
	</>
  )
}

export default App
