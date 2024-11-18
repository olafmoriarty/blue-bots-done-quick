import { Link } from "react-router-dom";

const ErrorPage = () => {
	return (
		<main>
			<h2>Something went wrong :-(</h2>
			<p>Could not load the page you asked for.</p>
			<p><Link to="/">Back to front page</Link></p>
		</main>
	)
}

export default ErrorPage;