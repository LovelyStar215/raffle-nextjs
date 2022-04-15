import React, { useState, useEffect, useRef } from 'react';
// import useDeepCompareEffect from 'use-deep-compare-effect'
import Web3 from 'web3'
// import { BN } from 'bn.js';

import { gameABI, ERC20TokenABI, oracleABI } from '../features/configure/abi.js'

import '../styles/globals.scss'

import Wallet from '../components/wallet'
// import Banner from '../components/banner'
import GamesList from '../components/gamesList'

// ENVIRONMENT
const gameAddress = '0x76aAfB8d7F9b64d53a5e42019b68E3E0Ce81aBBB';//process.env.GAME_ADDRESS || null;
const tokenAddress = '0xEb250E898c3BC66588DbB635f99d2503e041eC8f';//process.env.TOKEN_ADDRESS || null;
const feeAddress = '0xD164eA889594Bdbf91E3929AeBBf84357EF11bAB';//process.env.TESTA1_ADDRESS || null; //A1

console.log(process.env);

const chain = process.env.CHAIN || 'local';

const chainRpcs = {
  local: 'http://192.168.2.10:7545/',
};

const LOCAL_STORAGE_KEY = process.env.LOCAL_STORAGE_KEY;

// APP

function MyApp({ Component, pageProps }) {
  const [web3, setWeb3] = useState(null)
  const [activeAddress, setAddress] = useState(null)
  // const [addresses, setAddresses] = useState(null)
  const [connected, setConnected] = useState(false)

  const [gameContract, setGameContract] = useState(null)

  const [games, setGames] = useState([])

  const gameId = useRef();

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
        // setGameContract(new w3.eth.Contract(
        //   gameABI,
        //   gameAddress
        // ))
        console.log(now +  ': Connected');

        ethereum.on('accountsChanged', (accounts) => {
          console.log(now +  ': Changed');
          if (accounts.length)
            setAddress(accounts[0])
          else
            setAddress(null)
        })
      })
      .catch((err) => console.log(err))
      : console.log(now +  ": Please install MetaMask")
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
    // console.log('setGameState-newGames');
    // console.log(_games);
    setGames([..._games]);
  }

  const getGameState = async (web3, gameContract, games, gameNumber) => {
    let results = await gameContract.methods.getGameState(gameNumber).call();
    console.log('getGameState = ' + gameNumber);
    console.log(results);
    if (results) {
      // let keys = Object.keys(results);
      let len = Object.keys(results).length/2;
      let items = Object.keys(results).slice(len).reduce((result, key) => {
        // console.log('key: ' + key);
        let val = results[key];
        if (typeof val === 'boolean') {
          val = val ? 'true' : 'false';
        }
        // if (key.substring((key.length - 7)) === 'Address' && val.length > 10) {
        //   val = val.slice(0,4) + '...' + val.slice(-4);
        // }

        result[key] = val;

        return result;
      }, {});
      items.gameNumber = gameNumber;
      setGameState(items);
    }
  }


  // TESTING: SEND LPT FUNDS

  const sendFunds = async (_tokenAddress, _fromAddress, _toAddress, _amount) => {
    let tokenContract = new web3.eth.Contract(ERC20TokenABI, _tokenAddress);

    let decimals = web3.utils.toBN(18);
    // let decimals = await tokenContract.methods.decimals().call();
    // console.log(decimals);
    let value = web3.utils.toBN(_amount).mul(web3.utils.toBN(10).pow(decimals));
    
    await tokenContract.methods.approve(_fromAddress, value).send({from: activeAddress});
    // await tokenContract.methods.approve(srcAddress, value).send({from: srcAddress});

    let results = await tokenContract.methods.transferFrom(

      // From
      _fromAddress,

      // To
      _toAddress,

      // Amount
      value

    ).send({from: activeAddress});
  }


  const startGame = async (gameContract) => {
    if (!gameContract || !activeAddress) {
      console.log('Not ready');
    } else {
      let results = await gameContract.methods.startGame(

        // Token address
        tokenAddress,
  
        // Game fee address
        feeAddress,
  
        // Game fee percent
        2,
  
        // Ticket price
        1,
  
        // Max players
        10000,
  
        // Max player tickets
        100
  
      ).send({from: activeAddress});
  
      // setGameState(results);
      // console.log('startGame');
      // console.log(results.gameNumber);
      // getGameState(web3, gameContract, games, results.gameNumber);
    }
  }


  const endGame = async (_gameContract, _gameNumber) => {
    await _gameContract.methods.endGame(

      // Game number
      _gameNumber

    ).send({from: activeAddress});
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
  // useEffect(() => {
  //   let now = new Date().toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"});
  //   if (!connected) {
  //     window.ethereum ?
  //     ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => {
  //       setAddress(accounts[0])
  //       setConnected('1')
  //       let w3 = new Web3(ethereum)
  //       w3.eth.defaultAccount = accounts[0];
  //       setWeb3(w3)
  //       setGameContract(new w3.eth.Contract(
  //         gameABI,
  //         gameAddress
  //       ))
  //       console.log(now +  ': Connected');
  //     }).catch((err) => console.log(err))
  //     : console.log(now +  ": Please install MetaMask")
  //   } else {
  //     // Disconnect
  //     console.log(now +  ': Disconnect');
  //   }
  // }, [connected])
  useEffect(() => {
    if (web3) {
      setGameContract(new web3.eth.Contract(
        gameABI,
        gameAddress
      ))
    }
  }, [web3])



  // useEffect(() => {
  //   let now = new Date().toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"});
  //   console.log(now +  ': Disconnect');
  // }, [web3])




  



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


  // useDeepCompareEffect(() => {
  //   if (web3 && gameContract) {
  //     if (games.length == 0) {
  //       // Get games
  //       console.log('Get latest games');
  
  //       getGameState(web3, gameContract, games, 0);
  //     } else {
  //       console.log('games changed');
  //     }
  //   }
  // }, [games]);

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
          {/* <button className="button" onClick={() => sendFunds(tokenAddress, activeAddress, '0x53725f4B897217C460Cb0E388f1E3d1c868702fb', 1000)}>sendFunds (1000 LPT) (A0)</button> */}
          <div className="button">
            <button onClick={() => sendFunds(tokenAddress, sendFundsFrom.current.value, sendFundsTo.current.value, sendFundsAmount.current.value)}>sendFunds (LPT)</button>
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
            <button onClick={() => endGame(gameContract, gameId.current.value)}>endGame (A0)</button>
            <input ref={gameId} defaultValue="0" size="2" min="0" type="number" />
          </div>
          <div className="button">
            <button onClick={() => getGameState(web3, gameContract, games, gameId.current.value)}>getGameState</button>
            <input ref={gameId} defaultValue="0" size="2" min="0" type="number" />
          </div>
        </div>
      </div>
      <GamesList
        games={games}
        web3={web3}
        ERC20TokenABI={ERC20TokenABI}
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
