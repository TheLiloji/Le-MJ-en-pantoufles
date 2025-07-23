import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

const { width, height } = Dimensions.get('window');

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  useFrameworkReady();

  useEffect(() => {
    // Simuler un temps de chargement minimum pour montrer l'image
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 secondes minimum

    return () => clearTimeout(timer);
  }, []);

  // Afficher l'écran de chargement tant que l'app n'est pas prête
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Image 
          source={require('@/assets/images/Loading.png')}
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
    width: width, // Prend toute la largeur
    height: height, // Prend toute la hauteur
  },
});
