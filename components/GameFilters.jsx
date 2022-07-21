import React, { useRef } from 'react';
import Web3 from 'web3'
import { IconSearch } from './IconSearch';

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

	const controls = states.map((val, key) => {
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
						<div className="controls">
						<div
							onClick={(e) => {
								if (
									e.target.tagName === 'DIV'
									|| e.target.tagName.toUpperCase() === 'SVG'
									|| e.target.tagName.toUpperCase() === 'PATH'
								)
									getGameState(
										gameContract,
										Web3.utils.toBN(getGameStateId.current.value)
									)
							}}
							className="button search"
							title="Poll blockchain for raffle information"
							role="button"
							tabIndex="0">
								<input
									ref={getGameStateId}
									placeholder="Enter a raffle number"
									min="0"
									type="number"
								/>
								<div>
									<IconSearch />
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="md-50">
					<div>
						<div className="controls">
							{controls}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};