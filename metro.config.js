// metro.config.js
// Le dice al compilador de Expo cómo manejar archivos .svg

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Mueve svg de assetExts a sourceExts para tratarlo como componente
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;