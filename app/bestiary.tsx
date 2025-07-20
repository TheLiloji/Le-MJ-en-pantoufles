import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Search, Filter, X, ArrowLeft, ArrowUpDown, Plus, Minus } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { loadAllCreatures, findCreatureByName, searchCreatures, Creature } from '../utils/bestiaryService';
import BestiaryCard from './components/BestiaryCard';

export default function BestiaryScreen() {
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [filteredCreatures, setFilteredCreatures] = useState<Creature[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCreature, setSelectedCreature] = useState<Creature | null>(null);
  const [sortType, setSortType] = useState<'alphabetical' | 'fp'>('alphabetical');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [minFP, setMinFP] = useState(0);
  const [maxFP, setMaxFP] = useState(30);
  const [showFPFilter, setShowFPFilter] = useState(false);
  const [editingMinFP, setEditingMinFP] = useState(false);
  const [editingMaxFP, setEditingMaxFP] = useState(false);
  const [tempMinFP, setTempMinFP] = useState('0');
  const [tempMaxFP, setTempMaxFP] = useState('30');

  useEffect(() => {
    loadCreatures();
  }, []);

  useEffect(() => {
    let results = creatures;
    
    if (searchQuery.trim() !== '') {
      results = searchCreatures(searchQuery);
    }
    
    // Appliquer le filtre FP
    results = results.filter(creature => {
      const fp = parseFP(creature.fp);
      return fp >= minFP && fp <= maxFP;
    });
    
    // Appliquer le tri
    const sortedResults = sortCreatures(results, sortType, sortOrder);
    setFilteredCreatures(sortedResults);
  }, [searchQuery, creatures, sortType, sortOrder, minFP, maxFP]);

  const loadCreatures = async () => {
    try {
      const allCreatures = loadAllCreatures();
      setCreatures(allCreatures);
      setFilteredCreatures(allCreatures);
    } catch (error) {
      console.error('Erreur lors du chargement des créatures:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortCreatures = (creaturesToSort: Creature[], sortBy: 'alphabetical' | 'fp', order: 'asc' | 'desc' = 'asc'): Creature[] => {
    return [...creaturesToSort].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'alphabetical') {
        comparison = a.nom.localeCompare(b.nom, 'fr');
      } else {
        // Tri par FP (Facteur de Puissance)
        const fpA = parseFP(a.fp);
        const fpB = parseFP(b.fp);
        comparison = fpA - fpB;
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
  };

  const parseFP = (fp: string): number => {
    // Gérer les cas spéciaux comme "1/4", "1/2", etc.
    if (fp.includes('/')) {
      const [num, den] = fp.split('/').map(Number);
      return num / den;
    }
    // Pour les nombres entiers
    return Number(fp) || 0;
  };

  const handleSortPress = () => {
    setShowSortMenu(!showSortMenu);
  };

  const handleSortChange = (newSortType: 'alphabetical' | 'fp') => {
    setSortType(newSortType);
    setShowSortMenu(false);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleFPFilterToggle = () => {
    setShowFPFilter(!showFPFilter);
  };

  const formatFP = (fp: number): string => {
    if (fp === 0.25) return '1/4';
    if (fp === 0.5) return '1/2';
    return fp.toString();
  };

  const adjustMinFP = (increment: boolean) => {
    setMinFP(prev => {
      const newValue = increment ? prev + 0.25 : prev - 0.25;
      return Math.max(0, Math.min(newValue, maxFP - 0.25));
    });
  };

  const adjustMaxFP = (increment: boolean) => {
    setMaxFP(prev => {
      const newValue = increment ? prev + 0.25 : prev - 0.25;
      return Math.max(minFP + 0.25, Math.min(newValue, 30));
    });
  };

  const handleMinFPEdit = () => {
    setEditingMinFP(true);
    setTempMinFP(minFP.toString());
  };

  const handleMaxFPEdit = () => {
    setEditingMaxFP(true);
    setTempMaxFP(maxFP.toString());
  };

  const handleMinFPSave = () => {
    const value = parseFloat(tempMinFP);
    if (!isNaN(value) && value >= 0 && value <= maxFP - 0.25) {
      setMinFP(value);
    }
    setEditingMinFP(false);
  };

  const handleMaxFPSave = () => {
    const value = parseFloat(tempMaxFP);
    if (!isNaN(value) && value >= minFP + 0.25 && value <= 30) {
      setMaxFP(value);
    }
    setEditingMaxFP(false);
  };

  const handleMinFPCancel = () => {
    setEditingMinFP(false);
  };

  const handleMaxFPCancel = () => {
    setEditingMaxFP(false);
  };

  const handleCreaturePress = (creature: Creature) => {
    setSelectedCreature(creature);
  };

  const handleBackToList = () => {
    setSelectedCreature(null);
  };

  const renderCreatureItem = ({ item }: { item: Creature }) => (
    <TouchableOpacity 
      style={styles.creatureItem}
      onPress={() => handleCreaturePress(item)}
    >
      <View style={styles.creatureHeader}>
        <Text style={styles.creatureName}>{item.nom}</Text>
        <Text style={styles.creatureType}>{item.type}</Text>
      </View>
      <View style={styles.creatureStats}>
        <Text style={styles.stat}>CA: {item.ca}</Text>
        <Text style={styles.stat}>PV: {item.pv}</Text>
        <Text style={styles.stat}>FP: {item.fp}</Text>
      </View>
      {item.image_url && (
        <View style={styles.imageContainer}>
          <Text style={styles.imageText}>📷 Image disponible</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Chargement du bestiaire...</Text>
      </View>
    );
  }

  if (selectedCreature) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails de la créature</Text>
        </View>
        <BestiaryCard creature={selectedCreature} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Bestiaire D&D</Text>
        <Text style={styles.subtitle}>{filteredCreatures.length} créatures trouvées</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une créature..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.sortButton} onPress={handleSortPress}>
          <ArrowUpDown size={20} color="#6B7280" />
          <Text style={styles.sortButtonText}>
            {sortType === 'alphabetical' ? 'A-Z' : 'FP'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortOrderButton} onPress={handleSortOrderToggle}>
          <Text style={styles.sortOrderButtonText}>
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Text>
        </TouchableOpacity>
      </View>

      {showSortMenu && (
        <View style={styles.sortMenu}>
          <TouchableOpacity 
            style={[styles.sortOption, sortType === 'alphabetical' && styles.sortOptionActive]}
            onPress={() => handleSortChange('alphabetical')}
          >
            <Text style={[styles.sortOptionText, sortType === 'alphabetical' && styles.sortOptionTextActive]}>
              Ordre alphabétique
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortOption, sortType === 'fp' && styles.sortOptionActive]}
            onPress={() => handleSortChange('fp')}
          >
            <Text style={[styles.sortOptionText, sortType === 'fp' && styles.sortOptionTextActive]}>
              Facteur de Puissance
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filtre FP */}
      <View style={styles.fpFilterContainer}>
        <TouchableOpacity style={styles.fpFilterToggle} onPress={handleFPFilterToggle}>
          <Filter size={16} color="#6B7280" />
          <Text style={styles.fpFilterToggleText}>
            FP: {formatFP(minFP)} - {formatFP(maxFP)}
          </Text>
        </TouchableOpacity>
      </View>

      {showFPFilter && (
        <View style={styles.fpFilterPanel}>
          <View style={styles.fpRangeContainer}>
            <Text style={styles.fpRangeLabel}>FP Minimum</Text>
            <View style={styles.fpAdjuster}>
              <TouchableOpacity 
                style={styles.fpButton} 
                onPress={() => adjustMinFP(false)}
                disabled={minFP <= 0}
              >
                <Minus size={16} color={minFP <= 0 ? "#D1D5DB" : "#6B7280"} />
              </TouchableOpacity>
              
              {editingMinFP ? (
                <View style={styles.fpEditContainer}>
                  <TextInput
                    style={styles.fpEditInput}
                    value={tempMinFP}
                    onChangeText={setTempMinFP}
                    keyboardType="numeric"
                    autoFocus
                  />
                  <View style={styles.fpEditButtons}>
                    <TouchableOpacity style={styles.fpEditButton} onPress={handleMinFPSave}>
                      <Text style={styles.fpEditButtonText}>✓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.fpEditButton} onPress={handleMinFPCancel}>
                      <Text style={styles.fpEditButtonText}>✗</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={handleMinFPEdit}>
                  <Text style={styles.fpValue}>{formatFP(minFP)}</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.fpButton} 
                onPress={() => adjustMinFP(true)}
                disabled={minFP >= maxFP - 0.25}
              >
                <Plus size={16} color={minFP >= maxFP - 0.25 ? "#D1D5DB" : "#6B7280"} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fpRangeContainer}>
            <Text style={styles.fpRangeLabel}>FP Maximum</Text>
            <View style={styles.fpAdjuster}>
              <TouchableOpacity 
                style={styles.fpButton} 
                onPress={() => adjustMaxFP(false)}
                disabled={maxFP <= minFP + 0.25}
              >
                <Minus size={16} color={maxFP <= minFP + 0.25 ? "#D1D5DB" : "#6B7280"} />
              </TouchableOpacity>
              
              {editingMaxFP ? (
                <View style={styles.fpEditContainer}>
                  <TextInput
                    style={styles.fpEditInput}
                    value={tempMaxFP}
                    onChangeText={setTempMaxFP}
                    keyboardType="numeric"
                    autoFocus
                  />
                  <View style={styles.fpEditButtons}>
                    <TouchableOpacity style={styles.fpEditButton} onPress={handleMaxFPSave}>
                      <Text style={styles.fpEditButtonText}>✓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.fpEditButton} onPress={handleMaxFPCancel}>
                      <Text style={styles.fpEditButtonText}>✗</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={handleMaxFPEdit}>
                  <Text style={styles.fpValue}>{formatFP(maxFP)}</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.fpButton} 
                onPress={() => adjustMaxFP(true)}
                disabled={maxFP >= 30}
              >
                <Plus size={16} color={maxFP >= 30 ? "#D1D5DB" : "#6B7280"} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={filteredCreatures}
        renderItem={renderCreatureItem}
        keyExtractor={(item) => item.nom}
        style={styles.list}
        showsVerticalScrollIndicator={false}
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
}); 