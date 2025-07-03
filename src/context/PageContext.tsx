import { useState, createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PageContext = createContext( {} as ContextType );
export const usePage = () => useContext(PageContext);

export const PageContextProvider = (props : { children : JSX.Element|JSX.Element[] }) => {
	const [loginDetails, setLoginDetails] = useState(undefined as LoginInformation|undefined);
	const [error, setError] = useState('');
	const [botSettings, setBotSettings] = useState(undefined as BotSettingsFromAPI|undefined);
	const [isWorking, setIsWorking] = useState(false);
	const [accessToken, setAccessToken] = useState('');
//	const [refreshToken, setRefreshToken] = useState('');

	const navigate = useNavigate();

	const backendURI = import.meta.env.DEV ? 'http://localhost/tracery/v1' : 'https://api.bluebotsdonequick.com/v1';

	const headers : HeadersInit = {
		'Authorization': accessToken ? `Bearer ${accessToken}` : '',
		"Content-Type": "application/json",
		"Accept": "application/json",
	};

	useEffect(() => {
		if (botSettings && botSettings.id) {
			navigate(`/edit/${botSettings.id}`);
		}
	}, [botSettings]);


	const attemptLogin = async (provider : string, identifier : string, password : string, rememberMe? : boolean) => {
		setIsWorking(true);
		setLoginDetails({ provider: provider, identifier: identifier, password: password });
		setError('');
		const body = JSON.stringify({
			identifier: identifier,
			password: password,
			provider: provider,
			rememberMe: rememberMe ? true : false,
			returnData : true,
		});
		try {
			const res = await fetch(`${backendURI}/auth/`, {
				method: 'POST',
				body: body,
				headers: headers,
			});
			const json = await res.json();
			if (!json.status) {
				setError(json.error);
				setIsWorking(false);
				navigate('/login');
				return;
			}
			if (json.status) {
				if (json.accessToken) {
					setAccessToken(json.accessToken);
				}
				if (json.refreshToken) {
//					setRefreshToken(json.refreshToken);
				}
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
	attemptLogin : (provider : string, identifier : string, password : string, rememberMe? : boolean) => void,
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
	id : number,
	active : boolean,
	provider : string,
	identifier : string,
	script : string|null,
	language : string,
	minutesBetweenPosts : number|null,
	msg : string|null,
	reply : string|null,
	replyMode : number|null,
	autopostMode : number|null,
	autopostTimes : string|null,
	replyScript : string|null,
	actionIfLong : boolean,
	showSource : boolean,
	hideOnBotList : boolean,
	name? : string,
	thumb? : string,
}

