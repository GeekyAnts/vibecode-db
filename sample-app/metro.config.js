const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// The SDK lives one directory up (linked via package.json)
const sdkRoot = path.resolve(__dirname, "..");

// Watch the parent SDK directory
config.watchFolders = [sdkRoot];

// Ensure Metro resolves node_modules from both the sample-app and the SDK root
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(sdkRoot, "node_modules"),
];

// Enable package.json exports resolution (needed for @vibecode-db/client/adapters/*)
config.resolver.unstable_enablePackageExports = true;

module.exports = withNativeWind(config, { input: "./global.css" });
