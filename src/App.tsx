import { createContext, useContext, useState } from 'react';
import './App.css';
import FrontPage from './components/FrontPage';
import CreateBot from './components/CreateBot';
import EditBot from './components/EditBot';
import LogIn from './components/LogIn';
import Privacy from './components/Privacy';

const PageContext = createContext( {} as ContextType );

export const usePage = () => useContext(PageContext);

const App = () => {
	const backendURI = 'https://bluebotsdonequick.com/backend/';

	const [page, setPage] = useState('');
	const [loginDetails, setLoginDetails] = useState(undefined as LoginInformation|undefined);
	const [error, setError] = useState('');
	const [botSettings, setBotSettings] = useState(undefined as BotSettingsFromAPI|undefined);
	const [isWorking, setIsWorking] = useState(false);

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
			case 'privacy':
				pageToDisplay = <Privacy />
				break;
			case 'demo':
				pageToDisplay = <EditBot />
				break;
			default:
				pageToDisplay = <FrontPage />;
				break;
		}
	
	}

	const attemptLogin = async (provider : string, identifier : string, password : string) => {
		setIsWorking(true);
		setLoginDetails({ provider: provider, identifier: identifier, password: password });
		setError('');
		const body = JSON.stringify({
			mode: 'login',
			provider: provider,
			identifier: identifier,
			password: password,
		})
		try {
			const res = await fetch(backendURI, {
				method: 'POST',
				body: body,
			});
			const json = await res.json();
			if (!json.status) {
				setError(json.error);
				setIsWorking(false);
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
			setIsWorking(false);
		}
		catch {
			setError('SERVER_ERROR');
			setIsWorking(false);
			setPage('login');
			return;
		}
	}

	const logOut = () => {
		setLoginDetails(undefined);
		setBotSettings(undefined);
		setPage('');
	}

	const context = {
		setPage: setPage,
		attemptLogin: attemptLogin,
		botSettings: botSettings,
		loginDetails: loginDetails,
		error: error,
		backendURI: backendURI,
		isWorking: isWorking,
		logOut: logOut,
	}

	return (
		<PageContext.Provider value={context}>
		<header>
			<h1>Blue Bots, Done Quick!</h1>
		</header>
		{pageToDisplay}
		<footer>
			<p className="back">{page === 'privacy' ? <button onClick={() => setPage('')}>Back</button> : <button onClick={() => setPage('privacy')}>Privacy et cetera</button>}</p>
		</footer>
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
	isWorking : boolean,
	logOut : () => void,
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
	showSource : boolean,
	name? : string,
	thumb? : string,
}

export default App;