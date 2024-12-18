import { Link, useParams } from "react-router-dom";

const Help = () => {
	const params = useParams();
	const {page} = params;

	let content = <>
		<h2>BBDQ Help</h2>
		<ul>
			<li><Link to="/help/codes/">A list of all shortcode functions supported on BBDQ</Link></li>
		</ul>
		<p>(Hoping to add a proper Tracery tutorial here later!)</p>
	</>;
	if (page === 'json') {
		content = <>
		<h2>A very quick introduction to JSON</h2>
		<p>A <em>Tracery grammar</em> consists of a JSON object where all the values are strings or string arrays.</p>
		<p>You don't need to know <em>a lot</em> of JavaScript to write Tracery. However, most Tracery tutorials contain a section warning you that if you put a single character in the wrong place, your </p>
		<p>If you're experienced with JavaScript and how JSON objects work, you can skip this section. If you're not experienced with JavaScript, but you don't care how JSON objects work, you can skip this section at your own risk.</p>

		<p><Link to="/help/tracery/" className="button">Next page</Link></p>

		<p>For those of you still here, let's have a look at the parts that make up our JSON code.</p> 
		
		<pre className="help-highlighting"><code>{"{\n\t\"origin\": [ \"Hello, world!\" ]\n}"}</code></pre>

		<p>A <em>Tracery grammar</em> consists of a JSON object where all the values are strings or string arrays.</p>
		<h2>Wait, what does that mean?</h2>
		<p>Okay. You don't need to know <em>a lot</em> about JSON to write a Tracery bot, but considering the </p>
		<p>If you already know JavaScript and how JSON works, you can skip this section. If you're not experienced with JavaScript, but you don't care how JSON objects work, you can skip this section at your own risk.</p>

		<p>For those of you still here, let's have a look at the parts that make up our JSON code.</p> 
		
		<pre className="help-highlighting"><code>{"{\n\t\"origin\": [ \"Hello, world!\" ]\n}"}</code></pre>


		<h3>Strings</h3>
		<p>This is a string:</p>
		<pre className="help-highlighting"><code>{"{\n\t\"origin\": [ \"Hello, world!\" ]\n}"}</code></pre>
		<p>A string is a <em>type of data</em> in JavaScript. JavaScript has many types of data, such as numbers and booleans, but the strig </p>
		
		</>
	}
	if (page === 'codes') {
		content = <>
			<h2>Shortcodes</h2>
			<h3><code>{"{img}"}</code>: Images</h3>
			<p>Use <code><strong>{"{img [url]}"}</strong></code> or <code><strong>{"{img [url] [alt-text]}"}</strong></code> to insert an image:</p>
			<pre className="help-highlighting"><code>{"{\n\t\"origin\": [\n\t\t \"{img https://bluebotsdonequick.com/image.png}\",\n\t\t \"{img https://bluebotsdonequick.com/image.png A photo of a green dog.}\"\n\t ]\n}"}</code></pre>
			<p>You can insert PNG and JPEG images. The maximum file size is 1 MB. You can insert a maximum of four images in a post.</p>
			<p>Image shortcodes are parsed <em>after</em> the Tracery code has run, so this is valid:</p>
			<pre className="help-highlighting"><code>{"{\n\t\"origin\": [ \"{img https://bluebotsdonequick.com/#images#.png}\" ],\n\t\"images\": [ \"image\", \"image2\", \"image3\" ]\n}"}</code></pre>
			<h3><code>{"{svg}"}</code>: SVG images</h3>
			<p>Use <code><strong>{"{svg [svg code]}"}</strong></code> or <code><strong>{"{svg [svg code] [alt-text]}"}</strong></code> to insert an SVG:</p>
			<pre className="help-highlighting"><code>{"{\n\t\"origin\": [\n\t\t \"{svg <svg version=\"1.1\" width=\"300\" height=\"200\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"100%\" height=\"100%\" fill=\"red\" /><circle cx=\"150\" cy=\"100\" r=\"80\" fill=\"green\" /><text x=\"150\" y=\"125\" font-size=\"60\" text-anchor=\"middle\" fill=\"white\">SVG</text></svg> The word SVG in a green circle on a red background.}\"\n\t ]\n}"}</code></pre>
			<p>SVG shortcodes are parsed <em>after</em> the Tracery code has run, so any part of the SVG can be replaced by a Tracery tag.</p>
			<p>Please note that <strong>not all SVG functionality is supported by the SVG renderer I'm using</strong>. In particular I've noticed that <code>{"<ForeignObject>"}</code> does not work, that <em>some</em> <code>transform</code> attributes aren't working, and that <code>href</code> is not supported (use <code>xlink:href</code> instead).</p>
			<p>BBDQ uses a different method of generating images from SVGs than the one <em>Cheap bots, done quick</em> and <em>Cheap bots, toot suite</em> uses, so if something worked there, it doesn't automatically mean it works here. Also, the generated preview on the bot editing page also puts together SVGs in a different way than the bot itself does, which unfortunately means that the only way to be absolutely sure what an SVG will look like is to let the bot post it and see what comes out in the other end.</p>
			<h3><code>{"{alt}"}</code>: An alternative way to add alt texts </h3>
			<p>Use <code><strong>{"{alt [alt-text]}"}</strong></code> to add an alt text to the previous image:</p>
			<pre className="help-highlighting"><code>{"{\n\t\"origin\": [\n\t\t \"{img https://bluebotsdonequick.com/image.png} {alt A photo of a green dog.}\"\n\t ]\n}"}</code></pre>
			<p>The alt text will be attached to the previous image or SVG tag, if one exists. If that image tag already has an alt text, that one will be overwritten.</p>
			<h3><code>{"{date}, {hour}, {month}, {monthName}, {weekday}, {weekdayName}"}</code>: Date and time</h3>
			<p>Add the current time or date to your output, or use it to generate output. All given times are UTC.</p>
			<p>Use <code><strong>{"{date [php date format]}"}</strong></code> to insert any date, where the attribute is a <a href="https://www.php.net/manual/en/datetime.format.php">PHP datetime format</a>:</p>
			<pre className="help-highlighting"><code>{"{\n\t\"origin\": [\n\t\t \"Today is {date F jS, Y}.\"\n\t ]\n}"}</code></pre>
			<p>For simplicity I've also added shortcodes for a couple of the most common date strings:</p>
			<ul>
				<li><code>{"{hour}"}</code> returns the current hour in UTC time on a 24-hour clock as a two digit number between <code>00</code> and <code>23</code>.</li>
				<li><code>{"{month}"}</code> returns the current month as a two digit number between <code>01</code> and <code>12</code>.</li>
				<li><code>{"{monthName}"}</code> returns the current month, <code>January</code>-<code>December</code>.</li>
				<li><code>{"{weekday}"}</code> returns the current day of the week as a number between <code>0</code> (Sunday) and <code>6</code> (Saturday).</li>
				<li><code>{"{weekdayName}"}</code> returns the current day of the week, <code>Sunday</code>-<code>Saturday</code>.</li>
			</ul>
			<p>Dates are parsed <em>before</em> the Tracery code runs, so it can be used in tag names:</p>
			<pre className="help-highlighting"><code>{"{\n\t\"origin\": [ \"{weekday} is a #rhyme{weekday}#\" ],\n\t\"rhyme1\": \"bon day\",\n\t\"rhyme2\": \"blues day\",\n\t\"rhyme3\": \"Heaven's day\",\n\t\"rhyme4\": \"worse day\",\n\t\"rhyme5\": \"bi day\",\n\t\"rhyme6\": \"latter day\",\n\t\"rhyme0\": \"fun day\"\n}"}</code></pre>
			<p>While this is possible, in most cases it would probably be a better idea to use the <code>{"{item}"}</code> tag.</p>
			<h3><code>{"{n}"}</code>: An increasing number</h3>
			<p>The first time you use the <code>{"{n}"}</code> shortcode, it will be zero. The next time, it will be one. Every time you use it, it increases.</p>
			<pre className="help-highlighting"><code>{"{\n\t\"origin\": [ \"This message has been displayed {n} times.\" ]\n}"}</code></pre>
			<p>Use <code>{"{n mod [number]}"}</code> or <code>{"{n % [number]}"}</code> to take the modulo of the number (the spaces are important!). This could be handy e.g. if you want to switch between different sets of Tracery rules:</p>
			<pre className="help-highlighting"><code>{"{\n\t\"origin\": [ \"This message has been displayed #parity{n % 2}.a# number of times. \" ],\n\t\"parity0\": [ \"even\" ],\n\t\"parity1\": [ \"odd\" ]\n}"}</code></pre>
			<p>Again, you could also use the <code>{"{item}"}</code> tag here.</p>
			<p>Like dates, <code>{"{n}"}</code> is called <em>before</em> the Tracery code is parsed.</p>

			<h3><code>{"{item}"}</code>: Get a specific item from a Tracery rule</h3>
			<p>Use <code>{"{item [#rule#] [number]}"}</code> to pick an item from a given rule. The number is zero-indexed, which means that e.g this code.</p>
			<pre className="help-highlighting"><code>{"{\n\t\"origin\": [ \"I am thinking about {item #foods# 2}\" ],\n\t\"foods\": [ \"pasta\", \"pizza\", \"chocolate\", \"burgers\", \"noodles\" ]\n}"}</code></pre>
			<p>will return "I'm thinking about chocolate".</p>
			<p>Specifying a number directly in this way is rarely useful. It is, however, possible to combine this with the date functions or <code>{"{n}"}</code>:</p> 
			<pre className="help-highlighting"><code>{"{\n\t\"origin\": [ \"{weekday} is a {item #rhymes# {weekday}}.\" ],\n\t\"rhymes\": [ \"fun day\", \"bon day\", \"blues day\", \"Heaven's day\", \"worse day\", \"bi day\", \"latter day\" ]\n}"}</code></pre>
			<pre className="help-highlighting"><code>{"{\n\t\"origin\": [ \"{n} is an {item #parity# {n}} number.\" ],\n\t\"parity\": [ \"even\", \"odd\" ]\n}"}</code></pre>
			<p>Note that you don't have to use modulo when using <code>{"{n}"}</code> with <code>{"{item}"}</code> - if the given number is bigger than the size of the referenced array, a modulo will automatically be added.</p>
			<p><code>{"{item}"}</code> is called <em>before</em> the Tracery code is parsed, but <em>after</em> <code>{"{n}"}</code> and <code>{"{date}"}</code>-related functions are called.</p>

		</>;
	}

	return (<main className="help">
		{page ? <nav className="breadcrumbs"><Link to="/help/">BBDQ Help</Link> &gt;</nav> : null}
		{content}

	</main>);
}

export default Help;