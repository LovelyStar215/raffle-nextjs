import React from 'react';

const GameStatus = ({
	game
}) => {
	if (game.status > 0) {
		return (
			<div className="result state active">
				<div className="panels">
					<h5>Game is active</h5>
				</div>
			</div>
		);
	}

	const winnerResult = game?.winnerResult?.map((val, idx) => {
		// console.log(idx);
		// console.log(`winnerResult-${game.gameNumber}-${idx}`);
		return (
			<div className="ticket" key={`winnerResult-${game.gameNumber}-${idx}`}>#{val}</div>
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