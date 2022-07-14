import React from 'react';

const GameMetrics = ({
	web3,
	gameTokenMetadata,
	game,
	deployment
}) => {
	if (gameTokenMetadata.state === 0) return false;

	let labels = [
		['playerCount', 'Player count', 'Total number of players currently in this game'],
		['ticketCount', 'Ticket count', 'Total number of tickets bought by players'],
		['maxPlayers', 'Max players', 'Maximum number of players allowed'],
		['maxTicketsPlayer', 'Max tickets per player', 'Maximum number of tickets, a single player can have'],
		['feePercent', 'Fee percent', 'The amount in percent, that will be deducted from the ticket prize pot'],
		['feeAddress', 'Fee address', 'The destination address, where the fee percentage will be sent'],
		['ownerAddress', 'Owner address', 'The user address, that started this game.'],
		['winnerAddress', 'Winner address', 'The winner address, that won the game pots.']
	];
	
	const items = Object.entries(game).map(([key, val]) => {
		// console.log('gameItems');
		if (
			key === 'gameNumber'
			|| key === 'pot'
			|| key === 'status'
			|| key === 'ticketPrice'
			|| key === 'winnerResult'
		) return null;

		// Get `key` label records
		const keyLabel = labels.filter(function (label) {
			return label[0] === key;
		});

		// Shorten address
		if (key.substring((key.length - 7)) === 'Address') {
			let isNull = (val == '0x0000000000000000000000000000000000000000');

			return (
				<div key={`game-${game.gameNumber}-${key}`}>
					<div className="pill">
						<strong>{keyLabel.length ? keyLabel[0][1] : key}</strong>
						<div title={val}>
							{isNull
								? `－`
								: <a href={`${deployment.explorerAddressURI}${val}`}>
									{val.length > 10
									? val.slice(0,6) + '...' + val.slice(-4)
									: val}
								</a>}
						</div>
					</div>
				</div>
			)
		} else if(key === 'feePercent') {
			let percentage = parseInt(val);

			let classes = ['pill'];
			if (percentage) {
				for (let i = 20; i <= 100; i += 20) {
					if (percentage >= (i-20) && percentage <= i)
						classes.push(`p${i}`);
				}
			} else
				classes.push('p0');

			return (
				<div key={`game-${game.gameNumber}-${key}`}>
					<div className={classes.join(' ')}>
						<strong>{keyLabel.length ? keyLabel[0][1] : key}</strong>
						<div>{val}%</div>
					</div>
				</div>
			)
		}

		return (
			<div key={`game-${game.gameNumber}-${key}`}>
				<div className="pill">
					<strong>{keyLabel.length ? keyLabel[0][1] : key}</strong>
					<div>{val}</div>
				</div>
			</div>
		)
	});

	return (
		<div key={`gameMetrics-${game.gameNumber}`} className="metrics items">
			<div>{items}</div>
		</div>
	)
};

export default GameMetrics;