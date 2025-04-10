import { NavLink } from "react-router-dom";

const MainMenu = () => {
	return (
		<nav className="main-menu">
			<ul>
				<li>
					<NavLink to="/">Front page</NavLink>
				</li>
				<li>
					<NavLink to="/edit/">Edit bot</NavLink>
				</li>
				<li>
					<NavLink to="/bots/">All bots</NavLink>
				</li>
				<li>
					<NavLink to="/help/">Help</NavLink>
				</li>
				<li><a href="" target="_blank">Patreon</a></li>
			</ul>
		</nav>
	)
}

export default MainMenu;