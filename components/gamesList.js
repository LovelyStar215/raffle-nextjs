import React, { useEffect } from 'react';

import Game from './game'

const GamesList = ({
	tickets,
	getToken,
	games,
	web3,
	gameAddress,
	gameContract,
	activeAddress,
	buyTicket,
	getGamePlayerState,
	setGames
}) => {
	if (!games || !gameContract || !games.length || !web3)
		return null;

	return (
		<div className="games">
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
							getToken={getToken}
							game={game}
							gameTickets={tickets[game.gameNumber]}
							web3={web3}
							gameAddress={gameAddress}
							gameContract={gameContract}
							activeAddress={activeAddress}
							buyTicket={buyTicket}
							getGamePlayerState={getGamePlayerState}
							hideGame={hideGame}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default GamesList;