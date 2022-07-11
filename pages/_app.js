import React, { useState, useEffect, useRef } from 'react';
import Web3 from 'web3'

import {
  gameMasterABI,
  IERC20MetadataABI,
  gameTrophyABI
} from '../features/configure/abi.js'

import {
  gameAddress,
  gameTrophyAddress,
  tokenAddress,
  feeAddress,
  EXPLORER_ADDRESS_URI,
	CALLER_ROLE,
	MANAGER_ROLE,
  LOCAL_STORAGE_KEY_ROLES,
  LOCAL_STORAGE_KEY_GAMES,
  LOCAL_STORAGE_KEY_TICKETS,
  LOCAL_STORAGE_KEY_TOKENS,
  LOCAL_STORAGE_KEY_ALLOWANCES
} from '../features/configure/env';

import Notifications from '../components/Notifications.js';
import { HeaderIcon } from '../components/HeaderIcon'

import '../styles/globals.scss'

// APP

function MyApp({ Component, pageProps }) {
  const [menu, setMenu] = useState(0)

  const [notifications, setNotifications] = useState([])

  const [web3, setWeb3] = useState(null)
  const [activeAddress, setAddress] = useState(null)
  const [connected, setConnected] = useState(false)

  const [gameContract, setGameContract] = useState(null)

  const [roles, setRoles] = useState([[],[]])

  const [games, setGames] = useState([])

  const [totalActiveGameCalls, setActiveGameCalls] = useState(0)

  const [tickets, setTickets] = useState([])

  const [tokens, setTokens] = useState([])

  const [allowances, setAllowances] = useState([[],[]])
  // const [_playerIndexes, set_playerIndexes] = useState([])

  const startCommunityGameTokenAddress = useRef();
  const startCommunityGameTicketPrice = useRef();
  const startCommunityGameMaxPlayers = useRef();
  const startCommunityGameMaxTicketsPlayer = useRef();
  const startCommunityGameFeeAddress = useRef();
  const startCommunityGameFeePercent = useRef();

  const endGameId = useRef();
  const endCommunityGameId = useRef();

  const getActiveGamesMax = useRef();

  const sendFundsFrom = useRef();
  const sendFundsTo = useRef();
  const sendFundsAmount = useRef();

  const awardItemTo = useRef();
  const awardItemURI = useRef();

	useEffect(() => {
		console.log('The data from local storage;');

		const storedRoles = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ROLES));
		console.log('Roles from cache');
    console.log(storedRoles);
		if (storedRoles)
			setRoles(storedRoles);
    
		const storedGames = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_GAMES));
		console.log('Games from cache');
    console.log(storedGames);
		if (storedGames)
			setGames(storedGames);

    const storedTickets = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_TICKETS));
		console.log('Tickets from cache');
    console.log(storedTickets);
    if (storedTickets)
      setTickets(storedTickets);

    const storedTokens = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_TOKENS));
		console.log('Tokens from cache');
    console.log(storedTokens);
    if (storedTokens)
      setTokens(storedTokens);

    const storedApprovals = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ALLOWANCES));
		console.log('Allowances from cache');
    console.log(storedApprovals);
    if (storedApprovals)
    setAllowances(storedApprovals);
	}, [])

	// useEffect(() => {
	// 	console.log('Notifications changed');
	// 	console.log(notifications);
  //   let latestNotification = notifications.slice(-1);
  //   setBanner(latestNotification);
	// }, [notifications])

	useEffect(() => {
		console.log('Roles changed');
		console.log(roles);
		const storedRoles = JSON.stringify(roles);
		localStorage.setItem(LOCAL_STORAGE_KEY_ROLES, storedRoles);
	}, [roles])

	useEffect(() => {
		console.log('Games changed');
		console.log(games);
		const storedGames = JSON.stringify(games);
		localStorage.setItem(LOCAL_STORAGE_KEY_GAMES, storedGames);
	}, [games])

	useEffect(() => {
		console.log('Tickets changed');
		console.log(tickets);
		const storedTickets = JSON.stringify(tickets);
		localStorage.setItem(LOCAL_STORAGE_KEY_TICKETS, storedTickets);
	}, [tickets])

	useEffect(() => {
		console.log('Tokens changed');
		console.log(tokens);
		const storedTokens = JSON.stringify(tokens);
		localStorage.setItem(LOCAL_STORAGE_KEY_TOKENS, storedTokens);
	}, [tokens])

	useEffect(() => {
		console.log('Allowances changed');
		console.log(allowances);
		const storedApprovals = JSON.stringify(allowances);
		localStorage.setItem(LOCAL_STORAGE_KEY_ALLOWANCES, storedApprovals);
	}, [allowances])

  /**
   * 
   */
  const disconnect = () => {
    console.log('disconnect()');
    setAddress(null)
    setWeb3(null)
    setGameContract(null)
    setConnected(false)
  };

  /**
   * 
   */
   const connect = () => {
    console.log('connect()');
    let now = new Date().toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"});
    window.ethereum ?
      ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => {
        console.log(accounts);
        // setAddresses(accounts)
        setAddress(accounts[0].toLowerCase())
        setConnected(true)
        let w3 = new Web3(ethereum)
        w3.eth.defaultAccount = accounts[0];
        setWeb3(w3)
        console.log(now + ': Connected');

        ethereum.on('accountsChanged', (accounts) => {
          console.log(now + ': Changed');
          if (accounts.length)
            setAddress(accounts[0].toLowerCase())
          else
            setAddress(null)
        })
      })
      .catch((err) => console.log(err))
      : console.log(now + ": Please install MetaMask")
  };
  
  /**
  * 
  */
  const setNotification = (message, reference, group, level) => {
    console.log('setRole');
    let _notifications = notifications;
    let time = Date.now();
 
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
    if (results?.length) {
      results.forEach(gameNumber => {
        getGameState(gameContract, gameNumber);
      });
      console.log(results);
    } else {
      console.warn('There are no active games');
    }
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
      console.log(err.message);

      // const dataObj = err.data.slice(-1);
      // setNotification(
      //   dataObj.reason,
      //   gameNumber,
      //   1
      // );
    }
    console.log('getGameState-results');
    console.log(results);
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
   const startGame = async (gameContract) => {
    if (!gameContract || !activeAddress) {
      console.log('Not ready');
    } else {
      const decimals = web3.utils.toBN(18);
      let feePercent = web3.utils.toBN(1);//web3.utils.toBN(2).mul(web3.utils.toBN(10).pow(decimals));
      let ticketPrice = web3.utils.toBN(100000000000000000); // 0.1
      let maxPlayers = web3.utils.toBN(50000);
      let maxTicketsPlayer = web3.utils.toBN(20);

      let results = await gameContract.methods.startGame(

        // Token address
        tokenAddress,
  
        // Game fee address
        feeAddress,
  
        // Game fee percent
        feePercent,
  
        // Ticket price
        ticketPrice,
  
        // Max players
        maxPlayers,
  
        // Max player tickets
        maxTicketsPlayer
  
      ).send({from: activeAddress});
      console.log(results);
    }
  }

  /**
   * Mangement: 
   */
    const endGame = async (_gameContract, _gameNumber) => {
    let results = await _gameContract.methods.endGame(

      // Game number
      _gameNumber

    ).send({from: activeAddress});
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
  
      ).send({from: activeAddress});
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
    if (web3) {
      setGameContract(new web3.eth.Contract(
        gameMasterABI,
        gameAddress
      ))
    }
  }, [web3])

  /**
   * `GameMaster` events
   */
  useEffect(() => {
    if (web3 && gameContract) {
      gameContract.events.GameStarted({}, (error, data) => {
        console.log('EVENT: GameStarted');
        if (error) {
          console.error(error.message);

        } else {
          // console.log(data);
          if (data.returnValues) {
            // setGameState(data.returnValues);
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
          }
        }
      });
    }
  }, [gameContract])

  return (
    <>
      <header>
        <div className="container">
          <div className="grid">
            <div className="row">
              <div className="md-50">
                <HeaderIcon />
              </div>
              <div className="md-50">
                <div className="buttons md-text-left">
                  <button
                    onClick={() => {
                      setMenu(!menu);
                    }}
                    className={(() => {
                      let arr = [
                        'button',
                        'inverse'
                      ];
              
                      if (menu)
                        arr.push('active');
                      
                      return arr.join(' ');
                    })()}
                  >
                    Start raffle
                  </button>
                  <button
                    className="button inverse"
                    onClick={() => connected ? disconnect() : connect()}
                  >
                    🗲 { connected
                      ? activeAddress.length > 10 ? '0x' + activeAddress.slice(2,6).toUpperCase() + '...' + activeAddress.slice(-4).toUpperCase() : activeAddress
                      : 'Connect'
                    }
                  </button>
                </div>
                <div className="md-text-left">
                  <h1>...an Ethereum raffle app</h1>
                  <h2>Create raffles for any number of NFTs, tokens, with an optional fee, at  a price and ticket token of your choice.</h2>
                  
                  <p>
                    <ul>
                      <li>Each raffle can be set up to donate an optional fee (taken from <strong>P#0</strong>, which is the primary ticket pot), at the end of each game.</li>
                      <li>After a game has started, only new prizes can be added. Nothing else can be changed.</li>
                      <li>A winner is guaraneed at the end of every game!</li>
                      <li>In community raffles; a fee  (currently 5%, can vary 0~20%) (taken from P#0) is transfered to the treasury address. This is taken at the end of the game, before the optional game fee.</li>
                      <li>A game can only be ended by its owner, or management staff.</li>
                    </ul>
                  </p>
                  <div className="tip">
                    <p>This user interface is still under development, with the aim to eventually deploy it directly onto blockchain storage, for further decentralisation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <Notifications
        notifications={notifications}
      />
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
          <div className="buttons">
            <button
              onClick={() => startGame(gameContract)}
              className="button">
              startGame (A0)
            </button>
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
            <div
              onClick={(e) => {
                if (e.target.tagName === 'DIV') {
                  console.log('endCommunityGame ID: ' + endCommunityGameId.current.value);
                  endGame(
                    gameContract,
                    web3.utils.toBN(endCommunityGameId.current.value)
                  )
                }
              }}
              className="button"
              role="button"
              tabIndex="0">
              <div>endCommunityGame</div>
              <input ref={endCommunityGameId} defaultValue="0" size="1" min="0" type="number" />
            </div>
          </div>
          <h3>Management &ndash; Transfers</h3>
          <div className="buttons">
            <div
              onClick={(e) => {
                if (e.target.tagName === 'DIV')
                  sendFunds(
                    tokenAddress,
                    sendFundsFrom.current.value,
                    sendFundsTo.current.value,
                    sendFundsAmount.current.value
                  )
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
                  new web3.eth.Contract(
                    gameTrophyABI,
                    gameTrophyAddress
                  ).methods.awardItem(
                    awardItemTo.current.value,
                    awardItemURI.current.value
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

        if (!menu)
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
                <p>Once game has started, you can add (and remove) additional prize pots, such as other tokens, or NFTs</p>
                <h3>Remember</h3>
                <p>Always double check the form values, before starting the game. You can not change these parameters after the game has started.</p>
                <p>Prefer direct contract interaction? <a href={`${EXPLORER_ADDRESS_URI}${gameAddress}`}>{gameAddress}</a></p>
              </div>
              <div className="md-50">
                <div className="grid">
                  <div className="row">
                    <div className="md-50">
                      <label>Ticket token (ERC-20) address</label>
                      <input
                        ref={startCommunityGameTokenAddress}
                        type="text"
                        defaultValue={tokenAddress}
                      />
                    </div>
                    <div className="md-50">
                      <label>Fee address</label>
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
                      <label>Fee percent</label>
                      <input
                        ref={startCommunityGameFeePercent}
                        type="text"
                        defaultValue="10"
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
                <div className="buttons">
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
      <Component
        {...pageProps}
        activeAddress={activeAddress}
        web3={web3}
        allowances={allowances}
        tickets={tickets}
        tokens={tokens}
        games={games}
        gameAddress={gameAddress}
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
      />
      <footer>
        <div className="container">
          <div className="buttons">
            <a href={`${EXPLORER_ADDRESS_URI}${gameAddress}`} className="button">
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
