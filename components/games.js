import useDeepCompareEffect from 'use-deep-compare-effect'

const Games = ({
	games,
}) => {
	useDeepCompareEffect(() => {
		console.log('component: Games changed');
	}, [games])

	const gameLength = games.length / 2;
	console.log(gameLength);

	return (
		<div className="games">
			<div className="container">
          	<h3>Games</h3>
			{games.map(game => {

				// const gameItems = Object.keys(game).map((key, index) => {
				// 	let item = null;

				// 	console.log(index);
				// 	if (index >= gameLength) {
				// 		let value = game[key];
				// 		if (key.substring((key.length - 7)) === 'Address') {
				// 			value = value > 10 ? value.slice(0,4) + '...' + value.slice(-4) : value;
				// 		}
				// 		item = () => (
				// 			<div>
				// 				<strong>{key}</strong>
				// 				<span>{value}</span>
				// 			</div>
				// 		)
				// 	}
					
				// 	return item;
				// });

				const gameItems = Object.entries(game).slice(games.length/2).map(([key, val]) => {
					if (key.substring((key.length - 7)) === 'Address') {
						val = val > 10 ? val.slice(0,4) + '...' + val.slice(-4) : val;
					}

					return (
						<div>
							<strong>{key}</strong>
							<span>{val}</span>
						</div>
					)
				});

				return (
					<div className="game">
						<div className="container">
							<h4>Game #{game.gameNumber}</h4>
							<div className="items"><div>{gameItems}</div></div>
							<button onClick={() => {}}>Buy tickets</button>
						</div>
					</div>
				)
			})}
		</div>
		</div>
	);
};

export default Games;