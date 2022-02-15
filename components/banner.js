import React, {useState, useEffect} from 'react';
// import Web3 from 'web3'

const Banner = ({
	game,
}) => {
	return (
	  <div className="banner">
	    <div className="container">
	      <span>gameState: {game}</span>
	  	</div>
	  </div>
	);
};

export default Banner;