const ErrorMessage = (props : {error : string}) => {
	const errors = {
		'METHOD_NOT_ALLOWED': 'Huh, that\'s strange. The API returned an error message saying that you\'re using the wrong HTTP method. I have no idea how that happened, that shouldn\'t be possible! I guess you could... try again? And if that doesn\'t work, send me an e-mail or report an issue on the GitHub repo?',
		'INVALID_ENDPOINT': 'Huh, that\'s strange. The API returned an error message saying that the given endpoint does not exist. I have no idea how that happened, that shouldn\'t be possible! I guess you could... try again? And if that doesn\'t work, send me an e-mail or report an issue on the GitHub repo?',
		'NO_ENDPOINT_SELECTED': 'Huh, that\'s strange. The API returned an error message saying that the request is missing an endpoint. I have no idea how that happened, that shouldn\'t be possible! I guess you could... try again? And if that doesn\'t work, send me an e-mail or report an issue on the GitHub repo?',
		'WRONG_USERNAME_OR_PASSWORD': 'The was a problem logging in. Did you type the correct username and password?'
	} as {[key : string] : string};
	
	if (!props.error) {
		return;
	}

	return <p className="error">{errors[props.error] ? errors[props.error] : props.error}</p>
}

export default ErrorMessage;