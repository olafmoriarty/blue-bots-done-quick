import { useState } from "react";
import { usePage } from "../context/PageContext";
import ErrorMessage from "./ErrorMessage";
import { Link } from "react-router-dom";
import Title from "./Title";

const LogIn = () => {
	const {error, loginDetails, attemptLogin, isWorking} = usePage();

	const [providerFieldActive, setProviderFieldActive] = useState(false);
	const [provider, setProvider] = useState(loginDetails ? loginDetails.provider : 'https://bsky.social');
	const [identifier, setIdentifier] = useState(loginDetails ? loginDetails.identifier : '');
	const [password, setPassword] = useState(loginDetails ? loginDetails.password : '');
	const [rememberMe, setRememberMe] = useState(false);

	if (isWorking) {
		return (
		<main>
			<p className="updating">Logging in...</p>
		</main>
		)
	}

	return (
		<main>
			<Title>Log in</Title>
			<h2>Log in</h2>
			<ErrorMessage error={error} />
			<form onSubmit={(ev) => {
				ev.preventDefault();
				attemptLogin(provider, identifier, password, rememberMe);
			}}>
				<p><label htmlFor="provider-input"><strong>Provider:</strong></label><br />
				{providerFieldActive ? <input type="text" id="provider-input" value={provider} onChange={(ev) => setProvider(ev.target.value)} /> : <>https://bsky.social (<button className="link" type="button" onClick={() => setProviderFieldActive(true)}>edit</button>)</>}</p>

				<p><label><strong>Bluesky handle:</strong><br />
				<input type="text" placeholder="myawesomebot.bsky.social" value={identifier} onChange={(ev) => setIdentifier(ev.target.value)} required /></label></p>

				<p><label><strong>App password:</strong><br />
				<input type="password" placeholder="abcd-efgh-ijkl-mnop" value={password} onChange={(ev) => setPassword(ev.target.value)} required /></label></p>

				<p><label><input type="checkbox" checked={rememberMe} onChange={(ev)  => setRememberMe(ev.target.checked)} /> Remember me on this device</label></p>
				{rememberMe === false ? null : <div className="cookie-warning">
					<h3>A wild cookie banner appeared!</h3>
					<p>When clicking "Remember me on this device", a cookie will be stored on your device. This cookie contains a list of IDs of all accounts you are currently logged in to. You can delete this information at any time by clicking "Log out", and if you don't open bluebotsdonequick.com for 60 days, it will automatically expire. This information will never be shared with third parties.</p>
					<p>If you are in any way not okay with this, uncheck "Remember me" before logging in.</p>
				</div>}
				<p className="proceed"><button type="submit">Configure bot</button></p>
			</form>
			<p className="back"><Link to="/">Go back</Link></p>
		</main>
	)
}

export default LogIn;