import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus, Minus, Zap, Clock, Target } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { loadAllSpells, searchSpells, getSpellByLevel, getSpellBySchool, getSpellByClass, getAvailableClasses, Spell, isValidDisplayString } from '../../../utils/spellsService';
import { addSpellToGrimoire, loadGrimoires, Grimoire, removeSpellFromGrimoire } from '../../../utils/grimoireService';

export default function AddSpellToGrimoireScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [spells, setSpells] = useState<Spell[]>([]);
  const [grimoire, setGrimoire] = useState<Grimoire | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      // Charger les sorts
      const allSpells = loadAllSpells();
      setSpells(allSpells);
      
      // Charger le grimoire
      const grimoires = await loadGrimoires();
      const foundGrimoire = grimoires.find(g => g.id === id);
      if (foundGrimoire) {
        setGrimoire(foundGrimoire);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSpells = () => {
    try {
      const allSpells = loadAllSpells();
      setSpells(allSpells);
    } catch (error) {
      console.error('Erreur lors du chargement des sorts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSpells = spells.filter(spell => {
    const matchesSearch = searchQuery === '' || 
      spell.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spell.ecole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spell.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel = selectedLevel === '' || spell.niveau === selectedLevel;
    const matchesSchool = selectedSchool === '' || spell.ecole.toLowerCase() === selectedSchool.toLowerCase();
    const matchesClass = selectedClass === '' || 
      (spell.classes && spell.classes.some(c => c.toLowerCase() === selectedClass.toLowerCase()));

    return matchesSearch && matchesLevel && matchesSchool && matchesClass;
  });

  // Vérifier si un sort est déjà dans le grimoire
  const isSpellInGrimoire = (spell: Spell) => {
    if (!grimoire) return false;
    const spellId = `${spell.nom}-${spell.niveau}`;
    return grimoire.sorts.some(s => s.spellId === spellId);
  };

  const handleAddSpell = async (spell: Spell) => {
    try {
      await addSpellToGrimoire(id, spell);
      await loadData(); // Recharger les données pour actualiser l'état
      Alert.alert('Succès', `"${spell.nom}" ajouté au grimoire !`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible d\'ajouter le sort au grimoire';
      Alert.alert('Erreur', errorMessage);
    }
  };

  const handleRemoveSpell = async (spell: Spell) => {
    try {
      const spellId = `${spell.nom}-${spell.niveau}`;
      await removeSpellFromGrimoire(id, spellId);
      await loadData(); // Recharger les données pour actualiser l'état
      Alert.alert('Succès', `"${spell.nom}" retiré du grimoire !`);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Alert.alert('Erreur', 'Impossible de retirer le sort du grimoire');
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

  const schools = ['abjuration', 'conjuration', 'divination', 'enchantement', 'évocation', 'illusion', 'invocation', 'nécromancie', 'transmutation'];
  const classes = getAvailableClasses();
  const levels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Ajouter des sorts</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un sort..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Bouton de filtres */}
      <View style={styles.filterButtonContainer}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>
            {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Filtre par niveau */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Niveau</Text>
            <View style={styles.filterChipsContainer}>
              <TouchableOpacity
                style={[styles.filterChip, selectedLevel === '' && styles.filterChipActive]}
                onPress={() => setSelectedLevel('')}
              >
                <Text style={[styles.filterChipText, selectedLevel === '' && styles.filterChipTextActive]}>
                  Tous
                </Text>
              </TouchableOpacity>
              {levels.map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.filterChip, 
                    styles.levelChip,
                    selectedLevel === level && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedLevel(selectedLevel === level ? '' : level)}
                >
                  <Text style={[
                    styles.filterChipText, 
                    styles.levelChipText,
                    selectedLevel === level && styles.filterChipTextActive
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Filtre par école */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>École</Text>
            <View style={styles.filterChipsContainer}>
              <TouchableOpacity
                style={[styles.filterChip, selectedSchool === '' && styles.filterChipActive]}
                onPress={() => setSelectedSchool('')}
              >
                <Text style={[styles.filterChipText, selectedSchool === '' && styles.filterChipTextActive]}>
                  Toutes
                </Text>
              </TouchableOpacity>
              {schools.map(school => (
                <TouchableOpacity
                  key={school}
                  style={[styles.filterChip, selectedSchool === school && styles.filterChipActive]}
                  onPress={() => setSelectedSchool(selectedSchool === school ? '' : school)}
                >
                  <Text style={[styles.filterChipText, selectedSchool === school && styles.filterChipTextActive]}>
                    {school.charAt(0).toUpperCase() + school.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Filtre par classe */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Classe</Text>
            <View style={styles.filterChipsContainer}>
              <TouchableOpacity
                style={[styles.filterChip, selectedClass === '' && styles.filterChipActive]}
                onPress={() => setSelectedClass('')}
              >
                <Text style={[styles.filterChipText, selectedClass === '' && styles.filterChipTextActive]}>
                  Toutes
                </Text>
              </TouchableOpacity>
              {classes.map(className => (
                <TouchableOpacity
                  key={className}
                  style={[styles.filterChip, selectedClass === className && styles.filterChipActive]}
                  onPress={() => setSelectedClass(selectedClass === className ? '' : className)}
                >
                  <Text style={[styles.filterChipText, selectedClass === className && styles.filterChipTextActive]}>
                    {className}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      <ScrollView style={styles.spellsList} showsVerticalScrollIndicator={false}>
        {filteredSpells.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Aucun sort trouvé avec les filtres actuels
            </Text>
          </View>
        ) : (
          filteredSpells.map((spell) => (
            <TouchableOpacity 
              key={spell.nom} 
              style={styles.spellCard}
              activeOpacity={0.7}
              onPress={() => router.push({
                pathname: '/grimoires/[id]/spell/[spellId]',
                params: { id, spellId: spell.nom + '-' + spell.niveau }
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
                       isSpellInGrimoire(spell) ? styles.removeButton : styles.addButton,
                       isSpellInGrimoire(spell) && styles.removeButtonActive
                     ]}
                     onPress={(e) => {
                       e.stopPropagation(); // Empêcher la navigation
                       isSpellInGrimoire(spell) ? handleRemoveSpell(spell) : handleAddSpell(spell);
                     }}
                   >
                     {isSpellInGrimoire(spell) ? (
                       <Minus size={16} color="#FFFFFF" />
                     ) : (
                       <Plus size={16} color="#FFFFFF" />
                     )}
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
                 {isValidDisplayString(spell.composantes) && (
                   <View style={styles.detailItem}>
                     <Zap size={14} color="#6B7280" />
                     <Text style={styles.detailText}>{spell.composantes.trim()}</Text>
                   </View>
                 )}
               </View>

              {spell.classes && spell.classes.length > 0 && (
                <View style={styles.classesContainer}>
                  <Text style={styles.classesLabel}>Classes :</Text>
                  <View style={styles.classesList}>
                    {spell.classes.map((className, index) => (
                      <View key={index} style={styles.classChip}>
                        <Text style={styles.classChipText}>{className}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  filterButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  filterButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#DC2626',
  },
  filterChipText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  levelChip: {
    minWidth: 32,
    alignItems: 'center',
  },
  levelChipText: {
    fontWeight: 'bold',
  },
  spellsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
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
  levelBadge: {
    borderRadius: 16,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  removeButton: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonActive: {
    backgroundColor: '#DC2626',
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
  classesContainer: {
    marginBottom: 8,
  },
  classesLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  classesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  classChip: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  classChipText: {
    fontSize: 10,
    color: '#3730A3',
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
}); 