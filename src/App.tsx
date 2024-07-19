import { createContext, useContext, useState } from 'react';
import './App.css';
import FrontPage from './components/FrontPage';
import CreateBot from './components/CreateBot';
import EditBot from './components/EditBot';
import LogIn from './components/LogIn';

const PageContext = createContext( {} as ContextType );

export const usePage = () => useContext(PageContext);

const App = () => {
//	const backendURI = 'https://bluebotsdonequick.com/backend/';
	const backendURI = 'http://localhost/tracery/';

	const [page, setPage] = useState('');
	const [loginDetails, setLoginDetails] = useState(undefined as LoginInformation|undefined);
	const [error, setError] = useState('');
	const [botSettings, setBotSettings] = useState(undefined as BotSettingsFromAPI|undefined);

	let pageToDisplay;
	if (botSettings !== undefined) {
		pageToDisplay = <EditBot />
	}
	else {
		switch (page) {
			case 'create':
				pageToDisplay = <CreateBot />;
				break;
			case 'login':
				pageToDisplay = <LogIn />;
				break; 
			default:
				pageToDisplay = <FrontPage />;
				break;
		}
	
	}

	const attemptLogin = async (provider : string, identifier : string, password : string) => {
		setLoginDetails({ provider: provider, identifier: identifier, password: password });
		setError('');
		const body = JSON.stringify({
			mode: 'login',
			provider: provider,
			identifier: identifier,
			password: password,
		})
		const res = await fetch(backendURI, {
			method: 'POST',
			body: body,
		});
		const json = await res.json();
		if (!json.status) {
			setError(json.error);
			setPage('login');
			return;
		}
		if (json.status && json.data) {
			setBotSettings(json.data);
			if (json.data.identifier !== identifier) {
				setLoginDetails(details => {
					if (!details) {
						return undefined;
					}
					return {
						...details,
						identifier: json.data.identifier,
					}
				});
			}
		}
	}

	const context = {
		setPage: setPage,
		attemptLogin: attemptLogin,
		botSettings: botSettings,
		loginDetails: loginDetails,
		error: error,
		backendURI: backendURI,
	}

	return (
		<PageContext.Provider value={context}>
		<header>
			<h1>Blue Bots, Done Quick!</h1>
		</header>
		{pageToDisplay}
		</PageContext.Provider>
	)
}

type ContextType = {
	setPage : (page : string) => void,
	attemptLogin : (provider : string, identifier : string, password : string) => void,
	botSettings? : BotSettingsFromAPI,	
	loginDetails : LoginInformation|undefined,
	error : string,
	backendURI : string,
};

type LoginInformation = {
	provider : string,
	identifier : string,
	password : string,
}

export type BotSettingsFromAPI = {
	active : boolean,
	provider : string,
	identifier : string,
	script : string|null,
	language : string,
	minutesBetweenPosts : number|null,
	msg : string|null,
	reply : string|null,
	actionIfLong : boolean,
}

export default App;