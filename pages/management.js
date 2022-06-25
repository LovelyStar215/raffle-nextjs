import {
	CALLER_ROLE,
	MANAGER_ROLE,
} from '../features/configure/env';

function Management({
  activeAddress,
  web3,
  gameContract,
  setRole
}) {
  if (!gameContract || !web3)
		return null;

  const roleKeys = [
    CALLER_ROLE,
    MANAGER_ROLE
  ];

  return (
    <div key={`management`} className="games">
			<div className="container">
        <h3>Management</h3>
        <p>If you have been granted management roles within the gamemaster contract.<br/>Click button to cache your contract roles and enable management control panels.</p>
        <p>If your contract roles aren&apos;t loading correctly, get in contact with the contract owners.</p>
        <button
          onClick={() => {
            roleKeys.forEach(async role => {
              console.log('role: ' + role);
              let result = await gameContract.methods.hasRole(
                role,
                activeAddress
              ).call();
              if (result)
                setRole(role);
            });
            window.location='/';
          }}
          className="button"
        >
          Load contract roles
        </button>
      </div>
		</div>
  )
}

export default Management