const ErrorMessage = (props : {error : string, additionalInfo?: string[]}) => {
	const errors = {
		"INVALID_ENDPOINT": "Huh, that's strange. The API returned an error message saying that the given endpoint does not exist. I have no idea how that happened, that shouldn't be possible! I guess you could... try again? And if that doesn't work, send me an e-mail or report an issue on the GitHub repo?",
		"INVALID_JSON": "The Tracery grammar you are trying to submit is not valid JSON.",
		"METHOD_NOT_ALLOWED": "Huh, that's strange. The API returned an error message saying that you're using the wrong HTTP method. I have no idea how that happened, that shouldn't be possible! I guess you could... try again? And if that doesn't work, send me an e-mail or report an issue on the GitHub repo?",
		"MINUTES_NOT_A_NUMBER": "The posting frequency must be a number.",
		"NO_ENDPOINT_SELECTED": "Huh, that's strange. The API returned an error message saying that the request is missing an endpoint. I have no idea how that happened, that shouldn't be possible! I guess you could... try again? And if that doesn't work, send me an e-mail or report an issue on the GitHub repo?",
		"ORIGIN_RULE_MISSING": "The main Tracery rule you have specified does not exist in your grammar.",
		"PARAMETERS_MISSING": "Required information missing: ",
		"REPLY_RULE_MISSING": "The reply Tracery rule you have specified does not exist in your grammar.",
		"PROVIDER_PROTOCOL_MISSING": "The provider URL must contain a scheme, such as \"https://\".",
		"WRONG_USERNAME_OR_PASSWORD": "The was a problem logging in. Did you type the correct username and password?"
	} as {[key : string] : string};
	
	if (!props.error) {
		return;
	}

	let error = errors[props.error] ? errors[props.error] : props.error;
	if (props.additionalInfo) {
		error += ' (' + props.additionalInfo.join(', ') + ')'; 
	}

	return <p className="error">{error}</p>
}

export default ErrorMessage;