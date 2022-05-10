import React, { useRef } from 'react';

const Game = ({
	game,
	web3,
	IERC20MetadataABI,
	gameAddress,
	gameContract,
	activeAddress,
	buyTicket,
	hideGame
}) => {
	const numberOfTickets = useRef();

	let gameToken = new web3.eth.Contract(IERC20MetadataABI, game.tokenAddress);

	let hasEnded = game.status !== 'true';

	const gameItems = Object.entries(game).map(([key, val]) => {
		if (key.substring(0, 1) === '_') return null;

		// Shorten address
		if (key.substring((key.length - 7)) === 'Address') {
			// console.log(parseInt(val));
			val = val.length > 10
				? val.slice(0,5) + '...' + val.slice(-4)
				: (parseInt(val) == 0
					? '&ndash;'
					: val
				);
		}
		
		// Format wei by decimals, and add symbol
		else if(key === 'pot' || key === 'ticketPrice') {
			val = game._decimals === '18' ? web3.utils.fromWei(val) : val; // game._decimals
			if (game._symbol) val += ' ' + game._symbol;
		}

		return (
			<div>
				<strong>{key}</strong>
				<span>{val}</span>
			</div>
		)
	});

	const gameStateBanner = () => {
		if (game.status === 'true') {
			return (
				<div className="result active">
					<div>
						<div><strong>Game in progress</strong></div>
					</div>
				</div>
			);
		}

		const winnerResult = game._winnerResult.map(([val]) => {
			return (
				<div>{val}</div>
			);
		});
		// console.log('winnerResult: ' + winnerResult);

		return (
			<div className="result">
				<div>
					<div><strong>Winning ticket:</strong></div>
					<div className="items">{winnerResult}</div>
				</div>
			</div>
		)
	};

	return (
		<div key={`game-${game.gameNumber}`} className="game">
			<div className="container">
				<h4>Game #{game.gameNumber}</h4>
				{gameStateBanner()}
				<div className="items">
					<div>{gameItems}</div>
				</div>
				<div className="buttons">
					<button
						className="button"
						onClick={hideGame}>
						Hide
					</button>
					<button
						disabled={hasEnded}
						className="button"
						onClick={() => {
							let _totalCost = web3.utils.toBN(game.ticketPrice).mul(web3.utils.toBN(game.maxTicketsPlayer));
							gameToken.methods.approve(
								gameAddress,
								_totalCost
							).send({from: activeAddress})
						}}>
						Approve
					</button>
					<div className="button">
						<button
							disabled={hasEnded}
							onClick={() => {
								buyTicket(
									gameContract,
									web3.utils.toBN(game.gameNumber),
									web3.utils.toBN(numberOfTickets.current.value)
								)
							}}>
							Buy tickets
						</button>
						<input
							ref={numberOfTickets}
							max={game.maxTicketsPlayer}
							defaultValue="1"
							size="2"
							min="1"
							type="number"
						/>
					</div>
				</div>
			</div>
		</div>
	)
};

export default Game;