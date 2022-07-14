const GameStatus = ({
	game,
	deployment
}) => {
	if (game.status > 0) {
		return (
			<div className="result state active">
				<div className="panels">
					<h5>{game.status === '2' ? `Active community raffle` : `Active house raffle`}</h5>
					<p>{game.status === '2'
						? <span>Started by&nbsp; 
							<a href={`${deployment.explorerAddressURI}${game.ownerAddress}`}>
								{game.ownerAddress}
							</a>
						</span>
						: `This raffle was started by the management team`
					}</p>
				</div>
			</div>
		);
	}

	const winnerResult = game?.winnerResult?.map((val, idx) => {
		// console.log(idx);
		// console.log(`winnerResult-${game.gameNumber}-${idx}`);
		return (
			<div className="ticket" key={`winnerResult-${game.gameNumber}-${idx}`}>T#{val}</div>
		);
	});
	// console.log('winnerResult: ' + winnerResult);

	return (
		<div key={`gameStatus-${game.gameNumber}`} className="result state">
			<div className="panels">
				<h5>Winning ticket is</h5>
				<div className="panel">
					<div className="items">{winnerResult}</div>
				</div>
			</div>
		</div>
	)
};

export default GameStatus;