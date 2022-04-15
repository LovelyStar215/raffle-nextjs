import React, { useEffect } from 'react';

import Game from './game'

const GamesList = ({
	games,
	web3,
	ERC20TokenABI,
	gameAddress,
	gameContract,
	activeAddress,
	buyTicket,
	setGames
}) => {
	if (!games || !games.length || !web3)
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
						console.log(newGames);
						setGames([...newGames]);
					};

					return (
						<Game
							key={game.gameNumber}
							game={game}
							web3={web3}
							ERC20TokenABI={ERC20TokenABI}
							gameAddress={gameAddress}
							gameContract={gameContract}
							activeAddress={activeAddress}
							buyTicket={buyTicket}
							hideGame={hideGame}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default GamesList;