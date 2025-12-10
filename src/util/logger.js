function log(str) {
	console.log(`[cloudcannon] ${str}`);
}

function logError(str) {
	console.error(`[cloudcannon] ${str}`);
}

module.exports = {
	log,
	logError,
};
