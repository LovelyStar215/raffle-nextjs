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
  LOCAL_STORAGE_KEY_GAMES,
  LOCAL_STORAGE_KEY_TICKETS,
  LOCAL_STORAGE_KEY_TOKENS,
  LOCAL_STORAGE_KEY_APPROVALS
} from '../features/configure/env';

import '../styles/globals.scss'

import Wallet from '../components/Wallet'
// import Banner from '../components/banner'
import GamesList from '../components/GamesList'

// APP

function MyApp({ Component, pageProps }) {
  const [web3, setWeb3] = useState(null)
  const [activeAddress, setAddress] = useState(null)
  // const [addresses, setAddresses] = useState(null)
  const [connected, setConnected] = useState(false)

  const [gameContract, setGameContract] = useState(null)

  const [games, setGames] = useState([])

  const [totalActiveGameCalls, setActiveGameCalls] = useState(0)

  const [tickets, setTickets] = useState([])

  const [tokens, setTokens] = useState([])

  const [approvals, setAllowances] = useState([[],[]])
  // const [_playerIndexes, set_playerIndexes] = useState([])

  const endGameId = useRef();
  const getGameStateId = useRef();
  const getActiveGamesMax = useRef();

  const sendFundsFrom = useRef();
  const sendFundsTo = useRef();
  const sendFundsAmount = useRef();

  const awardItemTo = useRef();
  const awardItemURI = useRef();

  // User has the necessary contract roles?
	let hasManagementAccess = true; // TBC

	useEffect(() => {
		console.log('Loaded from local storage');
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

    const storedApprovals = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_APPROVALS));
    console.log(storedApprovals);
    if (storedApprovals)
    setAllowances(storedApprovals);
	}, [])

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
		console.log(approvals);
		const storedApprovals = JSON.stringify(approvals);
		localStorage.setItem(LOCAL_STORAGE_KEY_APPROVALS, storedApprovals);
	}, [approvals])

  const disconnect = () => {
    console.log('disconnect()');
    setAddress(null)
    setWeb3(null)
    setGameContract(null)
    setConnected(false)
  };




  const getAllowancePlayerIndex = (_playerAddress) => {
    let _allowances = approvals;
    // console.log('getAllowancePlayerIndex-_allowances');
    // console.log(_allowances);
    // let _playerIndexes = _allowances[0];
    // console.log('getAllowancePlayerIndex-_playerIndexes');
    // console.log(_allowances[0]);
    
    
    let _playerIndex = -1;
    
    if (_allowances[0].length)
      _playerIndex = _allowances[0].findIndex(address => address === _playerAddress);

    // console.log('_allowances[0] match: ' + _playerIndex);

    if (_playerIndex < 0) {
      _playerIndex = _allowances[0].length;

      _allowances[0][_playerIndex] = _playerAddress;
      _allowances[1][_playerIndex] = [];

      setAllowances([..._allowances]);
    }




    // if (_allowances[0].length) {
    //   const result = _allowances[0].filter(address => {
    //     console.log(address);
    //     return address === _playerAddress
    //   });
    //   console.log('_playerAllowances-filter');
    //   console.log([...result]);
    //   if (result.length) {
    //     let resultKey = [...result.keys()][0];
    //     console.log('getAllowancePlayerIndex: ' + _playerAddress);
    //     console.log('resultKey: ' + resultKey);
        
    //     return resultKey;
    //   }
    // }

    // console.warn('getAllowancePlayerIndex: create new entry');

    // let _playerIndexes = _playerIndexes;
    // let _playerIndex = _allowances[0].length;
    // console.log('getAllowancePlayerIndex-_playerIndex.length');
    // console.log(_playerIndex);

    // console.log('_allowances');
    // console.log(_allowances);

    // _allowances[0][_playerIndex] = _playerAddress;
    // _allowances[1][_playerIndex] = [];

    // console.log('getAllowancePlayerIndex-_playerIndexes');
    // console.log(_allowances[0]);

    // console.log('getAllowancePlayerIndex-_playerAllowances');
    // console.log(_allowances[1]);
    

    // setAllowances([..._allowances]);

    return _playerIndex;
  };



  const allowanceExists = (_playerAllowanceIdx, _address) => {
    if (approvals.length) {
      // let _playerAllowanceIdx = getAllowancePlayerIndex(activeAddress);
      // console.log('allowanceExists-_playerAllowanceIdx');
      // console.log(_playerAllowanceIdx);

      // console.log('allowanceExists-approvals: ' + JSON.stringify(approvals));
      // console.log('approvals[1].length: ' + approvals[1].length);
      // console.log('approvals[1][_playerAllowanceIdx]');
      // console.log(approvals[1][_playerAllowanceIdx]);
      if (approvals[1].length && approvals[1][_playerAllowanceIdx]) {
        const result = approvals[1][_playerAllowanceIdx].findIndex(approval => approval.address === _address);
        // console.log('_playerAllowances-findIndex');
        // console.log(result);
        if (result >= 0) {
          // console.log('allowanceExists: ' + _address);
          // console.log('result: ' + result);
          
          return result;
        }
      }
    }

    return false;
  };



  const setApproval = (_playerAllowanceIdx, data) => {
    let _approvals = approvals;
    console.log(activeAddress);
    // let _playerAllowanceIdx = getAllowancePlayerIndex(activeAddress);
    // console.log('_playerAllowanceIdx');
    // console.log(_playerAllowanceIdx);

    // console.log(_approvals[1][_playerAllowanceIdx]);

    let playerTokenAllowanceIdx = allowanceExists(_playerAllowanceIdx, data.address);
    if (playerTokenAllowanceIdx !== false) {
      // console.log('Existing record for setApproval: IDX: ' + playerTokenAllowanceIdx);
      _approvals[1][_playerAllowanceIdx][playerTokenAllowanceIdx] = data;
    }

    // No match, add new record
    else {
      playerTokenAllowanceIdx = _approvals[1][_playerAllowanceIdx].length;
      // console.log('New record for setApproval: IDX: ' + playerTokenAllowanceIdx);
      // const currAllowance = _approvals[1][_playerAllowanceIdx][playerTokenAllowanceIdx];
      // const newAllowance = { ...currAllowance, ...data };
      // console.log('setApproval-newAllowance');
      // console.log(newAllowance);
      _approvals[1][_playerAllowanceIdx][playerTokenAllowanceIdx] = data;
    }

    // const result = _approvals[1][_playerAllowanceIdx].filter(approval => approval.address === _address);
    // console.log('_playerAllowances-filter');
    // console.log([...result.keys()]);

    // let playerTokenAllowanceIdx;

    // if (result.length) {
    //   playerTokenAllowanceIdx = [...result.keys()][0];
    //   _approvals[1][_playerAllowanceIdx][playerTokenAllowanceIdx].amount = _amount.toString();
    // }

    // // No match, add new record
    // else {
    //   playerTokenAllowanceIdx = _approvals[1][_playerAllowanceIdx].length;
    //   const newAllowance = {
    //     address: _address,
    //     amount: _amount
    //   };
    //   console.log('setApproval-newAllowance');
    //   console.log(newAllowance);
    //   _approvals[1][_playerAllowanceIdx][playerTokenAllowanceIdx] = newAllowance;
    // }

    setAllowances([..._approvals]);
  };







  const _getAllowance = async (_playerAllowanceIdx, _address) => {
    let allowance;
    let token = new web3.eth.Contract(IERC20MetadataABI, _address);
    const result = await token.methods.allowance(
      activeAddress,
      gameAddress
    ).call();
    // console.log('allowance: ' + result);
    if (result) {
      let newAllowance = {
        state: 1,
        address: _address,
        amount: result.toString()
      };
      // console.log(newAllowance);
      setApproval(_playerAllowanceIdx, newAllowance);
    }
  };

  const getAllowance = (_address) => {
    let _playerAllowanceIdx = getAllowancePlayerIndex(activeAddress);
    // console.log('getAllowance-_playerAllowanceIdx');
    // console.log(_playerAllowanceIdx);
    let playerTokenAllowanceIdx = allowanceExists(_playerAllowanceIdx, _address);
    // console.log('getAllowance-playerTokenAllowanceIdx');
    // console.log(playerTokenAllowanceIdx);
    // console.log('getAllowance-_playerAllowanceIdx-STATE');
    // console.log(approvals[1][_playerAllowanceIdx]);
    // console.log('getAllowance-_playerAllowanceIdx-playerTokenAllowanceIdx-STATE');
    // console.log(approvals[1][_playerAllowanceIdx][playerTokenAllowanceIdx]);
    if (playerTokenAllowanceIdx !== false) {
      return approvals[1][_playerAllowanceIdx][playerTokenAllowanceIdx];
    }

    // No match, add new record
    // if (!approvals[1].length) {
    //   approvals[1][_playerAllowanceIdx] = [];
    // }
    // playerTokenAllowanceIdx = approvals[1][_playerAllowanceIdx].length;
    let newAllowance = {
      state: 0,
      address: _address,
      amount: '0'
    };
    // console.log('setApproval-newAllowance');
    // console.log(newAllowance);
    setApproval(_playerAllowanceIdx, newAllowance);
    _getAllowance(_playerAllowanceIdx, _address);

    return newAllowance;




    // if (approvals.length) {
    //   const currApproval = approvals.filter(approval => approval.address === _address);
      
    //   // Approval exists
    //   if (currApproval.length) {
    //     let approvalsKey = [...currApproval.keys()][0];
    //     let amount = approvals[approvalsKey].amount;
    //     console.log('Approval exists: ' + amount);
    //     console.log(approvals[approvalsKey]);

    //     return web3.utils.toBN(amount);
    //   }

    //   // Request token allowance
    //   _getAllowance(_address);
    // }

    // const result = approvals[1][_playerAllowanceIdx].filter(approval => approval.address === _address);
    // console.log('_playerAllowances-filter');
    // console.log([...result.keys()]);

    // let playerTokenAllowanceIdx;

    // if (result.length) {
    //   playerTokenAllowanceIdx = [...result.keys()][0];
    //   if (playerTokenAllowanceIdx)
    //     return playerTokenAllowanceIdx;
    // }

    // // No match, add new record
    // else {
    //   playerTokenAllowanceIdx = _approvals[1][_playerAllowanceIdx].length;
    //   const newAllowance = {
    //     address: _address,
    //     amount: _amount
    //   };
    //   console.log('setApproval-newAllowance');
    //   console.log(newAllowance);
    //   _approvals[1][_playerAllowanceIdx][playerTokenAllowanceIdx] = newAllowance;
    // }

    // return web3.utils.toBN('0');
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

  const setToken = (data) => {
    console.log('setToken');
    console.log(JSON.stringify(data));
    let tokenIdx = tokenExists(data.address);
    if (tokenIdx === false)
      tokenIdx = tokens.length;
    
    const currToken = tokens[tokenIdx];
    const newToken = { ...currToken, ...data };
    // console.log('setToken-newToken');
    // console.log(newToken);

    tokens[tokenIdx] = newToken;
    // console.log('setToken-tokens');
    // console.log(tokens);
    setTokens([...tokens]);
  }

  const _getToken = async (_address) => {
    let gameToken = new web3.eth.Contract(IERC20MetadataABI, _address);
    let token, name, symbol, decimals;
    
    const result = await gameToken.methods.name().call();
    console.log('name: ' + result);
    if (result) {
      name = result;
    }
    
    result = await gameToken.methods.symbol().call();
    console.log('symbol: ' + result);
    if (result) {
      symbol = result;
    }

    result = await gameToken.methods.decimals().call();
    console.log('decimals: ' + result);
    if (result) {
      decimals = result;
    }

    if (name.length && symbol.length && decimals.length) {
      token = {
        state: 1,
        address: _address,
        name,
        symbol,
        decimals
      };
      console.log(token);
      setToken(token);
    }
  };

  const tokenExists = (_address) => {
    if (tokens.length) {
      const result = tokens.findIndex(_token => _token.address === _address);
      if (result >= 0) {
        console.log('token exists: ' + _address);

        return result;
      }
    }

    return false;
  };

  const getToken = (_address) => {
    let tokenId = tokenExists(_address);
    if (tokenId !== false)
      return tokens[tokenId];

    // Request token
    console.log('token request: ' + _address);
    let token = {
      state: 0,
      address: _address
    };
    setToken(token);
    _getToken(_address);

    return token;
  };

  const setGameTickets = (_gameNumber, data) => {
    console.log('setGameTickets: ' + _gameNumber);
    console.log((data));
    let _tickets = tickets;
    // const currTickets = _tickets[_gameNumber];
    // console.log(currTickets);
    const newTickets = { ...data };
    console.log('setGameTickets-newTickets');
    console.log(newTickets);
    _tickets[_gameNumber] = newTickets;
    console.log('setGameTickets-_tickets');
    console.log(_tickets);
    setTickets([..._tickets]);
  };



  // GET GAME STATE

  const setGameState = (data) => {
    console.log('setGameState');
    console.log(JSON.stringify(data));
    let _games = games;
    const currGame = _games[data.gameNumber];
    const newGame = { ...currGame, ...data };
    console.log('setGameState-newGame');
    console.log(newGame);
    _games[data.gameNumber] = newGame;
    console.log('setGameState-newGames');
    console.log([..._games]);
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
    console.log('getActiveGames = ' + _total);
    if (results?.length) {
      console.log('getActiveGames');
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
    console.log('getGameState = ' + gameNumber);
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
      
      console.log('setGameData call');
      setGameState(items);

      getGamePlayerState(
      	gameNumber,
      	activeAddress
      )
    }
  }




  const getGamePlayerState = async (_gameNumber, _playerAddress) => {
    let results = await gameContract.methods.getGamePlayerState(
      _gameNumber,
      _playerAddress
    ).call();
    console.log('getGamePlayerState = ' + _gameNumber + '; address = ' + _playerAddress);
    console.log(results);
    let newTickets = tickets[_gameNumber] || [];
    newTickets[_playerAddress] = results;
    // newTickets = {
    //   _playerAddress: results
    // };
    console.log('newTickets');
    console.log(newTickets);
    setGameTickets(_gameNumber, newTickets);
    // return results;
  }





  // TESTING: SEND GBT FUNDS

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




  const buyTicket = async (_gameContract, _gameNumber, _numberOfTickets) => {
    console.log('buyTicket ' + _numberOfTickets + ' for #' + _gameNumber);

    let results = await _gameContract.methods.buyTicket(

      // Game number
      _gameNumber,

      // Number of tickets to buy
      _numberOfTickets

    ).send({from: activeAddress});
    console.log(results);
  }

	const panelManagementClasses = () => {
		let arr = [
			'tools'
		];
		if (!hasManagementAccess)
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
      <GamesList
        getActiveGames={getActiveGames}
        tickets={tickets}
        getToken={getToken}
        games={games}
        web3={web3}
        gameAddress={gameAddress}
        gameContract={gameContract}
        activeAddress={activeAddress}
        buyTicket={buyTicket}
        getGamePlayerState={getGamePlayerState}
        setGames={setGames}
        setApproval={setApproval}
        getAllowance={getAllowance}
      />
      <div className="container">
        <Component {...pageProps} />
      </div>
    </>
  )
}

export default MyApp
