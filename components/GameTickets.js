import Web3 from 'web3'

const GameTickets = ({
	activeAddress,
	gameTickets,
	gameTokenMetadata,
	game
}) => {
	if (gameTokenMetadata.state === 0) return false;
	
	let ticketItems = '';
	let totalSharePercentage = 0;
	let totalShareValue, totalSharePercentageString;

	if (!gameTickets || !gameTickets[activeAddress] || !gameTickets[activeAddress].length) {
		return (
			<div key={`gameTickets-${game.gameNumber}`} className="result empty">
				<div className="panels">
					<div>
						<p>You don&apos;t have any tickets in this game.</p>
					</div>
				</div>
			</div>
		);
	}

	ticketItems = gameTickets[activeAddress].map((val, key) => {
		return (
			<div className="ticket" key={`game-${game.gameNumber}-ticket-${key}`}>
				<span>T#{val}</span>
			</div>
		);
	}, {});

	// Players current pot share (value and percentage), in play
	// let token = getERC20Token(game.pot[0].assetAddress);
	if (gameTokenMetadata) {
		// console.log('game.ticketPrice');
		// console.log(game.ticketPrice);
		// console.log('ticketCount');
		let playerTicketCount = gameTickets[activeAddress].length;
		let playerTicketCountBN = Web3.utils.toBN(playerTicketCount);
		// console.log(playerTicketCount);
		// let decimals = Web3.utils.toBN(gameTokenMetadata.decimals);
		// console.log('gameTokenMetadata.decimals');
		// console.log(decimals);
		// totalShareValue = Web3.utils
		// 	.toBN(game.ticketPrice)
		// 	.mul(playerTicketCount);
		// console.log('shareBN');
		// console.log(totalShareValue.toString());
		// totalShareValue = Web3.utils
		// 	.toBN(game.ticketPrice).div(
		// 		Web3.utils
		// 		.toBN(10)
		// 		.pow(decimals)
		// 	)
		// 	.toString() + ' ' + gameTokenMetadata.symbol;
		totalShareValue = Web3.utils.fromWei(Web3.utils.toBN(game.ticketPrice).mul(playerTicketCountBN));
		if (gameTokenMetadata.symbol) totalShareValue += ' ' + gameTokenMetadata.symbol;

		let gameTicketCount = parseInt(game.ticketCount);
		if (gameTicketCount)
			totalSharePercentage = ((playerTicketCount * 100) / gameTicketCount).toFixed(2);
		totalSharePercentageString = `(${totalSharePercentage}%)`;
	}

	return (
		<div key={`gameTickets-${game.gameNumber}`} className="result">
			<div className="panels">
				<div>
					<h5>Your tickets ({playerTicketCount})</h5>
				</div>
				<div>
					<div className="panel">
						<div className="items">
							{ticketItems}
						</div>
					</div>
					<div className="panel">
						<div className="items">
							<div><strong>Share of pot</strong></div>
							{totalShareValue} {totalSharePercentageString}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
};

export default GameTickets;