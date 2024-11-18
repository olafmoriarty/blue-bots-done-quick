import BotPreviewType from "../types/BotPreviewType";
import Preview from "./Preview";

const BotPreview = (props : { element : BotPreviewType}) => {
	const el = props.element;

	return (
		<article>
		<Preview text={el.lastPostText || ''} handle={el.identifier} botName={el.name} avatar={el.thumb} link={`https://bsky.app/profile/${el.did}`} hideDate={true} />
		</article>
	)
}

export default BotPreview;