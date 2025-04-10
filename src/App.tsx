import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import './App.css';
import FrontPage from './components/FrontPage';
import CreateBot from './components/CreateBot';
import EditBot from './components/EditBot';
import LogIn from './components/LogIn';
import Privacy from './components/Privacy';
import { PageContextProvider } from './context/PageContext';
import ErrorPage from './components/ErrorPage';
import Header from './components/Header';
import Footer from './components/Footer';
import BotList from './components/BotList';
import Source from './components/Source';
import Help from './help/Help';
import MainMenu from './components/MainMenu';

const App = () => {
	const router = createBrowserRouter([
		{
			path: '/',
			element: <PageContextProvider>
				<MainMenu />
			<Header />
			<Outlet />
			<Footer />
			</PageContextProvider>,
			errorElement: <>
			<Header />
			<ErrorPage />
			<Footer />
				</>,
			children: [
				{
					path: '',
					element: <FrontPage />,
				},
				{
					path: 'bots/:identifier',
					element: <Source />,
				},
				{
					path: 'bots',
					element: <BotList />,
				},
				{
					path: 'create',
					element: <CreateBot />,
				},
				{
					path: 'edit',
					element: <EditBot />,
				},
				{
					path: 'demo',
					element: <EditBot demo={true} />,
				},
				{
					path: 'login',
					element: <LogIn />,
				},
				{
					path: 'help/:page',
					element: <Help />,
				},
				{
					path: 'help',
					element: <Help />,
				},
				{
					path: 'privacy',
					element: <Privacy />,
				},
			]
		},
	]);

	return <RouterProvider router={router} />;
}

export default App;