import React from 'react';

const GamePots = ({
	web3,
	gameTokenMetadata,
	game,
	getERC20Token,
	getERC721Token
}) => {
	if (gameTokenMetadata.state === 0)
		return false;

	if (!game.pot)
		return false;
	
	return (
		<div key={`gamePots-${game.gameNumber}`} className="result">
			<div className="panels">
				<div>
					<h5>Game prize</h5>
				</div>
				<div>
					{game.pot.map((pot, key) => {
						let value = pot.value;

						// Skip game pots (except for pot zero for tickets)
						// that have been removed
						if (key && value == 0) return null;

						let displayAddress =
							pot?.assetAddress?.slice(0,6)
							+ '...'
							+ pot?.assetAddress?.slice(-4)

						if (pot.assetType == 0) {
							let assetMetadata = getERC20Token(pot.assetAddress);
							if (assetMetadata) {
								// console.log('gamePots-getERC20Token');
								// console.log(token);
								value =
									assetMetadata.decimals === '18'
									? web3.utils.fromWei(pot.value)
									: pot.value; // game._decimals
								
								if (assetMetadata.symbol) value += ' ' + assetMetadata.symbol;
							}
						} else if (pot.assetType == 1) {
							value = `#${pot.value}`
							
							// let assetMetadata = getERC721Token(pot.assetAddress);
							// if (assetMetadata) {
							// 	value += ' ' + assetMetadata.symbol;
							// }
						}

						return (
							<div className="panel" key={`game-${game.gameNumber}-pot-${key}`}>
								<div className="items">
									<div>{pot.assetType == 1 ? 'NFT' : 'Token'}</div>
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