import './App.css';

const App = () => {
	return (
		<>
		<header>
			<h1>Blue Bots, Done Quick!</h1>
		</header>
		<main className="front-page">
			<div className="front-page-info">
				<p>Create your own Bluesky bot!</p>

			</div>
			<section className="buttons">
				<button>Create a Bluesky bot</button>
				<button>Edit your bot</button>
			</section>
			<h2>Popular BBDQ bots</h2>
			<h2>New BBDQ bots</h2>
		</main>
		</>
	)
}

export default App;