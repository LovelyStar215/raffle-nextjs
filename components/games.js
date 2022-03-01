const Games = ({
	games,
}) => {
	return (
		<div className="games container">
			{games.map((game) => {
				console.log(game);

				(
					<div className="game">
						{games.map((key, value) => {
							console.log(key);
							console.log(value);

							(
								<div>{key}: <span>{value}</span></div>
							)
						})}
					</div>
				)
			})}
		</div>
	);
};

export default Games;