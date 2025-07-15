import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Plus, Sparkles, ArrowLeft } from 'lucide-react-native';

export default function CreateCharacterStart() {
  const startCreation = () => {
    router.push('/create/race');
  };

  const goBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Créer un Personnage</Text>
        <Text style={styles.subtitle}>Assistant de création D&D 5e</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.heroCard}>
          <Sparkles size={48} color="#6B46C1" />
          <Text style={styles.heroTitle}>Création Intelligente</Text>
          <Text style={styles.heroDescription}>
            Notre assistant vous guide étape par étape pour créer votre personnage D&D parfait. 
            Tous les calculs et suggestions sont automatiques !
          </Text>
        </View>

        <View style={styles.stepsPreview}>
          <Text style={styles.stepsTitle}>9 Étapes Simples</Text>
          <View style={styles.stepsList}>
            <Text style={styles.stepItem}>1. Race & Sous-race</Text>
            <Text style={styles.stepItem}>2. Classe & Archétype</Text>
            <Text style={styles.stepItem}>3. Historique</Text>
            <Text style={styles.stepItem}>4. Caractéristiques</Text>
            <Text style={styles.stepItem}>5. Équipement</Text>
            <Text style={styles.stepItem}>6. Compétences</Text>
            <Text style={styles.stepItem}>7. Sorts (si applicable)</Text>
            <Text style={styles.stepItem}>8. Apparence & RP</Text>
            <Text style={styles.stepItem}>9. Résumé final</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={startCreation}>
          <Plus size={24} color="#FFFFFF" />
          <Text style={styles.startButtonText}>Commencer la Création</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#6B46C1',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  stepsPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepsList: {
    gap: 8,
  },
  stepItem: {
    fontSize: 14,
    color: '#4B5563',
    paddingVertical: 4,
    paddingLeft: 8,
  },
  startButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6B46C1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});