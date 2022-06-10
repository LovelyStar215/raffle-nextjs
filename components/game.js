import React, { useState, useEffect, useRef } from 'react';

const Game = ({
	getToken,
	game,
	gameTickets,
	web3,
	IERC20MetadataABI,
	gameAddress,
	gameContract,
	activeAddress,
	buyTicket,
	getGamePlayerState,
	hideGame
}) => {
	// getGamePlayerState(
	// 	game.gameNumber,
	// 	activeAddress
	// )

	const numberOfTickets = useRef();

	let gameToken = new web3.eth.Contract(IERC20MetadataABI, game.tokenAddress);

	let hasEnded = game._status == 0;

	let ticketItems = '';

	const gameItems = Object.entries(game).map(([key, val]) => {
		console.log('gameItems');
		if (key.substring(0, 1) === '_') return null;

		// Shorten address
		if (key.substring((key.length - 7)) === 'Address') {
			// console.log(parseInt(val));
			val = val.length > 10
				? val.slice(0,6) + '...' + val.slice(-4)
				: (parseInt(val) == 0
					? '&ndash;'
					: val
				);
		}
		
		// Format wei by decimals, and add symbol
		else if(key === 'ticketPrice') {
			let token = getToken(game.tokenAddress);
			// let token = false;
			if (token) {
				token = token.pop();
				console.log('gameItems-getToken');
				console.log(token);
				val = token.decimals === '18' ? web3.utils.fromWei(val) : val; // game._decimals
				if (token.symbol) val += ' ' + token.symbol;
			}
		}

		return (
			<div key={`game-${game.gameNumber}-${key}`}>
				<strong>{key}</strong>
				<span>{val}</span>
			</div>
		)
	});

	const gamePots = (pots) => {
		// console.log('pots');
		// console.log(pots);

		if (!pots) return false;

		let len = pots.length/2;
		let items = pots.slice(len).map((result, key) => {
			// console.log('pot');
			// console.log(result);

			let displayAddress =
				result?.assetAddress?.slice(0,6)
				+ '...'
				+ result?.assetAddress?.slice(-4)

			let token = getToken(result.assetAddress);
			let value = result.value;
			if (token) {
				token = token.pop();
				console.log('gamePots-getToken');
				console.log(token);
				value =
					token.decimals === '18'
					? web3.utils.fromWei(result.value)
					: result.value; // game._decimals
				
				if (token.symbol) value += ' ' + token.symbol;
			}

			return (
				<div className="pot" key={`game-${game.gameNumber}-pot-${key}`}>
					<div>{result.assetType == 0 ? 'Token' : 'NFT'}</div>
					<div>{displayAddress}</div>
					<div>{value}</div>
				</div>
			);
		}, {});
		
		return (
			<div className="result pots">
				<div>
					<div><strong>Pots</strong></div>
				</div>
				{items}
			</div>
		)
	};

	const gameTicketItems = () => {
		let items = '';
		if (gameTickets) {
			items = Object.keys(gameTickets).map((val, key) => {
				return (
					<div className="ticket" key={`game-${game.gameNumber}-ticket-${key}`}>
						<span>#{val}</span>
					</div>
				);
			}, {});
		}

		return (
			<div className="result tickets">
				<div>
					<div><strong>Tickets</strong></div>
					{items}
				</div>
			</div>
		)
		
	};

	const gameStateBanner = () => {
		if (game._status > 0) {
			return (
				<div className="result state active">
					<div>
						<div><strong>Game in progress</strong></div>
					</div>
				</div>
			);
		}

		const winnerResult = game?._winnerResult?.map((val, idx) => {
			// console.log(idx);
			// console.log(`winnerResult-${game.gameNumber}-${idx}`);
			return (
				<div key={`winnerResult-${game.gameNumber}-${idx}`}>{val}</div>
			);
		});
		// console.log('winnerResult: ' + winnerResult);

		return (
			<div className="result state">
				<div>
					<div><strong>Winning ticket:</strong></div>
					<div className="items">{winnerResult}</div>
				</div>
			</div>
		)
	};

	return (
		<div key={`game-${game.gameNumber}`} className="game">
			<div className="container">
				<h4>Game #{game.gameNumber}</h4>
				{gameStateBanner()}
				<div className="items">
					<div>{gameItems}</div>
				</div>
				{gameTicketItems()}
				{gamePots(game._pot)}
				<div className="buttons">
					<button
						className="button"
						onClick={hideGame}>
						Hide
					</button>
					<button
						disabled={hasEnded}
						className="button"
						onClick={() => {
							let _totalCost = web3.utils.toBN(game.ticketPrice).mul(web3.utils.toBN(game.maxTicketsPlayer));
							gameToken.methods.approve(
								gameAddress,
								_totalCost
							).send({from: activeAddress})
						}}>
						Approve
					</button>
					<button
						disabled={hasEnded}
						className="button"
						onClick={() => {
							getGamePlayerState(
								game.gameNumber,
								activeAddress
							)
						}}>
						Show tickets
					</button>
					<button
						className="button"
						onClick={() => {
							let result = getToken(
								game.tokenAddress,
							)
							console.log('getToken()');
							console.log(result);
						}}>
						Get token
					</button>
					<div className="button">
						<button
							disabled={hasEnded}
							onClick={() => {
								buyTicket(
									gameContract,
									web3.utils.toBN(game.gameNumber),
									web3.utils.toBN(numberOfTickets.current.value)
								)
							}}>
							Buy tickets
						</button>
						<input
							ref={numberOfTickets}
							max={game.maxTicketsPlayer}
							defaultValue="1"
							size="2"
							min="1"
							type="number"
						/>
					</div>
				</div>
			</div>
		</div>
	)
};

export default Game;