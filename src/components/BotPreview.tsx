import { useState } from "react";
import { BotPreviewType } from "./FrontPage";

const BotPreview = (props : { element : BotPreviewType}) => {
	const el = props.element;

	const [showSource, setShowSource] = useState(false);

	return (
		<>
		<article className="person" key={el.identifier}>
			{el.thumb ? <p className="avatar"><img src={el.thumb} alt={el.name || el.identifier} /></p> : <p className="avatar"></p>}
			<div className="main-part">
				<h3>{el.name || el.identifier}</h3>
				<p className="handle"><a href={`https://bsky.app/profile/${el.did}`} target="_blank" rel="noopener">{el.identifier}</a></p>
				{el.lastPostText ? <p>{el.lastPostText}</p> : null}
			</div>
			{el.script ? <p className="follow-button"><button onClick={async () => {
				setShowSource(value => !value);
			}}>{showSource ? 'Hide' : 'Source'}</button></p> : null}
		</article>
		{showSource ? <div className="source-code">
			{el.script}
		</div> : null}
		</>
	)
}

export default BotPreview;