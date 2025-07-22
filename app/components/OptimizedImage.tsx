import React, { useState, useCallback, memo } from 'react';
import { Image, View, ActivityIndicator, Text, StyleSheet, ImageProps, ImageStyle } from 'react-native';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  width?: number;
  height?: number;
  borderRadius?: number;
  showLoadingIndicator?: boolean;
  cache?: 'default' | 'reload' | 'force-cache' | 'only-if-cached';
}

// Simple image cache to track loaded images
const imageCache = new Set<string>();

const OptimizedImage = memo<OptimizedImageProps>(({
  uri,
  placeholder,
  fallback,
  width = 100,
  height = 100,
  borderRadius = 0,
  showLoadingIndicator = true,
  cache = 'default',
  style,
  ...props
}) => {
  const [loading, setLoading] = useState(!imageCache.has(uri));
  const [error, setError] = useState(false);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setError(false);
  }, []);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
    imageCache.add(uri);
  }, [uri]);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
    // Remove from cache if it was there
    imageCache.delete(uri);
  }, [uri]);

  const imageStyle: ImageStyle = {
    width,
    height,
    borderRadius,
    ...(style as ImageStyle),
  };

  const containerStyle = {
    width,
    height,
    borderRadius,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
  };

  if (error) {
    return (
      <View style={[containerStyle, styles.container]}>
        {fallback || (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackText}>📷</Text>
            <Text style={styles.fallbackSubtext}>Image non disponible</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[containerStyle, styles.container]}>
      <Image
        source={{ 
          uri,
          cache,
        }}
        style={imageStyle}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
        resizeMode="cover"
        {...props}
      />
      
      {loading && showLoadingIndicator && (
        <View style={styles.loadingOverlay}>
          {placeholder || (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(243, 244, 246, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 32,
    marginBottom: 4,
  },
  fallbackSubtext: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default OptimizedImage;

// Utility function to preload images
export const preloadImages = async (uris: string[]): Promise<void> => {
  const promises = uris.map(uri => {
    return new Promise<void>((resolve) => {
      if (imageCache.has(uri)) {
        resolve();
        return;
      }

      Image.prefetch(uri)
        .then(() => {
          imageCache.add(uri);
          resolve();
        })
        .catch(() => {
          // Ignore errors for preloading
          resolve();
        });
    });
  });

  await Promise.all(promises);
};

// Clear image cache
export const clearImageCache = (): void => {
  imageCache.clear();
};