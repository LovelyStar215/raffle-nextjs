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

import GameMetrics from '../components/GameMetrics'
import GamePots from '../components/GamePots'
import GameStatus from '../components/GameStatus'
import GameTickets from '../components/GameTickets'

const Game = ({
	getAllowancePlayerIndex,
	getToken,
	game,
	gameTickets,
	web3,
	gameContract,
	activeAddress,
	buyTicket,
	getGamePlayerState,
	hideGame,
	setApproval,
	getAllowance
}) => {
	const numberOfTickets = useRef();
	const addGamePotERC20AssetAddress = useRef();
	const addGamePotERC20AssetAmount = useRef();
	const addGamePotERC721AssetAddress = useRef();
	const addGamePotERC721AssetId = useRef();
	const removeGamePotERC20AssetAddress = useRef();
	const removeGamePotERC20AssetAmount = useRef();
	const removeGamePotERC721AssetAddress = useRef();
	const removeGamePotERC721AssetId = useRef();

	let gameToken = new web3.eth.Contract(IERC20MetadataABI, game.tokenAddress);

	// Get game token metadata
	let gameTokenMetadata = {};

	let gameHasEnded = (game._status == 0);

	// User has the necessary contract roles?
	let hasManagementAccess = true; // TBC

	// Set current game token allowance/approval state
	let gameTokenApprovalMax;
	let gameTokenAllowance;
	let hasGameTokenApproval = false;

	let gameERC20Tokens = [];
	let gameERC721Tokens = [];

	// Gather all tokens, used in this game
	game._pot.map((pot, potIdx) => {
		let result = [];

		// Non-null addresses only
		if (web3.utils.toBN(pot.assetAddress).gt(web3.utils.toBN(0))) {
			switch (pot.assetType) {
				case '0': {
					if (gameERC20Tokens.length)
						result = gameERC20Tokens.findIndex(_address => _address === pot.assetAddress);
	
					// Doesn't exist
					if (result >= 0)
						gameERC20Tokens[potIdx] = pot.assetAddress;
					
					break;
				}
	
				case '1': {
					if (gameERC721Tokens.length)
						result = gameERC721Tokens.findIndex(_address => _address === pot.assetAddress);
	
					// Doesn't exist
					if (result >= 0)
						gameERC721Tokens[potIdx] = pot.assetAddress;
					
					break;
				}
			}
		}
	});
	// console.log('gameERC20Tokens');
	// console.log(gameERC20Tokens);
	// console.log('gameERC721Tokens');
	// console.log(gameERC721Tokens);

	// Process all game tokens
	gameERC20Tokens.forEach((address, pot) => {

		// First sight of this token
		let tokenResult = getToken(address);

		// The ticket pot (always pot zero)
		if (!pot) {
			gameTokenMetadata = tokenResult;

			gameTokenApprovalMax = web3.utils
				.toBN(game.ticketPrice)
				.mul(web3.utils.toBN(game.maxTicketsPlayer));
			
			// console.log('gameERC20Tokens-getAllowance');
			gameTokenAllowance = getAllowance(address);
			// console.log(gameTokenAllowance);
			
			hasGameTokenApproval =
				web3.utils.toBN(gameTokenAllowance.amount)
				.sub(gameTokenApprovalMax)
				.gte(web3.utils.toBN('0'));
			// console.log(web3.utils.toBN(gameTokenAllowance.amount).sub(gameTokenApprovalMax).toString());
			// console.log('hasGameTokenApproval: ' + hasGameTokenApproval);
		} else {

		}
	});

	const panelManagementClasses = () => {
		let arr = [
			'tools'
		];
		if (!hasManagementAccess)
			arr.push('hide');
		
		return arr.join(' ');
	}

	const buttonApproveClasses = () => {
		let arr = [
			'button'
		];
		if (hasGameTokenApproval)
			arr.push('hide');
		
		return arr.join(' ');
	};

	const buttonBuyTicketClasses = () => {
		let arr = [
			'button'
		];
		if (!hasGameTokenApproval)
			arr.push('hide');
		
		return arr.join(' ');
	};

	return (
		<div key={`game-${game.gameNumber}`} className="game">
			<div className="container">
				<h4>Game #{game.gameNumber}</h4>
				<GameStatus
					game={game}
				/>
				<GameMetrics
					web3={web3}
					gameTokenMetadata={gameTokenMetadata}
					game={game}
				/>
				<GameTickets
					web3={web3}
					activeAddress={activeAddress}
					gameTickets={gameTickets}
					gameTokenMetadata={gameTokenMetadata}
					game={game}
				/>
				<GamePots
					web3={web3}
					gameTokenMetadata={gameTokenMetadata}
					game={game}
				/>
				<div className="buttons">
					<button
						className="button"
						onClick={hideGame}>
						Hide
					</button>
					{/* <button
						disabled={gameHasEnded}
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
					</button> */}
					<button
						disabled={gameHasEnded}
						className={buttonApproveClasses()}
						onClick={() => {
							gameToken.methods.approve(
								gameAddress,
								gameTokenApprovalMax
							).send({from: activeAddress})
							.on('receipt', function(receipt) {
								let newAllowance = {
									state: 1,
									address: game._pot[0].assetAddress,
									amount: gameTokenApprovalMax.toString()
								};
								console.log(newAllowance.amount);
								let _playerAllowanceIdx = getAllowancePlayerIndex(activeAddress);
								setApproval(_playerAllowanceIdx, newAllowance);
							});
						}}>
						Approve
					</button>
					{/* <button
						disabled={gameHasEnded}
						className={buttonApproveClasses()}
						onClick={() => {
							gameToken.methods.allowance(
								activeAddress,
								gameAddress
							).call()
							.on('receipt', function(receipt) {
								console.log('allowance');
								console.log(receipt);
							});
						}}>
						Get allowance
					</button> */}
					<div
						disabled={gameHasEnded}
						className={buttonBuyTicketClasses()}
						onClick={(e) => {
							if (e.target.tagName === 'DIV')
								buyTicket(
									gameContract,
									web3.utils.toBN(game.gameNumber),
									web3.utils.toBN(numberOfTickets.current.value)
								)
						}}
						role="button"
						tabIndex="0">
							<div>Buy tickets</div>
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
				<div className={panelManagementClasses()}>
					<div className="container">
						<div className="buttons">
							<h3>Management</h3>
							<div
								onClick={(e) => {
									if (e.target.tagName === 'DIV') {
										let _amount = web3.utils.toBN(
											addGamePotERC20AssetAmount.current.value)
											.mul(web3.utils.toBN(10).pow(web3.utils.toBN(18)));
										new web3.eth.Contract(
											IERC20MetadataABI,
											addGamePotERC20AssetAddress.current.value
										).methods.approve(
											gameAddress,
											_amount
										).send({from: activeAddress})
										.on('receipt', function(receipt) {
											gameContract.methods.addGamePotERC20Asset(
												web3.utils.toBN(game.gameNumber),
												_amount,
												addGamePotERC20AssetAddress.current.value
											).send({from: activeAddress})
											.on('receipt', function(receipt2) {
												console.log('receipt-addGamePotERC20Asset');
												console.log(receipt);
											});
										});
									}
								}}
								className="button"
								role="button"
								tabIndex="0">
									<div>addGamePotERC20Asset</div>
									<input
										ref={addGamePotERC20AssetAddress}
										defaultValue={tokenAddress}
										placeholder="Address"
										size="6"
										type="text"/>
									<input
										ref={addGamePotERC20AssetAmount}
										placeholder="Amount"
										defaultValue="1"
										size="3"
										min="0"
										type="number"/>
							</div>
							<div
								onClick={(e) => {
									if (e.target.tagName === 'DIV')
										gameContract.methods.removeGamePotERC20Asset(
											web3.utils.toBN(game.gameNumber),
											web3.utils.toBN(
												removeGamePotERC20AssetAmount.current.value)
												.mul(web3.utils.toBN(10).pow(web3.utils.toBN(18))),
												removeGamePotERC20AssetAddress.current.value
										).send({from: activeAddress})
										.on('receipt', function(receipt) {
											console.log('receipt-removeGamePotERC20Asset');
											console.log(receipt);
										});
								}}
								className="button"
								role="button"
								tabIndex="0">
									<div>removeGamePotERC20Asset</div>
									<input
										ref={removeGamePotERC20AssetAddress}
										defaultValue={tokenAddress}
										placeholder="Address"
										size="6"
										type="text"/>
									<input
										ref={removeGamePotERC20AssetAmount}
										placeholder="Amount"
										defaultValue="1"
										size="3"
										min="0"
										type="number"/>
							</div>
							<div
								onClick={(e) => {
									if (e.target.tagName === 'DIV')
										new web3.eth.Contract(
											IERC721MetadataABI,
											addGamePotERC721AssetAddress.current.value
										).methods.approve(
											gameAddress,
											addGamePotERC721AssetId.current.value
										)
										.send({from: activeAddress})
										.on('receipt', (receipt) => {
											console.log(receipt);

											gameContract.methods.addGamePotERC721Asset(
												web3.utils.toBN(game.gameNumber),
												addGamePotERC721AssetId.current.value,
												addGamePotERC721AssetAddress.current.value
											).send({from: activeAddress})
											.on('receipt', function(receipt) {
												console.log('receipt-addGamePotERC721Asset');
												console.log(receipt);
											});
										});
								}}
								className="button"
								role="button"
								tabIndex="0">
									<div>addGamePotERC721Asset</div>
									<input
										ref={addGamePotERC721AssetAddress}
										defaultValue={gameTrophyAddress}
										placeholder="Address"
										size="6"
										type="text"/>
									<input
										ref={addGamePotERC721AssetId}
										placeholder="ID"
										size="3"
										min="0"
										type="number"/>
							</div>
							<div
								onClick={(e) => {
									if (e.target.tagName === 'DIV')
										gameContract.methods.removeGamePotERC721Asset(
											web3.utils.toBN(game.gameNumber),
											removeGamePotERC721AssetId.current.value,
											removeGamePotERC721AssetAddress.current.value
										).send({from: activeAddress})
										.on('receipt', function(receipt) {
											console.log('receipt-removeGamePotERC721Asset');
											console.log(receipt);
										});
								}}
								className="button"
								role="button"
								tabIndex="0">
									<div>removeGamePotERC721Asset</div>
									<input
										ref={removeGamePotERC721AssetAddress}
										defaultValue={gameTrophyAddress}
										placeholder="Address"
										size="6"
										type="text"/>
									<input
										ref={removeGamePotERC721AssetId}
										placeholder="ID"
										size="3"
										min="0"
										type="number"/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
};

export default Game;