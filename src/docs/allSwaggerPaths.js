// Combinaison de tous les paths Swagger
const swaggerPaths = require('./swaggerPaths');
const swaggerPathsExtended = require('./swaggerPathsExtended');
const swaggerPathsFinal = require('./swaggerPathsFinal');

// Combiner tous les paths
const allSwaggerPaths = {
  ...swaggerPaths,
  ...swaggerPathsExtended,
  ...swaggerPathsFinal
};

module.exports = allSwaggerPaths;
