import { useEffect, useState } from 'react';
import tracery from 'tracery-grammar';

import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCog, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

import { usePage } from "../context/PageContext";
import ErrorMessage from './ErrorMessage';
import DeleteBot from './DeleteBot';
import languages from '../data/languages.json';
import Preview from './Preview';
import { Link, useNavigate } from 'react-router-dom';
import HighlightedTextarea from './HighlightedTextarea';
import TraceryWysiwygEditor from './TraceryWysiwigEditor';
import phpdate from '../utils/phpdate';


function EditBot(props : {demo? : boolean}) {

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

	const navigate = useNavigate();

	const [grammar, setGrammar] = useState( null as ReturnType<typeof tracery.createGrammar> | null );
	const [script, setScript] = useState(botSettings?.script || defaultCode);
	const [parsingError, setParsingError] = useState(false);
	const [origin, setOrigin] = useState(botSettings?.msg || 'origin');
	const [reply, setReply] = useState(botSettings?.reply || '');
	const [minutesBetweenPosts, setMinutesBetweenPosts] = useState(botSettings?.minutesBetweenPosts || 720);
	const [active, setActive] = useState(botSettings?.active);
	const [language, setLanguage] = useState(botSettings?.language || "en");
	const [actionIfLong, setActionIfLong] = useState(botSettings?.actionIfLong || false);
	const [showSource, setShowSource] = useState(botSettings?.showSource || false);
	const [previewText, setPreviewText] = useState('');
	const [replyPreviewText, setReplyPreviewText] = useState('');

	const [error, setError] = useState('');
	const [isFetching, setIsFetching] = useState(false);

	const [showDeleteForm, setShowDeleteForm] = useState(false);

	const [editorMode, setEditorMode] = useState('wysiwyg' as 'wysiwyg'|'json');
	const [showEditorSettings, setShowEditorSettings] = useState(false);
	const [syntaxHighlighting, setSyntaxHighlighting] = useState(false);
	const [separator, setSeparator] = useState("\n");

	// Get editor mode from localStorage
	useEffect(() => {
		const storedEditorMode = localStorage.getItem('editorMode');
		if (storedEditorMode && (storedEditorMode === 'wysiwyg' || storedEditorMode === 'json')) {
			setEditorMode(storedEditorMode);
		}
		const storedHighlightingMode = localStorage.getItem('syntaxHighlighting');
		if (storedHighlightingMode && (storedHighlightingMode === '0')) {
			setSyntaxHighlighting(false);
		}
		else {
			setSyntaxHighlighting(true);
		}
		const storedSeparator = localStorage.getItem('separator');
		if (storedSeparator) {
			setSeparator(storedSeparator);
		}
	}, []);

	useEffect(() => {
		if (!props.demo && !botSettings) {
			navigate('/login');
		}
	
		if (!grammar) {
			updateScript();
		}
	}, []);

	useEffect(() => {
		setPreviewText(grammar?.flatten(`#${origin}#`) || '');
	}, [grammar, origin]);

	useEffect(() => {
		setReplyPreviewText(grammar?.flatten(`#${reply}#`) || '');
	}, [grammar, reply]);

	const changeEditorMode = (mode : 'wysiwyg'|'json') => {
		setEditorMode(mode);
		localStorage.setItem('editorMode', mode);
	}

	const changeSyntaxHighlighting = (mode : boolean) => {
		setSyntaxHighlighting(mode);
		localStorage.setItem('syntaxHighlighting', mode ? '1' : '0');
	}

	const changeSeparator = (newSeparator : string) => {
		setSeparator(newSeparator);
		localStorage.setItem('separator', newSeparator);
	}

	const updateScript = (inputText? : string) => {
		let text = script;
		if (inputText !== undefined) {
			text = inputText;
			setScript(text);
		}

		try {

			let updatedValues = JSON.parse(text);

			Object.keys(updatedValues).forEach((rule) => updatedValues[rule] = typeof updatedValues[rule] === 'string' ? preprocessDates(updatedValues[rule]) : updatedValues[rule].map((el : string) => preprocessDates(el)));
			Object.keys(updatedValues).forEach((rule) => updatedValues[rule] = typeof updatedValues[rule] === 'string' ? preprocessItems(updatedValues[rule], updatedValues) : updatedValues[rule].map((el : string) => preprocessItems(el, updatedValues)));

			const grammar = tracery.createGrammar(updatedValues);
			grammar.addModifiers(tracery.baseEngModifiers);
			setGrammar( grammar );
			setParsingError(false);
		}
		catch (e) {
			console.log(e);
			setParsingError(true);
		}
	}

	const dateReplacer = (dateString : string, date : string) => {
		if (!dateString) {
			return '';
		}
		return phpdate(date);
	}

	const preprocessDates = (text : string) => {
		let newText = text;
		const d = new Date();
		const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		newText = newText.replaceAll('{hour}', d.getHours().toString());
		newText = newText.replaceAll('{month}', d.getHours().toString() + 1);
		newText = newText.replaceAll('{monthName}', months[d.getHours()]);
		newText = newText.replaceAll('{weekday}', d.getDay().toString());
		newText = newText.replaceAll('{weekdayName}', days[d.getDay()]);
		newText = newText.replace(/\{date ([^}]+)\}/g, dateReplacer);
		newText = newText.replaceAll(/\{n(?: (?:mod|\%) (\d+))?\}/g, '0');
		return newText;
	}

	const preprocessItems = (text : string, rules : { [key : string]: string|string[] }) => {
		let newText = text;
		newText = newText.replaceAll(/\{item #([^ \}]+)# (\d+|\\\[date\\\])\}/g, (ignoreThis, rule, number) => {
			if (!ignoreThis) {
				return '';
			}
			if (!rules[rule]) {
				return '';
			}
			return rules[rule][(number === '\\[date\\]' ? 0 : Number(number)) % rules[rule].length]
		});
		return newText;
	}

	if (!loginDetails || !botSettings) {
//		return;
	}

	const updateBot = async (activate : boolean, postNow? : boolean) => {
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
			postNow: postNow ? true : false,
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

	return (
		<main className="main-content">
			{loginDetails && botSettings ? null : <p className="error">This is just a demo! You can experiment with these settings as much as you want to get an impression of how this website works, but you won't actually be able to save anything. To go back to the frontpage and create a bot, <Link to="/">click here</Link>.</p>}
			<section className="settings-heading">
			<h2>Settings for {botSettings?.identifier || loginDetails?.identifier || "bbdqtestbot.bsky.social"}</h2>
			<p><button className="link" onClick={() => logOut('/login')}>Log out ...</button></p>
			</section>
			<section className="tracery-input">
				<h3>Your bot's Tracery code</h3>
				<div className="tracery-mode-tags">
					<button className={`wysiwyg-button ${parsingError ? 'button-not-active' : ''} ${editorMode === 'wysiwyg' ? 'active' : ''}`} onClick={!parsingError ? () => changeEditorMode('wysiwyg') : undefined}>Editor view</button>
					<button className={`json-button ${editorMode === 'json' ? 'active' : ''}`} onClick={() => changeEditorMode('json')}>JSON view</button>
					<a className="help-button" href="/help/" target="_blank"><Icon icon={faQuestionCircle} /></a>
					<button className="cog-button" onClick={() => setShowEditorSettings(oldValue => !oldValue)}><Icon icon={faCog} /></button>
					{showEditorSettings ? <div className="mode-settings">
						<h4>Mode</h4>
						<article><label><input type="radio" name="editor-mode" checked={editorMode === 'wysiwyg' ? true : false} onChange={!parsingError ? () => changeEditorMode('wysiwyg') : undefined} /> Editor view</label></article>
						<article><label><input type="radio" name="editor-mode" checked={editorMode === 'json' ? true : false}  onChange={() => changeEditorMode('json')} /> JSON view</label></article>
						<h4>Syntax highlighting</h4>
						<article><label><input type="radio" name="syntax-highlighting" checked={syntaxHighlighting} onChange={() => changeSyntaxHighlighting(true)} /> On</label></article>
						<article><label><input type="radio" name="syntax-highlighting" checked={!syntaxHighlighting} onChange={() => changeSyntaxHighlighting(false)} /> Off</label></article>
						{editorMode === 'wysiwyg' ? <>
						<h4>Separator</h4>
						<article><label><input type="radio" name="editor-separator" checked={separator === "\n"} onChange={() => changeSeparator("\n")} /> Newline</label></article>
						<article><label><input type="radio" name="editor-separator" checked={separator === "\n\n"} onChange={() => changeSeparator("\n\n")} /> Double newline</label></article>
						<article><label><input type="radio" name="editor-separator" checked={separator === '{{SEPARATOR}}'} onChange={() => changeSeparator('{{SEPARATOR}}')} /> {"{{SEPARATOR}}"}</label></article></> : null}
					</div> : null}
				</div>
				{editorMode === 'wysiwyg' ? 
					<TraceryWysiwygEditor script={script} updateScript={updateScript} origin={origin} highlighting={syntaxHighlighting} separator={separator} /> 
				: 
					<HighlightedTextarea script={script} updateScript={updateScript} highlighting={syntaxHighlighting} />
				}
				
				
				<p className="back"><a href="#instructions">Insert images, SVGs and hashtags</a></p>
			</section>
			{parsingError || !grammar ? <p className="error"><strong>Error:</strong> The JSON code you've entered is not valid.</p> : <>
				<section className="trace">
					<h3>Main Tracery rule (the one used when your bot is posting)</h3>
					<select value={origin} onChange={(ev) => setOrigin(ev.target.value)}>{Object.keys(JSON.parse(script)).map((el, index) => <option key={index}>{el}</option>)}</select>
					<h3>Post preview</h3>
				<Preview text={previewText} handle={botSettings?.identifier || loginDetails?.identifier || "bbdqtestbot.bsky.social"} avatar={botSettings?.thumb} botName={botSettings?.name} showAlts={true} />
				<p className="back"><button onClick={() => setPreviewText(grammar?.flatten(`#${origin}#`) || '')}>Reroll...</button></p>
				</section>
				<section className="trace">
					<h3>Reply Tracery rule (the one used when your bot replies to mentions)</h3>
					<select value={reply} onChange={(ev) => setReply(ev.target.value)}><option key="none" value="">Do not post replies</option>{Object.keys(JSON.parse(script)).map((el, index) => <option key={index}>{el}</option>)}</select>
					{reply ? <>
						<h3>Reply preview</h3>
						<Preview text={replyPreviewText} handle={botSettings?.identifier || loginDetails?.identifier || "bbdqtestbot.bsky.social"} avatar={botSettings?.thumb} botName={botSettings?.name} showAlts={true} />
						<p className="back"><button onClick={() => setReplyPreviewText(grammar?.flatten(`#${reply}#`) || '')}>Reroll...</button></p>
					</> : null}
					</section>

			<section className="settings">
				<h3>Posting frequency</h3>
				<select value={minutesBetweenPosts} onChange={(ev) => setMinutesBetweenPosts(parseInt(ev.target.value))}>
					<option value={0}>Never</option>
					<option value={10}>Every 10 minutes</option>
					<option value={30}>Every 30 minutes</option>
					<option value={60}>Every hour</option>
					<option value={120}>Every 2 hours</option>
					<option value={180}>Every 3 hours</option>
					<option value={240}>Every 4 hours</option>
					<option value={360}>Every 6 hours</option>
					<option value={480}>Every 8 hours</option>
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
				<button type="button" onClick={() => updateBot(active ? true : false, true)}>{active ? "Save and post now" : "Save as draft and post now"}</button>
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
					<p>To include SVG images, add <code>{"{svg <svg [...]>[...]</svg> Alt text}"}</code> to your output string.</p>
					<ul>
						<li>Note that quotation marks must be escaped using backslashes - instead of e.g. <code>width="300"</code>, type <code>width=\"300\"</code>.</li><li>Also note that the <code>{"<foreignObject>"}</code> tag <strong>is not supported</strong> (sorry) and that including external files, e.g. in <code>{"<image>"}</code> tags, only work if you use the <code>xlink:href</code> attribute (using plain href instead will not work).</li></ul>
					<p>You can also use <code>{"{alt Alt text}"}</code> to add alt text, if you prefer that syntax. Alt texts added this way will always be attached to the previous img or svg displayed, and will overwrite any already existing alt text.</p>
					<p>URLs and mentions are converted into links. <strong>Don't</strong> abuse the mentions. Hashtags work as long as you escape the octothorpe symbol using double backslashes: <code>\\#hashtag</code>.</p>
				</div>
			<p className="back"><Link to="/">Back</Link></p>
		</main>
  )
}

export default EditBot;