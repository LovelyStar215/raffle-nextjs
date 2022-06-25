import {
  IERC20MetadataABI,
  IERC721MetadataABI
} from '../features/configure/abi.js'

import GamesList from '../components/GamesList'

function HomePage({
  activeAddress,
  web3,
  allowances,
  tickets,
  tokens,
  games,
  gameAddress,
  gameContract,
  getActiveGames,
  getGamePlayerState,
  setGames,
  setAllowances,
  setTokens
}) {

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

  const _getERC20Token = async (_address) => {
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

  const getERC20Token = (_address) => {
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
    _getERC20Token(_address);

    return token;
  };

  const _getERC721Token = async (_address) => {
    let gameToken = new web3.eth.Contract(IERC721MetadataABI, _address);
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

    if (name.length && symbol.length) {
      token = {
        state: 1,
        address: _address,
        name,
        symbol
      };
      console.log(token);
      setToken(token);
    }
  };

  const getERC721Token = (_address) => {
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
    _getERC721Token(_address);

    return token;
  };

  const playerAllowanceExists = (_playerAllowanceIdx, _address) => {
    if (allowances.length) {
      // let _playerAllowanceIdx = getAllowancePlayerIndex(activeAddress);
      // console.log('playerAllowanceExists-_playerAllowanceIdx');
      // console.log(_playerAllowanceIdx);

      // console.log('playerAllowanceExists-allowances: ' + JSON.stringify(allowances));
      // console.log('allowances[1].length: ' + allowances[1].length);
      // console.log('allowances[1][_playerAllowanceIdx]');
      // console.log(allowances[1][_playerAllowanceIdx]);
      if (allowances[1].length && allowances[1][_playerAllowanceIdx]) {
        const result = allowances[1][_playerAllowanceIdx].findIndex(approval => approval.address === _address);
        // console.log('_playerAllowances-findIndex');
        // console.log(result);
        if (result >= 0) {
          // console.log('playerAllowanceExists: ' + _address);
          // console.log('result: ' + result);
          
          return result;
        }
      }
    }

    return false;
  };

  const getAllowancePlayerIndex = (_playerAddress) => {
    let _allowances = allowances;
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

    return _playerIndex;
  };

  const _getAllowance = async (_playerAllowanceIdx, _address) => {
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
      setAllowance(_playerAllowanceIdx, newAllowance);
    }
  };

  const getAllowance = (_address) => {
    let _playerAllowanceIdx = getAllowancePlayerIndex(activeAddress);
    // console.log('getAllowance-_playerAllowanceIdx');
    // console.log(_playerAllowanceIdx);
    let playerTokenAllowanceIdx = playerAllowanceExists(_playerAllowanceIdx, _address);
    // console.log('getAllowance-playerTokenAllowanceIdx');
    // console.log(playerTokenAllowanceIdx);
    // console.log('getAllowance-_playerAllowanceIdx-STATE');
    // console.log(allowances[1][_playerAllowanceIdx]);
    // console.log('getAllowance-_playerAllowanceIdx-playerTokenAllowanceIdx-STATE');
    // console.log(allowances[1][_playerAllowanceIdx][playerTokenAllowanceIdx]);
    if (playerTokenAllowanceIdx !== false) {
      return allowances[1][_playerAllowanceIdx][playerTokenAllowanceIdx];
    }

    // No match, add new record
    // if (!allowances[1].length) {
    //   allowances[1][_playerAllowanceIdx] = [];
    // }
    // playerTokenAllowanceIdx = allowances[1][_playerAllowanceIdx].length;
    let newAllowance = {
      state: 0,
      address: _address,
      amount: '0'
    };
    // console.log('setAllowance-newAllowance');
    // console.log(newAllowance);
    setAllowance(_playerAllowanceIdx, newAllowance);
    _getAllowance(_playerAllowanceIdx, _address);

    return newAllowance;
  };

  const setAllowance = (_playerAllowanceIdx, data) => {
    let _allowances = allowances;
    console.log(activeAddress);
    // let _playerAllowanceIdx = getAllowancePlayerIndex(activeAddress);
    // console.log('_playerAllowanceIdx');
    // console.log(_playerAllowanceIdx);

    // console.log(_allowances[1][_playerAllowanceIdx]);

    let playerTokenAllowanceIdx = playerAllowanceExists(_playerAllowanceIdx, data.address);
    if (playerTokenAllowanceIdx !== false) {
      // console.log('Existing record for setAllowance: IDX: ' + playerTokenAllowanceIdx);
      _allowances[1][_playerAllowanceIdx][playerTokenAllowanceIdx] = data;
    }

    // No match, add new record
    else {
      playerTokenAllowanceIdx = _allowances[1][_playerAllowanceIdx].length;
      // console.log('New record for setAllowance: IDX: ' + playerTokenAllowanceIdx);
      // const currAllowance = _allowances[1][_playerAllowanceIdx][playerTokenAllowanceIdx];
      // const newAllowance = { ...currAllowance, ...data };
      // console.log('setAllowance-newAllowance');
      // console.log(newAllowance);
      _allowances[1][_playerAllowanceIdx][playerTokenAllowanceIdx] = data;
    }

    setAllowances([..._allowances]);
  };

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

  return (
    <GamesList
      web3={web3}
      tickets={tickets}
      games={games}
      getAllowancePlayerIndex={getAllowancePlayerIndex}
      getActiveGames={getActiveGames}
      getERC20Token={getERC20Token}
      getERC721Token={getERC721Token}
      gameAddress={gameAddress}
      gameContract={gameContract}
      activeAddress={activeAddress}
      buyTicket={buyTicket}
      getGamePlayerState={getGamePlayerState}
      setGames={setGames}
      setAllowance={setAllowance}
      getAllowance={getAllowance}
    />
  )
}

export default HomePage