import { useState } from "react";
import { BotPreviewType } from "./FrontPage";
import Preview from "./Preview";

const BotPreview = (props : { element : BotPreviewType}) => {
	const el = props.element;

	const [showSource, setShowSource] = useState(false);

	return (
		<article>
		<Preview text={el.lastPostText || ''} handle={el.identifier} botName={el.name} avatar={el.thumb} link={`https://bsky.app/profile/${el.did}`} hideDate={true} />
		{showSource ? <div className="source-code">
			{el.script}
		</div> : null}
		{el.script ? <p className="show-source-button"><button onClick={async () => {
			setShowSource(value => !value);
		}}>
		{showSource ? 'Hide' : `Show source for ${el.identifier}`}</button></p> : null}
		</article>
	)
}

export default BotPreview;