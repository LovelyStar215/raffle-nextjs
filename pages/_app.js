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
	CALLER_ROLE,
	MANAGER_ROLE,
  LOCAL_STORAGE_KEY_ROLES,
  LOCAL_STORAGE_KEY_GAMES,
  LOCAL_STORAGE_KEY_TICKETS,
  LOCAL_STORAGE_KEY_TOKENS,
  LOCAL_STORAGE_KEY_ALLOWANCES
} from '../features/configure/env';

import '../styles/globals.scss'

// APP

function MyApp({ Component, pageProps }) {
  const [web3, setWeb3] = useState(null)
  const [activeAddress, setAddress] = useState(null)
  // const [addresses, setAddresses] = useState(null)
  const [connected, setConnected] = useState(false)

  const [gameContract, setGameContract] = useState(null)

  const [roles, setRoles] = useState([[],[]])

  const [games, setGames] = useState([])

  const [totalActiveGameCalls, setActiveGameCalls] = useState(0)

  const [tickets, setTickets] = useState([])

  const [tokens, setTokens] = useState([])

  const [allowances, setAllowances] = useState([[],[]])
  // const [_playerIndexes, set_playerIndexes] = useState([])

  const endGameId = useRef();
  const getGameStateId = useRef();
  const getActiveGamesMax = useRef();

  const sendFundsFrom = useRef();
  const sendFundsTo = useRef();
  const sendFundsAmount = useRef();

  const awardItemTo = useRef();
  const awardItemURI = useRef();

	useEffect(() => {
		console.log('Loaded from local storage');

		const storedRoles = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ROLES));
    console.log(storedRoles);
		if (storedRoles)
			setRoles(storedRoles);
    
		const storedGames = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_GAMES));
    console.log(storedGames);
		if (storedGames)
			setGames(storedGames);

    const storedTickets = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_TICKETS));
    console.log(storedTickets);
    if (storedTickets)
      setTickets(storedTickets);

    const storedTokens = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_TOKENS));
    console.log(storedTokens);
    if (storedTokens)
      setTokens(storedTokens);

    const storedApprovals = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_ALLOWANCES));
    console.log(storedApprovals);
    if (storedApprovals)
    setAllowances(storedApprovals);
	}, [])

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
		console.log('Approvals changed');
		console.log(allowances);
		const storedApprovals = JSON.stringify(allowances);
		localStorage.setItem(LOCAL_STORAGE_KEY_ALLOWANCES, storedApprovals);
	}, [allowances])

  const disconnect = () => {
    console.log('disconnect()');
    setAddress(null)
    setWeb3(null)
    setGameContract(null)
    setConnected(false)
  };




  



  



  







  





  const connect = () => {
    console.log('connect()');
    let now = new Date().toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"});
    window.ethereum ?
      ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => {
        console.log(accounts);
        // setAddresses(accounts)
        setAddress(accounts[0])
        setConnected(true)
        let w3 = new Web3(ethereum)
        w3.eth.defaultAccount = accounts[0];
        setWeb3(w3)
        console.log(now + ': Connected');

        ethereum.on('accountsChanged', (accounts) => {
          console.log(now + ': Changed');
          if (accounts.length)
            setAddress(accounts[0])
          else
            setAddress(null)
        })
      })
      .catch((err) => console.log(err))
      : console.log(now + ": Please install MetaMask")
  };

  

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

    console.log(_roles);
    
    setRoles([..._roles]);
  }



  const hasRole = (roleName) => {
    // console.log('hasRole');
    let addressIdx = -1;
    if (roles[0].length) {
      let result = roles[0].findIndex(address => address === activeAddress);
      if (result < 0 )
        return false;

      addressIdx = result;

      result = roles[1][addressIdx].findIndex(role => role === roleName);
      if (result < 0 )
        return false;

      return true;
    }
    
    return false;
  }




  const setGameState = (data) => {
    // console.log('setGameState');
    // console.log(JSON.stringify(data));
    let _games = games;
    const currGame = _games[data.gameNumber];
    const newGame = { ...currGame, ...data };
    // console.log('setGameState-newGame');
    // console.log(newGame);
    _games[data.gameNumber] = newGame;
    // console.log('setGameState-newGames');
    // console.log([..._games]);
    setGames([..._games]);
  }


  const getActiveGames = async (_total, _runOnce) => {
    let runOnce = _runOnce ? true : false;
    if (runOnce && totalActiveGameCalls) {
      console.warn('Only allowed to run getActiveGames() once, in this instance.');
      return;
    }

    let newActiveGameCalls = totalActiveGameCalls + 1;
    setActiveGameCalls(newActiveGameCalls);

    let results = await gameContract.methods.getActiveGames(_total).call();
    // console.log('getActiveGames = ' + _total);
    if (results?.length) {
      // console.log('getActiveGames');
      results.forEach(gameNumber => {
        getGameState(web3, gameContract, games, gameNumber);
      });
      console.log(results);
    } else {
      console.warn('There are no active games');
    }
  };



  const getGameState = async (web3, gameContract, games, gameNumber) => {
    let results = await gameContract.methods.getGameState(gameNumber).call();
    // console.log('getGameState = ' + gameNumber);
    // console.log(results);
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
          let newKey = `_${key}`;
          result[newKey] = potRecord;
        } else if (key === 'winnerResult' || key === 'status') {
          // console.log(val);
          let newKey = `_${key}`;
          result[newKey] = val;
        } else {
          result[key] = val;
        }

        return result;
      }, {});
      items.gameNumber = gameNumber.toString();
      
      // console.log('setGameData call');
      setGameState(items);

      getGamePlayerState(
      	gameNumber,
      	activeAddress
      )
    }
  }




  const setGameTickets = (_gameNumber, data) => {
    // console.log('setGameTickets: ' + _gameNumber);
    // console.log((data));
    let _tickets = tickets;
    // const currTickets = _tickets[_gameNumber];
    // console.log(currTickets);
    const newTickets = { ...data };
    // console.log('setGameTickets-newTickets');
    // console.log(newTickets);
    _tickets[_gameNumber] = newTickets;
    // console.log('setGameTickets-_tickets');
    // console.log(_tickets);
    setTickets([..._tickets]);
  };




  const getGamePlayerState = async (_gameNumber, _playerAddress) => {
    let results = await gameContract.methods.getGamePlayerState(
      _gameNumber,
      _playerAddress
    ).call();
    // console.log('getGamePlayerState = ' + _gameNumber + '; address = ' + _playerAddress);
    // console.log(results);
    let newTickets = tickets[_gameNumber] || [];
    newTickets[_playerAddress] = results;
    // newTickets = {
    //   _playerAddress: results
    // };
    // console.log('newTickets');
    // console.log(newTickets);
    setGameTickets(_gameNumber, newTickets);
    // return results;
  }









  

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
  }


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
    }
  }


  const endGame = async (_gameContract, _gameNumber) => {
    let results = await _gameContract.methods.endGame(

      // Game number
      _gameNumber

    ).send({from: activeAddress});
    console.log(results);
  }




  

	const panelManagementClasses = () => {
		let arr = [
			'tools'
		];
		if (!hasRole(CALLER_ROLE) && !hasRole(MANAGER_ROLE))
			arr.push('hide');
		
		return arr.join(' ');
	}



  // Listen for connection
  useEffect(() => {
    if (web3) {
      setGameContract(new web3.eth.Contract(
        gameMasterABI,
        gameAddress
      ))
    }
  }, [web3])






  // Listen for game events
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
            getGameState(web3, gameContract, games, data.returnValues.gameNumber);
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
            getGameState(web3, gameContract, games, data.returnValues.gameNumber);
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
            getGameState(web3, gameContract, games, data.returnValues.gameNumber);
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
            getGameState(web3, gameContract, games, data.returnValues.gameNumber);
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
        <h3>Wallet</h3>
        <div>
          <button className="button" onClick={() => (connected ? disconnect() : connect())}>
            { connected
              ? activeAddress.length > 10 ? activeAddress.slice(0,4) + '...' + activeAddress.slice(-4) : activeAddress
              : 'Connect'
            }
          </button>
        </div>
      </header>
      <div className={panelManagementClasses()}>
        <div className="container">
          <div className="buttons">
            <h3>Management &ndash; Games</h3>
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
                if (e.target.tagName === 'DIV')
                  getGameState(
                    web3,
                    gameContract,
                    games,
                    web3.utils.toBN(getGameStateId.current.value)
                  )
              }}
              className="button"
              role="button"
              tabIndex="0">
              <div>getGameState</div>
              <input ref={getGameStateId} defaultValue="0" size="1" min="0" type="number" />
            </div>
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
              role="button"
              tabIndex="0">
              <div>getActiveGames</div>
              <input ref={getActiveGamesMax} defaultValue="1" size="1" min="1" type="number" />
            </div>
          </div>
          <div className="buttons">
            <h3>Management &ndash; Transfers</h3>
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
      />
      <div className="container">
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
            className="button lightning"
            title="Contract role call"
          >✺</button>
      </div>
    </>
  )
}

export default MyApp
