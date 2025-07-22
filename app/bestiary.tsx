import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Search, Filter, X, ArrowLeft, ArrowUpDown, Plus, Minus } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { 
  loadAllCreaturesSync, 
  searchCreatures, 
  findCreatureByName,
  clearCache
} from '../utils/bestiaryService';
import { Creature, CreatureFilters, SortOptions } from '../types/bestiary';
import BestiaryCard from './components/BestiaryCard';

// Memoized sort function
const sortCreatures = (creatures: Creature[], sortType: SortOptions['type'], sortOrder: SortOptions['order']): Creature[] => {
  return [...creatures].sort((a, b) => {
    let comparison = 0;
    
    switch (sortType) {
      case 'alphabetical':
        comparison = a.nom.localeCompare(b.nom);
        break;
      case 'fp':
        const fpA = parseFP(a.fp);
        const fpB = parseFP(b.fp);
        comparison = fpA - fpB;
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
};

// Optimized FP parsing with memoization
const fpCache = new Map<string, number>();
const parseFP = (fp: string): number => {
  if (fpCache.has(fp)) {
    return fpCache.get(fp)!;
  }
  
  let result: number;
  if (fp.includes('/')) {
    const [numerator, denominator] = fp.split('/').map(Number);
    result = numerator / denominator;
  } else {
    result = parseInt(fp, 10) || 0;
  }
  
  fpCache.set(fp, result);
  return result;
};

// Memoized filter function
const filterCreatures = (
  creatures: Creature[], 
  filters: CreatureFilters
): Creature[] => {
  return creatures.filter(creature => {
    // Search query filter
    if (filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase();
      const matchesSearch = 
        creature.nom.toLowerCase().includes(query) ||
        creature.type.toLowerCase().includes(query) ||
        creature.alignement.toLowerCase().includes(query) ||
        creature.taille.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }
    
    // FP filter
    const fp = parseFP(creature.fp);
    if (fp < filters.minFP || fp > filters.maxFP) {
      return false;
    }
    
    // Type filter
    if (filters.type && !creature.type.toLowerCase().includes(filters.type.toLowerCase())) {
      return false;
    }
    
    // Size filter
    if (filters.taille && !creature.taille.toLowerCase().includes(filters.taille.toLowerCase())) {
      return false;
    }
    
    // Alignment filter
    if (filters.alignement && !creature.alignement.toLowerCase().includes(filters.alignement.toLowerCase())) {
      return false;
    }
    
    return true;
  });
};

// Memoized list item component
const CreatureListItem = memo<{ 
  creature: Creature; 
  onPress: (creature: Creature) => void;
}>(({ creature, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(creature);
  }, [creature, onPress]);

  return <BestiaryCard creature={creature} onPress={handlePress} />;
});

CreatureListItem.displayName = 'CreatureListItem';

export default function BestiaryScreen() {
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter and sort state
  const [filters, setFilters] = useState<CreatureFilters>({
    searchQuery: '',
    minFP: 0,
    maxFP: 30,
  });
  
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    type: 'alphabetical',
    order: 'asc'
  });

  // UI state
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFPFilter, setShowFPFilter] = useState(false);
  const [editingMinFP, setEditingMinFP] = useState(false);
  const [editingMaxFP, setEditingMaxFP] = useState(false);
  const [tempMinFP, setTempMinFP] = useState('0');
  const [tempMaxFP, setTempMaxFP] = useState('30');

  const params = useLocalSearchParams();

  // Load creatures data
  useEffect(() => {
    loadCreatures();
  }, []);

  // Handle navigation params
  useEffect(() => {
    if (params.creature) {
      handleCreatureSearch(params.creature as string);
    }
  }, [params.creature]);

  const loadCreatures = useCallback(async () => {
    try {
      setLoading(true);
      // Use sync version for now, but this could be optimized to async with proper loading states
      const allCreatures = loadAllCreaturesSync();
      setCreatures(allCreatures);
    } catch (error) {
      console.error('Error loading creatures:', error);
      Alert.alert('Erreur', 'Impossible de charger les créatures');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreatureSearch = useCallback(async (creatureName: string) => {
    try {
      const creature = await findCreatureByName(creatureName);
      if (creature) {
        setSelectedCreature(creature);
      }
    } catch (error) {
      console.error('Error searching creature:', error);
    }
  }, []);

  // Memoized filtered and sorted creatures
  const filteredCreatures = useMemo(() => {
    let results = filterCreatures(creatures, filters);
    return sortCreatures(results, sortOptions.type, sortOptions.order);
  }, [creatures, filters, sortOptions]);

  // Optimized search handler with debouncing
  const handleSearchChange = useCallback((text: string) => {
    setFilters(prev => ({ ...prev, searchQuery: text }));
  }, []);

  const handleSortChange = useCallback((type: SortOptions['type']) => {
    setSortOptions(prev => ({
      type,
      order: prev.type === type && prev.order === 'asc' ? 'desc' : 'asc'
    }));
    setShowSortMenu(false);
  }, []);

  const handleFPFilterChange = useCallback((minFP: number, maxFP: number) => {
    setFilters(prev => ({ ...prev, minFP, maxFP }));
  }, []);

  const handleCreaturePress = useCallback((creature: Creature) => {
    setSelectedCreature(creature);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    clearCache(); // Clear cache to force reload
    await loadCreatures();
    setRefreshing(false);
  }, [loadCreatures]);

  // Render item function for FlatList
  const renderCreatureItem = useCallback(({ item }: { item: Creature }) => (
    <CreatureListItem creature={item} onPress={handleCreaturePress} />
  ), [handleCreaturePress]);

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: Creature) => item.nom, []);

  // Get item layout for better performance
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 180, // Estimated item height
    offset: 180 * index,
    index,
  }), []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Chargement du bestiaire...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Bestiaire</Text>
        <Text style={styles.subtitle}>
          {filteredCreatures.length} créature{filteredCreatures.length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search and filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une créature..."
            placeholderTextColor="#6B7280"
            value={filters.searchQuery}
            onChangeText={handleSearchChange}
          />
          {filters.searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchChange('')}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <ArrowUpDown size={16} color="#FFFFFF" />
            <Text style={styles.filterButtonText}>Tri</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={() => setShowFPFilter(!showFPFilter)}
          >
            <Filter size={16} color="#FFFFFF" />
            <Text style={styles.filterButtonText}>FP</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sort menu */}
      {showSortMenu && (
        <View style={styles.sortMenu}>
          <TouchableOpacity 
            style={styles.sortOption} 
            onPress={() => handleSortChange('alphabetical')}
          >
            <Text style={styles.sortOptionText}>
              Alphabétique {sortOptions.type === 'alphabetical' && `(${sortOptions.order === 'asc' ? '↑' : '↓'})`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sortOption} 
            onPress={() => handleSortChange('fp')}
          >
            <Text style={styles.sortOptionText}>
              Puissance {sortOptions.type === 'fp' && `(${sortOptions.order === 'asc' ? '↑' : '↓'})`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sortOption} 
            onPress={() => handleSortChange('type')}
          >
            <Text style={styles.sortOptionText}>
              Type {sortOptions.type === 'type' && `(${sortOptions.order === 'asc' ? '↑' : '↓'})`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FP Filter */}
      {showFPFilter && (
        <View style={styles.fpFilterContainer}>
          <Text style={styles.fpFilterTitle}>Filtrer par Puissance (FP)</Text>
          <View style={styles.fpFilterRow}>
            <Text style={styles.fpLabel}>Min:</Text>
            <TouchableOpacity onPress={() => setEditingMinFP(true)}>
              <Text style={styles.fpValue}>{filters.minFP}</Text>
            </TouchableOpacity>
            <Text style={styles.fpLabel}>Max:</Text>
            <TouchableOpacity onPress={() => setEditingMaxFP(true)}>
              <Text style={styles.fpValue}>{filters.maxFP}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Creatures list */}
      <FlatList
        data={filteredCreatures}
        renderItem={renderCreatureItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  header: {
    backgroundColor: '#10B981',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#D1FAE5',
    textAlign: 'center',
    marginTop: 4,
  },
  searchContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  creatureItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  creatureHeader: {
    marginBottom: 8,
  },
  creatureName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  creatureType: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  creatureStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stat: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  imageText: {
    fontSize: 12,
    color: '#6B7280',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  sortMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sortOptionActive: {
    backgroundColor: '#F0F9FF',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  sortOptionTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  fpFilterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  fpFilterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  fpFilterToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 6,
  },
  fpFilterPanel: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  fpRangeContainer: {
    marginBottom: 12,
  },
  fpRangeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  fpAdjuster: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  fpButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fpValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    minWidth: 40,
    textAlign: 'center',
  },
  sortOrderButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
  },
  sortOrderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  fpEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fpEditInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 50,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  fpEditButtons: {
    flexDirection: 'row',
    marginLeft: 4,
  },
  fpEditButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  fpEditButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 12,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  fpFilterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  fpFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
  },
  fpLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  fpValue: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#EBF4FF',
    borderRadius: 6,
    minWidth: 40,
    textAlign: 'center',
  },
  sortMenu: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  fpFilterContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
}); 