const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimizations for better performance
config.resolver.assetExts.push('md');

// Enable tree shaking for better bundle size
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Enable bundle splitting for better loading performance
config.serializer = {
  ...config.serializer,
  createModuleIdFactory: () => (path) => {
    // Consistent module IDs for better caching
    return require('crypto').createHash('sha256').update(path).digest('hex').substr(0, 8);
  },
  processModuleFilter: (module) => {
    // Filter out large JSON files from the main bundle for lazy loading
    if (module.path.includes('data/') && module.path.endsWith('.json')) {
      return false;
    }
    return true;
  },
};

// Enable caching for faster rebuilds
config.cacheStores = [
  {
    type: 'FileStore',
    root: require('path').join(__dirname, 'node_modules/.cache/metro'),
  },
];

// Optimize asset handling
config.resolver.platforms = ['ios', 'android', 'web', 'native'];

// Enable experimental features for better performance
config.transformer.experimentalImportSupport = true;
config.transformer.inlineRequires = true;

module.exports = config; 