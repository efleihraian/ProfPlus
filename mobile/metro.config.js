// Aplicația importă contractul API și module de client din web; .easignore permite numai sursele necesare.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, "../web/shared"), path.resolve(__dirname, "../web/lib")];

module.exports = config;
