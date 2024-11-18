import { useState } from "react";
import { usePage } from "../context/PageContext";
import ErrorMessage from "./ErrorMessage";

const DeleteBot = () => {

	const {loginDetails, backendURI, logOut} = usePage();

	const [error, setError] = useState('');
	const [yes, setYes] = useState('');
	const [isFetching, setIsFetching] = useState(false);

	if (!loginDetails) {
		return;
	}
	const deleteTheBot = async () => {
		setError('');
		setIsFetching(true);

		const body = JSON.stringify({
			mode: 'delete',
			provider: loginDetails.provider,
			identifier: loginDetails.identifier,
			password: loginDetails.password,
		});
		const res = await fetch( backendURI, {
			method: 'DELETE',
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
		else {
			logOut();
		}
		setIsFetching(false);
	}

	return (
		<section>
			<h3>Delete your bot</h3>
			<ErrorMessage error={error} />
			<p>To confirm that you are absolutely 100 % sure that you want to delete your bot, please type "YES" (all caps) in the input field below.</p>
			<p><input type="text" value={yes} onChange={(ev) => setYes(ev.target.value)} /></p>
			{yes === 'YES' && !isFetching ? <button className="big-red-button" type="button" onClick={() => deleteTheBot()}>Delete bot</button> : null}
			<p>(This will not delete your Bluesky account, only the information that is stored on the BBDQ server which makes the bot post there. To delete the Bluesky account, log in to it on Bluesky and delete it there.)</p>
		</section>
	)
}

export default DeleteBot;