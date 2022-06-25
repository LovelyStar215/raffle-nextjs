import React, { useEffect } from 'react';

import Game from './Game'

const GamesList = ({
	getAllowancePlayerIndex,
	getActiveGames,
	tickets,
	getERC20Token,
	getERC721Token,
	games,
	web3,
	gameContract,
	activeAddress,
	buyTicket,
	getGamePlayerState,
	setGames,
	setAllowance,
	getAllowance
}) => {
	if (!gameContract || !web3)
		return null;

	if (!games || !games.length) {
		let runOnce = true;
		getActiveGames(10, runOnce);
		return null;
	}

	return (
		<div key={`gamesList`} className="games">
			<div className="container">
          		<h3>Games</h3>
				{games.map(game => {
					if (!game)
						return null;
					
					const hideGame = () => {
						let newGames = games;
						newGames[game.gameNumber] = null;
						//newGames[game._visibility] = false;
						console.log(newGames);
						setGames([...newGames]);
					};

					return (
						<Game
							key={`gameNumber-${game.gameNumber}`}
							getAllowancePlayerIndex={getAllowancePlayerIndex}
							getERC20Token={getERC20Token}
							getERC721Token={getERC721Token}
							game={game}
							gameTickets={tickets[game.gameNumber]}
							web3={web3}
							gameContract={gameContract}
							activeAddress={activeAddress}
							buyTicket={buyTicket}
							getGamePlayerState={getGamePlayerState}
							hideGame={hideGame}
							setAllowance={setAllowance}
							getAllowance={getAllowance}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default GamesList;