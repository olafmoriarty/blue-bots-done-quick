import timezoneOffsetToTimezone from '../utils/timezoneOffsetToTimezone';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { CustomAutopostRow } from '../types/CustomAutopostRow';

const AutopostSettings = (props : Props) => {
	const { autopostTimes, setAutopostTimes } = props;

	const date = new Date();
	const timezoneOffsetInMinutes = date.getTimezoneOffset();

	const timePlusOffset = (time : string, direction : "toUTC"|"toLocal" = "toUTC") => {
		const timeParts = time.split(':');
		
		const minutesIntoDay = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);
		const minutesIntoDayConverted = direction === "toLocal" ? minutesIntoDay - timezoneOffsetInMinutes : minutesIntoDay + timezoneOffsetInMinutes;

		const newHour = Math.floor(minutesIntoDayConverted / 60).toString().padStart(2, '0');
		const newMinutes = ((60 + minutesIntoDayConverted % 60) % 60).toString().padStart(2, '0');
		return `${ newHour }:${ newMinutes }`;
	}


	const autopostRows : CustomAutopostRow[] = autopostTimes ? JSON.parse(autopostTimes).map((el : CustomAutopostRow) => {
		if (!el.time) {
			return el;
		}
		let newTime = timePlusOffset(el.time, "toLocal");
		let newEl = { ...el, time: newTime };
		let hour = parseInt(newTime.split(':')[0]);
		let minutes = newTime.split(':')[1];
		if (hour < 0) {
			hour += 24;
			newTime = `${ hour.toString().padStart(2, '0') }:${minutes}`;
			newEl.time = newTime;
			if (el.type === 'w' && el.weekdays && el.weekdays.length) {
				const newWeekdays = el.weekdays.map(day => ((day - 1) + 7) % 7);
				newEl.weekdays = newWeekdays;
				return newEl;
			}
			if (el.type === 'm' && el.monthdays) {
				const newMonthdays = el.monthdays.split(',').map(date => (parseInt(date) - 1)).join(',');
				newEl.monthdays = newMonthdays;
				return newEl;
			}
		}
		if (hour > 23) {
			hour -= 24;
			newTime = `${ hour.toString().padStart(2, '0') }:${minutes}`;
			newEl.time = newTime;
			if (el.type === 'w' && el.weekdays && el.weekdays.length) {
				const newWeekdays = el.weekdays.map(day => ((day + 1) + 7) % 7);
				newEl.weekdays = newWeekdays;
				return newEl;
			}
			if (el.type === 'm' && el.monthdays) {
				const newMonthdays = el.monthdays.split(',').map(date => (parseInt(date) + 1)).join(',');
				newEl.monthdays = newMonthdays;
				return newEl;
			}
		}

		return { ...el, time: newTime };
	}) : [{type: "d", rule: "", time: ""}];
	const setAutopostRows = ( value : CustomAutopostRow[] ) => {
		const convertedValue = [ ...value ].map(el => el.time ? { ...el, time: timePlusOffset(el.time) } : el);
		const json = JSON.stringify(convertedValue);
		console.log(json);
		setAutopostTimes(json);
	}

	const updateField = (row : number, fieldName : string, value : string) => {
		setAutopostRows(autopostRows.map((el, index) => index === row ? { ...el, [fieldName]: value } : el))
	}

	const updateWeekdays = (row : number, dayIndex : number, isChecked : boolean) => {
		const oldValue = autopostRows[row]?.weekdays || [];
		let newValue = [ ...oldValue ];
		if (isChecked && !oldValue.includes(dayIndex)) {
			newValue.push(dayIndex);
		}
		else if (!isChecked) {
			newValue = newValue.filter(day => day !== dayIndex);
		}
		setAutopostRows(autopostRows.map((el, index) => index === row ? { ...el, weekdays: newValue } : el))
	}

	const deleteRow = (row : number) => {
		if (row > autopostRows.length) {
			return;
		}
		const arr = [ ...autopostRows ];
		arr.splice(row, 1);
		setAutopostRows(arr);

	}

	const addRow = () => {
		setAutopostRows([
			...autopostRows,
			{type: "d", rule: "", time: ""},
		]);
	}

	const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

	return (
		<div className="custom-autopost-wrapper">{
			autopostRows.map((row, index) => <div className="custom-autopost-row" data-mode={row.type} key={index}>
				<div className="custom-autopost-mode">
					<label>
						<h5 className="form-description">Type</h5>
						<select value={row.type} onChange={(ev) => updateField(index, "type", ev.target.value)}>
							<option value="d">Daily</option>
							<option value="w">Weekly</option>
							<option value="m">Monthly</option>
						</select>
					</label>

				</div>
				<div className="custom-autopost-details">{row.type === 'w' ?
					<>
						<h5 className="form-description">Days</h5>
						{weekdays.map((day, dayIndex) => <p key={day}><label><input type="checkbox" checked={row.weekdays?.includes((dayIndex + 1) % 7) || false} onChange={event => updateWeekdays( index, (dayIndex + 1) % 7, event.target.checked )} /> {day}</label></p>)}
					</>
				: row.type === 'm' ?
					<>
						<label>
							<h5 className="form-description">Dates</h5>
							<input type="text" value={row.monthdays || ""} onChange={(ev) => updateField(index, "monthdays", ev.target.value)} />
							<p className="form-description">E.g. "7" or "7,14,21,28"</p>
						</label> 
					</>
				: null}</div>
				<div className="custom-autopost-time">
					<label>
					<h5 className="form-description">Time</h5>
					<input type="time" value={row.time} onChange={(ev) => updateField(index, "time", ev.target.value)} /></label>
					<p className="form-description">{timezoneOffsetToTimezone(timezoneOffsetInMinutes)}</p>
				</div>
				<div className="custom-autopost-rule">
					<label>
						<h5 className="form-description">Tracery rule</h5>
						<input type="text" placeholder="#origin#" value={row.rule} onChange={(ev) => updateField(index, "rule", ev.target.value)} />
					</label>
				</div>
				<div className="custom-autopost-buttons"><button className="link" onClick={() => deleteRow(index)}><Icon icon={faTrash} /></button></div>
			</div>
		)			
		}
		<button onClick={addRow} className="add-row">Add another row...</button></div>		
	)
}

type Props = {
	autopostTimes : string,
	setAutopostTimes : (rows : string) => void,
}

export default AutopostSettings;