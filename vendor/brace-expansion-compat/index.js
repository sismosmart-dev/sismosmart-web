"use strict";

// eslint-disable-next-line @typescript-eslint/no-require-imports -- minimatch v3 requires a synchronous CommonJS-compatible export.
const upstream = require("brace-expansion-upstream");
const expand = upstream.expand;

module.exports = expand;
module.exports.expand = expand;
module.exports.EXPANSION_MAX = upstream.EXPANSION_MAX;
module.exports.EXPANSION_MAX_LENGTH = upstream.EXPANSION_MAX_LENGTH;
