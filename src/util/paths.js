function normalisePath(path) {
	return path.replace(/\/+/g, '/').replace(/^\.$/, '').replace(/^\.\//g, '');
}

function removeLeadingAndTrailingSlashes(path) {
	return path.replace(/^\/+|\/+$/g, '');
}

function stripTopPath(path, topPath) {
	const normalisedTop = normalisePath(topPath);
	return path.startsWith(normalisedTop) ? path.substring(normalisedTop.length) : path;
}

function isTopPath(basePath, index, basePaths) {
	return !basePaths.some((other) => other !== basePath && basePath.startsWith(`${other}/`));
}

function getSourcePath(inputPath, source) {
	return stripTopPath(normalisePath(inputPath), removeLeadingAndTrailingSlashes(source)).replace(
		/^\/+/,
		''
	);
}

module.exports = {
	normalisePath,
	stripTopPath,
	isTopPath,
	getSourcePath,
};
