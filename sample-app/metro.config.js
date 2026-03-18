const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// The SDK lives one directory up (linked via package.json)
const sdkRoot = path.resolve(__dirname, "..");

// Watch the parent SDK directory so changes are picked up
config.watchFolders = [sdkRoot];

// Resolve node_modules from both sample-app and SDK root
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(sdkRoot, "node_modules"),
];

// Enable package.json exports resolution (needed for @vibecode-db/client/adapters/*)
config.resolver.unstable_enablePackageExports = true;

// Optional peer deps that may not be installed — return empty modules
// Remove packages from this list once you install them
const optionalDeps = [
  "pocketbase",
];

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (optionalDeps.some((dep) => moduleName === dep || moduleName.startsWith(dep + "/"))) {
    return { type: "empty" };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
