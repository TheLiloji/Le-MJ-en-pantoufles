const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ajouter le support des fichiers .md
config.resolver.assetExts.push('md');

config.resolver.alias = {
    ...config.resolver.alias,
    '@': __dirname,
  };

module.exports = config; 