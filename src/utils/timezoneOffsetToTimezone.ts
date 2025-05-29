const timezoneOffsetToTimezone = ( minutes : number ) => {
	let timezone = 'UTC';
	timezone += minutes > 0 ? '-' : '+';
	const hours = Math.floor(Math.abs(minutes) / 60).toString();
	timezone += hours.length > 1 ? hours : '0' + hours;
	timezone += ':';
	const extraMinutes = (Math.abs(minutes) % 60).toString();
	timezone += extraMinutes.length > 1 ? extraMinutes : '0' + extraMinutes;
	return timezone;
}

export default timezoneOffsetToTimezone;