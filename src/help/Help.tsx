import { Link, useParams } from "react-router-dom";
import highlightJson from "../utils/highlightJson";
import TraceryWysiwygEditor from "../components/TraceryWysiwigEditor";
import { useState } from "react";
import Title from "../components/Title";

const Help = () => {
	const params = useParams();
	const {page} = params;

	const [wysiwygExample, setWysiwygExample] = useState("{\n\t\"origin\": [\"#quotes#\"],\n\t\"quotes\": [\n\t\t\"A hug is always the right size.\",\n\t\t\"Sometimes the smallest things take up the most room in your heart.\",\n\t\t\"It is more fun to talk with someone who doesn’t use long, difficult words but rather short, easy words like, \\\"What about lunch?\\\"\",\n\t\t\"People say nothing is impossible, but I do nothing every day.\",\n\t\t\"Rivers know this: There is no hurry. We shall get there some day.\",\n\t\t\"I'm so rumbly in my tumbly.\"\n\t]\n}");

	let content = <>
		<Title>Help</Title>
		<h2>BBDQ Help</h2>
		<ul>
		<li><Link to="/help/editor/">How to use editor view</Link></li>
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
		
		<Highlight>{"{\n\t\"origin\": [ \"Hello, world!\" ]\n}"}</Highlight>

		<p>A <em>Tracery grammar</em> consists of a JSON object where all the values are strings or string arrays.</p>
		<h2>Wait, what does that mean?</h2>
		<p>Okay. You don't need to know <em>a lot</em> about JSON to write a Tracery bot, but considering the </p>
		<p>If you already know JavaScript and how JSON works, you can skip this section. If you're not experienced with JavaScript, but you don't care how JSON objects work, you can skip this section at your own risk.</p>

		<p>For those of you still here, let's have a look at the parts that make up our JSON code.</p> 
		
		<Highlight>{"{\n\t\"origin\": [ \"Hello, world!\" ]\n}"}</Highlight>


		<h3>Strings</h3>
		<p>This is a string:</p>
		<Highlight>{"{\n\t\"origin\": [ \"Hello, world!\" ]\n}"}</Highlight>
		<p>A string is a <em>type of data</em> in JavaScript. JavaScript has many types of data, such as numbers and booleans, but the strig </p>
		
		</>
	}
	if (page === 'codes') {
		content = <>
			<Title>List of shortcodes</Title>
			<h2>Shortcodes</h2>
			<h3><code>{"{img}"}</code>: Images</h3>
			<p>Use <code><strong>{"{img [url]}"}</strong></code> or <code><strong>{"{img [url] [alt-text]}"}</strong></code> to insert an image:</p>
			<Highlight>{"{\n\t\"origin\": [\n\t\t \"{img https://bluebotsdonequick.com/image.png}\",\n\t\t \"{img https://bluebotsdonequick.com/image.png A photo of a green dog.}\"\n\t ]\n}"}</Highlight>
			<p>You can insert PNG and JPEG images. The maximum file size is 1 MB. You can insert a maximum of four images in a post.</p>
			<p>Image shortcodes are parsed <em>after</em> the Tracery code has run, so this is valid:</p>
			<Highlight>{"{\n\t\"origin\": [ \"{img https://bluebotsdonequick.com/#images#.png}\" ],\n\t\"images\": [ \"image\", \"image2\", \"image3\" ]\n}"}</Highlight>
			<h3><code>{"{svg}"}</code>: SVG images</h3>
			<p>Use <code><strong>{"{svg [svg code]}"}</strong></code> or <code><strong>{"{svg [svg code] [alt-text]}"}</strong></code> to insert an SVG:</p>
			<Highlight>{"{\n\t\"origin\": [\n\t\t \"{svg <svg version=\\\"1.1\\\" width=\\\"300\\\" height=\\\"200\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\"><rect width=\\\"100%\\\" height=\\\"100%\\\" fill=\\\"red\\\" /><circle cx=\\\"150\\\" cy=\\\"100\\\" r=\\\"80\\\" fill=\\\"green\\\" /><text x=\\\"150\\\" y=\\\"125\\\" font-size=\\\"60\\\" text-anchor=\\\"middle\\\" fill=\\\"white\\\">SVG</text></svg> The word SVG in a green circle on a red background.}\"\n\t ]\n}"}</Highlight>
			<p>SVG shortcodes are parsed <em>after</em> the Tracery code has run, so any part of the SVG can be replaced by a Tracery tag.</p>
			<p>Please note that <strong>not all SVG functionality is supported by the SVG renderer I'm using</strong>. In particular I've noticed that <code>{"<ForeignObject>"}</code> does not work, that <em>some</em> <code>transform</code> attributes aren't working, and that <code>href</code> is not supported (use <code>xlink:href</code> instead).</p>
			<p>BBDQ uses a different method of generating images from SVGs than the one <em>Cheap bots, done quick</em> and <em>Cheap bots, toot suite</em> uses, so if something worked there, it doesn't automatically mean it works here. Also, the generated preview on the bot editing page also puts together SVGs in a different way than the bot itself does, which unfortunately means that the only way to be absolutely sure what an SVG will look like is to let the bot post it and see what comes out in the other end.</p>
			<h3><code>{"{alt}"}</code>: An alternative way to add alt texts </h3>
			<p>Use <code><strong>{"{alt [alt-text]}"}</strong></code> to add an alt text to the previous image:</p>
			<Highlight>{"{\n\t\"origin\": [\n\t\t \"{img https://bluebotsdonequick.com/image.png} {alt A photo of a green dog.}\"\n\t ]\n}"}</Highlight>
			<p>The alt text will be attached to the previous image or SVG tag, if one exists. If that image tag already has an alt text, that one will be overwritten.</p>
			<h3><code>{"{date}"}</code>, <code>{"{hour}"}</code>, <code>{"{month}"}</code>, <code>{"{monthName}"}</code>, <code>{"{weekday}"}</code>, <code>{"{weekdayName}"}</code>: Date and time</h3>
			<p>Add the current time or date to your output, or use it to generate output. All given times are UTC.</p>
			<p>Use <code><strong>{"{date [php date format]}"}</strong></code> to insert any date, where the attribute is a <a href="https://www.php.net/manual/en/datetime.format.php">PHP datetime format</a>:</p>
			<Highlight>{"{\n\t\"origin\": [\n\t\t \"Today is {date F jS, Y}.\"\n\t ]\n}"}</Highlight>
			<p>For simplicity I've also added shortcodes for a couple of the most common date strings:</p>
			<ul>
				<li><code>{"{hour}"}</code> returns the current hour in UTC time on a 24-hour clock as a two digit number between <code>00</code> and <code>23</code>.</li>
				<li><code>{"{month}"}</code> returns the current month as a two digit number between <code>01</code> and <code>12</code>.</li>
				<li><code>{"{monthName}"}</code> returns the current month, <code>January</code>-<code>December</code>.</li>
				<li><code>{"{weekday}"}</code> returns the current day of the week as a number between <code>0</code> (Sunday) and <code>6</code> (Saturday).</li>
				<li><code>{"{weekdayName}"}</code> returns the current day of the week, <code>Sunday</code>-<code>Saturday</code>.</li>
			</ul>
			<p>Dates are parsed <em>before</em> the Tracery code runs, so it can be used in tag names:</p>
			<Highlight>{"{\n\t\"origin\": [ \"{weekdayName} is a #rhyme{weekday}#\" ],\n\t\"rhyme1\": \"bon day\",\n\t\"rhyme2\": \"blues day\",\n\t\"rhyme3\": \"Heaven's day\",\n\t\"rhyme4\": \"worse day\",\n\t\"rhyme5\": \"bi day\",\n\t\"rhyme6\": \"latter day\",\n\t\"rhyme0\": \"fun day\"\n}"}</Highlight>
			<p>While this is possible, in most cases it would probably be a better idea to use the <code>{"{item}"}</code> tag.</p>
			<h3><code>{"{n}"}</code>: An increasing number</h3>
			<p>The first time you use the <code>{"{n}"}</code> shortcode, it will be zero. The next time, it will be one. Every time you use it, it increases.</p>
			<Highlight>{"{\n\t\"origin\": [ \"This message has been displayed {n} times.\" ]\n}"}</Highlight>
			<p>Use <code>{"{n mod [number]}"}</code> or <code>{"{n % [number]}"}</code> to take the modulo of the number (the spaces are important!). This could be handy e.g. if you want to switch between different sets of Tracery rules:</p>
			<Highlight>{"{\n\t\"origin\": [ \"This message has been displayed #parity{n % 2}.a# number of times. \" ],\n\t\"parity0\": [ \"even\" ],\n\t\"parity1\": [ \"odd\" ]\n}"}</Highlight>
			<p>Again, you could also use the <code>{"{item}"}</code> tag here.</p>
			<p>Like dates, <code>{"{n}"}</code> is called <em>before</em> the Tracery code is parsed.</p>

			<h3><code>{"{item}"}</code>: Get a specific item from a Tracery rule</h3>
			<p>Use <code>{"{item [#rule#] [number]}"}</code> to pick an item from a given rule. The number is zero-indexed, which means that e.g this code</p>
			<Highlight>{"{\n\t\"origin\": [ \"I am thinking about {item #foods# 2}\" ],\n\t\"foods\": [ \"pasta\", \"pizza\", \"chocolate\", \"burgers\", \"noodles\" ]\n}"}</Highlight>
			<p>will return "I'm thinking about chocolate".</p>
			<p>Specifying a number directly in this way is rarely useful. It is, however, possible to combine this with the date functions or <code>{"{n}"}</code>:</p> 
			<Highlight>{"{\n\t\"origin\": [ \"{weekdayName} is a {item #rhymes# {weekday}}.\" ],\n\t\"rhymes\": [ \"fun day\", \"bon day\", \"blues day\", \"Heaven's day\", \"worse day\", \"bi day\", \"latter day\" ]\n}"}</Highlight>
			<Highlight>{"{\n\t\"origin\": [ \"{n} is an {item #parity# {n}} number.\" ],\n\t\"parity\": [ \"even\", \"odd\" ]\n}"}</Highlight>
			<p>Note that you don't have to use modulo when using <code>{"{n}"}</code> with <code>{"{item}"}</code> - if the given number is bigger than the size of the referenced array, a modulo will automatically be added.</p>
			<p><code>{"{item}"}</code> is called <em>before</em> the Tracery code is parsed, but <em>after</em> <code>{"{n}"}</code> and <code>{"{date}"}</code>-related functions are called.</p>

			<h3><code>{"{label}"}</code>: Add a label to suggestive images</h3>
			<p>Use <code>{"{label [label-name]}"}</code> to add a label to your post, declaring that it contains adult content. <code>[label-name]</code> can be one of the following values:</p>
			<ul>
				<li><code>porn</code> - for adult content</li>
				<li><code>sexual</code> - for what BlueSky calls "less intense sexual content"</li>
				<li><code>nudity</code> - for non-sexual nudity</li>
				<li><code>graphic-media</code> - for violence / gore</li>
			</ul>
			<p>Other values than one of these four, as far as I know, will not work.</p>
			<p>The label will only be attached to the post if it contains images (including SVGs).</p>
			<Highlight>{"{\n\t\"origin\": [\n\t\t \"{img https://bluebotsdonequick.com/image.png An oil painting of a naked man attacking a Tesla with a battle mace.}{label nudity}\"\n\t ]\n}"}</Highlight>
			<h3><code>{"{lang}"}</code>: Set post language programmatically</h3>
			<p>By default, your post language will be set to the language you've selected in your dashboard.</p>
			<p>You can override this by using <code>{"{lang [language-code]}"}</code> to set the language. <code>[language-code]</code> must be a two-letter <a href="https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes" target="_blank">ISO 639-1 language code</a>.</p>
			<p>One post can contain multiple <code>{"{lang}"}</code> codes:</p>
			<Highlight>{"{\n\t\"origin\": [ \"#welcome.capitalize#, #welcome#, #welcome#!\" ],\n\t\"welcome\": [ \"willkommen{lang de}\", \"bienvenue{lang fr}\", \"welcome{lang en}\" ]\n}"}</Highlight>

		</>;
	}
	
	if (page === 'editor') {
		content = <>
			<Title>How to use the editor</Title>
			<h2>Editor view</h2>
			<p>BBDQ's Editor view is an attempt at creating a method of making it easier to generate Tracery code without having to edit the JSON directly. The code is still saved as JSON, and if you want to, you can click the JSON tab at any time to edit it directly.</p>
			<p>Advanced users may still prefer to stick to JSON view, but if you don't have a lot of programming experience and you just want to build a simple quote bot, this is the easiest way to do so.</p>
			<h3>Example</h3>
			<p>Let's say we want to create a bot that posts a random Winnie the Pooh quote every day. The JSON code may look something like this:</p>
			<Highlight>{"{\n\t\"origin\": [\"#quotes#\"],\n\t\"quotes\": [\n\t\t\"A hug is always the right size.\",\n\t\t\"Sometimes the smallest things take up the most room in your heart.\",\n\t\t\"It is more fun to talk with someone who doesn’t use long, difficult words but rather short, easy words like, \\\"What about lunch?\\\"\",\n\t\t\"People say nothing is impossible, but I do nothing every day.\",\n\t\t\"Rivers know this: There is no hurry. We shall get there some day.\",\n\t\t\"I'm so rumbly in my tumbly.\"\n\t]\n}"}</Highlight>
			<p>This is not a very complex grammar, and yet it illustrates a few of the things you have to remember when writing Tracery in JSON syntax: You have a lot of quotation marks that must be closed correctly, if a quote contains quotation marks they must be escaped, and the last string in a rule should never be followed by a comma. So while there's not a lot of trickery, you could still easily run into syntax errors if you add a hundred more quotes.</p>
			<p>This is what that bot looks like in Editor view:</p>
			<TraceryWysiwygEditor script={wysiwygExample} updateScript={setWysiwygExample} origin={"origin"} highlighting={true} separator={"\n"} /> 
			<p>Editor view shows you <strong>one Tracery rule at a time</strong>. When it first opens, it shows you only the root element of your code, which by default is the <code>origin</code> rule.</p>
			<h3>Write text, not JSON</h3>
			<p>You'll also notice that instead of saying <code>["#quotes#"]</code>, it just says <code>#quotes#</code>. In editor view, instead of asking you to give the contents of a rule as an array of strings, you can write the text directly into the textarea, without adding quotation marks. If you want the rule to contain multiple values, you just write each of them on a separate line.</p>
			<p>The JSON code is auto-generated and updated in the background when you edit the text. Since this happens automatically, this code is guaranteed to have no syntax errors.</p>
			<h3>Click a rule to edit it</h3>
			<p>To edit the <code>quotes</code> rule, you can either double-click <code>#quotes#</code>, or you can click or tap the "quotes" button under the textarea. This will open that rule and let you edit its contents. Try it in the example above!</p>
			<p>If you add a reference to a new rule, that rule will also automatically become clickable, and a new button will pop up. If a button is white with red text, that means "This is a rule you're referencing in the textarea above, but it doesn't actually exist yet. Click here to create it!"</p>
			<h3>No more escaping quotes!</h3>
			<p>You'll notice that since none of this text is encapsuled in quotation marks, you don't have to escape characters, either. So instead of writing <code>\"What about lunch?\"</code>, you can write <code>"What about lunch?"</code>.</p>
			<p>You still have to escape newlines by typing <code>\n</code>, and since you're still using Tracery, hashtag symbols must also be escaped, but now you escape them with a single backslash (<code>\#hashtag</code>) instead of a double (<code>"\\#hashtag"</code>).</p>
			<h3>Change separator</h3>
			<p>By default, you can use a newline to add a new element. But that's not always the most convenient separator - maybe you have a lot of quotes that contain newlines, and you don't want to have to type "\n" every single time.</p>
			<p>To change the separator, click the gear icon above the editor, and pick which separator you want to use. For now, there are three option to choose from - newline, double newline, or the literal string <code>{"{{SEPARATOR}}"}</code>.</p>
			<p>Double newline lets you insert a single line break to an element by pressing Enter, and a new element will only start if you have two line breaks in a row. If you do need to have more than one line break in a row in your posts, you can still use <code>\n</code> to insert one manually.</p>
			<p><code>{"{{SEPARATOR}}"}</code> is a weird one, but it's a string you'll never have the need to insert into your posts, which means that this is ideal for rules that are intended to contain a single element where you want to be able to insert as many newlines and quotation marks you want without worrying about escaping characters. And if you <em>do</em> need to add a second element, you type <code>{"{{SEPARATOR}}"}</code> and move on to the next.</p>
			<h3>What <em>can't</em> the editor do?</h3>
			<p>The editor assumes that if you have an empty element, that's an artifact of you pasting a bunch of text, so they'll be removed when the text is converted to JSON. <strong>If you want a rule to actually contain empty strings, you can not edit that rule in Editor view, as that will make all the empty lines vanish</strong>.</p>
			<p>The editor lets you select any of the rules that are mentioned in the current rule. If you're writing very complex Tracery, this will not always work. Sometimes you add an inline rule that you don't actually want to create a Tracery rule for, but the editor will still assume that you'll do.</p>
			<p>Using shortcodes in tags? <code>#tag{"{hour}"}#</code>, <code>#tag{"{weekday}"}#</code>, <code>#tag{"{weekdayName}"}#</code>, <code>#tag{"{month}"}#</code> and <code>#tag{"{monthName}"}#</code> will work, and generate buttons for all possible values that tag could contain. <code>#tag{"{date ...}"}#</code> will <em>not</em> work, as it would be too complex to generate all possible options for all possible values of that shortcode. Likewise, <code>#tag{"{n}"}#</code> will <em>not</em> work because <code>{"{n}"}</code> can have an infinite number of values, but <code>#tag{"{n % [divisor]}"}#</code> or <code>#tag{"{n mod [divisor]}"}#</code> <em>will</em> work as there is a finite number of possible values for that shortcode.</p>
			<p>The editor currently does not let you rename or delete a Tracery rule, and you can't edit a rule that is not linked to from somewhere else.</p>
			<h3>So... should I use it?</h3>
			<p>Frankly, that's up to you. I won't be mad if you don't. Editing JSON is the traditional way of writing Tracery, and it's a way that works fine for many of us. This is just an alternative. For some people, it may be easier. For some people, it may just be annoying. I have no idea which category you fit into. At the moment, I have no idea which category <em>I</em> fit into, either. So... I guess we'll just have to try it and find out?</p>
		</>
	}
	
	return (<main className="help">
		{page ? <nav className="breadcrumbs"><Link to="/help/">BBDQ Help</Link> &gt;</nav> : null}
		{content}

	</main>);
}

const Highlight = (props : { children : string }) => {
	return (
		<pre className="help-highlighting">
			<code>
				{highlightJson(props.children)}
			</code>
		</pre>
	);
}

export default Help;