const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ajouter le support des fichiers .md
config.resolver.assetExts.push('md');

module.exports = config; 