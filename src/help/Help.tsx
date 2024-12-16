import { Link, useParams } from "react-router-dom";

const Help = () => {
	const params = useParams();
	const {page} = params;

	let content;
	if (page === 'json') {
		content = <>
		<h2>A very quick introduction to JSON</h2>
		<p>Tracery bots are stored in the <strong>JSON</strong> format, and, while it can be mostly avoided on BBDQ by using the editor view, the traditional way of editing Tracery bots is to edit the JSON directly.</p>
		<p>If you're experienced with JavaScript and how JSON objects work, you can skip this section. If you're not experienced with JavaScript, but you don't care how JSON objects work, you can skip this section at your own risk.</p>

		<p><Link to="/help/tracery/" className="button">Next page</Link></p>

		<p>For those of you still here, let's have a look at the parts that make up our JSON code.</p> 
		
		<pre className="help-highlighting"><code>{"{\n\t\"origin\": [ \"Hello, world!\" ]\n}"}</code></pre>


		<h3>Strings</h3>
		<p>This is a string:</p>
		<pre className="help-highlighting"><code>{"{\n\t\"origin\": [ \"Hello, world!\" ]\n}"}</code></pre>
		<p>A string is a <em>type of data</em> in JavaScript. JavaScript has many types of data, such as numbers and booleans, but the strig </p>
		
		</>
	}

	return (<main className="help">
		{content}

	</main>);
}

export default Help;