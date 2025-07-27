import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { preloadAllData, getPreloadStatus } from '../utils/preloadService';

const { width, height } = Dimensions.get('window');

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  useFrameworkReady();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Précharger les données en arrière-plan
        await preloadAllData();
        
        // Attendre un minimum de 2 secondes pour l'UX
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du préchargement:', error);
        // En cas d'erreur, on continue quand même après 2 secondes
        setTimeout(() => setIsLoading(false), 2000);
      }
    };

    initializeApp();
  }, []);

  // Afficher l'écran de chargement tant que l'app n'est pas prête
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Image 
          source={require('../assets/images/Loading.png')}
          style={styles.loadingImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="create" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fdfaf3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingImage: {
    width: width,
    height: height * 0.8,
  },
});
