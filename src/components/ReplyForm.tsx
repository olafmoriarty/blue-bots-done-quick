import { useEffect, useState } from "react";
import makeJsonPretty from "../utils/makeJsonPretty";
import isValidRegularExpression from "../utils/isValidRegularExpression";

const ReplyForm = (props : Props) => {


	const [replyRules, setReplyRules] = useState<replyRule[]>([]);
	const [parsingError, setParsingError] = useState(false);

	useEffect(() => {
		try {
			const jsonRules : { [key : string] : string } = JSON.parse(props.json);
			if (typeof jsonRules !== 'object') {
				return;
			}

			setReplyRules(Object.keys(jsonRules).filter(key => key !== '.').concat([ '', '.' ]).map(key => { return { key: key, value: jsonRules[key] === undefined ? '' : jsonRules[key] } }));
			setParsingError(false);
		}
		catch (e) {
			console.log(e);
			setParsingError(true);
		}
	}, []);

	useEffect(() => {
		if (!replyRules || !replyRules.length) {
			return;
		}
		let newJsonObject : { [key : string] : string } = {};
		replyRules.forEach((el, index) => {
			// Does key already exist?
			if (newJsonObject[el.key] !== undefined) {
				return;
			}

			// Is key a premature "."?
			if (el.key === '.' && index !== replyRules.length - 1) {
				return;
			}

			// Is the key missing?
			if (!el.key) {
				return;
			}

			// Is the key invalid regex?
			if (el.regexError) {
				return;
			}

			// Add rule to object
			newJsonObject[el.key] = el.value;
		});

		const newJson = makeJsonPretty( JSON.stringify( newJsonObject ) );
		props.updateJson(newJson);
	}, [replyRules]);

	const updateReplies = ( replyIndex : number, field : "key"|"value", newText : string ) => {
		setReplyRules(oldReplyRules => {
			let newReplyRules = oldReplyRules.map((obj, index) => {
				if (index !== replyIndex) {
					return obj;
				}
				let newObj = { ...obj };
				if (field === 'key') {
					newObj.key = newText;
					newObj.regexError = !isValidRegularExpression(newText);
				}
				if (field === 'value') {
					newObj.value = newText;
				}
				return newObj;
			});
			if (newReplyRules.filter(el => el.key === "").length === 0) {
				newReplyRules = newReplyRules.slice(0, newReplyRules.length - 1).concat({ key: "", value: "" }).concat(newReplyRules.slice(-1));
			}
			return newReplyRules;
		});
	}

	if (parsingError) {
		return (
			<section className="reply-form">
				<p>Your JSON code contains errors. You need to fix these errors in JSON view before you can use Editor view.</p>
			</section>
		);
	}

	return (
		<section className="reply-form">
			{ replyRules.map( (el, index) => <article className="reply-rule" key={index === replyRules.length - 1 ? "last" : index}>{index < replyRules.length - 1 ? <p className="reply-rule-key"><label>{index > 0 ? "Else if" : "If"} message contains<br /><input type="text" value={el.key} onChange={ev => updateReplies(index, "key", ev.target.value)} /></label></p> : <p className="reply-rule-key">For all other messages</p>}<div className="reply-rule-value"><p><label>Reply with<br /><input type="text" value={el.value} onChange={ev => updateReplies(index, "value", ev.target.value)} /></label></p>
			{el.value && !el.key ? <p className="reply-error">Reply rules without a keyword will not be saved!</p> : null}
			{el.key === '.' && index !== replyRules.length - 1 ? <p className="reply-error">Keyword can not be "."!</p> : null}
			{el.regexError ? <p className="reply-error">Keyword is not valid RegEx!</p> : null}
			{(el.key && index !== replyRules.length - 1) && replyRules.slice(0, index).map(prev => prev.key).includes(el.key) ? <p className="reply-error">Keywords can not repeat!</p> : null}
			</div></article> ) }
			<p className="instructions">
				Keyword fields are case-insensitive and can contain regular expressions. 
			</p>
		</section>
	)
}

type Props = {
	json : string,
	updateJson : (json : string) => void,
}

type replyRule = {
	key: string,
	regexError?: boolean,
	value: string,
}

export default ReplyForm;