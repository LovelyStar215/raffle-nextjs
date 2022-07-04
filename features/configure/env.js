import Web3 from 'web3'

export const gameAddress = process.env.NEXT_PUBLIC_GAMEMASTER_ADDRESS || null;
export const gameTrophyAddress = process.env.NEXT_PUBLIC_GAME_TROPHY_ADDRESS || null;
export const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || null;
export const feeAddress = process.env.NEXT_PUBLIC_TESTA1_ADDRESS || null;

export const EXPLORER_ADDRESS_URI = process.env.NEXT_PUBLIC_EXPLORER_ADDRESS_URI || null;

export const CALLER_ROLE = Web3.utils.keccak256('CALLER_ROLE');
export const MANAGER_ROLE = Web3.utils.keccak256('MANAGER_ROLE');

export const LOCAL_STORAGE_KEY_ROLES = process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY_ROLES || 'caedmon.roles';
export const LOCAL_STORAGE_KEY_GAMES = process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY_GAMES || 'caedmon.games';
export const LOCAL_STORAGE_KEY_TICKETS = process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY_TICKETS || 'caedmon.tickets';
export const LOCAL_STORAGE_KEY_TOKENS = process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY_TOKENS || 'caedmon.tokens';
export const LOCAL_STORAGE_KEY_ALLOWANCES = process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY_ALLOWANCES || 'caedmon.allowances';
