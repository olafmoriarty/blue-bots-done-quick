import { Link } from "react-router-dom";

const Footer = () => {
	return (
		<footer>
			<ul>
				<li><Link to="/privacy">Privacy etc.</Link></li>
				<li><a target="_blank" href="https://bsky.app/profile/bluebotsdonequick.com">BBDQ on Bluesky</a></li>
				<li><a target="_blank" href="https://github.com/olafmoriarty/blue-bots-done-quick/issues">BBDQ on GitHub</a></li>
			</ul>
			<p>By <a href="https://olafmoriarty.com" target="_blank">Olaf Moriarty Solstrand</a></p>
		</footer>
	);
}

export default Footer;