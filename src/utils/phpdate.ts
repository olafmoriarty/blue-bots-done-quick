const phpdate = (datestring : string) => {
	console.log(datestring);
	let newString = '';
	const date = new Date();

	const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const threeLetterdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const threeLetterMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	const year = date.getUTCFullYear();
	const isLeapYear = (year % 4 === 0) && (year % 400 === 0 || year % 100 !== 0);

	for (let i = 0; i < datestring.length; i++) {
		const char = datestring[i];

		// Day of month, 01-31
		if (char === 'd') {
			newString += date.getUTCDate().toString().padStart(2, '0');
		}
		// Three-letter weekday, Sun-Sat
		else if (char === 'D') {
			newString += threeLetterdays[date.getUTCDay()];
		}
		// Day of month, 1-31
		else if (char === 'j') {
			newString += date.getUTCDate().toString();
		}
		// Weekday, Sunday-Saturday
		else if (char === 'l') {
			newString += days[date.getUTCDay()];
		}
		// Day of week, 1-7 (1 = Monday)
		else if (char === 'N') {
			const day = date.getUTCDay();
			if (day === 0) {
				newString += '7';
			}
			else {
				newString += day.toString();
			}
		}
		// Day of month suffix, st/nd/rd/th
		else if (char === 'S') {
			const day = date.getUTCDate();
			if (day === 1 || day === 21 || day === 31) {
				newString += 'st';
			}
			else if (day === 2 || day === 22) {
				newString += 'nd';
			}
			else if (day === 3 || day === 23) {
				newString += 'rd';
			}
			else {
				newString += 'th';
			}
		}
		// Day of week, 0-6 (0 = Sunday)
		else if (char === 'w') {
			newString += date.getUTCDay().toString();
		}
		// Day of year, 1-366
		else if (char === 'z') {
			const start = new Date(date.getUTCFullYear(), 0, 0);
			const diff = date.getTime() - start.getTime();
			const days = Math.floor(diff / (24 * 60 * 60 * 1000));
			newString += days.toString();
		}
		// Week number ISO 8601
		else if (char === 'W') {
			// Day of week 
			const dayOfWeek = date.getUTCDay();
			// How many days from Thursday?
			const dayDiffThursday = dayOfWeek === 0 ? 3 : dayOfWeek - 4;
			const dateOfThursday = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - dayDiffThursday);
			// How many days between this week's Thursday and the first Thursday of the year?
			const dateOfJan1st = new Date(date.getUTCFullYear(), 0, 1);
			const thursdayWeekOne = new Date(date.getUTCFullYear(), 0, 1 + ((4 - dateOfJan1st.getDay()) % 7));
			console.log(thursdayWeekOne);

			const weekNumber = 1 + Math.round((dateOfThursday.getTime() - thursdayWeekOne.getTime()) / (1000 * 60 * 60 * 24 * 7));
			newString += weekNumber.toString();
		}

		// Month, January-December
		else if (char === 'F') {
			newString += months[date.getUTCMonth()];
		}
		// Month, 01-12
		else if (char === 'm') {
			newString += (date.getUTCMonth() + 1).toString().padStart(2, '0');
		}
		// Month, Jan-Dec
		else if (char === 'M') {
			newString += threeLetterMonths[date.getUTCMonth()];
		}
		// Month, 1-12
		else if (char === 'n') {
			newString += (date.getUTCMonth() + 1).toString();
		}
		// Days in month, 28-31
		else if (char === 't') {
			const currentMonth = date.getUTCMonth() + 1;
			if (currentMonth === 2) {
				if (isLeapYear) {
					newString += '29';
				}
				else {
					newString += '28';
				}
			}
			else if ([4, 6, 9, 11].includes(currentMonth)) {
				newString += '30';
			}
			else {
				newString = '31';
			}
		}
		// Leap year (1 if true, 0 if false)
		else if (char === 'L') {
			if (isLeapYear) {
				newString += '1';
			}
			else {
				newString += '0';
			}
		}
		// ISO 8601 week-numbering year; the year of the week we're in
		else if (char === 'o') {
			// Day of week 
			const dayOfWeek = date.getUTCDay();
			// How many days from Thursday?
			const dayDiffThursday = dayOfWeek === 0 ? 3 : dayOfWeek - 4;
			const dateOfThursday = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - dayDiffThursday);

			newString += dateOfThursday.getUTCFullYear().toString();
		}
		// Four-digit year with - or +
		else if (char === 'X') {
			const year = date.getUTCFullYear();
			newString += (year >= 0 ? '+' : '-');
			newString += year.toString().padStart(4, '0');
		}
		// Four-digit year with - or +, but + only if year > 10000
		else if (char === 'x') {
			const year = date.getUTCFullYear();
			newString += (year >= 10000 ? '+' : year < 0 ? '-' : '');
			newString += year.toString().padStart(4, '0');
		}
		// Four-digit year
		else if (char === 'Y') {
			newString += date.getUTCFullYear().toString();
		}
		// Two-digit year
		else if (char === 'y') {
			let year = date.getUTCFullYear().toString();
			if (year.length > 2) {
				year = year.slice(-2);
			}
			newString += year;
		}
		// am or pm
		else if (char === 'a') {
			newString += (date.getUTCHours() < 12 ? 'am' : 'pm');
		}
		// AM or PM
		else if (char === 'A') {
			newString += (date.getUTCHours() < 12 ? 'AM' : 'PM');
		}
		// Swatch internet time, 0-999 (... they don't have week numbers, but they have SWATCH INTERNET TIME?!?)
		else if (char === 'B') {
			newString += Math.floor((date.getUTCHours() * 60 * 60 + date.getUTCMinutes() * 60 + date.getUTCSeconds()) / 86400 * 1000).toString().padStart(3, '0');
		}
		// Hour, 1-12
		else if (char === 'g') {
			const hour = date.getUTCHours() % 12;
			newString += (hour === 0 ? '12' : hour.toString());
		}
		// Hour, 0-23
		else if (char === 'G') {
			newString += date.getUTCHours().toString();
		}
		// Hour, 01-12
		else if (char === 'h') {
			const hour = date.getUTCHours() % 12;
			newString += (hour === 0 ? '12' : hour.toString()).padStart(2, '0');
		}
		// Hour, 00-23
		else if (char === 'H') {
			newString += date.getUTCHours().toString().padStart(2, '0');
		}
		// Minutes, 00-59
		else if (char === 'i') {
			newString += date.getUTCMinutes().toString().padStart(2, '0');
		}
		// Seconds, 00-59
		else if (char === 's') {
			newString += date.getUTCSeconds().toString().padStart(2, '0');
		}
		// Microseconds. NOTE - since the purpose of this function is to mimic the result of a php date() function, it does not actually return microseconds, as date("u") in PHP will always return 000000.
		else if (char === 'u') {
			newString += '000000';
		}
		// Milliseconds. NOTE - since the purpose of this function is to mimic the result of a php date() function, it does not actually return milliseconds, as date("v") in PHP will always return 000.
		else if (char === 'v') {
			newString += '000';
		}

		// TIMEZONE STUFF: Not actually calculated, since I know the timezone should be UTC
		else if (char === 'e') {
			newString += 'UTC';
		}
		else if (char === 'I') {
			newString += '0';
		}
		else if (char === 'O') {
			newString += '+0000';
		}
		else if (char === 'P') {
			newString += '+00:00';
		}
		else if (char === 'p') {
			newString += 'Z';
		}
		else if (char === 'T') {
			newString += 'UTC';
		}
		else if (char === 'Z') {
			newString += '0';
		}
		// ISO-8601 string
		else if (char === 'c') {
			newString += date.toISOString();
		}
		// RFC 2822 / RFC 5322 formatted date
		else if (char === 'r') {
			newString += phpdate('D, j M Y H:i:s O');
		}
		// Seconds since epoch
		else if (char === 'U') {
			newString += Math.floor(date.getTime() / 1000).toString();
		}
		else {
			newString += char;
		}
	}

	return newString;

}

export default phpdate;