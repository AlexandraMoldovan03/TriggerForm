const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");

// SVG as source (not asset)
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== "svg");
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

// Video files as bundleable assets
config.resolver.assetExts = [...config.resolver.assetExts, "mov", "mp4", "m4v"];

module.exports = config;
