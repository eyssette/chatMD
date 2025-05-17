function success(pos, chatbot) {
	var crd = pos.coords;
	chatbot.dynamicVariables.LATITUDE = crd.latitude;
	chatbot.dynamicVariables.LONGITUDE = crd.longitude;
	chatbot.dynamicVariables.POSITION_ACCURACY = crd.accuracy;
}

function error(err) {
	console.warn(`ERREUR (${err.code}): ${err.message}`);
}

function getCurrentPosition(options) {
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject, options);
	});
}

const options = {
	enableHighAccuracy: true,
	timeout: 5000,
	maximumAge: 0,
};
export async function processGeolocation(chatbot) {
	try {
		const position = await getCurrentPosition(options);
		success(position, chatbot);
	} catch (err) {
		error(err);
	}
}
