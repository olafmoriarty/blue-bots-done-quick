const highlightJson = (inputText : string) => {
	if (inputText.length > 100000) {
		return <span className={`highlight-text`}>{inputText}</span>
	}

	let start = 0;
	let depth = 0;
	let inTag = false;
	let foundSections = [] as Section[];
	let stringIsKey = false;
	let newText = '';
	let inString = false;
	let levels = [] as ("object"|"array")[];
	let ignoreNext = false;

	const text = inputText.charAt(inputText.length - 1) === "\n" ? inputText + " " : inputText;

	for (let i = 0; i < text.length; i++) {
		const char = text.charAt(i);
		newText += char;
		
		if (ignoreNext) {
			ignoreNext = false;
			continue;
		}
		if (inString) {
			if (char === '\\') {
				ignoreNext = true;
			}
			if (char === '#' && text.charAt(i - 1) !== '\\') {
				if (!inTag) {
					if (start < i) {
						foundSections.push({
							type: depth ? 'bracket' : 'text',
							content: text.substring(start, i),
						});
						start = i;
					}
					inTag = true;
				}
				else {
					foundSections.push({
						type: 'tag',
						content: text.substring(start, i + 1),
					});
					start = i + 1;
					inTag = false;
				}
			}
			if (char === '[' && text.charAt(i - 1) !== '\\') {
				if (!depth && start < i) {
					foundSections.push({
						type: 'text',
						content: text.substring(start, i),
					});
					start = i;
				}
				depth++;
			}
			if (char === ']' && text.charAt(i - 1) !== '\\') {
				depth--;
				if (!depth) {
					foundSections.push({
						type: 'bracket',
						content: text.substring(start, i + 1),
					});
					start = i + 1;
				}
			}
			if (char === '"') {
				inString = false;
				foundSections.push({
					type: stringIsKey ? 'key' : 'text',
					content: text.substring(start, i + 1),
				});
				start = i + 1;
				stringIsKey = false;
			}
		}
		else {
			if (char === '{') {
				stringIsKey = true;
				levels.push('object');
				if (start < i) {
					foundSections.push({
						type: 'none',
						content: text.substring(start, i),
					});
					start = i;
						
				}
				foundSections.push({
					type: 'punctuation',
					content: text.substring(start, i + 1),
				});
				start = i + 1;
			}
			else if (char === '}' && levels[levels.length - 1] === 'object') {
				stringIsKey = false;
				levels.pop();
				if (start < i) {
					foundSections.push({
						type: 'none',
						content: text.substring(start, i),
					});
					start = i;
						
				}
				foundSections.push({
					type: 'punctuation',
					content: text.substring(start, i + 1),
				});
				start = i + 1;

			}
			else if (char === '[') {
				levels.push('array');
				if (start < i) {
					foundSections.push({
						type: 'none',
						content: text.substring(start, i),
					});
					start = i;
						
				}
				foundSections.push({
					type: 'punctuation',
					content: text.substring(start, i + 1),
				});
				start = i + 1;
			}
			else if (char === ']' && levels[levels.length - 1] === 'array') {
				levels.pop();
				if (start < i) {
					foundSections.push({
						type: 'none',
						content: text.substring(start, i),
					});
					start = i;
						
				}
				foundSections.push({
					type: 'punctuation',
					content: text.substring(start, i + 1),
				});
				start = i + 1;
			}
			else if (char === '"') {
				inString = true;
				if (start < i) {
					foundSections.push({
						type: 'none',
						content: text.substring(start, i),
					});
					start = i;
				}
			}
			else if (char === ',') {
				if (levels[levels.length - 1] === 'object') {
					stringIsKey = true;
				}
				if (start < i) {
					foundSections.push({
						type: 'none',
						content: text.substring(start, i),
					});
					start = i;
						
				}
				foundSections.push({
					type: 'punctuation',
					content: text.substring(start, i + 1),
				});
				start = i + 1;
			}
			else if (char === ':' && levels[levels.length - 1] === 'object') {
				if (start < i) {
					foundSections.push({
						type: 'none',
						content: text.substring(start, i),
					});
					start = i;
						
				}
				foundSections.push({
					type: 'punctuation',
					content: text.substring(start, i + 1),
				});
				start = i + 1;
			}
			
		}
	}
	// Final section
	if (start < text.length) {
		foundSections.push({
			type: "none",
			content: text.substring(start, text.length),
		});
	}

	return foundSections.map((el, index) => <span key={index} className={`highlight-${el.type}`}>{el.content}</span>);
}

type Section = {
	type : "text"|"tag"|"punctuation"|"bracket"|"key"|"none",
	content : string,
};

export default highlightJson;