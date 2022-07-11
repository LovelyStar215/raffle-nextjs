const Notifications = ({
	notifications,
}) => {
	console.log('Notifications changed');
	// console.log(notifications);
    let latestNotification = notifications.slice(-1);
	console.log(latestNotification);

	let classes = ['notifications'];

	// Default notification if none exist
	if (!latestNotification.length) {
		latestNotification[0] = {
			message: 'Welcome to [insert name here]',
			reference: false,
			group: 0,
			level: -1,
			time: Date.now()
		};
		console.log(latestNotification);
	}

	let groupLabel;
	switch (latestNotification[0].group) {
		case 2: {
			
			break;
		}
		case 1: {
			groupLabel = `Raffle #${latestNotification[0].reference}`;
			break;
		}
		default: {
			groupLabel = `Braffle (${latestNotification[0].group})`;
			break;
		}
	}

	switch (latestNotification[0].level) {
		case 2: {
			classes.push('error');
			break;
		}
		case 1: {
			classes.push('warn');
			break;
		}
		case 0: {
			classes.push('info');
			break;
		}
	}

	return (
		<section className={classes.join(' ')}>
			<div className="container">
				<div>{groupLabel} &middot; {latestNotification[0].message}</div>
			</div>
		</section>
	);
};

export default Notifications;