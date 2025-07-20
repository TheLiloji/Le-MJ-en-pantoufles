import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getSavedSpells, removeSpellFromSaved, SavedSpell } from '../../utils/spellsService';

export default function SpellDetailScreen() {
  const { id } = useLocalSearchParams();
  const [spell, setSpell] = useState<SavedSpell | null>(null);

  useEffect(() => {
    loadSpell();
  }, [id]);

  const loadSpell = () => {
    const savedSpells = getSavedSpells();
    const foundSpell = savedSpells.find(s => s.id === id);
    setSpell(foundSpell || null);
  };

  const handleRemoveSpell = () => {
    if (spell) {
      removeSpellFromSaved(spell.id);
      router.back();
    }
  };

  const handleOpenUrl = () => {
    if (spell?.url) {
      Linking.openURL(spell.url);
    }
  };

  const levelColors = {
    '0': '#6B7280',
    '1': '#10B981',
    '2': '#3B82F6',
    '3': '#8B5CF6',
    '4': '#F59E0B',
    '5': '#EF4444',
    '6': '#DC2626',
    '7': '#7C3AED',
    '8': '#059669',
    '9': '#1F2937',
  };

  if (!spell) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Sort non trouvé</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/spells')} 
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{spell.nom}</Text>
        <Text style={styles.subtitle}>{spell.ecole}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.spellCard}>
          <View style={styles.spellHeader}>
            <View style={styles.spellInfo}>
              <Text style={styles.spellName}>{spell.nom}</Text>
              <Text style={styles.spellSchool}>{spell.ecole}</Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: levelColors[spell.niveau as keyof typeof levelColors] || '#6B7280' }]}>
              <Text style={styles.levelText}>Niveau {spell.niveau}</Text>
            </View>
          </View>

          <View style={styles.spellDetails}>
            {spell.temps_incantation && spell.temps_incantation.trim() && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Temps d'incantation:</Text>
                <Text style={styles.detailValue}>{spell.temps_incantation}</Text>
              </View>
            )}
            {spell.portee && spell.portee.trim() && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Portée:</Text>
                <Text style={styles.detailValue}>{spell.portee}</Text>
              </View>
            )}
            {spell.composantes && spell.composantes.trim() && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Composantes:</Text>
                <Text style={styles.detailValue}>{spell.composantes}</Text>
              </View>
            )}
            {spell.classes && spell.classes.length > 0 && spell.classes.some(c => c && c.trim()) && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Classes:</Text>
                <Text style={styles.detailValue}>{spell.classes.filter(c => c && c.trim()).join(', ')}</Text>
              </View>
            )}
            {spell.concentration?.trim() && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Concentration:</Text>
                <Text style={styles.detailValue}>{spell.concentration}</Text>
              </View>
            )}
            {spell.rituel?.trim() && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Rituel:</Text>
                <Text style={styles.detailValue}>{spell.rituel}</Text>
              </View>
            )}
          </View>

          {spell.description && spell.description.trim() && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{spell.description}</Text>
            </View>
          )}

          <View style={styles.tagsContainer}>
            {spell.concentration?.trim() && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>Concentration</Text>
              </View>
            )}
            {spell.rituel?.trim() && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>Rituel</Text>
              </View>
            )}
          </View>

          <View style={styles.actionsContainer}>
            {spell.url && (
              <TouchableOpacity style={styles.actionButton} onPress={handleOpenUrl}>
                <ExternalLink size={16} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Voir plus d'infos</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.removeButton} onPress={handleRemoveSpell}>
              <Trash2 size={16} color="#FFFFFF" />
              <Text style={styles.removeButtonText}>Retirer du grimoire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#DC2626',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
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
    color: '#FEE2E2',
    textAlign: 'center',
    marginTop: 8,
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  spellCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  spellHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  spellInfo: {
    flex: 1,
  },
  spellName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  spellSchool: {
    fontSize: 16,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  levelBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  spellDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 