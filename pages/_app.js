import React, { useState, useEffect, useRef } from 'react';
// import useDeepCompareEffect from 'use-deep-compare-effect'
import Web3 from 'web3'
// import { BN } from 'bn.js';

import { gameABI, IERC20MetadataABI, oracleABI } from '../features/configure/abi.js'

import '../styles/globals.scss'

import Wallet from '../components/wallet'
// import Banner from '../components/banner'
import GamesList from '../components/gamesList'

// ENVIRONMENT
const gameAddress = '0xA25Ba3b605a5Cf91490E435A4e692c7EbA7Ab52a';//process.env.GAME_ADDRESS || null;
const tokenAddress = '0x8551Fa6d7d0d5fB1eDf7CB51Fbc4cDe54dc27528';//process.env.TOKEN_ADDRESS || null;
const feeAddress = '0x16318951352A701DaB6C5B30DA64f8f8c1b3de70';//process.env.TESTA1_ADDRESS || null; //A1


const chain = process.env.CHAIN || 'local';

const chainRpcs = {
  local: 'http://192.168.2.3:7545/',
};



console.log(process.env);


const LOCAL_STORAGE_KEY = process.env.LOCAL_STORAGE_KEY;

// APP

function MyApp({ Component, pageProps }) {
  const [web3, setWeb3] = useState(null)
  const [activeAddress, setAddress] = useState(null)
  // const [addresses, setAddresses] = useState(null)
  const [connected, setConnected] = useState(false)

  const [gameContract, setGameContract] = useState(null)

  const [games, setGames] = useState([])

  const endGameId = useRef();
  const getGameStateId = useRef();

  const sendFundsFrom = useRef();
  const sendFundsTo = useRef();
  const sendFundsAmount = useRef();

	useEffect(() => {
		console.log('Loaded from local storage');
		const storedGames = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    console.log(storedGames);
		if (storedGames)
			setGames(storedGames);
	}, [])

	useEffect(() => {
		console.log('Games changed');
		console.log(games);
		const storedGames = JSON.stringify(games);
		localStorage.setItem(LOCAL_STORAGE_KEY, storedGames);
	}, [games])


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

  // GET GAME STATE

  const setGameState = (data) => {
    // console.log('setGameState');
    console.log(JSON.stringify(data));
    let _games = games;
    const currGame = _games[data.gameNumber];
    const newGame = { ...currGame, ...data };
    // console.log('setGameState-newGame');
    // console.log(newGame);
    _games[data.gameNumber] = newGame;
    console.log('setGameState-newGames');
    console.log(_games);
    setGames([..._games]);
  }

  const getGameState = async (web3, gameContract, games, gameNumber) => {
    let results = await gameContract.methods.getGameState(gameNumber).call();
    console.log('getGameState = ' + gameNumber);
    console.log(results);
    if (results) {
      // let keys = Object.keys(results);

      // Clear out indexed array entries
      let len = Object.keys(results).length/2;
      let items = Object.keys(results).slice(len).reduce((result, key) => {
        // console.log('key: ' + key);
        let val = results[key];
        if (typeof val === 'boolean') {
          val = val ? 'true' : 'false';
        }

        if (key === 'winnerResult') {
          console.log(val);
          result['_winnerResult'] = val;
        } else {
          result[key] = val;
        }

        return result;
      }, {});
      items.gameNumber = gameNumber.toString();

      let gameToken = new web3.eth.Contract(IERC20MetadataABI, items.tokenAddress);
      
      const  result = await gameToken.methods.name().call();
      console.log('name: ' + result);
      if (result) {
        items._name = result;
      }
      
      result = await gameToken.methods.symbol().call();
      console.log('symbol: ' + result);
      if (result) {
        items._symbol = result;
      }

      result = await gameToken.methods.decimals().call();
      console.log('decimals: ' + result);
      if (result) {
        items._decimals = result;
      }

      console.log(items);
      console.log('setGameData call');
      setGameState(items);
    }
  }





  // TESTING: SEND CGT FUNDS

  const sendFunds = async (_tokenAddress, _fromAddress, _toAddress, _amount) => {
    const decimals = web3.utils.toBN(18);
    let tokenContract = new web3.eth.Contract(IERC20MetadataABI, _tokenAddress);
    let _value = web3.utils.toBN(_amount).mul(web3.utils.toBN(10).pow(decimals));
    
    await tokenContract.methods.approve(_fromAddress, _value).send({from: activeAddress});
    // await tokenContract.methods.approve(srcAddress, _value).send({from: srcAddress});

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
      let maxPlayers = web3.utils.toBN(100000);
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
        gameABI,
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
          {/* <button className="button" onClick={() => sendFunds(tokenAddress, activeAddress, '0x53725f4B897217C460Cb0E388f1E3d1c868702fb', 1000)}>sendFunds (1000 CGT) (A0)</button> */}
          <div className="button">
            <button onClick={() => sendFunds(tokenAddress, sendFundsFrom.current.value, sendFundsTo.current.value, sendFundsAmount.current.value)}>sendFunds (CGT)</button>
            <input
              ref={sendFundsFrom}
              defaultValue={activeAddress}
              placeholder="From"
              size="8"
              type="text"
            />
            <input
              ref={sendFundsTo}
              defaultValue={gameAddress}
              placeholder="To"
              size="8"
              type="text"
            />
            <input
              ref={sendFundsAmount}
              defaultValue="1000"
              size="4"
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
            <input ref={endGameId} defaultValue="0" size="2" min="0" type="number" />
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
            <input ref={getGameStateId} defaultValue="0" size="2" min="0" type="number" />
          </div>
          {/* <button
						className="button"
						onClick={() => {
              const decimals = web3.utils.toBN(18);
              let tokenContract = new web3.eth.Contract(IERC20MetadataABI, tokenAddress);
							let _totalCost = web3.utils.toBN(100000000).mul(web3.utils.toBN(10).pow(decimals));
							tokenContract.methods.approve(
								activeAddress,
								_totalCost
							).send({from: activeAddress})
						}}>
						Approve funds
					</button> */}
          <button
						className="button"
						onClick={async () => {
              let tokenContract = new web3.eth.Contract(IERC20MetadataABI, tokenAddress);
							let value = await tokenContract.methods.balanceOf(
								gameAddress
							).call({from: activeAddress})
              console.log(value);
						}}>
						Get contract balance
					</button>
        </div>
      </div>
      <GamesList
        games={games}
        web3={web3}
        IERC20MetadataABI={IERC20MetadataABI}
        gameAddress={gameAddress}
        gameContract={gameContract}
        activeAddress={activeAddress}
        buyTicket={buyTicket}
        setGames={setGames}
      />
      <div className="container">
        <Component {...pageProps} />
      </div>
    </>
  )
}

export default MyApp
