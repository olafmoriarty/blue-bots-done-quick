const isValidRegularExpression = (value : string) => {
	let isValid = true;
	try {
		new RegExp(value.replaceAll('/', '\/'), 'i');
	}
	catch (e) {
		isValid = false;
	}

	return isValid;
}

export default isValidRegularExpression;