import DOMPurify from 'dompurify';

const Preview = (props : Props) => {
	const stripImagesRegex = /\{(img|svg|alt)(?:[  ]([^}]*))?}/g;
	const {text} = props;
	const matches = [...text.matchAll(stripImagesRegex)];
	let images = [] as JSX.Element[];
	matches.forEach((match, index) => {
		if (match[1] === 'img') {
			// Are there already four images in this post?
			if (images.length >= 4) {
				return;
			}

			// Is there an image?
			if (match[2] === undefined) {
				return;
			}

			// is it written in the correct format?
			const imgMatches = match[2].match(/(https?:\/\/[^  }]+)[  ]?(.*)/);
			if (!imgMatches || !imgMatches.length) {
				return;
			}

			images.push(<article key={index}>
				<img src={imgMatches[1]} alt={imgMatches[2] || ''} />
			</article>);
		}
		if (match[1] === 'svg') {
			// Are there already four images in this post?
			if (images.length >= 4) {
				return;
			}

			// Is there an image?
			if (match[2] === undefined) {
				return;
			}

			// is it written in the correct format?
			const imgMatches = match[2].match(/^(<svg.*<\/svg>)(?:[  ]?(.*))?$/s);
			if (!imgMatches || !imgMatches.length) {
				return;
			}

			// Does the SVG contain external images?
			if (!imgMatches[1].includes('xlink:href')) {
				// Preferred/prettiest preview format, but it doesn't work with external images without setting up some advanced async solution to fetch image data... 
				images.push(<article key={index}>
					<img src={`data:image/svg+xml;base64, ${btoa(unescape(encodeURIComponent(imgMatches[1])))}`} alt={imgMatches[2] || ''} />
				</article>);

			}
			else {
				// Not as pretty, and needs to be sanitized, but at least it should work for all SVGs
				images.push(<article key={index} className="svg-box" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(imgMatches[1])}}>
				</article>);
			}
		}
	});

	const LinkIfExists = (linkProps : {children : string|JSX.Element}) => {
		if (props.link) {
			return <a href={props.link} target="_blank">{linkProps.children}</a>
		}
		return linkProps.children;
	}

	return (
		<div className="bluesky-post">
			<div className="bluesky-post-top-row">
				<LinkIfExists>{props.avatar ? <img src={props.avatar} alt="Your Bluesky avatar" className="bluesky-post-avatar" /> : <div className="bluesky-post-avatar no-avatar" />}</LinkIfExists>
				<div className="bluesky-post-name-and-handle">
					<p className="bluesky-post-name"><LinkIfExists>{props.botName || props.handle}</LinkIfExists></p>
					<p className="bluesky-post-handle"><LinkIfExists>{props.handle}</LinkIfExists></p>
				</div>
			</div>
			{text.replace(stripImagesRegex, '')}
			{images.length ? <div className="bluesky-post-images">
				{images}
			</div> : null}
			{props.hideDate ? null :
				<p className="bluesky-post-date">January 1, 1970 at 1:00 AM</p>
			}
		</div>
	);
}

type Props = {
	text : string,
	handle : string,
	botName? : string,
	avatar? : string,
	link? : string,
	hideDate? : boolean,
}

export default Preview;