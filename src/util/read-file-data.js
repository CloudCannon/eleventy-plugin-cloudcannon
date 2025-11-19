const { readFileSync } = require('fs');

function readFileData(filePath) {
	try {
		const contents = readFileSync(filePath, 'utf-8');
		if (filePath.endsWith('.json')) {
			return JSON.parse(contents);
		}
	} catch (err) {
		console.log(err);
	}
}

module.exports = readFileData;
