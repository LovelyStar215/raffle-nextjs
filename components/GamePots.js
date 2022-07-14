import Web3 from 'web3'

const GamePots = ({
	gameTokenMetadata,
	game,
	getERC20Token,
	getERC721Token,
	deployment
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
								let convertedValue =
									assetMetadata.decimals === '18'
									? Web3.utils.fromWei(pot.value)
									: pot.value; // game._decimals
								
								value = convertedValue;
								
								if (assetMetadata.symbol)
									value += ' ' + assetMetadata.symbol;

								// On game pot zero, show value minus the fee (if applicable)
								if (!key) {
									let feePercent = parseInt(game.feePercent);
									if (feePercent) {
										let feePercent = parseInt(game.feePercent);
										let valueWithFee = (parseInt(convertedValue) / 100) * (100 - feePercent);
										value += ` (${valueWithFee} ${assetMetadata.symbol})`;
									}
								}
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
									<div>P#{key}</div>
									<div>{pot.assetType == 1 ? 'NFT' : 'Token'}</div>
									<div>
										<a href={`${deployment.explorerAddressURI}${pot.assetAddress}`}>
											{displayAddress}
										</a>
									</div>
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