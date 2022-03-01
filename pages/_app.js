import React, {useState, useEffect} from 'react';
import Web3 from 'web3'

import { gameABI, gameTokenABI, oracleABI } from '../features/configure/abi.js'

import '../styles/globals.scss'

import Wallet from '../components/wallet'
// import Banner from '../components/banner'
import Games from '../components/games'

// ENVIRONMENT

const gameAddress = process.env.ADDRESS_GAME || '0xF829837304499518C37915Ab995C1002B2948f3f';
const tokenAddress = process.env.ADDRESS_TOKEN || '0x1a4871D70237aC85D87377FacE9A23E22FAe4E2b';


const srcAddress = '0x71eD234534e42C43A8858e887bF21d2eC05b4Aec';
const feeAddress = '0x73d3350ff8D90D3bb6C8B8De301226aDfEF33aeF';

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
    if (gameContract) {
      gameContract.events.GameStart({}, (error, data) => { //GameStarted
        console.log('EVENT: GameStarted');
        if (error) {
          console.error(error.message);

        } else {
          console.log(data);
          if (data.returnValues) {
            setGameState(games, data.returnValues);
          }
        }
      });
      gameContract.events.GameEnd({}, (error, data) => { //GameEnded
        console.log('EVENT: GameEnded');
        if (error) {
          console.error(error.message);

        } else {
          console.log(data);
          if (data.returnValues) {
            setGameState(games, data.returnValues);
          }
        }
      });
      gameContract.events.GameTicket({}, (error, data) => { //GameTicketBought
        console.log('EVENT: GameTicketBought');
        if (error) {
          console.error(error.message);

        } else {
          console.log(data);
          if (data.returnValues) {
            setGameState(games, data.returnValues);
          }
        }
      });
    }
  }, [gameContract])


  useEffect(async () => {
    if (games.length == 0) {
      // Get games
      console.log('Get latest games');

      this.getGameState(web3, gameContract, games, 0);
    }

    // Process games
    console.log('Games changed');
  }, [games])


  // GET GAME STATE

  let getGameState = async function(web3, gameContract, games, gameNumber) {
    let results = await gameContract.methods.getGameState(gameNumber).call();
    console.log(results);
    // setGameState(games, results);
    console.log('setGameState: ' + data.gameNumber);
    games[data.gameNumber] = Object.assign({}, data, games[data.gameNumber] || {});
    setGames(games);
  }


  // TESTING: START GAME

  let startGame = async function(web3, gameContract) {
    let results = await gameContract.methods.startGame(

      // Token address
      tokenAddress,

      // Game fee address
      feeAddress,

      // Game fee percent
      2,

      // Ticket price
      10,

      // Max players
      100,

      // Max player tickets
      1

    ).send({from: srcAddress});

    return { ...results };
  }


  return (
    <>
      <Wallet
        address={address}
        connected={connected}
      />
      <Games
        games={games}
      />
      <div className="container">
        <button onClick={() => this.startGame(web3, gameContract)}>startGame</button>
        <button onClick={() => this.getGameState(web3, gameContract, games, 0)}>getGameState (0)</button>
      </div>
      <div className="container">
        <Component {...pageProps} />
      </div>
    </>
  )
}

export default MyApp
