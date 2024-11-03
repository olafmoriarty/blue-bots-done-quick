import { useEffect, useState } from 'react';
import tracery from 'tracery-grammar';
import { usePage } from '../App';
import ErrorMessage from './ErrorMessage';
import DeleteBot from './DeleteBot';
import languages from '../data/languages.json';

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

	const {botSettings, loginDetails, backendURI, logOut} = usePage();

	const [grammar, setGrammar] = useState( null as ReturnType<typeof tracery.createGrammar> | null );
	const [script, setScript] = useState(botSettings?.script || defaultCode);
	const [parsingError, setParsingError] = useState(false);
	const [origin, setOrigin] = useState(botSettings?.msg || 'origin');
	const [reply, setReply] = useState(botSettings?.reply || 'origin');
	const [minutesBetweenPosts, setMinutesBetweenPosts] = useState(botSettings?.minutesBetweenPosts || 720);
	const [active, setActive] = useState(botSettings?.active);
	const [language, setLanguage] = useState(botSettings?.language || "en");
	const [actionIfLong, setActionIfLong] = useState(botSettings?.actionIfLong || false);
	const [showSource, setShowSource] = useState(botSettings?.showSource || false);

	const [error, setError] = useState('');
	const [isFetching, setIsFetching] = useState(false);

	const [showDeleteForm, setShowDeleteForm] = useState(false);

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
//		return;
	}

	const updateBot = async (activate : boolean) => {
		if (!loginDetails) {
			return;
		}
		setError('');
		setIsFetching(true);

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
			showSource: showSource,
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
		if (!json.status) {
			setError(json.error);
		}
		setIsFetching(false);
	}

	const stripImagesRegex = /\{(img|svg)(?:[  ]((?:[^}]|(?<=\\\\)})*))?}/g;

	return (
		<main className="main-content">
			{loginDetails && botSettings ? null : <p className="error">This is just a demo! You can experiment with these settings as much as you want to get an impression of how this website works, but you won't actually be able to save anything. To go back to the frontpage and create a bot, <button className="link" onClick={() => logOut()}>click here</button>.</p>}
			<h2>Settings for {botSettings?.identifier || loginDetails?.identifier || "demobot.bsky.social"}</h2>
			<section className="tracery-input">
				<h3>Your bot's Tracery code</h3>
				<textarea value={script} onChange={(ev) => updateScript(ev.target.value)} />
				<p className="back"><a href="#instructions">Insert images, SVGs and hashtags</a></p>
			</section>
			{parsingError || !grammar ? <p className="error"><strong>Error:</strong> The JSON code you've entered is not valid.</p> : <>
				<section className="trace">
					<h3>Main Tracery rule (the one used when your bot is posting)</h3>
					<select value={origin} onChange={(ev) => setOrigin(ev.target.value)}>{Object.keys(JSON.parse(script)).map((el, index) => <option key={index}>{el}</option>)}</select>
				</section>
				<section className="preview">
					<p className="floff">{grammar?.flatten(`#${origin}#`).replace(stripImagesRegex, '[Image]')}</p>
					<p className="floff">{grammar?.flatten(`#${origin}#`).replace(stripImagesRegex, '[Image]')}</p>
					<p className="floff">{grammar?.flatten(`#${origin}#`).replace(stripImagesRegex, '[Image]')}</p>
				</section>
				<section className="trace">
					<h3>Reply Tracery rule (the one used when your bot replies to mentions)</h3>
					<select value={reply} onChange={(ev) => setReply(ev.target.value)}>{Object.keys(JSON.parse(script)).map((el, index) => <option key={index}>{el}</option>)}</select>
				</section>
				<section className="preview">

					<p className="floff">{grammar?.flatten(`#${reply}#`).replace(/\{img (https?:\/\/[^ }]+) ?([^}]*)}/g, '[Image]')}</p>
					<p className="floff">{grammar?.flatten(`#${reply}#`).replace(/\{img (https?:\/\/[^ }]+) ?([^}]*)}/g, '[Image]')}</p>
					<p className="floff">{grammar?.flatten(`#${reply}#`).replace(/\{img (https?:\/\/[^ }]+) ?([^}]*)}/g, '[Image]')}</p>
				</section>

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
					{languages.sort((a, b) => a.name < b.name ? -1 : 1).map(el => <option value={el.code} key={el.code}>{el.name}</option>)}
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
				<h3>Share your code?</h3>
				<p><label><input type="checkbox" checked={showSource} onChange={() => setShowSource(old => !old)}  /> Allow other users to read the source code of my bot</label></p>
			</section>
			<ErrorMessage error={error} />
			{isFetching ? <p className="updating">Updating bot ...</p> : <section className="buttons">
				<button type="button" onClick={() => updateBot(true)}>{active ? "Update bot" : "Save settings and activate bot"}</button>
				<button className="less-attractive-button" type="button" onClick={() => updateBot(false)}>{active ? "Temporarily deactivate bot" : "Save as draft, don't activate bot yet"}</button>
				{showDeleteForm ? null : <button className="big-red-button" type="button" onClick={() => {
				if (loginDetails) {
					setShowDeleteForm(true)
				}
				}}>Delete bot</button>}
			</section>}
			{showDeleteForm ? <DeleteBot /> : null}
			</>}
			<div className="form-instructions" id="instructions">
					<p>To include images (JPEG or PNG, max 1 MB), add <code>{"{img https://url.to/the-image Alt text}"}</code> to your output string.</p>
					<p>To include SVG images, add <code>{"{svg <svg [...]>[...]</svg> Alt text}"}</code> to your output string. Note that quotation marks must be escaped using backslashes - instead of e.g. <code>width="300"</code>, type <code>width=\"300\"</code>.</p>
					<p>URLs and mentions are converted into links. <strong>Don't</strong> abuse the mentions. Hashtags work as long as you escape the octothorpe symbol using double backslashes: <code>\\#hashtag</code>.</p>
				</div>
			<p className="back"><button onClick={() => logOut()}>Log out</button></p>
		</main>
  )
}

export default EditBot;