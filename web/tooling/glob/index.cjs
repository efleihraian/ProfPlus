"use strict";
const { glob, globSync } = require("tinyglobby");
const { isAbsolute } = require("node:path");
// Only the API used by the pinned Next lint and Vinext import tools is supported.
// Fail visibly if an upstream upgrade starts using a different contract.
function prepare(patterns, options = {}) {
  const list = Array.isArray(patterns) ? patterns : [patterns];
  if (list.length > 1024) throw new RangeError("Too many tooling glob patterns");
  for (const pattern of list) {
    if (typeof pattern !== "string" || !pattern || pattern.length > 32768) {
      throw new TypeError("Tooling glob patterns must be non-empty strings up to 32768 characters");
    }
    let braces = 0, parentheses = 0;
    for (let i = 0; i < pattern.length; i++) {
      const char = pattern[i];
      if (char === "\\") { i++; continue; }
      if (char === "{") braces++;
      else if (char === "}") braces = Math.max(0, braces - 1);
      else if (char === "(") parentheses++;
      else if (char === ")") parentheses = Math.max(0, parentheses - 1);
      if (braces > 64 || parentheses > 64) throw new RangeError("Tooling glob nesting exceeds 64 levels");
    }
  }
  for (const key of Object.keys(options)) {
    if (!["cwd", "onlyDirectories"].includes(key)) throw new TypeError(`Unsupported tooling glob option: ${key}`);
  }
  // Required by tinyglobby's migration guide: fast-glob does not expand a
  // literal directory into its descendants.
  return { expandDirectories: false, absolute: list.some(pattern => isAbsolute(pattern)), ...options };
}
// tinyglobby marks directories with a slash; fast-glob returns unmarked paths.
const unmark = files => files.map(file => file.length > 1 && !/^[a-z]:\/$/i.test(file) ? file.replace(/\/$/, "") : file);
const scan = (patterns, options) => glob(patterns, prepare(patterns, options)).then(unmark);
const scanSync = (patterns, options) => unmark(globSync(patterns, prepare(patterns, options)));
module.exports = Object.assign(scan, { sync: scanSync, glob: scan, globSync: scanSync });
