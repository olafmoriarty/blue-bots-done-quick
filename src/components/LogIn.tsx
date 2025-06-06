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
				attemptLogin(provider, identifier, password);
			}}>
				<p><label htmlFor="provider-input"><strong>Provider:</strong></label><br />
				{providerFieldActive ? <input type="text" id="provider-input" value={provider} onChange={(ev) => setProvider(ev.target.value)} /> : <>https://bsky.social (<button className="link" type="button" onClick={() => setProviderFieldActive(true)}>edit</button>)</>}</p>

				<p><label><strong>Bluesky handle:</strong><br />
				<input type="text" placeholder="myawesomebot.bsky.social" value={identifier} onChange={(ev) => setIdentifier(ev.target.value)} required /></label></p>

				<p><label><strong>App password:</strong><br />
				<input type="password" placeholder="abcd-efgh-ijkl-mnop" value={password} onChange={(ev) => setPassword(ev.target.value)} required /></label></p>
				<p className="proceed"><button type="submit">Configure bot</button></p>
			</form>
			<p className="back"><Link to="/">Go back</Link></p>
		</main>
	)
}

export default LogIn;