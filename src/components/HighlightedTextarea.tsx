import { useRef } from "react";
import highlightJson from "../utils/highlightJson";

const HighlightedTextarea = (props : { script : string, updateScript : (script : string) => void, highlighting : boolean }) => {
	const {script, updateScript, highlighting} = props;

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

	return (
		<div className={`highlighting-container json-textarea ${highlighting ? '' : 'do-not-highlight'}`}>
		<pre ref={highlightingRef} className="tracery-script highlighting" aria-hidden><code>{!highlighting ? script : highlightJson(script)}</code></pre>
		<textarea ref={textareaRef} className="highlighting-textarea" spellCheck={false} value={script} onChange={(ev) => updateScript(ev.target.value)} onInput={() => syncScroll()} onScroll={syncScroll} />
		</div>
	);
}

export default HighlightedTextarea;