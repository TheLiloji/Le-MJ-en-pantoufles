import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal } from 'react-native';

interface BestiaryCardProps {
  creature: {
    nom: string;
    type: string;
    taille: string;
    alignement: string;
    ca: string;
    pv: string;
    vitesse: string;
    fp: string;
    caracs: {
      FOR: string;
      DEX: string;
      CON: string;
      INT: string;
      SAG: string;
      CHA: string;
    };
    actions: string;
    actions_legendaires: string;
    image_url?: string | null;
    ca_detail?: string;
    autres_infos?: string[];
  };
}

export default function BestiaryCard({ creature }: BestiaryCardProps) {
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const getModifier = (score: string) => {
    const match = score.match(/\(([^)]+)\)/);
    return match ? match[1] : '';
  };

  const getScore = (score: string) => {
    const match = score.match(/^(\d+)/);
    return match ? match[1] : '';
  };

  const handleImagePress = () => {
    if (creature.image_url) {
      setImageModalVisible(true);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* En-tête avec image */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{creature.nom}</Text>
            <Text style={styles.subtitle}>
              {creature.type} de taille {creature.taille}, {creature.alignement}
            </Text>
          </View>
          {creature.image_url && (
            <TouchableOpacity onPress={handleImagePress}>
              <Image 
                source={{ uri: creature.image_url }} 
                style={styles.image}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Statistiques principales */}
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Classe d'armure</Text>
            <Text style={styles.statValue}>{creature.ca}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Points de vie</Text>
            <Text style={styles.statValue}>{creature.pv}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Vitesse</Text>
            <Text style={styles.statValue}>{creature.vitesse}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Puissance</Text>
            <Text style={styles.statValue}>{creature.fp}</Text>
          </View>
        </View>

        {/* Caractéristiques */}
        <View style={styles.characteristicsContainer}>
          <Text style={styles.sectionTitle}>Caractéristiques</Text>
          <View style={styles.characteristicsGrid}>
            <View style={styles.characteristicItem}>
              <Text style={styles.characteristicLabel}>FOR</Text>
              <Text style={styles.characteristicScore}>{getScore(creature.caracs.FOR)}</Text>
              <Text style={styles.characteristicModifier}>{getModifier(creature.caracs.FOR)}</Text>
            </View>
            <View style={styles.characteristicItem}>
              <Text style={styles.characteristicLabel}>DEX</Text>
              <Text style={styles.characteristicScore}>{getScore(creature.caracs.DEX)}</Text>
              <Text style={styles.characteristicModifier}>{getModifier(creature.caracs.DEX)}</Text>
            </View>
            <View style={styles.characteristicItem}>
              <Text style={styles.characteristicLabel}>CON</Text>
              <Text style={styles.characteristicScore}>{getScore(creature.caracs.CON)}</Text>
              <Text style={styles.characteristicModifier}>{getModifier(creature.caracs.CON)}</Text>
            </View>
            <View style={styles.characteristicItem}>
              <Text style={styles.characteristicLabel}>INT</Text>
              <Text style={styles.characteristicScore}>{getScore(creature.caracs.INT)}</Text>
              <Text style={styles.characteristicModifier}>{getModifier(creature.caracs.INT)}</Text>
            </View>
            <View style={styles.characteristicItem}>
              <Text style={styles.characteristicLabel}>SAG</Text>
              <Text style={styles.characteristicScore}>{getScore(creature.caracs.SAG)}</Text>
              <Text style={styles.characteristicModifier}>{getModifier(creature.caracs.SAG)}</Text>
            </View>
            <View style={styles.characteristicItem}>
              <Text style={styles.characteristicLabel}>CHA</Text>
              <Text style={styles.characteristicScore}>{getScore(creature.caracs.CHA)}</Text>
              <Text style={styles.characteristicModifier}>{getModifier(creature.caracs.CHA)}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        {creature.actions && (
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <Text style={styles.actionsText}>{creature.actions}</Text>
          </View>
        )}

        {/* Actions légendaires */}
        {creature.actions_legendaires && (
          <View style={styles.legendaryContainer}>
            <Text style={styles.sectionTitle}>Actions légendaires</Text>
            <Text style={styles.legendaryText}>{creature.actions_legendaires}</Text>
          </View>
        )}

        {/* Détails de CA - Commenté pour simplifier l'affichage */}
        {/* {creature.ca_detail && (
          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>Détails</Text>
            <Text style={styles.detailsText}>{creature.ca_detail}</Text>
          </View>
        )} */}
      </View>

      {/* Modal pour l'image en grand */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          {creature.image_url && (
            <Image 
              source={{ uri: creature.image_url }} 
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  card: {
    margin: 16,
    elevation: 4,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginLeft: 12,
  },
  statsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  characteristicsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  characteristicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  characteristicItem: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 8,
  },
  characteristicLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  characteristicScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  characteristicModifier: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  actionsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  legendaryContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  legendaryText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  detailsContainer: {
    padding: 16,
  },
  detailsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalImage: {
    width: '90%',
    height: '80%',
    borderRadius: 12,
  },
}); 