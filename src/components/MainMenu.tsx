import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

const MainMenu = () => {
	const [showMenu, setShowMenu] = useState(false);

	return (
		<nav className="main-menu">
			<button className="open-menu-button" onClick={() => setShowMenu((oldValue) => !oldValue)}><Icon icon={showMenu ? faTimes : faBars} /></button>
			<ul className={showMenu ? 'menu-visible' : 'menu-hidden'}>
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