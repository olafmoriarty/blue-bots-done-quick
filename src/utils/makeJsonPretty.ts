const makeJsonPretty = ( text : string ) => {
	let newText = '';
	let inString = false;
	let levels = [] as ("object"|"array")[];
	let ignoreNext = false;
	for (let i = 0; i < text.length; i++) {
		const char = text.charAt(i);
		
		if (ignoreNext) {
			newText += char;
			ignoreNext = false;
			continue;
		}
		if (inString) {
			newText += char;
			if (char === '\\') {
				ignoreNext = true;
			}
			if (char === '"') {
				inString = false;
			}
		}
		else {
			if (char === '{') {
				levels.push('object');
				newText += char;
				newText += "\n" + ("\t".repeat(levels.length));
			}
			else if (char === '}' && levels[levels.length - 1] === 'object') {
				levels.pop();
				newText += "\n" + ("\t".repeat(levels.length));
				newText += char;
			}
			else if (char === '[') {
				levels.push('array');
				newText += char;
				newText += "\n" + ("\t".repeat(levels.length));
			}
			else if (char === ']' && levels[levels.length - 1] === 'array') {
				levels.pop();
				newText += "\n" + ("\t".repeat(levels.length));
				newText += char;
			}
			else if (char === '"') {
				inString = true;
				newText += char;
			}
			else if (char === ',') {
				newText += char;
				newText += "\n" + ("\t".repeat(levels.length));
			}
			else if (char === ':' && levels[levels.length - 1] === 'object') {
				newText += char;
				newText += ' ';
			}
			else {
				newText += char;
			}
			
		}
	}
	return newText;
}
export default makeJsonPretty;