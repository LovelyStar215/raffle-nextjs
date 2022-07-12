const Notifications = ({
	notifications,
}) => {
	// console.log('Notifications changed');
	// console.log(notifications);
    let latestNotification = notifications.slice(-1);
	// console.log(latestNotification);

	let classes = ['notifications'];

	// Default notification if none exist
	if (!latestNotification.length) {
		latestNotification[0] = {
			message: 'Connect your wallet, to access the latest raffle data.',
			reference: false,
			level: 'info',
			time: Date.now()
		};
	}
	// console.log('latestNotification');
	// console.log(latestNotification);

	let groupLabel;
	switch (latestNotification[0].group) {
		case 2: {
			
			break;
		}
		case 'game': {
			groupLabel = `Raffle #${latestNotification[0].reference}`;
			break;
		}
		default: {
			groupLabel = 'App';
			if (latestNotification[0].reference)
				groupLabel = `${latestNotification[0].reference}`;
			break;
		}
	}

	switch (latestNotification[0].level) {
		case 'error': {
			classes.push('error');
			break;
		}
		case 'warn': {
			classes.push('warn');
			break;
		}
		case 'info': {
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