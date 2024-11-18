import { Fragment, useEffect, useState } from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import BotPreviewType from '../types/BotPreviewType';
import { usePage } from '../context/PageContext';
import BotPreview from './BotPreview';

const BotList = () => {
	const [params, setParams] = useSearchParams();
	const sort = params.get('sort');
	const page = params.get('page');
	const [total, setTotal] = useState(0);
	const [bots, setBots] = useState(undefined as BotPreviewType[]|undefined);
	const {backendURI} = usePage();

	useEffect(() => {
		setBots(undefined);
		getBots(sort || '', 50, Number(page) || 1)
			.then((res : { data: BotPreviewType[], total: number}) => {
				setBots(res.data);
				setTotal(res.total);
			});
	}, [ sort, page ]);

	const getBots = async (sort? : string, limit = 50, page = 1) => {
		let queryString = '';
		if (sort === 'activeSince') {
			queryString += '&sort=activeSince';
		}
		if (page) {
			queryString += '&page=' + page;
		}
		queryString += '&count=' + limit;
		const res = await fetch( backendURI + '?mode=list' + queryString );
		const json = await res.json();
		return { data: json.data, total: json.total };
	}

	const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	return (
		<main>
			<h2>All BBDQ bots</h2>

			<div className="bot-list-settings">
			<div className="bot-list-setting-sort">
				{sort === 'activeSince' ? 
				<p>Sorted by <strong>creation date</strong><br /><button className="link" onClick={() => setParams({ sort: '' })}>Sort by follower count...</button></p> : 
				<p>Sorted by <strong>follower count</strong><br /><button className="link" onClick={() => setParams({ sort: 'activeSince' })}>Sort by creation date...</button></p>}
			</div>
			<div className="bot-list-setting-page">
				<p>Page {[...Array(Math.ceil(total / 50)).keys()].map(el => <Fragment key={el + 1}>{el > 0 ? ', ' : ''}{el + 1 === Number(page) ? <strong>{el + 1}</strong> : <button className="link" onClick={() => setParams( {sort: sort || '', page: (el + 1).toString()} )}>{el + 1}</button>}</Fragment>)}</p>
			</div>
			</div>

			{bots ? bots.map(el => {
				const created = new Date(el.activeSince);
				return <div className="bot-list-element" key={el.identifier}>
					<BotPreview element={el} />
					<section className="bot-list-meta">
						<p><strong>{el.followers}</strong> followers</p>
						<p>Created <strong>{`${monthNames[created.getMonth()]} ${created.getDate()} ${created.getFullYear()}, ${created.getHours()}:${created.getMinutes()}`}</strong></p>
						{el.script ? <p><strong><Link to={`/bots/${el.identifier}`}>View source</Link></strong></p> : null}

					</section>
				</div>
			}) : <p className="loading">Loading bots ...</p>}
		</main>
	)
}

export default BotList;