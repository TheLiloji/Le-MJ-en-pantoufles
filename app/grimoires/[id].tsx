import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Zap, BookOpen, Trash2, Clock, Target } from 'lucide-react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { loadGrimoires, Grimoire, removeSpellFromGrimoire, useSpellSlot, restoreSpellSlot, resetSpellSlots, updateGrimoireEmplacements } from '@/utils/grimoireService';
import { GrimoireSpell } from '@/utils/grimoireService';
import { isValidDisplayString } from '@/utils/spellsService';

export default function GrimoireDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [grimoire, setGrimoire] = useState<Grimoire | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmplacementsForm, setShowEmplacementsForm] = useState(false);
  const [emplacements, setEmplacements] = useState<{ [niveau: string]: number }>({});
  const [deletingSpell, setDeletingSpell] = useState<string | null>(null);

  useEffect(() => {
    loadGrimoireData();
  }, [id]);

  // Recharger les données quand on revient sur cette page
  useFocusEffect(
    React.useCallback(() => {
      loadGrimoireData();
    }, [id])
  );

  const loadGrimoireData = async () => {
    try {
      const grimoires = await loadGrimoires();
      const foundGrimoire = grimoires.find(g => g.id === id);
      if (foundGrimoire) {
        setGrimoire(foundGrimoire);
        setEmplacements(foundGrimoire.emplacements);
      } else {
        Alert.alert('Erreur', 'Grimoire non trouvé');
        router.push('/(tabs)/spells');
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger le grimoire');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpell = () => {
    router.push({
      pathname: '/grimoires/[id]/add-spell',
      params: { id }
    });
  };

  const handleRemoveSpell = async (spell: GrimoireSpell) => {
    console.log('handleRemoveSpell appelé pour:', spell.nom, 'spellId:', spell.spellId);
    
    // Si c'est le premier clic, activer le mode suppression
    if (deletingSpell !== spell.spellId) {
      setDeletingSpell(spell.spellId);
      // Reset après 3 secondes
      setTimeout(() => setDeletingSpell(null), 3000);
      return;
    }
    
    // Deuxième clic - confirmer la suppression
    setDeletingSpell(null);
    console.log('Utilisateur a confirmé la suppression du sort');
    try {
      console.log('Suppression du sort:', spell.spellId, 'du grimoire:', id);
      await removeSpellFromGrimoire(id, spell.spellId);
      console.log('Sort supprimé avec succès');
      await loadGrimoireData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur: Impossible de supprimer le sort');
    }
  };

  const handleUseSpellSlot = async (niveau: string) => {
    if (!grimoire) return;
    
    const available = grimoire.emplacements[niveau] || 0;
    const used = grimoire.emplacementsUtilises[niveau] || 0;
    
    if (used >= available) {
      Alert.alert('Emplacement indisponible', 'Aucun emplacement disponible pour ce niveau');
      return;
    }

    try {
      await useSpellSlot(id, niveau);
      await loadGrimoireData();
    } catch (error) {
      console.error('Erreur lors de l\'utilisation:', error);
    }
  };

  const handleRestoreSpellSlot = async (niveau: string) => {
    if (!grimoire) return;
    
    const used = grimoire.emplacementsUtilises[niveau] || 0;
    
    if (used <= 0) {
      Alert.alert('Aucun emplacement à restaurer', 'Aucun emplacement utilisé pour ce niveau');
      return;
    }

    try {
      await restoreSpellSlot(id, niveau);
      await loadGrimoireData();
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
    }
  };

  const handleResetSlots = async () => {
    Alert.alert(
      'Réinitialiser les emplacements',
      'Voulez-vous réinitialiser tous les emplacements utilisés ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          onPress: async () => {
            try {
              await resetSpellSlots(id);
              await loadGrimoireData();
            } catch (error) {
              console.error('Erreur lors de la réinitialisation:', error);
            }
          }
        }
      ]
    );
  };

  const handleSaveEmplacements = async () => {
    try {
      await updateGrimoireEmplacements(id, emplacements);
      await loadGrimoireData();
      setShowEmplacementsForm(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
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

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!grimoire) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Grimoire non trouvé</Text>
      </View>
    );
  }

  const niveaux = Object.keys(grimoire.emplacements).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.push('/(tabs)/spells')}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{grimoire.nom}</Text>
          {grimoire.description && (
            <Text style={styles.subtitle}>{grimoire.description}</Text>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section Emplacements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emplacements de sorts</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setShowEmplacementsForm(!showEmplacementsForm)}
            >
              <Text style={styles.editButtonText}>
                {showEmplacementsForm ? 'Annuler' : 'Modifier'}
              </Text>
            </TouchableOpacity>
          </View>

          {showEmplacementsForm ? (
            <View style={styles.emplacementsForm}>
              {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map(niveau => (
                <View key={niveau} style={styles.emplacementInput}>
                  <Text style={styles.emplacementLabel}>Niveau {niveau}</Text>
                  <TextInput
                    style={styles.emplacementTextInput}
                    value={emplacements[niveau]?.toString() || '0'}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 0;
                      setEmplacements(prev => ({
                        ...prev,
                        [niveau]: value
                      }));
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              ))}
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEmplacements}>
                <Text style={styles.saveButtonText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          ) : (
                         <View style={styles.emplacementsDisplay}>
               {niveaux.length > 0 ? (
                 niveaux.map(niveau => {
                   const total = grimoire.emplacements[niveau] || 0;
                   const used = grimoire.emplacementsUtilises[niveau] || 0;
                   const remaining = total - used;
                   
                   return (
                     <View key={niveau} style={styles.emplacementItem}>
                       <View style={styles.emplacementInfo}>
                         <View style={[styles.levelBadge, { backgroundColor: levelColors[niveau as keyof typeof levelColors] || '#6B7280' }]}>
                           <Text style={styles.levelText}>{niveau}</Text>
                         </View>
                         <Text style={styles.emplacementText}>
                           {remaining}/{total} restants
                         </Text>
                       </View>
                       <View style={styles.emplacementActions}>
                         <TouchableOpacity 
                           style={[styles.slotButton, styles.useButton]}
                           onPress={() => handleUseSpellSlot(niveau)}
                           disabled={remaining <= 0}
                         >
                           <Zap size={16} color="#FFFFFF" />
                         </TouchableOpacity>
                         <TouchableOpacity 
                           style={[styles.slotButton, styles.restoreButton]}
                           onPress={() => handleRestoreSpellSlot(niveau)}
                           disabled={used <= 0}
                         >
                           <Text style={styles.restoreButtonText}>+</Text>
                         </TouchableOpacity>
                       </View>
                     </View>
                   );
                 })
               ) : (
                 <Text style={styles.noEmplacementsText}>
                   Aucun emplacement configuré. Utilisez "Modifier" pour en ajouter.
                 </Text>
               )}
              {niveaux.length > 0 && (
                <TouchableOpacity style={styles.resetButton} onPress={handleResetSlots}>
                  <Text style={styles.resetButtonText}>Réinitialiser tous les emplacements</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Section Sorts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sorts ({grimoire.sorts.length})</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddSpell}>
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>

          {grimoire.sorts.length === 0 ? (
            <View style={styles.emptyState}>
              <BookOpen size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>Aucun sort dans ce grimoire</Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddSpell}>
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.emptyStateButtonText}>Ajouter des sorts</Text>
              </TouchableOpacity>
            </View>
          ) : (
                         grimoire.sorts.map((spell) => (
               <TouchableOpacity 
                 key={spell.spellId} 
                 style={styles.spellCard}
                 onPress={() => router.push({
                   pathname: '/grimoires/[id]/spell/[spellId]',
                   params: { id, spellId: spell.spellId }
                 })}
               >
                 <View style={styles.spellHeader}>
                   <View style={styles.spellInfo}>
                     <Text style={styles.spellName}>{spell.nom}</Text>
                     <Text style={styles.spellSchool}>{spell.ecole}</Text>
                   </View>
                   <View style={styles.spellActions}>
                     <View style={[styles.levelBadge, { backgroundColor: levelColors[spell.niveau as keyof typeof levelColors] || '#6B7280' }]}>
                       <Text style={styles.levelText}>{spell.niveau}</Text>
                     </View>
                     <TouchableOpacity 
                       style={[
                         styles.removeButton, 
                         { 
                           padding: 8, 
                           backgroundColor: deletingSpell === spell.spellId ? '#EF4444' : '#FEE2E2', 
                           borderRadius: 6, 
                           marginLeft: 8 
                         }
                       ]}
                       onPress={(e) => {
                         e.stopPropagation(); // Empêcher la navigation
                         console.log('Bouton trash cliqué pour:', spell.nom);
                         handleRemoveSpell(spell);
                       }}
                     >
                       <Trash2 size={16} color={deletingSpell === spell.spellId ? "#FFFFFF" : "#EF4444"} />
                     </TouchableOpacity>
                   </View>
                 </View>

                                 {isValidDisplayString(spell.description) && (
                   <Text style={styles.spellDescription}>{spell.description.trim()}</Text>
                 )}

                                 <View style={styles.spellDetails}>
                   {isValidDisplayString(spell.temps_incantation) && (
                     <View style={styles.detailItem}>
                       <Clock size={14} color="#6B7280" />
                       <Text style={styles.detailText}>{spell.temps_incantation.trim()}</Text>
                     </View>
                   )}
                   {isValidDisplayString(spell.portee) && (
                     <View style={styles.detailItem}>
                       <Target size={14} color="#6B7280" />
                       <Text style={styles.detailText}>{spell.portee.trim()}</Text>
                     </View>
                   )}
                 </View>

                                 {(isValidDisplayString(spell.concentration) || isValidDisplayString(spell.rituel)) && (
                   <View style={styles.spellTags}>
                     {isValidDisplayString(spell.concentration) && (
                       <View style={styles.tag}>
                         <Text style={styles.tagText}>Concentration</Text>
                       </View>
                     )}
                     {isValidDisplayString(spell.rituel) && (
                       <View style={styles.tag}>
                         <Text style={styles.tagText}>Rituel</Text>
                       </View>
                       )}
                   </View>
                 )}
               </TouchableOpacity>
             ))
           )}
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#FEE2E2',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  editButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  emplacementsForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  emplacementInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emplacementLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  emplacementTextInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#374151',
    width: 80,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emplacementsDisplay: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  emplacementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emplacementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    borderRadius: 16,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emplacementText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  emplacementActions: {
    flexDirection: 'row',
    gap: 8,
  },
  slotButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  useButton: {
    backgroundColor: '#DC2626',
  },
  restoreButton: {
    backgroundColor: '#10B981',
  },
  restoreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noEmplacementsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resetButton: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  resetButtonText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 16,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  spellCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  spellHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  spellInfo: {
    flex: 1,
  },
  spellName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  spellSchool: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  spellActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeButton: {
    padding: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
    marginLeft: 8,
  },
  spellDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  spellDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 2,
  },
  detailText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 4,
    fontWeight: '500',
  },
  spellTags: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 100,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 100,
  },
}); 