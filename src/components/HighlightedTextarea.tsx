import { useRef } from "react";
import hljs from 'highlight.js/lib/core';
import jsonHighlight from 'highlight.js/lib/languages/json';

const HighlightedTextarea = (props : { script : string, updateScript : (script : string) => void }) => {
	hljs.registerLanguage('json', jsonHighlight);

	const {script, updateScript} = props;

	const highlightingRef = useRef(null as null|HTMLPreElement);
	const textareaRef = useRef(null as null|HTMLTextAreaElement);

	const syncScroll = () => {
		const element = textareaRef.current;
		const targetElement = highlightingRef.current;

		if (!element || !targetElement) {
			return;
		}
		console.log(element, targetElement);

		targetElement.scrollTop = element.scrollTop;
		targetElement.scrollLeft = element.scrollLeft;
	}

	return (
		<div className="highlighting-container">
		<pre ref={highlightingRef} className="tracery-script highlighting" aria-hidden><code dangerouslySetInnerHTML={{ __html: hljs.highlight(script, {language: 'json'}).value + (script[script.length - 1] === "\n" ? " " : "") }} /></pre>
		<textarea ref={textareaRef} className="highlighting-textarea" spellCheck={false} value={script} onChange={(ev) => updateScript(ev.target.value)} onInput={() => syncScroll()} onScroll={syncScroll} />
		</div>
	);
}

export default HighlightedTextarea;