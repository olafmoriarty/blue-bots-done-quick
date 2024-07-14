<?php
include('tracery-parser.php');

$tracery = new Tracery;

$raw = json_decode('{
	"origin": ["#statement.capitalize#!",  
	"#statement.capitalize#",
	"#statement.capitalize# #emoji#",
	"#statement.capitalize#, #statement#.",
	"#utrop.capitalize#! #statement.capitalize#.",
	"#statement.capitalize#. #utrop.capitalize#!",
	"#statement.capitalize#. #spørsmål.capitalize#"],


	"statement" : ["#spørsmål#", "skjønner ikke hvorfor #skjermeg#", "skjønner ikke hvorfor #skjerdeg#", "god morgen #emoji#",  "god natt #emoji#", "god helg", "endelig er det fredag", "jeg følger #aktør2# og de beriker feeden min med #voksenting#", "nå synes jeg vi burde #voksenverb#", "jeg bryr meg ikke om at #skjermeg#", "min generasjon tåler litt #voksenting# #emoji#", "hallo damer", "ikke bry dere om #negativaktør#, #statement#",  "dette burde ikke vært nødvendig å forklare for voksne folk", "det er ikke min feil at #skjerdeg#", "vanskelig å ikke  #voksenverb#", "nei, nå er det på tide å #voksenverb#", "det er frekt å kalle folk for #derogatory2#", "feeden min er full av #aktør2#", "det er viktig for meg å #voksenverb# av og til", "jeg tror ikke noen egentlig er #derogatory1#", "det er skummelt at det fins #dorligting#", "jeg verdsetter #voksenting# og #voksenting#", "mitt fulle og faktiske navn er Bothild Botstad", "hihi, nå skal jeg #voksenverb#", "respekterer ikke folk som bare vil #dorligverb#", "Hvis du insisterer på å #voksenverb#, må du #voksenverb#", "litt snikskryt: jeg liker å #voksenverb# og jeg er ikke redd for å si det", "trenger #positivaktør# til å hjelpe meg med dette", "jeg har respekt for alle, også #derogatory2#", "#negativaktør# vil heller #dorligverb# enn å #voksenverb#", "jeg siterer Erik Bye: \'\'#statement.capitalize#\'\'", "hva sier det om #voksenting# at #skjermeg#?", "du fremstår for meg som en #adj3# #derogatorydeg# som bare er ute etter å #dorligverb#", "det er når #negativaktør# absolutt skal #dorligverb# at jeg merker at #skjermeg#", "#statement#... sa brura #emoji#", "husk: #lovebomb#", "dette er din daglige påminnelse om å #voksenverb#", "noen jeg trodde var #aktør2# har avfulgt meg", "takk for at du la meg til som venn på denne siden", "kan ikke forstå hvorfor noen skal #dorligverb# når man bare kan #voksenverb# i stedet", "nei, takke meg til #interesse#", "noen er bare opptatt av #dorligting#, men ikke jeg, jeg er opptatt av #interesse#", "takk for at du vil #voksenverb#", "jeg skjønner ikke dette \'\'#okboomer#\'\' - det har vel kanskje med #dorligting# å gjøre?", "fint å #voksenverb# i dag", "griner av latter - #positivaktør# er så morsom", "endelig tid for #interesse#", "det der har jeg aldri sagt! Noen må ha hacket meg", "jeg har bevis på at #skjermeg#", "folk som syns det er greit å #dorligverb# burde #skjerhen#", "#negativaktør# burde #skjerhen#"],
	"spørsmål":["hvorfor følger du ikke tilbake?", "stempler du meg som en #derogatory1#?", "kan du bekrefte at jeg ikke er en #derogatory1#?", "kanskje du burde #voksenverb# i stedet for å #dorligverb#?", "hvorfor ser jeg dette?", "hvem bryr seg egentlig om #dorligting#", "er du en #derogatorydeg#?", "\'\'#okboomer#\'\', hva er det liksom?", "hvorfor tror du #skjermeg#?", "hva synes du om at så mange vil #dorligverb#?", "vet arbeidsplassen din (#arbeidsplass#) om din tendens til å #dorligverb#?", "\'\'#okboomer#\'\'...?", "følger du meg?", "hvorfor kommer dette opp i feeden min hele tiden?", "er dette en kampanje?", "hva mener du med dette?", "vent... hva har jeg gjort nå?", "hvorfor tar du denne tonen mot meg?", "hvordan fant du min profil?", "si meg, NØYAKTIG HVOR har jeg skrevet \'\'jeg er #derogatory1#\'\'?", "har du vrangforestillinger?", "hva er en \'\'#okboomer#\'\'?", "jeg trenger oppmuntring, kan du poste bilde av #interesse#?", "er jeg for ny på twitter til å skjønne disse #dorligting#-greiene?", "bryr du deg om å #dorligverb#?", "forstår du hvorfor #skjermeg#?", "hva er greia med at #skjerdeg#?", "skulle dette liksom være morsomt?", "hvem er du?"],
	"lovebomb": ["du er #adj1#", "du er #positivaktør#", "gratulerer med dagen", "ha en fin dag", "stor klem til deg", "#emoji# #emoji#", ";-)", "god morgen til deg", "jeg digger deg", "du er så #adj1#", "du din #adj2# person", "takk for dette"],

	"positivaktør": ["et forbilde", "ei dame vi respekterer", "en #adj1# stemme i debatten", "en datamann", "meningsmangfoldet"],
	"negativaktør": ["#derogatory3#", "surmaga #derogatory3#", "kjipe #derogatory3#", "trangsynte #derogatory3#", "rabiate #derogatory3#", "#derogatory3# som ikke følger tilbake", "kalde og utrivelige #derogatory3#", "vrange #derogatory3#", "rasende #derogatory3#", "såkalte #derogatory3#"],
	"aktør2": ["alle som følger meg", "#adj2# folk", "#adj2# stemmer", "#aktør2# (dere vet hvem dere er #emoji#)", "#adj2# damer", "#adj2# menn", "#adj2# internettvenner"],

	"adj1": ["flott", "fin", "nydelig", "artig", "vittig", "smart", "ydmyk", "verdifull", "velformulert", "trivelig", "snill", "god"],
	"adj2": ["flotte", "viktige", "spennende", "interessante", "tøffe", "voksne", "reflekterte", "fornuftige", "smarte", "artige", "verdifulle"],
	"adj3": ["intolerant", "kald", "utrivelig", "utspekulert", "barnslig", "surmaga", "hatefull", "sint", "sur", "woke"],

	"derogatory1": ["nazist", "TERF", "\'\'cis\'\'", "slem person", "meningspoliti", "gjennomført fæl person", "en av de \'\'ukule\'\'"],
	"derogatory2": ["nazister", "terfs", "rasshøl", "fascister"],
	"derogatory3": ["kjerringer", "gledesdrepere", "twittermobber", "ulveflokker", "snøflak", "kritikere", "saueflokker", "woke-twitrere", "mobbere", "aktivister"],
	"derogatorydeg": ["godhetsposør", "narsissist", "sytepave", "sau", "lille venn"],

	"skjermeg" : ["så mange har blokkert meg", "#aktør2# er #adj2# #emoji#", "#aktør2# ikke følger tilbake", "det er så mye tekniske problemer på twitter nå", "jeg aldri blokkerer noen og er stolt av det", "det renner inn kommentarer fra #negativaktør#", "en kampanje mot meg er i gang", "twitter har blitt et kaldt og utrivelig sted", "jeg sier hva jeg vil og skammer meg ikke over det", "jeg blir stemplet som #derogatory1#", "folk ikke skjønner at jeg egentlig er en #adj1# og #adj1# person", "#dorligting# minner meg om ungdomsskolen", "jeg føler meg utsatt for #dorligting#", "jeg er meg"],
	"skjerdeg": ["folk stiller spørsmål ved hvem du er", "du alltid skal #dorligverb#", "twitter har blitt et kaldt og utrivelig sted", "du blir blokkert av #negativaktør#", "noen er uenige med deg", "du ikke blir tatt seriøst når du er anonym", "du prøver å #dorligverb#", "du ikke vil #voksenverb#"],
	"skjerhen": ["få seg en på trynet", "bli avanonymisert", "slette kontoen sin", "få smake sin egen medisin", "bli eksponert som #derogatory3#"],

	"voksenting": ["#adj2# perspektiver", "#adj2# diskusjoner", "#aktør2#", "vinkvelder", "gode samtaler", "innspill fra #aktør2#", "ytringsfrihet", "en tur ut i det fine været"],
	"dorligting": ["\'\'#okboomer#\'\'", "#negativaktør#", "å #dorligverb#", "organiserte følg/avfølg/blokker lister", "anonyme kontoer", "kjendisreality", "meningene til #negativaktør#", "selfies i feeden", "selfiefredag", "blokkeringslister", "ungdomsskoleoppførsel", "umorsomme \'\'bot\'\'-er", "skjermbilder"],
	"interesse": ["#positivaktør#", "#voksenting#", "en fin blomst", "søte hundevalper", "solnedgangen", "dagens middag", "den fine himmelen", "en flott ferietur", "årets første utepils", "en deilig seng 😴", "et boblebad", "Gullrekka på TV-en", "tur i skogen"],

	"voksenverb": ["legge denne diskusjonen død", "ta en kaffe #emoji#", "følge tilbake", "bygge opp i stedet for å rive ned", "ta debatten", "tåle at #skjerdeg#",  "logge av", "få litt frisk luft", "nyte dagen",  "nevne ei dame vi respekterer", "ikke leve i et ekkokammer", "anerkjenne andre perspektiver", "bli glad i #aktør2#", "lese en god bok", "trene", "spise kake", "drikke kaffe", "ha internhumor med #aktør2#", "lure på hva #okboomer# er", "lytte til begge sider", "ha noe fornuftig på hjertet", "se på den fine solnedgangen", "komme med noen gode poenger", "slappe av", "ta et glass vin", "#voksenverb# med god samvittighet", "være venner med alle", "passe på ytringsfriheten", "poste bilde av #interesse#", "bry seg litt mindre om #dorligting# og litt mer om #interesse#", "slappe av på sofaen", "drikke en kaffe med noen man er uenig med", "kose seg med #interesse#", "følge folk man er uenig med", "ta noe på kornet", "klappe en katt"],
	"dorligverb": ["ha en anonym konto på twitter", "stemple folk som #derogatory2# ut av ingenting", "ikke følge tilbake", "ha tillit etter manglende åpenhet", "henge ut folk bare fordi man er uenig", "blokkere bare fordi flokken sier det", "kneble ytringsplikten", "kontrollere andres feed", "høre hjemme på instagram, ikke her", "starte kampanjer mot #aktør2#", "avfeie folk som #derogatory2# når de faktisk bare prøver å #voksenverb#", "være opptatt av hvem folk skal følge", "poste for mange selfies", "henge ut andre ved hjelp av #dorligting#", "å quote-tweete for å henge ut"],

	"utrop": ["skjerpings", "i alle dager", "nei nå altså", "nok er nok", "ta deg en bolle", "ut på tur, aldri sur", "OK...", "makan til #negativaktør#", "hihi", "karpe diem, #aktør2#", "hmmmm", "makan", "dra meg nå baklengs inn i fuglekassa", "tenk på barna", "ja, så er det sagt", "måtte bare si det", "god helg", "spot on", "ærlig talt"],

	"okboomer": ["voksentwitter", "cis", "interseksjonalitet", "boomer", "bots", "woke", "politisk korrekthet", "wok-kultur"],

	"arbeidsplass": ["televerket", "skoleverket", "universitetet", "helsevesenet", "meterologisk institutt", "biblioteket"],

	"emoji": ["😁", "😋", "🤗", "👍🏻", "👋", "🙏", "👏", "🌈", "🍷", "🍹", "☕️", "💁‍♀️", "🙈", "❤️", "💓", "💗", "💕"],

	"svar": ["#statement.capitalize#", "#spørsmål.capitalize#", "#lovebomb.capitalize# #emoji#"]
}', true);

$grammar = $tracery->createGrammar($raw);

$grammar->addModifiers($tracery->baseEngModifiers());
for ($i = 0; $i < 50; $i++) {
	echo '<p>' . $grammar->flatten('#origin#') . '</p>';

}

