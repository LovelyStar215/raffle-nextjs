import React from 'react';

const GameMetrics = ({
	web3,
	gameTokenMetadata,
	game
}) => {
	const items = Object.entries(game).map(([key, val]) => {
		console.log('gameItems');
		if (key.substring(0, 1) === '_') return null;

		// Shorten address
		if (key.substring((key.length - 7)) === 'Address') {
			// console.log(parseInt(val));
			val = val.length > 10
				? val.slice(0,6) + '...' + val.slice(-4)
				: (parseInt(val) == 0
					? '&ndash;'
					: val
				);
		}
		
		// Format wei by decimals, and add symbol
		else if(key === 'ticketPrice') {
			console.log('ticketPrice-gameTokenMetadata')
			console.log(gameTokenMetadata);
			if (gameTokenMetadata) {
				console.log('gameItems-getToken');
				console.log(gameTokenMetadata);
				val = gameTokenMetadata.decimals === '18' ? web3.utils.fromWei(val) : val; // game._decimals
				if (gameTokenMetadata.symbol) val += ' ' + gameTokenMetadata.symbol;
			}
		}

		return (
			<div key={`game-${game.gameNumber}-${key}`}>
				<strong>{key}</strong>
				<span>{val}</span>
			</div>
		)
	});

	return (
		<div key={`gameMetrics-${game.gameNumber}`} className="items">
			<div>{items}</div>
		</div>
	)
};

export default GameMetrics;