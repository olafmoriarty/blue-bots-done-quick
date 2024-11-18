import { useState } from "react";
import { usePage } from "../context/PageContext";
import { Link } from "react-router-dom";

const CreateBot = () => {
	const {attemptLogin, isWorking} = usePage(); 
	const [step, setStep] = useState(0);
	const [providerFieldActive, setProviderFieldActive] = useState(false);
	const [provider, setProvider] = useState('https://bsky.social');
	const [identifier, setIdentifier] = useState('');
	const [password, setPassword] = useState('');

	const steps = [
		<>
			<h3><strong>Step one:</strong> Create a Bluesky account for your bot!</h3>
			<ul>
			<li>Go to <a href="https://bsky.app" target="_blank">Bluesky</a>. If you're logged in, log out.</li>
			<li>Click the "Sign up" button to register a new account.</li>
			<li>Complete the account registration process with the handle you want to use for your bot.</li>
			<li>Enter your bot account's handle in the input field below.</li>
			</ul>
			<form onSubmit={(ev) => {
				ev.preventDefault();
				setStep(1);
			}}>
				<p><label htmlFor="provider-input"><strong>Provider:</strong></label><br />
				{providerFieldActive ? <input type="text" id="provider-input" value={provider} onChange={(ev) => setProvider(ev.target.value)} /> : <>https://bsky.social (<button className="link" type="button" onClick={() => setProviderFieldActive(true)}>edit</button>)</>}</p>

				<p><label><strong>Bluesky handle:</strong><br />
				<input type="text" placeholder="myawesomebot.bsky.social" value={identifier} onChange={(ev) => setIdentifier(ev.target.value)} required /></label></p>
				<p className="proceed"><button type="submit">Proceed</button></p>
			</form>
			<p><em>(If you want to use your own domain as a handle, you can either change the handle before creating your bot, or use the temporary .bsky.social for now and change it later. <a href="https://bsky.social/about/blog/4-28-2023-domain-handle-tutorial" target="_blank">Here's how to set your domain as a handle</a>)</em></p>
		</>,
		<>
			<h3><strong>Step two:</strong> Create an app password!</h3>
			<ul>
			<li>While logged in to Bluesky with your bot user, click Settings and scroll down to <a href="" target="_blank">App Passwords</a>.</li>
			<li>Click the "Add App Password" button. It does not matter which unique name you give the password, so the randomly generated one will work fine.</li>
			<li>Leave the "Allow access to direct messages" checkbox unchecked.</li>
			<li>Click "Create App Password", and copy the generated app password.</li>
			<li>Paste the app password in the input field below.</li>
			</ul>
			<form onSubmit={(ev) => {
				ev.preventDefault();
				attemptLogin(provider, identifier, password);
			}}>
				<p><label><strong>App password:</strong><br />
				<input type="password" placeholder="abcd-efgh-ijkl-mnop" value={password} onChange={(ev) => setPassword(ev.target.value)} required /></label></p>
				<p className="proceed"><button type="submit">Generate bot</button></p>
			</form>

			<p><em>Your app password will be stored in a database on the BBDQ server along with the Bluesky handle in an encrypted format.</em></p>	
		</>
	];

	if (isWorking) {
		return (
		<main>
			<p className="updating">Logging in...</p>
		</main>
		)
	}


	return (
		<main>
			<div className="create-bot">
				<h2>Create a bot</h2>
				{steps[step]}
			</div>
			<p className="back"><Link to="/">Go back</Link></p>
		</main>
	)
}

export default CreateBot;