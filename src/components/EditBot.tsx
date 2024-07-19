import { useEffect, useState } from 'react';
import tracery from 'tracery-grammar';
import { usePage } from '../App';

function EditBot() {

const defaultCode = `{
    "origin": [
        "The #adjective# #adjective# #animal# #verbed# over the #adjective# #adjective# #animal#.",
        "#greeting.capitalize#, #location#!"
    ],
    "animal": ["dog", "cat", "squirrel", "fox", "bear", "pig", "seagull"],
    "adjective": ["quick", "slow", "brown", "dark", "mysterious", "magical", "explosive", "foreign", "invisible"],
    "verbed": ["jumped", "stepped", "bounced", "flew", "soared"],

    "greeting": ["hello", "ahoy there", "goooood morning", "hi", "merry Christmas"],
    "location": ["World", "Earth", "Jupiter", "Odalen", "galaxy", "Gallifrey", "Sesame Street"]
}`;

	const {botSettings, loginDetails, backendURI} = usePage();

	const [grammar, setGrammar] = useState( null as ReturnType<typeof tracery.createGrammar> | null );

	const [script, setScript] = useState(botSettings?.script || defaultCode);
	const [parsingError, setParsingError] = useState(false);
	const [origin, setOrigin] = useState(botSettings?.msg || 'origin');
	const [reply, setReply] = useState(botSettings?.reply || 'origin');
	const [minutesBetweenPosts, setMinutesBetweenPosts] = useState(botSettings?.minutesBetweenPosts || 720);
	const [active, setActive] = useState(botSettings?.active);
	const [language, setLanguage] = useState(botSettings?.language || "en");
	const [actionIfLong, setActionIfLong] = useState(botSettings?.actionIfLong || false);

	useEffect(() => {
		if (!grammar) {
			updateScript();
		}
	}, []);

	const updateScript = (inputText? : string) => {
		let text = script;
		if (inputText) {
			text = inputText;
			setScript(text);
		}

		try {
			const grammar = tracery.createGrammar(JSON.parse(text));
			grammar.addModifiers(tracery.baseEngModifiers);
			setGrammar( grammar );
			setParsingError(false);
		}
		catch {
			setParsingError(true);
		}
	}

	if (!loginDetails || !botSettings) {
		return;
	}

	const updateBot = async (activate : boolean) => {
		if (activate) {
			setActive(true);
		}
		else {
			setActive(false);
		}

		const body = JSON.stringify({
			mode: 'edit',
			provider: loginDetails.provider,
			identifier: loginDetails.identifier,
			password: loginDetails.password,
			script: script,
			msg: origin,
			reply: reply,
			active: activate,
			minutesBetweenPosts: minutesBetweenPosts,
			language: language,
			actionIfLong: actionIfLong,

		});
		const res = await fetch( backendURI, {
			method: 'PATCH',
			body: body,
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json",
			}
		});
		const json = await res.json();
		console.log(json);
	}

	return (
		<main className="main-content">
			<h2>Settings for {botSettings?.identifier || loginDetails.identifier}</h2>
			<section className="tracery-input">
				<h3>Your bot's Tracery code</h3>
				<textarea value={script} onChange={(ev) => updateScript(ev.target.value)} />
			</section>
			{parsingError ? <p className="error"><strong>Error:</strong> The JSON code you've entered is not valid.</p> : <>
				<section className="trace">
					<h3>Main Tracery rule (the one used when your bot is posting)</h3>
					<select value={origin} onChange={(ev) => setOrigin(ev.target.value)}>{Object.keys(JSON.parse(script)).map((el, index) => <option key={index}>{el}</option>)}</select>
				</section>
				<section className="preview">
					<p className="floff">{grammar?.flatten(`#${origin}#`)}</p>
					<p className="floff">{grammar?.flatten(`#${origin}#`)}</p>
					<p className="floff">{grammar?.flatten(`#${origin}#`)}</p>
				</section>
				<section className="trace">
					<h3>Reply Tracery rule (the one used when your bot replies to mentions)</h3>
					<select value={reply} onChange={(ev) => setReply(ev.target.value)}>{Object.keys(JSON.parse(script)).map((el, index) => <option key={index}>{el}</option>)}</select>
				</section>
				<section className="preview">

					<p className="floff">{grammar?.flatten(`#${reply}#`)}</p>
					<p className="floff">{grammar?.flatten(`#${reply}#`)}</p>
					<p className="floff">{grammar?.flatten(`#${reply}#`)}</p>
				</section>
			</>}

			<section className="settings">
				<h3>Posting frequency</h3>
				<select value={minutesBetweenPosts} onChange={(ev) => setMinutesBetweenPosts(parseInt(ev.target.value))}>
					<option value={10}>Every 10 minutes</option>
					<option value={30}>Every 30 minutes</option>
					<option value={60}>Every hour</option>
					<option value={120}>Every 2 hours</option>
					<option value={360}>Every 6 hours</option>
					<option value={720}>Every 12 hours</option>
					<option value={1440}>Every 24 hours</option>
					<option value={2880}>Every 48 hours</option>
					<option value={10080}>Every week</option>
				</select>
				<h3>Post language</h3>
				<select value={language} onChange={(ev) => setLanguage(ev.target.value)}>
					<option value="en">English</option>
				</select>
				<h3>If a generated post is more than 300 characters long...</h3>
				<p><label><input 
					type="radio" 
					name="actionIfLong" 
					value="retry"
					checked={!actionIfLong}
					onChange={() => setActionIfLong(false)}
				/> Try regenerating a shorter post text (max 10 attempts)</label></p>
				<p><label><input 
					type="radio" 
					name="actionIfLong" 
					value="thread"
					checked={actionIfLong}
					onChange={() => setActionIfLong(true)}
				/> Split text into chunks and post as a thread</label></p>
			</section>
			<button type="button" onClick={() => updateBot(true)}>{active ? "Update bot" : "Save settings and activate bot"}</button>
			<button className="less-attractive-button" type="button" onClick={() => updateBot(false)}>{active ? "Temporarily deactivate bot" : "Save settings, don't activate yet"}</button>
			<button className="big-red-button" type="button">Delete bot</button>
		</main>
  )
}

export default EditBot;