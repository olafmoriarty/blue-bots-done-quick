import { Fragment, useEffect, useRef, useState } from "react";
import makeJsonPretty from "../utils/makeJsonPretty";

const TraceryWysiwygEditor = (props : { script : string, updateScript : (script : string) => void, origin : string }) => {

	const [tree, setTree] = useState([ props.origin ] as string[]);
	const currentNode = tree.length ? tree[tree.length - 1] : '';
	const {script, updateScript} = props;
	const [sections, setSections] = useState([] as Section[]);

	const [text, setText] = useState('');

	useEffect(() => {
		let newText = '';
		try {
			const scriptObject = JSON.parse(script);
			if (currentNode) {
				if (!scriptObject[currentNode]) {
					newText = '';
				}
				else if (Array.isArray(scriptObject[currentNode])) {
					newText = scriptObject[currentNode].map((el : string) => el.replaceAll("\n", "\\n")).join("\n");
				}
				else {
					newText = scriptObject[currentNode].replaceAll("\n", "\\n");
				}
			}
		}
		catch (e) {
			console.log(e);
		}
		setText(newText);
		const newSections = getTracerySections(newText.charAt(newText.length - 1) === "\n" ? newText + " " : newText);
		setSections(newSections);

	}, [currentNode]);

	useEffect(() => {
		setTree([ props.origin])
	}, [props.origin]);

	const updateText = (inputText? : string) => {
		let text = script;
		if (inputText !== undefined) {
			text = inputText;
			setText(text);
			let newScript = { ...JSON.parse(script) };
			newScript[currentNode] = inputText.split("\n").map(el => el.replace(/\\n/g, "\n")).filter(el => el !== '');
			updateScript( makeJsonPretty(JSON.stringify(newScript)) );
			const newSections = getTracerySections(text);
			setSections(newSections);
		}
	}

	const highlightingRef = useRef(null as null|HTMLPreElement);
	const textareaRef = useRef(null as null|HTMLTextAreaElement);

	const syncScroll = () => {
		const element = textareaRef.current;
		const targetElement = highlightingRef.current;

		if (!element || !targetElement) {
			return;
		}
		targetElement.scrollTop = element.scrollTop;
		targetElement.scrollLeft = element.scrollLeft;
	}

	const addToTree = (rule : string) => {
		setTree(oldTree => [ ...oldTree, rule ]);
	}

	const getTracerySections = (text : string) => {
		let start = 0;
		let depth = 0;
		let inTag = false;
		let foundSections = [] as Section[];
		let ignoreNext = false;
		const textLength = text.length;
		for (let i = 0; i < textLength; i++) {
			if (ignoreNext) {
				ignoreNext = false;
				continue;
			}
			const char = text.charAt(i);
			if (char === '\\') {
				ignoreNext = true;
			}
			if (char === '#' && depth === 0) {
				if (!inTag) {
					inTag = true;
					foundSections.push({
						start: start,
						end: i,
						type: "text",
						content: text.substring(start, i),
					});
					start = i;
				}
				else {
					inTag = false;
					foundSections.push({
						start: start,
						end: i,
						type: "tag",
						content: text.substring(start, i + 1),
					});
					start = i + 1;
				}
			}
			if (char === "\n" && inTag) {
				inTag = false;
			}
		}
		if (start < text.length) {
			foundSections.push({
				start: start,
				end: text.length,
				type: "text",
				content: text.substring(start, text.length),
			});
		}
		return foundSections;
	}

	return (
		<div className="wysiwyg">
			{tree.map((el, index) => index < tree.length - 1 ? <button key={index} className="wysiwyg-parent" data-level={Math.min(index, 4)} onClick={() => setTree(tree.slice(0, index + 1))}>{el}</button> : null)}
			<div className="wysiwyg-button-bar" data-level={Math.min(tree.length - 1, 4)}>
					<div className="rule-name">{tree[tree.length - 1]}</div>
				</div>
			<div className="highlighting-container" data-level={Math.min(tree.length - 1, 4)}>
				<pre ref={highlightingRef} className="tracery-script highlighting" aria-hidden><code>{sections.map((el, index) => el.type === "tag" ? <span key={index} className="highlight-tag">{el.content}</span> : <Fragment key={index}>{el.content}</Fragment>)}</code></pre>
				<textarea ref={textareaRef} key={tree[tree.length - 1]} className="highlighting-textarea" spellCheck={false} value={text} onChange={(ev) => updateText(ev.target.value)} onInput={() => syncScroll()} onScroll={syncScroll} onDoubleClick={(ev) => {
					const position = Math.floor((ev.currentTarget.selectionStart + ev.currentTarget.selectionEnd) / 2);
					for (let i = 0; i < sections.length; i++) {
						if (sections[i].end > position) {
							if (sections[i].type === 'tag') {
								addToTree(sections[i].content.substring(1, sections[i].content.length - 1));
							}
							break;
						}
					}
				}} />
			</div>
			<TagButtons sections={sections} existingRules={Object.keys( JSON.parse(script) )} addToTree={addToTree} level={Math.min(tree.length - 1, 4)} />
		</div>
	);
}

const TagButtons = (props : {sections : Section[], existingRules : string[], addToTree : (rule : string) => void, level : number}) => {
	const {sections} = props;
	const allTags = sections
		.filter((el) => el.type === 'tag')
		.map((el) => el.content.substring(1, el.content.length - 1))
		.map(el => el.split('.')[0]);
	const uniqueTags = allTags.filter((el, index) => allTags.indexOf(el) === index);
	return (
		<div className="wysiwyg-tag-buttons" data-level={props.level}>{uniqueTags.map((el, index) => <button key={index} className={props.existingRules.includes(el) ? '' : "new-rule-button"} onClick={() => props.addToTree(el)}>{el}</button>)}</div>
 	)
}

type Section = {
	start : number,
	end : number,
	type : "text"|"tag",
	content : string,
};

export default TraceryWysiwygEditor;