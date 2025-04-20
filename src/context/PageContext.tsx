import { useState, createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PageContext = createContext( {} as ContextType );
export const usePage = () => useContext(PageContext);

export const PageContextProvider = (props : { children : JSX.Element|JSX.Element[] }) => {
	const [loginDetails, setLoginDetails] = useState(undefined as LoginInformation|undefined);
	const [error, setError] = useState('');
	const [botSettings, setBotSettings] = useState(undefined as BotSettingsFromAPI|undefined);
	const [isWorking, setIsWorking] = useState(false);

	const navigate = useNavigate();

	const backendURI = import.meta.env.DEV ? 'http://localhost/tracery/' : 'https://bluebotsdonequick.com/backend/';

	useEffect(() => {
		if (botSettings) {
			navigate('/edit');
		}
	}, [botSettings]);


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
				navigate('/login');
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
			navigate('/login');
			return;
		}
	}

	const logOut = ( returnTo? : string ) => {
		setLoginDetails(undefined);
		setBotSettings(undefined);
		if (returnTo) {
			navigate(returnTo);
		}
	}


	const context = {
		attemptLogin: attemptLogin,
		botSettings: botSettings,
		loginDetails: loginDetails,
		error: error,
		backendURI: backendURI,
		isWorking: isWorking,
		logOut: logOut,
	}
	
	return <PageContext.Provider value={context}>
		{props.children}
	</PageContext.Provider>
}




type ContextType = {
	attemptLogin : (provider : string, identifier : string, password : string) => void,
	botSettings? : BotSettingsFromAPI,	
	loginDetails : LoginInformation|undefined,
	error : string,
	backendURI : string,
	isWorking : boolean,
	logOut : (returnTo? : string) => void,
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
	replyMode : number|null,
	replyScript : string|null,
	actionIfLong : boolean,
	showSource : boolean,
	name? : string,
	thumb? : string,
}

