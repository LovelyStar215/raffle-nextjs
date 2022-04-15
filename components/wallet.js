const Wallet = ({
  address,
  connected,
}) => {
  return (
    <header>
      <h3>Wallet</h3>
      <div>
        <button onClick={() => (connected ? () => {setConnected(false)} : null)}>
          { connected ?
            (
              address.length > 10 ? address.slice(0,4) + '...' + address.slice(-4) : address
            )
            : 'Connect'
          }
        </button>
      </div>
    </header>
  );
};

export default Wallet;