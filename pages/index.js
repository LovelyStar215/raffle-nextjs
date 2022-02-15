// import Web3 from 'web3'
// import { gameABI, gameTokenABI, oracleABI } from '../features/configure/abi.js'

function HomePage() {
  // let now = new Date().toLocaleString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"});
  // console.log(now +  ': web3State: ' + JSON.stringify(web3State));

  return <div>
    <h1>Welcome</h1>
    </div>
}

// export async function getStaticProps() {

//   const chain = 'fantom';

//   const chainRpcs = {
//     fantom: 'http://192.168.2.10:7545/',
//   };

//   const web3 = new Web3(chainRpcs[chain]);
//   const _gameAddress = '0x4C51130A602DeBD7FD0b551d2fe33d9D068b16db';

//   const gameContract = new web3.eth.Contract(
//     gameABI,
//     _gameAddress
//   );
  
//   let results = await gameContract.methods.getGameFeePercent().call();

//   return {
//     props: {
//       gameFeePercent: results[0],
//     },
//   }
// }

export default HomePage