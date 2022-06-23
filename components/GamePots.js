import React, { useState, useEffect, useRef } from 'react';
import {
	IERC20MetadataABI,
	IERC721MetadataABI
} from '../features/configure/abi.js';

import {
	gameAddress,
	gameTrophyAddress,
	tokenAddress
} from '../features/configure/env';

const GamePots = ({
	web3,
	gameTokenMetadata,
	game
}) => {
	// console.log('pots');
	// console.log(game._pot);
	// console.log(game._pot.length);

	if (!game._pot) return false;
	
	return (
		<div className="result">
			<div className="panels">
				<div>
					<h5>Game prize</h5>
				</div>
				<div>
					{game._pot.map((pot, key) => {
						let value = pot.value;

						// Skip game pots (except for pot zero for tickets)
						// that have been removed
						if (key && value == 0) return null;

						let displayAddress =
						pot?.assetAddress?.slice(0,6)
							+ '...'
							+ pot?.assetAddress?.slice(-4)

						if (pot.assetType == 0) {
							// let token = getToken(pot.assetAddress);
							// if (token) {
							// 	// console.log('gamePots-getToken');
							// 	// console.log(token);
							// 	value =
							// 		token.decimals === '18'
							// 		? web3.utils.fromWei(pot.value)
							// 		: pot.value; // game._decimals
								
							// 	if (token.symbol) value += ' ' + token.symbol;
							// }
							if (gameTokenMetadata) {
								// console.log('gamePots-getToken');
								// console.log(token);
								value =
									gameTokenMetadata.decimals === '18'
									? web3.utils.fromWei(pot.value)
									: pot.value; // game._decimals
								
								if (gameTokenMetadata.symbol) value += ' ' + gameTokenMetadata.symbol;
							}
						} else if (pot.assetType == 1) {
							value = `#${pot.value}`
						}

						return (
							<div className="panel" key={`game-${game.gameNumber}-pot-${key}`}>
								<div className="items">
									<div>{pot.assetType == 0 ? 'Token' : 'NFT'}</div>
									<div>{displayAddress}</div>
									<div>{value}</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	)
};

export default GamePots;