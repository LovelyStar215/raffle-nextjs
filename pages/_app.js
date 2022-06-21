import React, { useState, useEffect, useRef } from 'react';
// import useDeepCompareEffect from 'use-deep-compare-effect'
import Web3 from 'web3'
// import { BN } from 'bn.js';

import { gameMasterABI, IERC20MetadataABI } from '../features/configure/abi.js'

import '../styles/globals.scss'

import Wallet from '../components/wallet'
// import Banner from '../components/banner'
import GamesList from '../components/gamesList'

// ENVIRONMENT
const gameAddress = '0x81D2Ef94CC380C501bF696538eB1a8C924E0C235';//process.env.GAME_ADDRESS || null;
const tokenAddress = '0xC399979F65d1418248593dB74aA0B8fF134a2C23';//process.env.TOKEN_ADDRESS || null;
const feeAddress = '0xF7CbB70c591677E2408d784395e23049399Fb361';//process.env.TESTA1_ADDRESS || null; //A1


const chain = process.env.CHAIN || 'local';

const chainRpcs = {
  local: 'http://192.168.2.4:7545/',
};

// ENVIRONMENT
// const gameAddress = '0x11a305dcb346f4bb48e18f430191fbdea648d242';//process.env.GAME_ADDRESS || null;
// const tokenAddress = '0xbf92a8d662dadbc8bcd8b96545b932a8f79f12b3';//process.env.TOKEN_ADDRESS || null;
// const feeAddress = '0x3d31312F65E90c76f0bf95b574EADCf81Cf2B566';//process.env.TESTA1_ADDRESS || null; //A1


// const chain = 'rinkeby';

// const chainRpcs = {
//   local: 'http://192.168.2.4:7545/',
//   rinkeby: 'https://mainnet.infura.io/v3/ddf47ec4f3e2420bbd5eed733573e6aa'
// };



// console.log(process.env);

// TODO: state for tokens, to reduce calls.
// token rendering
// game pot rendering
// getactivegames implment if empty storage


const LOCAL_STORAGE_KEY_GAMES = process.env.LOCAL_STORAGE_KEY_GAMES || 'caedmon.games';
const LOCAL_STORAGE_KEY_TICKETS = process.env.LOCAL_STORAGE_KEY_TICKETS || 'caedmon.tickets';
const LOCAL_STORAGE_KEY_TOKENS = process.env.LOCAL_STORAGE_KEY_TOKENS || 'caedmon.tokens';
const LOCAL_STORAGE_KEY_APPROVALS = process.env.LOCAL_STORAGE_KEY_APPROVALS || 'caedmon.approvals';

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

  const [approvals, setApprovals] = useState([])

  const endGameId = useRef();
  const getGameStateId = useRef();
  const getActiveGamesMax = useRef();

  const sendFundsFrom = useRef();
  const sendFundsTo = useRef();
  const sendFundsAmount = useRef();

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
    setApprovals(storedApprovals);
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

  const setApproval = (_address, _amount) => {
    console.log('setApproval');
    let _approvals = approvals;
    const currApproval = _approvals.filter(approval => approval.address === _address);
    console.log('currApproval');
    console.log([...currApproval.keys()]);
    
    // Approval exists, update
    if (currApproval.length) {
      let approvalsKey = [...currApproval.keys()][0];
      _approvals[approvalsKey].amount = _amount.toString();
    }
    
    // No match, add new record
    else {
      const newApproval = {};
      newApproval.address = _address;
      newApproval.amount = _amount.toString();
      console.log('setApproval-newApproval');
      console.log(newApproval);
      _approvals[_approvals.length] = newApproval;
    }
    

    console.log('setApproval-_approvals');
    console.log(_approvals);
    setApprovals([..._approvals]);
  };

  const _getAllowance = async (_address) => {
    let allowance;
    let token = new web3.eth.Contract(IERC20MetadataABI, _address);
    const result = await token.methods.allowance(
      activeAddress,
      gameAddress
    ).call();
    console.log('allowance: ' + result);
    if (result) {
      allowance = result.toString();
      console.log(allowance);
      setApproval(_address, result);
    }

    
    return allowance;
  };

  const getAllowance = (_address) => {
    const currApproval = approvals.filter(approval => approval.address === _address);
    
    // Approval exists
    if (currApproval.length) {
      let approvalsKey = [...currApproval.keys()][0];
      let amount = approvals[approvalsKey].amount;
      console.log('Approval exists: ' + amount);
      console.log(approvals[approvalsKey]);

      return web3.utils.toBN(amount);
    }

    // Request token allowance
    _getAllowance(_address);

    return web3.utils.toBN('0');
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
    let _tokens = tokens;
    const currToken = _tokens[data.address];
    const newToken = { ...currToken, ...data };
    console.log('setToken-newToken');
    console.log(newToken);
    _tokens[_tokens.length] = newToken;
    console.log('setToken-tokens');
    console.log(_tokens);
    setTokens([..._tokens]);
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
        address: _address,
        name,
        symbol,
        decimals
      };
      console.log(token);
      setToken(token);
    }
  };

  const getToken = (_address) => {
    if (tokens.length) {
      let filter = tokens.filter(_token => _token.address === _address);
      if (filter.length) {
        console.log('token exists: ' + _address);
        let filterKey = [...filter.keys()][0];
        return tokens[filterKey];
      }
    }

    // Request token
    console.log('token request: ' + _address);
    _getToken(_address);

    return null;
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
            setGameState(data.returnValues);
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
      <div className="tools">
        <div className="container">
          <h3>Dev</h3>
          <div className="button">
            <button onClick={() => sendFunds(tokenAddress, sendFundsFrom.current.value, sendFundsTo.current.value, sendFundsAmount.current.value)}>sendFunds (GBT)</button>
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
          <button className="button" onClick={() => startGame(gameContract)}>startGame (A0)</button>
          <div className="button">
            <button onClick={() => {
              console.log('endGame ID: ' + endGameId.current.value);
              endGame(
                gameContract,
                web3.utils.toBN(endGameId.current.value)
              )
            }}>endGame (A0)</button>
            <input ref={endGameId} defaultValue="0" size="1" min="0" type="number" />
          </div>
          <div className="button">
            <button onClick={() => {
              getGameState(
                web3,
                gameContract,
                games,
                web3.utils.toBN(getGameStateId.current.value)
              )
            }}>getGameState</button>
            <input ref={getGameStateId} defaultValue="0" size="1" min="0" type="number" />
          </div>
          <div className="button">
            <button onClick={() => {
              console.log('getActiveGamesMax: ' + getActiveGamesMax.current.value);
              getActiveGames(
                web3.utils.toBN(getActiveGamesMax.current.value)
              )
            }}>getActiveGames</button>
            <input ref={getActiveGamesMax} defaultValue="1" size="1" min="1" type="number" />
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
