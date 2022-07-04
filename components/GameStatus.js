import React from 'react';

import {
	EXPLORER_ADDRESS_URI
} from '../features/configure/env.js'

const GameStatus = ({
	game
}) => {
	if (game.status > 0) {
		return (
			<div className="result state active">
				<div className="panels">
					<h5>{game.status === '2' ? `Community game is active` : `House game is active`}</h5>
					<p>{game.status === '2'
						? <span>This is an independent game started by&nbsp; 
							<a href={`${EXPLORER_ADDRESS_URI}${game.ownerAddress}`}>
								{game.ownerAddress}
							</a>
						</span>
						: `This game was started by the management team`
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