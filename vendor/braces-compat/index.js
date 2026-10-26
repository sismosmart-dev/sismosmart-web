"use strict";

// ponytail: implements only the braces(input, options) call that micromatch makes
// (expand mode, and a whole-pattern alternation like "(a/x|a/y)" otherwise). It does not provide braces.parse,
// braces.compile, braces.create or braces.stringify. Replace this wrapper with the
// upstream package once braces ships a release fixed for GHSA-vfj7-8cjw-p6xm.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- micromatch loads braces through synchronous CommonJS require.
const { expand } = require("brace-expansion-upstream");

function braces(input, options = {}) {
  const output = [];
  for (const pattern of [].concat(input)) {
    const expanded = expand(String(pattern));
    if (options.expand === true || expanded.length < 2) {
      output.push(...expanded);
    } else {
      output.push(`(${expanded.join("|")})`);
    }
  }
  return options.nodupes === true ? [...new Set(output)] : output;
}

braces.expand = (input, options) => braces(input, { ...options, expand: true });

module.exports = braces;
