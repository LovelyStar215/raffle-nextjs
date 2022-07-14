import {
	gameAddress,
	gameTrophyAddress,
	tokenAddress
} from './env';

export const getChainDeployment = (_chainId) => {
	switch (_chainId) {
		// case 1:
		// 	return {
		// 		status: 0,
		// 		name: 'Ethereum',
		// 		addressContractGameMaster: '',
		// 		addressContractGameTrophy: '',
		// 		addressContractGameToken: '',
		// 		explorerURI: 'https://etherscan.io/',
		// 		explorerAddressURI: 'https://etherscan.io/address/'
		// 	};
		case 4:
			return {
				status: -1,
				name: 'Rinkeby',
				addressContractGameMaster: '0x35242de9626c603ec5caff32c185550cd4cd40b4',
				addressContractGameTrophy: '',
				addressContractGameToken: '0xbf92a8d662dadbc8bcd8b96545b932a8f79f12b3',
				explorerURI: 'https://rinkeby.etherscan.io/',
				explorerAddressURI: 'https://rinkeby.etherscan.io/address/'
			};
		case 1337:
			return {
				status: -2,
				name: 'Ganache',
				addressContractGameMaster: gameAddress,
				addressContractGameTrophy: gameTrophyAddress,
				addressContractGameToken: tokenAddress,
				explorerURI: '',
				explorerAddressURI: ''

			};
		default:
			return false;
	}
};