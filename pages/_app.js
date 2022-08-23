import React, { useState, useEffect, useRef } from 'react';
import Web3 from 'web3'

import {
  gameMasterABI,
  IERC20MetadataABI,
  gameTrophyABI
} from '../features/configure/abi.js'

import { getChainDeployment } from '../features/configure/chain.js';

import {
	CALLER_ROLE,
	MANAGER_ROLE,
  LOCAL_STORAGE_KEY_ROLES,
  LOCAL_STORAGE_KEY_GAMES,
  LOCAL_STORAGE_KEY_TICKETS,
  LOCAL_STORAGE_KEY_TOKENS,
  LOCAL_STORAGE_KEY_ALLOWANCES
} from '../features/configure/env';

import Notifications from '../components/Notifications.js';
import { HeaderLogo } from '../components/HeaderLogo'

import '../styles/globals.scss'

// APP

function MyApp({ Component, pageProps }) {
  const [menus, setMenus] = useState([])

  const [notifications, setNotifications] = useState([])

  const [web3, setWeb3] = useState(null)
  const [activeAddress, setAddress] = useState(null)
  const [chainId, setChainId] = useState(0)

  const [gameContract, setGameContract] = useState(null)

  const [roles, setRoles] = useState([[],[]])

  const [games, setGames] = useState([])

  const [totalActiveGameCalls, setActiveGameCalls] = useState(0)

  const [tickets, setTickets] = useState([])

  const [tokens, setTokens] = useState([])

  const [allowances, setAllowances] = useState([[],[]])

  const [treasuryFeePercent, setTreasuryFeePercent] = useState(0)
  const [treasuryFeeAddress, setTreasuryFeeAddress] = useState(0)

  const startCommunityGameTokenAddress = useRef();
  const startCommunityGameTicketPrice = useRef();
  const startCommunityGameMaxPlayers = useRef();
  const startCommunityGameMaxTicketsPlayer = useRef();
  const startCommunityGameFeeAddress = useRef();
  const startCommunityGameFeePercent = useRef();

  const endGameId = useRef();

  const getActiveGamesMax = useRef();

  const sendFundsFrom = useRef();
  const sendFundsTo = useRef();
  const sendFundsAmount = useRef();

  const awardItemTo = useRef();
  const awardItemURI = useRef();

  let deployment = false;

	useEffect(async () => {

    // Get MetaMask account details
    ethereum
      .request({ method: 'eth_accounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        // Some unexpected error.
        // For backwards compatibility reasons, if no accounts are available,
        // eth_accounts will return an empty array.
        console.error(err);
      });

    // Get current chain ID
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    handleChainChanged(chainId);
	}, [])


  useEffect(() => {
    if (chainId) {
      deployment = getChainDeployment(chainId);

      console.log('The data from local storage;');
      const storedRoles = JSON.parse(localStorage.getItem(`${LOCAL_STORAGE_KEY_ROLES}.${chainId}`));
      console.log('Roles from cache');
      console.log(storedRoles);
      if (storedRoles)
        setRoles(storedRoles);
      
      const storedGames = JSON.parse(localStorage.getItem(`${LOCAL_STORAGE_KEY_GAMES}.${chainId}`));
      console.log('Games from cache');
      console.log(storedGames);
      if (storedGames)
        setGames(storedGames);

      const storedTickets = JSON.parse(localStorage.getItem(`${LOCAL_STORAGE_KEY_TICKETS}.${chainId}`));
      console.log('Tickets from cache');
      console.log(storedTickets);
      if (storedTickets)
        setTickets(storedTickets);

      const storedTokens = JSON.parse(localStorage.getItem(`${LOCAL_STORAGE_KEY_TOKENS}.${chainId}`));
      console.log('Tokens from cache');
      console.log(storedTokens);
      if (storedTokens)
        setTokens(storedTokens);

      const storedApprovals = JSON.parse(localStorage.getItem(`${LOCAL_STORAGE_KEY_ALLOWANCES}.${chainId}`));
      console.log('Allowances from cache');
      console.log(storedApprovals);
      if (storedApprovals)
      setAllowances(storedApprovals);
    }
  }, [chainId]);

  useEffect(() => {
    if (web3) {
      web3.currentProvider.on(
        'chainChanged',
        chainId => {
          // console.log('chainChanged EVENT');
          // handleChainChanged(chainId);
          window.location.reload();
        },
      );

      web3.currentProvider.on(
        'accountsChanged',
        accounts => {
          console.log('accountsChanged EVENT');
          handleAccountsChanged(accounts);
        },
      );

      web3.currentProvider.on(
        'disconnect',
        error => {
          console.log('disconnect EVENT');
          console.error(error);
          disconnect();
        },
      );

      web3.currentProvider.on(
        'message',
        message => {
          console.log('message EVENT');
          console.log(message);
        },
      );
    }
  }, [web3]);

	// useEffect(() => {
	// 	console.log('Notifications changed');
	// 	console.log(notifications);
  //   let latestNotification = notifications.slice(-1);
  //   setBanner(latestNotification);
	// }, [notifications])

	useEffect(() => {
    if (chainId) {
      console.log('Roles changed');
      console.log(roles);
      const storedRoles = JSON.stringify(roles);
      localStorage.setItem(`${LOCAL_STORAGE_KEY_ROLES}.${chainId}`, storedRoles);
    }
	}, [roles])

	useEffect(() => {
		if (chainId) {
      console.log('Games changed');
      console.log(games);
      const storedGames = JSON.stringify(games);
      localStorage.setItem(`${LOCAL_STORAGE_KEY_GAMES}.${chainId}`, storedGames);
    }
	}, [games])

	useEffect(() => {
		if (chainId) {
      console.log('Tickets changed');
      console.log(tickets);
      const storedTickets = JSON.stringify(tickets);
      localStorage.setItem(`${LOCAL_STORAGE_KEY_TICKETS}.${chainId}`, storedTickets);
    }
	}, [tickets])

	useEffect(() => {
		if (chainId) {
      console.log('Tokens changed');
      console.log(tokens);
      const storedTokens = JSON.stringify(tokens);
      localStorage.setItem(`${LOCAL_STORAGE_KEY_TOKENS}.${chainId}`, storedTokens);
    }
	}, [tokens])

	useEffect(() => {
		if (chainId) {
      console.log('Allowances changed');
      console.log(allowances);
      const storedApprovals = JSON.stringify(allowances);
      localStorage.setItem(`${LOCAL_STORAGE_KEY_ALLOWANCES}.${chainId}`, storedApprovals);
    }
	}, [allowances])

  const getMenu = (_menuId) => {
    if (menus[_menuId])
      return menus[_menuId];
    return false;
  };

  const setMenu = (_menuId, _state) => {
    let _menus = menus;
    _menus[_menuId] = Number(_state);
    setMenus([..._menus]);
  };

  /**
   * 
   */
  const disconnect = () => {
    setNotification(
      'warn',
      'Disconnected',
      activeAddress
    );
    console.log('disconnect()');
    setAddress(null)
    setChainId(0)
    setWeb3(null)
    setGameContract(null)
  };

  const handleAccountsChanged = (accounts) => {
    if (!web3) {
      let _web3 = new Web3(window.ethereum)
      _web3.eth.defaultAccount = accounts[0];
      setWeb3(_web3)
    }

    if (accounts.length) {
      setAddress(accounts[0].toLowerCase())

      setNotification(
        'info',
        'Connected',
        accounts[0].toLowerCase()
      );
    } else {
      setAddress(null)

      setNotification(
        'warn',
        'Disconnected',
        activeAddress
      );
    }
  };

  const handleChainChanged = (chainId) => {
    let _networkId = Web3.utils.isHex(chainId) ? Web3.utils.hexToNumber(chainId) : parseInt(chainId);
    setChainId(_networkId)

    const _deployment = getChainDeployment(_networkId);
    if (_deployment) {
      setNotification(
        'info',
        `Connected to ${_deployment.name}`
      );
    } else {
      setNotification(
        'error',
        `Chain ID (${_networkId}) is not supported.`
      );
    }
  };

  /**
   * 
   */
   const connect = () => {
    console.log('connect()');

    window.ethereum ?
      ethereum
      .request({ method: 'eth_requestAccounts' })
      .then((accounts) => {

        // let w3 = new Web3(ethereum)
        // w3.eth.defaultAccount = accounts[0];
        // setWeb3(w3)
        // setNotification(
        //   'error',
        //   'Please install MetaMask'
        // )
        handleAccountsChanged(accounts);
      })
      .catch((err) => {
        console.error(err);

        setNotification(
          'error',
          'Something went wrong with the MetaMask connection'
        )
      })
    : (
      setNotification(
        'error',
        'Please install MetaMask'
      )
    );
  };
  
  /**
  * 
  */
  const setNotification = (scope, message, reference) => {
    // console.log('setNotification');
    let _notifications = notifications;
    let time = Date.now();

    let group;
    let level = scope;
    if (scope.indexOf('.') >= 0) {
      let _scope = scope.split('.');
      group = _scope[0];
      level = _scope[1];
    }
 
    _notifications.push({
      message,
      reference,
      group,
      level,
      time
    });
    
    setNotifications([..._notifications]);
 }

  /**
   * 
   */
   const setRole = (roleName) => {
    console.log('setRole');
    let _roles = roles;
    let addressIdx = -1;
    if (_roles[0].length) {
      let result = _roles[0].findIndex(address => address === activeAddress);
      if (result >= 0 ) {
        addressIdx = result;
      }
    }

    if (addressIdx < 0) {
      addressIdx = _roles[0].length;
      _roles[0][addressIdx] = activeAddress;
      _roles[1][addressIdx] = [];
    }

    let roleIdx = _roles[1][addressIdx].length;
    _roles[1][addressIdx][roleIdx] = roleName;

    // console.log(_roles);
    
    setRoles([..._roles]);
  }

  /**
   * 
   */
   const hasRole = (roleName) => {
    if (roles[0].length) {
      let result = roles[0].findIndex(address => address === activeAddress);
      if (result < 0 )
        return false;

      let result2 = roles[1][result].findIndex(role => role === roleName);
      if (result2 < 0 )
        return false;

      return true;
    }
    
    return false;
  }

  /**
   * 
   */
   const setGameState = (data) => {
    let _games = games;
    const currGame = _games[data.gameNumber];
    
    _games[data.gameNumber] = { ...currGame, ...data };

    setNotification(
      'game.info',
      'Updated',
      data.gameNumber
    )

    setGames([..._games]);
  }

  /**
   * 
   */
   const getActiveGames = async (_total, _runOnce) => {
    let runOnce = _runOnce ? true : false;
    if (runOnce && totalActiveGameCalls) {
      console.warn('Only allowed to run getActiveGames() once, in this instance.');
      return;
    }

    let newActiveGameCalls = totalActiveGameCalls + 1;
    setActiveGameCalls(newActiveGameCalls);

    let results = await gameContract.methods.getActiveGames(_total).call();
    let totalResults = 0;
    if (results?.length) {
      totalResults = results.length;
      results.forEach(gameNumber => {
        getGameState(gameContract, gameNumber);
      });
      console.log(results);
    } else {
      console.warn('There are no active games');
    }
      
    setNotification(
      'info',
      `Found ${totalResults} games`
    );
  };

  /**
   * Fetch and store data for `gameNumber`
   */
   const getGameState = async (gameContract, gameNumber) => {
     console.log('getGameState');
    let results;
    try {
      results = await gameContract.methods.getGameState(gameNumber).call();
    } catch (err) {
      setNotification(
        'game.warn',
        'Does not exist',
        gameNumber
      );
    }
    
    if (results) {
      let len = Object.keys(results).length/2;
      let items = Object.keys(results).slice(len).reduce((result, key) => {
        let val = results[key];
        if (typeof val === 'boolean') {
          val = val ? 'true' : 'false';
        }

        if (key === 'pot') {
          let potRecord = [];
          val.forEach((pot, potIdx) => {
            let potLen = Object.keys(pot).length/2;
            potRecord[potIdx] = Object.fromEntries(Object.entries(pot).slice(potLen));
          }, {});
          // console.log(potRecord);
          result[key] = potRecord;
        } else if (key.substring((key.length - 7)) === 'Address') {
          result[key] = val.toLowerCase();
        } else {
          result[key] = val;
        }

        return result;
      }, {});
      items.gameNumber = gameNumber.toString();
      console.log('gameItems');
      console.log(items);
      setGameState(items);

      // setNotification(
      //   'game.info',
      //   'Information has been found and displayed below',
      //   gameNumber
      // );

      getGamePlayerState(
      	gameNumber,
      	activeAddress
      )
    }
  }

  /**
   * 
   */
   const setGameTickets = (_gameNumber, data) => {
    let _tickets = tickets;
    _tickets[_gameNumber] = { ...data };
    
    setTickets([..._tickets]);
  };

  /**
   * Get and store an array of ticket numbers, for `_playerAddress` in `_gameNumber`
   */
  const getGamePlayerState = async (_gameNumber, _playerAddress) => {
    let results = await gameContract.methods.getGamePlayerState(
      _gameNumber,
      _playerAddress
    ).call();

    let newTickets = tickets[_gameNumber] || [];
    newTickets[_playerAddress] = results;

    setGameTickets(_gameNumber, newTickets);

    // setNotification(
    //   'game.info',
    //   `Displaying player details ${_playerAddress}`,
    //   _gameNumber
    // );
  }

  /**
   * Mangement: 
   */
  const sendFunds = async (_tokenAddress, _fromAddress, _toAddress, _amount) => {
    const decimals = web3.utils.toBN(18);
    let tokenContract = new web3.eth.Contract(IERC20MetadataABI, _tokenAddress);
    let _value = web3.utils.toBN(_amount).mul(web3.utils.toBN(10).pow(decimals));
    
    await tokenContract.methods.approve(_fromAddress, _value).send({from: activeAddress});

    let results = await tokenContract.methods.transferFrom(

      // From
      _fromAddress,

      // To
      _toAddress,

      // Amount
      _value

    ).send({from: activeAddress});
    console.log(results);
  }

  /**
   * Mangement: 
   */
    const endGame = async (_gameContract, _gameNumber) => {
    let results = await _gameContract.methods.endGame(

      // Game number
      _gameNumber

    ).send({from: activeAddress})

    .once('sent', function(payload){
      console.log(payload);
      setNotification(
        'game.warn',
        `Closing`,
        _gameNumber
      );
    })

    .on('error', function(error) {
      console.log(error);
      setNotification(
        'game.error',
        'Unable to close',
        _gameNumber
      );
    });

    console.log(results);
  }

  /**
   * Mangement: 
   */
   const startCommunityGame = async (gameContract) => {
    if (!gameContract || !activeAddress) {
      console.log('Not ready');
    } else {
      const decimals = web3.utils.toBN(18);
      let feePercent = web3.utils.toBN(startCommunityGameFeePercent.current.value);
      let ticketPrice = web3.utils.toBN(startCommunityGameTicketPrice.current.value).mul(web3.utils.toBN(10).pow(decimals));
      let maxPlayers = web3.utils.toBN(startCommunityGameMaxPlayers.current.value);
      let maxTicketsPlayer = web3.utils.toBN(startCommunityGameMaxTicketsPlayer.current.value);

      let results = await gameContract.methods.startGame(

        // Token address
        startCommunityGameTokenAddress.current.value,
  
        // Game fee address
        startCommunityGameFeeAddress.current.value,
  
        // Game fee percent
        feePercent,
  
        // Ticket price
        ticketPrice,
  
        // Max players
        maxPlayers,
  
        // Max player tickets
        maxTicketsPlayer
  
      ).send({from: activeAddress})

      .once('sent', function(payload){
        console.log(payload);
        setNotification(
          'warn',
          'Starting new game'
        );
      })
  
      .on('error', function(error) {
        console.log(error);
        setNotification(
          'game.error',
          'Unable to start',
          _gameNumber
        );
      });

      console.log(results);
    }
  }

  /**
   * Mangement: 
   */
    const endCommunityGame = async (_gameContract, _gameNumber) => {
    let results = await _gameContract.methods.endGame(

      // Game number
      _gameNumber

    ).send({from: activeAddress});
    console.log(results);
  }

  /**
   * Display management panels if the user has been granted roles `MANAGER_ROLE` and `CALLER_ROLE` for house games
   */
	const panelManagementClasses = () => {
		let arr = [
			'tools'
		];
		if (
      !hasRole(CALLER_ROLE)
      && !hasRole(MANAGER_ROLE)
    )
			arr.push('hide');
		
		return arr.join(' ');
	}

  /**
   * `GameMaster` contract
   */
  useEffect(() => {
    if (web3 && chainId) {
      const _deployment = getChainDeployment(chainId);
      if (_deployment) {
        setGameContract(new web3.eth.Contract(
          gameMasterABI,
          _deployment.addressContractGameMaster
        ))
      } else {
        console.error('Unsupported chain: ' + chainId);
      }
    }
  }, [web3, chainId])

  /**
   * `GameMaster` events
   */
  useEffect(() => {
    if (web3 && gameContract) {
      gameContract.methods.treasuryAddress().call()
        .then(res => {
          console.log('treasuryFeeAddress: ' + res)
          setTreasuryFeeAddress(res);
        });

      gameContract.methods.treasuryFeePercent().call()
        .then(res => {
          console.log('treasuryFeePercent: ' + res)
          setTreasuryFeePercent(res);
        });

      gameContract.events.GameStarted({}, (error, data) => {
        console.log('EVENT: GameStarted');
        if (error) {
          console.error(error.message);

        } else {
          // console.log(data);
          if (data.returnValues) {
            // setGameState(data.returnValues);
            setNotification(
              'game.info',
              'Started',
              data.returnValues.gameNumber
            );
            getGameState(gameContract, data.returnValues.gameNumber);
          }
        }
      });
      gameContract.events.GameChanged({}, (error, data) => {
        console.log('EVENT: GameChanged');
        if (error) {
          console.error(error.message);

        } else {
          // console.log(data);
          if (data.returnValues) {
            setNotification(
              'game.info',
              'Updated',
              data.returnValues.gameNumber
            );
            getGameState(gameContract, data.returnValues.gameNumber);
          }
        }
      });
      gameContract.events.GameEnded({}, (error, data) => {
        console.log('EVENT: GameEnded');
        if (error) {
          console.error(error.message);

        } else {
          // console.log(data);
          if (data.returnValues) {
            // setGameState(data.returnValues);
            setNotification(
              'game.warn',
              'Ended',
              data.returnValues.gameNumber
            );
            getGameState(gameContract, data.returnValues.gameNumber);
          }
        }
      });
      gameContract.events.TicketBought({}, (error, data) => {
        console.log('EVENT: TicketBought');
        if (error) {
          console.error(error.message);

        } else {
          // console.log(data);
          if (data.returnValues) {
            // setGameState(data.returnValues);
            getGameState(gameContract, data.returnValues.gameNumber);
            getGamePlayerState(
              data.returnValues.gameNumber,
              activeAddress
            )
            setNotification(
              'game.info',
              `Ticket(s) bought`,
              data.returnValues.gameNumber
            );
          }
        }
      });
    }
  }, [gameContract])

  const getTreasuryInformation = () => {
    if (chainId) {
      const _deployment = getChainDeployment(chainId);

      return (
        <span>
          The treasury fee is currently <a href={`${_deployment.explorerAddressURI}${_deployment.addressContractGameMaster}#readContract#F14`}>
          {treasuryFeePercent}%</a> (varies 0~20%), sent to <a href={`${_deployment.explorerAddressURI}${_deployment.addressContractGameMaster}#readContract#F13`}>{treasuryFeeAddress}</a>
        </span>
      )
    }
    return "...";
  };

  return (
    <>
      <header>
        <div className="container">
          <div className="grid">
            <div className="row">
              <div className="md-50">
                <HeaderLogo />
              </div>
              <div className="md-50">
                <div className="controls md-text-left">
                  <button
                    onClick={() => {
                      setMenu(0, !getMenu(0));
                    }}
                    className={(() => {
                      let arr = [
                        'button',
                        'inverse'
                      ];
              
                      if (getMenu(0))
                        arr.push('active');
                      
                      return arr.join(' ');
                    })()}
                  >
                    Start raffle
                  </button>
                  <button
                    className="button inverse"
                    onClick={() => activeAddress ? disconnect() : connect()}
                  >
                    🗲 { activeAddress
                      ?
                        activeAddress.length > 10
                        ? '0x' + activeAddress.slice(2,6).toUpperCase() + '...' + activeAddress.slice(-4).toUpperCase()
                        : activeAddress
                      : 'Connect'
                    }
                  </button>
                  <div className="control switch">
                    <div className={(() => {
                      let arr = [
                        'menu'
                      ];
              
                      if (getMenu(1))
                        arr.push('active');
                      
                      return arr.join(' ');
                    })()}>
                      <div>
                        <ul>
                          <li><button onClick={async () => {
                            await ethereum.request({
                              method: 'wallet_switchEthereumChain',
                              params: [{ chainId: Web3.utils.toHex(1337) }],
                            })
                            // setChainId(1337)
                          }}>Ganache</button></li>
                          <li><button onClick={async () => {
                            await ethereum.request({
                              method: 'wallet_switchEthereumChain',
                              params: [{ chainId: Web3.utils.toHex(4) }],
                            })
                            // setChainId(4)
                          }}>Rinkeby</button></li>
                        </ul>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setMenu(1, !getMenu(1));
                      }}
                      className={(() => {
                        let arr = [
                          'button',
                          'inverse'
                        ];
                
                        if (getMenu(1))
                          arr.push('active');
                        
                        return arr.join(' ');
                      })()}
                    >
                      Network
                    </button>
                  </div>
                </div>
                <div className="md-text-left">
                  <h1>...an Ethereum raffle app</h1>
                  <h2>Create raffles for any number of NFTs, tokens, with an optional fee, at  a price and ticket token of your choice.</h2>
                  <ul>
                    <li>Each raffle can be set up to donate an optional fee (RF) (taken from <strong>P#0</strong>, which is the primary ticket pot), at the end of each game.</li>
                    <li>After a game has started, only new prizes can be added. Nothing else can be changed.</li>
                    <li>A winner is guaranteed at the end of every game!</li>
                    <li>In community raffles; a fee (TF) ({getTreasuryInformation()}, from P#0) is taken at the end of the game, before the optional game fee.</li>
                    <li>A game can only be ended by its owner, or an address with manager role.</li>
                  </ul>
                  <div className="tip">
                    <p>This user interface is still under development, with the aim to eventually deploy it directly onto blockchain storage, for further decentralisation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className={(() => {
        let arr = [
          'tools'
        ];
        if (
          !hasRole(CALLER_ROLE)
          && !hasRole(MANAGER_ROLE)
        )
          arr.push('hide');
        
        return arr.join(' ');
      })()}>
        <div className="container">
          <h3>Management &ndash; Games</h3>
          <div className="controls">
            <div
              onClick={(e) => {
                if (e.target.tagName === 'DIV') {
                  console.log('endGame ID: ' + endGameId.current.value);
                  endGame(
                    gameContract,
                    web3.utils.toBN(endGameId.current.value)
                  )
                }
              }}
              className="button"
              role="button"
              tabIndex="0">
              <div>endGame (A0)</div>
              <input ref={endGameId} defaultValue="0" size="1" min="0" type="number" />
            </div>
          </div>
          <h3>Management &ndash; Transfers</h3>
          <div className="controls">
            <div
              onClick={(e) => {
                if (e.target.tagName === 'DIV') {
                  const _deployment = getChainDeployment(chainId);
                  if (!_deployment) {
                    setNotification(
                      'error',
                      `Unable to transfer game token a game on this chain`
                    );
                  } else {
                    sendFunds(
                      _deployment.addressContractGameToken,
                      sendFundsFrom.current.value,
                      sendFundsTo.current.value,
                      sendFundsAmount.current.value
                    )
                  }
                }
              }}
              className="button"
              role="button"
              tabIndex="0">
                <div>sendFunds (GBT)</div>
                <input
                  ref={sendFundsFrom}
                  defaultValue={activeAddress}
                  placeholder="From"
                  size="6"
                  type="text"
                />
                <input
                  ref={sendFundsTo}
                  placeholder="To"
                  size="6"
                  type="text"
                />
                <input
                  ref={sendFundsAmount}
                  defaultValue="1000"
                  size="3"
                  min="0"
                  type="number"
                />
            </div>
            <div
              onClick={(e) => {
                if (e.target.tagName === 'DIV') {
                  const _deployment = getChainDeployment(chainId);
                  new web3.eth.Contract(
                    gameTrophyABI,
                    _deployment.addressContractGameTrophy
                  ).methods.awardItem(
                    awardItemTo.current.value
                    // awardItemURI.current.value
                  )
                  .send({from: activeAddress})
                  .on('receipt', (receipt) => {
                    console.log(receipt);
                  });
                }
              }}
              className="button"
              role="button"
              tabIndex="0">
                <div>awardItem (GT)</div>
                <input
                  ref={awardItemTo}
                  defaultValue={activeAddress}
                  placeholder="To"
                  size="6"
                  type="text"
                />
                <input
                  ref={awardItemURI}
                  defaultValue="http://example.com/foo.jpeg"
                  size="3"
                  type="text"
                />
            </div>
            {/* <button
              className="button"
              onClick={async () => {
                let tokenContract = new web3.eth.Contract(IERC20MetadataABI, tokenAddress);
                let value = await tokenContract.methods.balanceOf(
                  gameAddress
                ).call({from: activeAddress})
                console.log(value);
              }}>
              Get contract balance
            </button> */}
          </div>
        </div>
      </div>
      <div className={(() => {
        let arr = [
          'raffle'
        ];

        if (!getMenu(0))
          arr.push('hide');
        
        return arr.join(' ');
      })()}>
        <div className="container">
          <div className="grid">
            <div className="row">
              <div className="md-50 text-left">
                <h1>Start a raffle</h1>
                <p>Tip: Copy and paste from a trusted source, then verify using a tool such as &quot;Search/Find&quot; to highlight your pasted values against your source. This will ensure there isn&apos;t any malware on your device, potentialy changing addresses!</p>
                <h3>Adding additional prizes</h3>
                <p>Once game has started, you can add (which will be unremovable) additional prize pots, such as other tokens, or NFTs</p>
                <h3>Remember</h3>
                <p>Always double check the form values, before starting the game. You can not change these parameters after the game has started.</p>
                <p>Prefer direct contract interaction? <a href={`${deployment.explorerAddressURI}${deployment.addressContractGameMaster}`}>Contract {deployment.addressContractGameMaster}</a></p>
              </div>
              <div className="md-50">
                <div className="grid">
                  <div className="row">
                    <div className="md-50">
                      <label>Ticket token (ERC-20) address</label>
                      <input
                        ref={startCommunityGameTokenAddress}
                        type="text"
                        defaultValue={deployment ? deployment.addressContractGameToken : null}
                      />
                    </div>
                    <div className="md-50">
                      <label>Fee address (optional)</label>
                      <input
                        ref={startCommunityGameFeeAddress}
                        type="text"
                        defaultValue={activeAddress}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="md-50">
                      <label>Ticket price</label>
                      <input
                        ref={startCommunityGameTicketPrice}
                        type="text"
                        defaultValue="1"
                        min="0"
                        max="10000000"
                      />
                    </div>
                    <div className="md-50">
                      <label>Raffle fee percent (optional)</label>
                      <input
                        ref={startCommunityGameFeePercent}
                        type="text"
                        defaultValue="5"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="md-50">
                      <label>Max tickets per player</label>
                      <input
                        ref={startCommunityGameMaxTicketsPlayer}
                        type="number"
                        defaultValue="20"
                        min="1"
                        max="50"
                      />
                    </div>
                    <div className="md-50">
                      <label>Max players</label>
                      <input
                        ref={startCommunityGameMaxPlayers}
                        type="number"
                        defaultValue="20"
                        min="10"
                        max="65535"
                      />
                    </div>
                  </div>
                </div>
                <div className="controls">
                  <button
                    onClick={() => startCommunityGame(gameContract)}
                    className="button">
                    Start game
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Notifications
        notifications={notifications}
      />
      <Component
        {...pageProps}
        activeAddress={activeAddress}
        web3={web3}
        allowances={allowances}
        tickets={tickets}
        tokens={tokens}
        games={games}
        gameContract={gameContract}
        roles={roles}
        getActiveGames={getActiveGames}
        getGamePlayerState={getGamePlayerState}
        setGames={setGames}
        setAllowances={setAllowances}
        setTokens={setTokens}
        setRole={setRole}
        hasRole={hasRole}
        endGame={endGame}
        getGameState={getGameState}
        setNotification={setNotification}
        chainId={chainId}
        treasuryFeePercent={treasuryFeePercent}
      />
      <footer>
        <div className="container">
          <div className="controls">
            <a href={`${deployment.explorerAddressURI}${deployment.addressContractGameMaster}`} className="button">
              Contract
            </a>
            <button
              onClick={() => {
                [
                  CALLER_ROLE,
                  MANAGER_ROLE
                ]
                .forEach(async role => {
                  console.log('role: ' + role);
                  let result = await gameContract.methods.hasRole(
                    role,
                    activeAddress
                  ).call();
                  if (result)
                    setRole(role);
                });
              }}
              className="button slim"
              title="Contract role call"
            >
              <div className="doubled">✺</div>
            </button>
            <div
              onClick={(e) => {
                if (e.target.tagName === 'DIV') {
                  console.log('getActiveGamesMax: ' + getActiveGamesMax.current.value);
                  getActiveGames(
                    web3.utils.toBN(getActiveGamesMax.current.value)
                  )
                }
              }}
              className="button"
              title="Poll active games"
              role="button"
              tabIndex="0">
              <div>Poll active</div>
              <input ref={getActiveGamesMax} defaultValue="1" size="1" min="1" type="number" />
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default MyApp
