import React, { useRef } from 'react';
// import { BN } from 'bn.js';

const Game = ({
	game,
	web3,
	ERC20TokenABI,
	gameAddress,
	gameContract,
	activeAddress,
	buyTicket,
	hideGame
}) => {
	const numberOfTickets = useRef();

	let approvalAmount = game.ticketPrice * game.maxTicketsPlayer;//numberOfTickets; //game.maxTicketsPlayer;

	let gameToken = new web3.eth.Contract(ERC20TokenABI, game.tokenAddress);

	let hasEnded = !game.status;

	const gameItems = Object.entries(game).map(([key, val]) => {

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
			

		return (
			<div>
				<strong>{key}</strong>
				<span>{val}</span>
			</div>
		)
	});

	return (
		<div key={`game-${game.gameNumber}`} className="game">
			<div className="container">
				<h4>Game #{game.gameNumber}</h4>
				<div className="items"><div>{gameItems}</div></div>
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
							let decimals = web3.utils.toBN(18);
							let value = web3.utils.toBN(approvalAmount).mul(web3.utils.toBN(10).pow(decimals));
							gameToken.methods.approve(gameAddress, value).send({from: activeAddress})
						}}>
						Approve funds
					</button>
					<div className="button">
						<button
							disabled={hasEnded}
							onClick={() => {
								buyTicket(gameContract, game.gameNumber, numberOfTickets.current.value)
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