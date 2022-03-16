import React from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect'

const Games = ({
	games,
	web3,
	ERC20TokenABI,
	gameAddress,
	gameContract,
	srcAddress,
	buyTicket
}) => {
	useDeepCompareEffect(() => {
		console.log('component: Games changed');
	}, [games])

	return (
		<div className="games">
			<div className="container">
          		<h3>Games</h3>
				{games.map(game => {
					if (typeof game === 'undefined')
						return;

					let numberOfTickets = game.maxTicketsPlayer;

					let approvalAmount = game.ticketPrice * 10;//numberOfTickets; //game.maxTicketsPlayer;

					let gameToken = new web3.eth.Contract(ERC20TokenABI, game.tokenAddress);

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
						<div className="game">
							<div className="container">
								<h4>Game #{game.gameNumber}</h4>
								<div className="items"><div>{gameItems}</div></div>
								<div className="buttons">
									<button className="button" onClick={() => {gameToken.methods.approve(gameAddress, approvalAmount).send({from: srcAddress})}}>Approve funds</button>
									<div className="button">
										<button onClick={() => {buyTicket(gameContract, game.gameNumber, numberOfTickets)}}>Buy tickets</button>
										<input defaultValue={game.maxTicketsPlayer} size="3" max={game.maxTicketsPlayer} min="1" onChange={event => {
											numberOfTickets = event.target.value;
										}} type="number" />
									</div>
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	);
};

export default Games;