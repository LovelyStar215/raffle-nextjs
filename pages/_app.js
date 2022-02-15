import React, {useState, useEffect} from 'react';
import Web3 from 'web3'
import { gameABI, gameTokenABI, oracleABI } from '../features/configure/abi.js'
// import { MultiCall } from 'eth-multicall'

import '../styles/globals.scss'

import Wallet from '../components/wallet'
import Banner from '../components/banner'




// helloWorldContract.events.UpdatedMessages({}, (error, data) => {
//   if (error) {
//     setStatus(error.message);
//   } else {
//     setMessage(data.returnValues[1]);
//     setNewMessage("");
//     setStatus("Your message has been updated!");
//   }
// });





const gameAddress = '0xaCEa0CFfE0a76030Aa5c00a1c2bC96402E9D0776';
// const gameAddress = '0xc71C9DC92FB5704ca7AeFd0a0c420630f9ACdc5c';

const chain = 'fantom';

const chainRpcs = {
  fantom: 'http://192.168.2.10:7545/',
};

// if (!web3.currentProvider.connected) {
//   web3.setProvider(newProvider())
// }






async function getGameState(chain, _gameAddress, _address) {
  const web3 = new Web3(chainRpcs[chain]);
  const gameContract = new web3.eth.Contract(
    gameABI,
    _gameAddress
  );

  let results = await gameContract.methods.getGameState().call(0);
  return { ...results };
}






function MyApp({ Component, pageProps }) {
  const [web3, setWeb3] = useState(null)
  const [address, setAddress] = useState(null)
  const [connected, setConnected] = useState(null)

  const [gameState, setGameState] = useState(null)

  
  useEffect(() => {
    let now = new Date().toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"});
    if (!connected) {
      window.ethereum ?
      ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => {
        setAddress(accounts[0])
        setConnected('1')
        let w3 = new Web3(ethereum)
        setWeb3(w3)
        console.log(now +  ': Connected');
      }).catch((err) => console.log(err))
      : console.log(now +  ": Please install MetaMask")
    }
  }, [address, connected])

  useEffect(async () => {
    let now = new Date().toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"});
    let response = await getGameState(chain, gameAddress, address);
    console.log(now +  ': getGameState: ' + JSON.stringify(response));
    setGameState(response[0]);
  }, [])

  return (
    <>
      <Wallet
        address={address}
        connected={connected}
      />
      <Banner
        game={gameState}
      />
      <div className="container">
        <Component {...pageProps} />
      </div>
    </>
  )
}

export default MyApp
