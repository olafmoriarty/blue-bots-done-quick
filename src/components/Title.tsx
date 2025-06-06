import { Helmet } from "react-helmet";

const Title = (props : {children? : string}) => {

	return (
		<Helmet>
			<title>{props.children ? `${props.children} — Blue Bots, Done Quick!` : "Blue Bots, Done Quick!"}</title>
		</Helmet>
	)
}

export default Title;