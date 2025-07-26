import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { preloadAllData, getPreloadStatus } from '../utils/preloadService';

const { width, height } = Dimensions.get('window');

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [preloadMessage, setPreloadMessage] = useState('Chargement...');
  useFrameworkReady();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Démarrer le préchargement
        setPreloadMessage('Préchargement des données...');
        
        // Précharger les données en arrière-plan
        await preloadAllData();
        
        // Attendre un minimum de 2 secondes pour l'UX
        const minLoadingTime = 2000;
        const startTime = Date.now();
        
        // Vérifier le statut toutes les 100ms pour l'indicateur de progression
        const progressInterval = setInterval(() => {
          const status = getPreloadStatus();
          const progress = (status.completed / status.total) * 100;
          setPreloadProgress(progress);
          
          // Messages selon l'étape
          if (status.spells && !status.classes) {
            setPreloadMessage('Chargement des classes...');
          } else if (status.classes && !status.grimoires) {
            setPreloadMessage('Chargement des grimoires...');
          } else if (status.grimoires && !status.backpacks) {
            setPreloadMessage('Chargement des sacs à dos...');
          } else if (status.backpacks) {
            setPreloadMessage('Préparation de l\'application...');
          }
        }, 100);

        // Attendre le temps minimum
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        
        clearInterval(progressInterval);
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
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{preloadMessage}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${preloadProgress}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{Math.round(preloadProgress)}%</Text>
        </View>
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
    height: height * 0.7, // Réduire un peu pour laisser de la place au texte
  },
  progressContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#DC2626',
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
});
