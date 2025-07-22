import React, { useState, memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Creature } from '../../types/bestiary';
import OptimizedImage from './OptimizedImage';

interface BestiaryCardProps {
  creature: Creature;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');

// Memoized component to prevent unnecessary re-renders
const BestiaryCard = memo<BestiaryCardProps>(({ creature, onPress }) => {
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const getModifier = useCallback((score: string) => {
    const match = score.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
  }, []);

  const getScore = useCallback((score: string) => {
    const match = score.match(/^(\d+)/);
    return match ? match[1] : '';
  }, []);

  const handleImagePress = useCallback(() => {
    if (creature.image_url) {
      setImageModalVisible(true);
    }
  }, [creature.image_url]);

  const handleCardPress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  return (
    <TouchableOpacity style={styles.container} onPress={handleCardPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.name}>{creature.nom}</Text>
        <Text style={styles.type}>{creature.type} ({creature.taille}), {creature.alignement}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.statGroup}>
          <Text style={styles.statLabel}>CA</Text>
          <Text style={styles.statValue}>{creature.ca}</Text>
        </View>
        <View style={styles.statGroup}>
          <Text style={styles.statLabel}>PV</Text>
          <Text style={styles.statValue}>{creature.pv}</Text>
        </View>
        <View style={styles.statGroup}>
          <Text style={styles.statLabel}>Vitesse</Text>
          <Text style={styles.statValue}>{creature.vitesse}</Text>
        </View>
        <View style={styles.statGroup}>
          <Text style={styles.statLabel}>FP</Text>
          <Text style={styles.statValue}>{creature.fp}</Text>
        </View>
      </View>

      <View style={styles.caracteristiques}>
        {Object.entries(creature.caracs).map(([key, value]) => (
          <View key={key} style={styles.caracItem}>
            <Text style={styles.caracLabel}>{key}</Text>
            <Text style={styles.caracScore}>{getScore(value)}</Text>
            <Text style={styles.caracModifier}>{getModifier(value)}</Text>
          </View>
        ))}
      </View>

      {creature.image_url && (
        <TouchableOpacity onPress={handleImagePress} style={styles.imageContainer}>
          <OptimizedImage 
            uri={creature.image_url} 
            width={100}
            height={100}
            borderRadius={8}
            cache="force-cache"
          />
        </TouchableOpacity>
      )}

      {/* Simplified modal for better performance */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          onPress={() => setImageModalVisible(false)}
          activeOpacity={1}
        >
                   <View style={styles.modalContent}>
           {creature.image_url && (
             <OptimizedImage 
               uri={creature.image_url} 
               width={width * 0.8}
               height={width * 0.8}
               borderRadius={8}
               cache="force-cache"
               showLoadingIndicator={true}
             />
           )}
         </View>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  );
});

BestiaryCard.displayName = 'BestiaryCard';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    color: '#A0AEC0',
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statGroup: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#A0AEC0',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  caracteristiques: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1A202C',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  caracItem: {
    alignItems: 'center',
    flex: 1,
  },
  caracLabel: {
    fontSize: 10,
    color: '#A0AEC0',
    marginBottom: 2,
  },
  caracScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  caracModifier: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  creatureImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 20,
    maxWidth: width * 0.9,
    maxHeight: width * 0.9,
  },
  modalImage: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 8,
    resizeMode: 'contain',
  },
});

export default BestiaryCard; 