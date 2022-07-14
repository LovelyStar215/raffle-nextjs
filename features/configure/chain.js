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
		// case 137:
		// 	return {
		// 		status: 0,
		// 		name: 'Polygon',
		// 		addressContractGameMaster: '',
		// 		addressContractGameTrophy: '',
		// 		addressContractGameToken: '',
		// 		explorerURI: 'https://polygonscan.com/',
		// 		explorerAddressURI: 'https://polygonscan.com/address/'
		// 	};
		// case 250:
		// 	return {
		// 		status: 0,
		// 		name: 'Fantom',
		// 		addressContractGameMaster: '',
		// 		addressContractGameTrophy: '',
		// 		addressContractGameToken: '',
		// 		explorerURI: 'https://ftmscan.com/',
		// 		explorerAddressURI: 'https://ftmscan.com/address/'
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
				addressContractGameMaster: process.env.NEXT_PUBLIC_GAMEMASTER_ADDRESS || null,
				addressContractGameTrophy: process.env.NEXT_PUBLIC_GAME_TROPHY_ADDRESS || null,
				addressContractGameToken: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || null,
				explorerURI: process.env.NEXT_PUBLIC_EXPLORER_URI || null,
				explorerAddressURI: process.env.NEXT_PUBLIC_EXPLORER_ADDRESS_URI || null

			};
		default:
			return false;
	}
};