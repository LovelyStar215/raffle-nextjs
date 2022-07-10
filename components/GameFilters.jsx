import React, { useRef } from 'react';
import Web3 from 'web3'

export const GameFilters = ({
	gameListRenderMode,
	setGameListRenderMode,
	getGameState,
	gameContract
}) => {
	const getGameStateId = useRef();

	const states = [
		'Finished',
		'House',
		'Community',
		'All',
	];

	const buttons = states.map((val, key) => {
		let arr = [
			'button'
		];
	
		if (gameListRenderMode === key)
			arr.push('active');
		
		return (
			<button
				key={`gameFilter-${key}`}
				onClick={() => setGameListRenderMode(key)}
				className={arr.join(' ')}
			>
				{val}
			</button>
		)
	});

	return (
		<div className="grid">
			<div className="row">
			<div className="md-50">
					<div>
						<div className="buttons">
						<div
							onClick={(e) => {
								if (e.target.tagName === 'DIV')
								getGameState(
									gameContract,
									Web3.utils.toBN(getGameStateId.current.value)
								)
							}}
							className="button"
							title="Poll blockchain for raffle information"
							role="button"
							tabIndex="0">
								<div>Raffle search</div>
								<input ref={getGameStateId} placeholder="Enter a raffle number" size="8" min="0" type="number" />
							</div>
						</div>
					</div>
				</div>
				<div className="md-50">
					<div>
						<div className="buttons">
							{buttons}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};