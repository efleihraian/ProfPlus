// Aplicația importă contractul API din web/shared (același cod ca site-ul), aflat în afara folderului mobile/.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, "../web/shared")];

module.exports = config;
