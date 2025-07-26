import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Search, ArrowLeft, Plus, BookOpen, Filter } from 'lucide-react-native';
import { router } from 'expo-router';
import { loadAllSpells, searchSpells, addSpellToSaved, isSpellSaved, Spell, getAvailableClasses } from '../../utils/spellsService';

export default function AddSpellScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allSpells, setAllSpells] = useState<Spell[]>([]);
  const [filteredSpells, setFilteredSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  useEffect(() => {
    loadSpells();
  }, []);

  useEffect(() => {
    filterSpells();
  }, [searchQuery, allSpells, selectedLevel, selectedSchool, selectedClass]);

  const loadSpells = () => {
    const spells = loadAllSpells();
    setAllSpells(spells);
    setFilteredSpells(spells);
    setLoading(false);
  };

  const filterSpells = () => {
    let results = allSpells;

    // Filtre par recherche
    if (searchQuery.trim() !== '') {
      results = searchSpells(searchQuery);
    }

    // Filtre par niveau
    if (selectedLevel !== 'all') {
      results = results.filter(spell => spell.niveau === selectedLevel);
    }

    // Filtre par école
    if (selectedSchool !== 'all') {
      results = results.filter(spell => spell.ecole.toLowerCase() === selectedSchool.toLowerCase());
    }

    // Filtre par classe
    if (selectedClass !== 'all') {
      results = results.filter(spell => 
        spell.classes && spell.classes.some(c => c.toLowerCase() === selectedClass.toLowerCase())
      );
    }

    setFilteredSpells(results);
  };

  const handleAddSpell = (spell: Spell) => {
    addSpellToSaved(spell);
    // Feedback visuel ou notification
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

  const schools = [
    'abjuration', 'conjuration', 'divination', 'enchantement', 
    'évocation', 'illusion', 'invocation', 'nécromancie', 'transmutation'
  ];

  const levels = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const classes = getAvailableClasses();

  const renderSpellItem = ({ item }: { item: Spell }) => {
    const isSaved = isSpellSaved(item.nom);
    
    return (
      <View style={styles.spellCard}>
        <View style={styles.spellHeader}>
                  <View style={styles.spellInfo}>
          <Text style={styles.spellName}>{item.nom}</Text>
          <Text style={styles.spellSchool}>{item.ecole}</Text>
          {item.classes && item.classes.length > 0 && item.classes.some(c => c && c.trim()) && (
            <Text style={styles.spellClasses}>
              {item.classes.filter(c => c && c.trim()).join(', ')}
            </Text>
          )}
        </View>
          <View style={styles.spellActions}>
            <View style={[styles.levelBadge, { backgroundColor: levelColors[item.niveau as keyof typeof levelColors] || '#6B7280' }]}>
              <Text style={styles.levelText}>{item.niveau}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.addButton, isSaved && styles.addButtonSaved]} 
              onPress={() => handleAddSpell(item)}
              disabled={isSaved}
            >
              {isSaved ? (
                <Text style={styles.addButtonText}>✓</Text>
              ) : (
                <Plus size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {item.description && item.description.trim() && (
          <Text style={styles.spellDescription} numberOfLines={3}>
            {item.description}
          </Text>
        )}

        <View style={styles.spellDetails}>
          {item.temps_incantation && item.temps_incantation.trim() && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Temps:</Text>
              <Text style={styles.detailText}>{item.temps_incantation}</Text>
            </View>
          )}
          {item.portee && item.portee.trim() && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Portée:</Text>
              <Text style={styles.detailText}>{item.portee}</Text>
            </View>
          )}
          {item.composantes && item.composantes.trim() && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Composantes:</Text>
              <Text style={styles.detailText}>{item.composantes}</Text>
            </View>
          )}
        </View>

        {(item.concentration?.trim() || item.rituel?.trim()) && (
          <View style={styles.spellTags}>
            {item.concentration?.trim() && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>Concentration</Text>
              </View>
            )}
            {item.rituel?.trim() && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>Rituel</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Chargement des sorts...</Text>
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
        <Text style={styles.title}>Ajouter des sorts</Text>
        <Text style={styles.subtitle}>{filteredSpells.length} sorts trouvés</Text>
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

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <TouchableOpacity 
            style={[styles.filterButton, selectedLevel === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedLevel('all')}
          >
            <Text style={[styles.filterButtonText, selectedLevel === 'all' && styles.filterButtonTextActive]}>
              Tous niveaux
            </Text>
          </TouchableOpacity>
          {levels.map(level => (
            <TouchableOpacity 
              key={level}
              style={[styles.filterButton, selectedLevel === level && styles.filterButtonActive]}
              onPress={() => setSelectedLevel(level)}
            >
              <Text style={[styles.filterButtonText, selectedLevel === level && styles.filterButtonTextActive]}>
                Niveau {level}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filtres par classe */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <TouchableOpacity 
            style={[styles.filterButton, selectedClass === 'all' && styles.filterButtonActive]}
            onPress={() => setSelectedClass('all')}
          >
            <Text style={[styles.filterButtonText, selectedClass === 'all' && styles.filterButtonTextActive]}>
              Toutes classes
            </Text>
          </TouchableOpacity>
          {classes.map(className => (
            <TouchableOpacity 
              key={className}
              style={[styles.filterButton, selectedClass === className && styles.filterButtonActive]}
              onPress={() => setSelectedClass(className)}
            >
              <Text style={styles.filterButtonText}>
                {className}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredSpells}
        renderItem={renderSpellItem}
        keyExtractor={(item) => item.nom}
        style={styles.spellsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.spellsListContent}
      />
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
  filtersContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  filtersScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#DC2626',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  spellsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  spellsListContent: {
    paddingBottom: 20,
  },
  spellCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  spellInfo: {
    flex: 1,
  },
  spellActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spellName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  spellSchool: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  spellClasses: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
    marginTop: 2,
  },
  levelBadge: {
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#DC2626',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonSaved: {
    backgroundColor: '#10B981',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spellDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  spellDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    width: 80,
  },
  detailText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  spellTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
}); 