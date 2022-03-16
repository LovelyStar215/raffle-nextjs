import React, {useState, useEffect} from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect'
import Web3 from 'web3'

import { gameABI, ERC20TokenABI, oracleABI } from '../features/configure/abi.js'

import '../styles/globals.scss'

import Wallet from '../components/wallet'
// import Banner from '../components/banner'
import Games from '../components/games'

// ENVIRONMENT

const gameAddress = '0x02918a29f6a5d5BBd0a97C08B771d58083104B80';//process.env.ADDRESS_GAME || '0x6394e1342D2BAE843227C55F87D1131437F98873';
const tokenAddress = '0xB215477DB33Da8CdfbC31A091FDb57b75985f0C2';//process.env.ADDRESS_TOKEN || '0x652Eac604B056D09d37Dd5ED16A984B2f0955f7F';


const srcAddress = '0xb1aBDb990F253FB59839A7481dDa107B541C1F7b'; //A0
const feeAddress = '0xD164eA889594Bdbf91E3929AeBBf84357EF11bAB'; //A1

const chain = process.env.CHAIN || 'local';

const chainRpcs = {
  local: 'http://192.168.2.10:7545/',
};

// GET GAME STATE

// async function getWeb3GameState(web3, gameContract, games, gameNumber) {
//   let results = await gameContract.methods.getGameState(gameNumber).call();
//   console.log(results);
//   // setGameState(games, results);
//   console.log('setGameState: ' + data.gameNumber);
//   games[data.gameNumber] = Object.assign({}, data, games[data.gameNumber] || {});
//   setGames(games);
// }

// SET GAME STATE

// function setGameState(games, data) {
//   // let game = games[data.gameNumber] || {};
//   // if (games.indexOf(data.gameNumber))
//   console.log('setGameState: ' + data.gameNumber);
//   games[data.gameNumber] = Object.assign({}, data, games[data.gameNumber] || {});
//   setGames(games);
// }

// APP

function MyApp({ Component, pageProps }) {
  const [web3, setWeb3] = useState(null)
  const [address, setAddress] = useState(null)
  const [connected, setConnected] = useState(null)

  const [gameContract, setGameContract] = useState(null)

  const [games, setGames] = useState([])

  const [gameId, setGameId] = useState(0)


  // GET GAME STATE

  const setGameState = (data) => {
    // console.log('setGameState');
    console.log(JSON.stringify(data));
    let _games = games;
    _games[data.gameNumber] = Object.assign({}, data, _games[data.gameNumber] || {});
    // console.log('setGameState-new');
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
    
    await tokenContract.methods.approve(_fromAddress, _amount).send({from: srcAddress});
    // await tokenContract.methods.approve(srcAddress, _amount).send({from: srcAddress});

    let results = await tokenContract.methods.transferFrom(

      // From
      _fromAddress,

      // To
      _toAddress,

      // Amount
      1000

    ).send({from: srcAddress});
  }


  const startGame = async (web3, gameContract, games) => {
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

    ).send({from: srcAddress});

    // setGameState(results);
    // console.log('startGame');
    // console.log(results.gameNumber);
    // getGameState(web3, gameContract, games, results.gameNumber);
  }




  const buyTicket = async (_gameContract, _gameNumber, _numberOfTickets) => {
    console.log('buyTicket ' + _numberOfTickets + ' for #' + _gameNumber);

    let results = await _gameContract.methods.buyTicket(

      // Game number
      _gameNumber,

      // Number of tickets to buy
      _numberOfTickets

    ).send({from: srcAddress});
    console.log(results);
  }



  // Listen for connection
  useEffect(() => {
    let now = new Date().toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"});
    if (!connected) {
      window.ethereum ?
      ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => {
        setAddress(accounts[0])
        setConnected('1')
        let w3 = new Web3(ethereum)
        w3.eth.defaultAccount = accounts[0];
        setWeb3(w3)
        setGameContract(new w3.eth.Contract(
          gameABI,
          gameAddress
        ))
        console.log(now +  ': Connected');
      }).catch((err) => console.log(err))
      : console.log(now +  ": Please install MetaMask")
    } else {
      // Disconnect
      console.log(now +  ': Disconnect');
    }
  }, [connected])



  // Listen for game events
  useEffect(() => {
    if (connected && gameContract) {
      gameContract.events.GameStarted({}, (error, data) => { //GameStarted
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
      gameContract.events.GameEnded({}, (error, data) => { //GameEnded
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
      gameContract.events.GameTicketBought({}, (error, data) => { //GameTicketBought
        console.log('EVENT: GameTicketBought');
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


  useDeepCompareEffect(() => {
    if (connected && gameContract) {
      if (games.length == 0) {
        // Get games
        console.log('Get latest games');
  
        getGameState(web3, gameContract, games, 0);
      } else {
        console.log('games changed');
      }
    }
  }, [games]);

  return (
    <>
      <Wallet
        address={address}
        connected={connected}
      />
      <div className="tools">
        <div className="container">
          <h3>Dev</h3>
          <button className="button" onClick={() => sendFunds(tokenAddress, gameAddress, srcAddress, 1000)}>sendFunds (1000 LPT) (A0)</button>
          <button className="button" onClick={() => startGame(web3, gameContract)}>startGame (A0)</button>
          <div className="button">
            <button onClick={() => getGameState(web3, gameContract, games, gameId)}>getGameState</button>
            <input defaultValue="0" size="3" min="0" onChange={event => setGameId(event.target.value)} type="number" />
          </div>
        </div>
      </div>
      <Games
        games={games}
        web3={web3}
        ERC20TokenABI={ERC20TokenABI}
        gameAddress={gameAddress}
        gameContract={gameContract}
        srcAddress={srcAddress}
        buyTicket={buyTicket}
      />
      <div className="container">
        <Component {...pageProps} />
      </div>
    </>
  )
}

export default MyApp
