import React, { useState, useEffect, useRef } from 'react';
import { IERC20MetadataABI } from '../features/configure/abi.js';

const Game = ({
	getToken,
	game,
	gameTickets,
	web3,
	gameAddress,
	gameContract,
	activeAddress,
	buyTicket,
	getGamePlayerState,
	hideGame,
	setApproval,
	getAllowance
}) => {
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
			console.log('ticketPrice-token')
			console.log(token);
			if (token) {
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

	const gamePots = () => {
		// console.log('pots');
		// console.log(game._pot);
		// console.log(game._pot.length);

		if (!game._pot) return false;
		
		return (
			<div className="result pots">
				<div>
					<div><strong>Pots</strong></div>
				</div>
				{game._pot.map((pot, key) => {
					// console.log('potItem: ' + key);
					// console.log(pot);

					let displayAddress =
					pot?.assetAddress?.slice(0,6)
						+ '...'
						+ pot?.assetAddress?.slice(-4)

					let token = getToken(pot.assetAddress);
					let value = pot.value;
					if (token) {
						// console.log('gamePots-getToken');
						// console.log(token);
						value =
							token.decimals === '18'
							? web3.utils.fromWei(pot.value)
							: pot.value; // game._decimals
						
						if (token.symbol) value += ' ' + token.symbol;
					}

					return (
						<div className="pot" key={`game-${game.gameNumber}-pot-${key}`}>
							<div>{pot.assetType == 0 ? 'Token' : 'NFT'}</div>
							<div>{displayAddress}</div>
							<div>{value}</div>
						</div>
					);
				})}
			</div>
		)
	};

	const gameTicketItems = () => {
		let ticketItems = '';
		let totalShareValue, totalSharePercentage, totalSharePercentageString;
		if (gameTickets && gameTickets[activeAddress]) {
			ticketItems = gameTickets[activeAddress].map((val, key) => {
				return (
					<div className="ticket" key={`game-${game.gameNumber}-ticket-${key}`}>
						<span>#{val}</span>
					</div>
				);
			}, {});

			// Players current pot share (value and percentage), in play
			let token = getToken(game.tokenAddress);
			if (token) {
				console.log('game.ticketPrice');
				console.log(game.ticketPrice);
				console.log('ticketCount');
				let ticketCount = gameTickets[activeAddress].length;
				let ticketCountBN = web3.utils.toBN(ticketCount);
				// console.log(ticketCount);
				// let decimals = web3.utils.toBN(token.decimals);
				// console.log('token.decimals');
				// console.log(decimals);
				// totalShareValue = web3.utils
				// 	.toBN(game.ticketPrice)
				// 	.mul(ticketCount);
				// console.log('shareBN');
				// console.log(totalShareValue.toString());
				// totalShareValue = web3.utils
				// 	.toBN(game.ticketPrice).div(
				// 		web3.utils
				// 		.toBN(10)
				// 		.pow(decimals)
				// 	)
				// 	.toString() + ' ' + token.symbol;
				totalShareValue = web3.utils.fromWei(web3.utils.toBN(game.ticketPrice).mul(ticketCountBN));
				if (token.symbol) totalShareValue += ' ' + token.symbol;

				totalSharePercentage = (ticketCount * parseInt(game.ticketCount)).toFixed(2);
				if (totalSharePercentage)
					totalSharePercentageString = `(${totalSharePercentage}%)`;
			}
		}

		return (
			<div className="result pots">
				<div>
					<div><strong>Your play</strong></div>
				</div>
				<div className="pot">
					<div><strong>Tickets ({ticketCount})</strong></div>
					{ticketItems}
				</div>
				<div className="pot">
					<div><strong>Share of pot</strong></div>
					{totalShareValue} {totalSharePercentageString}
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
				{gamePots()}
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
					<button
						disabled={hasEnded}
						className="button"
						onClick={() => {
							let _totalCost = web3.utils.toBN(game.ticketPrice).mul(web3.utils.toBN(game.maxTicketsPlayer));
							gameToken.methods.approve(
								gameAddress,
								_totalCost
							).send({from: activeAddress})
							.on('receipt', function(receipt) {
								// console.log(receipt);
								setApproval(receipt.to, _totalCost);
								// let allowance = getAllowance(game.tokenAddress);
								// console.log('getAllowance');
								// console.log(allowance);
							});
						}}>
						Approve
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