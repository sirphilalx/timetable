const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add 'sql' to asset extensions for Drizzle SQLite migrations
config.resolver.assetExts.push("sql");

module.exports = withNativeWind(config, { input: "./global.css" });
