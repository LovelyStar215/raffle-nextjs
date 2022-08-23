import React, { useRef } from 'react';
import Web3 from 'web3';

import {
	IERC20MetadataABI,
	IERC721MetadataABI,
	IERC1155ABI
} from '../features/configure/abi.js';

import {
	CALLER_ROLE,
	MANAGER_ROLE
} from '../features/configure/env';

import GameMetrics from '../components/GameMetrics'
import GamePots from '../components/GamePots'
import GameStatus from '../components/GameStatus'
import GameTickets from '../components/GameTickets'
import { getChainDeployment } from '../features/configure/chain.js';

const Game = ({
	getAllowancePlayerIndex,
	getERC20Token,
	getERC721Token,
	game,
	gameTickets,
	web3,
	gameContract,
	activeAddress,
	buyTicket,
	setAllowance,
	getAllowance,
	hasRole,
	endGame,
	chainId,
	treasuryFeePercent
}) => {
	// if (!chainId)
	// 	return null;

	const numberOfTickets = useRef();
	const addGamePotERC20AssetAddress = useRef();
	const addGamePotERC20AssetAmount = useRef();
	const addGamePotERC721AssetAddress = useRef();
	const addGamePotERC721AssetId = useRef();
	const addGamePotERC1155AssetAddress = useRef();
	const addGamePotERC1155AssetId = useRef();
	// const removeGamePotERC20AssetAddress = useRef();
	// const removeGamePotERC20AssetAmount = useRef();
	// const removeGamePotERC721AssetAddress = useRef();
	// const removeGamePotERC721AssetId = useRef();

	const deployment = getChainDeployment(chainId);

	let gameToken = new web3.eth.Contract(IERC20MetadataABI, game.pot[0].assetAddress);

	// Get game token metadata
	let gameTokenMetadata = {};

	let gameHasEnded = (game.status == 0);

	// Set current game token allowance/approval state
	let gameTokenApprovalMax;
	let gameTokenAllowance;
	let hasGameTokenApproval = false;

	let gameERC20Tokens = [];
	let gameERC721Tokens = [];

	// Gather all tokens, used in this game
	game.pot.map((pot, potIdx) => {
		let result = [];

		// Non-null addresses only
		if (Web3.utils.toBN(pot.assetAddress).gt(Web3.utils.toBN(0))) {
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

	// Process all game ERC20 tokens
	gameERC20Tokens.forEach((address, pot) => {
		let tokenResult = getERC20Token(address);

		// The ticket pot (always pot zero)
		if (!pot) {
			gameTokenMetadata = tokenResult;

			gameTokenApprovalMax = Web3.utils
				.toBN(game.ticketPrice)
				.mul(Web3.utils.toBN(game.maxTicketsPlayer));
			
			// console.log('gameERC20Tokens-getAllowance');
			gameTokenAllowance = getAllowance(address);
			// console.log(gameTokenAllowance);
			
			hasGameTokenApproval =
				Web3.utils.toBN(gameTokenAllowance.amount)
				.sub(gameTokenApprovalMax)
				.gte(Web3.utils.toBN('0'));
			// console.log(Web3.utils.toBN(gameTokenAllowance.amount).sub(gameTokenApprovalMax).toString());
			// console.log('hasGameTokenApproval: ' + hasGameTokenApproval);
		}
	});

	// Process all game ERC721 tokens
	gameERC721Tokens.forEach(address => getERC721Token(address));

	const panelManagementClasses = () => {
		let arr = [
			'row'
		];
		if (
			!hasRole(CALLER_ROLE)
			&& !hasRole(MANAGER_ROLE)
			&& game.ownerAddress !== activeAddress
		)
			arr.push('hide');
		
		return arr.join(' ');
	}

	const controlsClasses = () => {
		let arr = [
			'controls'
		];
		if (game.status === "0")
			arr.push('hide');
		
		return arr.join(' ');
	};

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

	const ticketPrice = () => {
		let price;
		if (gameTokenMetadata) {
			price =
				gameTokenMetadata.decimals === '18'
				? Web3.utils.fromWei(game.ticketPrice)
				: game.ticketPrice;

			if (gameTokenMetadata.symbol)
				price += ' ' + gameTokenMetadata.symbol;
		}

		return (
			<div>
				<h2>{price}</h2>
				<span>Price per ticket</span>
			</div>
		);
	};

	return (
		<div key={`game-${game.gameNumber}`} className="game">
			<div className="container">
				<div className="grid">
					<div className="row">
						<div className="md-50">
							<div>
								<div className="container">
									<div className="grid">
										<div className="row middle banner">
											<div className="sm-50">
												<h4>R#{game.gameNumber}</h4>
											</div>
											<div className="sm-50">
												<div className="price">{ticketPrice()}</div>
											</div>
										</div>
									</div>
								</div>
								<GameMetrics
									gameTokenMetadata={gameTokenMetadata}
									game={game}
									deployment={deployment}
								/>
								<div className={controlsClasses()}>
									<button
										disabled={gameHasEnded}
										className={buttonApproveClasses()}
										onClick={() => {
											gameToken.methods.approve(
												deployment.addressContractGameMaster,
												gameTokenApprovalMax
											).send({from: activeAddress})
											.on('receipt', function(receipt) {
												let newAllowance = {
													state: 1,
													address: game.pot[0].assetAddress,
													amount: gameTokenApprovalMax.toString()
												};
												console.log(newAllowance.amount);
												let _playerAllowanceIdx = getAllowancePlayerIndex(activeAddress);
												setAllowance(_playerAllowanceIdx, newAllowance);
											});
										}}>
										Approve
									</button>
									<div
										disabled={gameHasEnded}
										className={buttonBuyTicketClasses()}
										onClick={(e) => {
											if (e.target.tagName === 'DIV')
												buyTicket(
													gameContract,
													Web3.utils.toBN(game.gameNumber),
													Web3.utils.toBN(numberOfTickets.current.value)
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
							</div>
						</div>
						<div className="md-50">
							<div>
								<GameStatus
									game={game}
									deployment={deployment}
								/>
								<GameTickets
									activeAddress={activeAddress}
									gameTickets={gameTickets}
									gameTokenMetadata={gameTokenMetadata}
									game={game}
								/>
								<GamePots
									deployment={deployment}
									game={game}
									gameTokenMetadata={gameTokenMetadata}
									getERC20Token={getERC20Token}
									getERC721Token={getERC721Token}
									treasuryFeePercent={treasuryFeePercent}
								/>
								<div className="tip">
									<div>
										<p>Game numbers are unique. Always remember to verify game details before buying tickets. Games can be created by anyone, and may look simillar to another.</p>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className={panelManagementClasses()}>
						<div>
							<div className="tools">
								<div className="container">
									<h3>Management</h3>
									<div className="controls">
										<button
											onClick={(e) => {
												console.log('endGame ID: ' + game.gameNumber);
												endGame(
													gameContract,
													Web3.utils.toBN(game.gameNumber)
												)
											}}
											className={(() => {
												let classes = [
													'button'
												];
												if (game.status === '0')
													classes.push('hide');

												return classes.join(' ');
											})()}>
											endGame
										</button>
										<div
											onClick={(e) => {
												if (e.target.tagName === 'DIV') {
													let _amount = Web3.utils.toBN(
														addGamePotERC20AssetAmount.current.value)
														.mul(Web3.utils.toBN(10).pow(Web3.utils.toBN(18)));
													new web3.eth.Contract(
														IERC20MetadataABI,
														addGamePotERC20AssetAddress.current.value
													).methods.approve(
														deployment.addressContractGameMaster,
														_amount
													).send({from: activeAddress})
													.on('receipt', function(receipt) {
														gameContract.methods.addGamePotERC20Asset(
															Web3.utils.toBN(game.gameNumber),
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
													defaultValue={deployment.addressContractGameToken}
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
										{/* <div
											onClick={(e) => {
												if (e.target.tagName === 'DIV')
													gameContract.methods.removeGamePotERC20Asset(
														Web3.utils.toBN(game.gameNumber),
														Web3.utils.toBN(
															removeGamePotERC20AssetAmount.current.value)
															.mul(Web3.utils.toBN(10).pow(Web3.utils.toBN(18))),
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
													defaultValue={deployment.addressContractGameToken}
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
										</div> */}
										<div
											onClick={(e) => {
												if (e.target.tagName === 'DIV')
													new web3.eth.Contract(
														IERC721MetadataABI,
														addGamePotERC721AssetAddress.current.value
													).methods.approve(
														deployment.addressContractGameMaster,
														addGamePotERC721AssetId.current.value
													)
													.send({from: activeAddress})
													.on('receipt', (receipt) => {
														console.log(receipt);

														gameContract.methods.addGamePotERC721Asset(
															Web3.utils.toBN(game.gameNumber),
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
													defaultValue={deployment.addressContractGameTrophy}
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
													new web3.eth.Contract(
														IERC1155ABI,
														addGamePotERC1155AssetAddress.current.value
													).methods.setApprovalForAll(
														deployment.addressContractGameMaster,
														true
													)
													.send({from: activeAddress})
													.on('receipt', (receipt) => {
														console.log(receipt);

														gameContract.methods.addGamePotERC1155Asset(
															Web3.utils.toBN(game.gameNumber),
															addGamePotERC1155AssetId.current.value,
															addGamePotERC1155AssetAddress.current.value
														).send({from: activeAddress})
														.on('receipt', function(receipt) {
															console.log('receipt-addGamePotERC1155Asset');
															console.log(receipt);
														})
														.on('error', err => {
															console.error(err);
														});
													});
											}}
											className="button"
											role="button"
											tabIndex="0">
												<div>addGamePotERC1155Asset</div>
												<input
													ref={addGamePotERC1155AssetAddress}
													defaultValue={deployment.addressContractGameTrophy}
													placeholder="Address"
													size="6"
													type="text"/>
												<input
													ref={addGamePotERC1155AssetId}
													placeholder="ID/Amount"
													size="3"
													min="0"
													type="number"/>
										</div>
										{/* <div
											onClick={(e) => {
												if (e.target.tagName === 'DIV')
													gameContract.methods.removeGamePotERC721Asset(
														Web3.utils.toBN(game.gameNumber),
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
													defaultValue={deployment.addressContractGameTrophy}
													placeholder="Address"
													size="6"
													type="text"/>
												<input
													ref={removeGamePotERC721AssetId}
													placeholder="ID"
													size="3"
													min="0"
													type="number"/>
										</div> */}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
};

export default Game;