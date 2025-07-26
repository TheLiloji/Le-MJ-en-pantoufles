import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { Search, ArrowLeft, Plus, Package, Gem, Sword, Shield, ChevronDown, Skull } from 'lucide-react-native';
import { router } from 'expo-router';
import { 
  loadEquipmentData, 
  loadMagicItems, 
  loadPoisons,
  addEquipmentItem, 
  searchEquipment, 
  searchMagicItems,
  searchPoisons,
  getRarityColor,
  getItemIcon,
  getEquipmentTypes,
  getMagicItemTypes,
  getPoisonTypes,
  EquipmentItem,
  MagicItem,
  Poison,
  EquipmentData
} from '../../utils/equipmentService';

interface EquipmentSearchResult {
  id: string;
  name: string;
  type: string;
  category: string;
  price?: number;
  currency?: string;
  ca?: number;
  damage?: string;
}

export default function AddEquipmentScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [equipmentData, setEquipmentData] = useState<EquipmentData | null>(null);
  const [magicItems, setMagicItems] = useState<MagicItem[]>([]);
  const [poisons, setPoisons] = useState<Poison[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<EquipmentSearchResult[]>([]);
  const [filteredMagicItems, setFilteredMagicItems] = useState<MagicItem[]>([]);
  const [filteredPoisons, setFilteredPoisons] = useState<Poison[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'equipment' | 'magic' | 'poisons'>('equipment');
  
  // Filtres par type
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, equipmentData, magicItems, poisons, activeTab, selectedType]);

  const loadData = async () => {
    try {
      const [equipment, magic, poison] = await Promise.all([
        loadEquipmentData(),
        loadMagicItems(),
        loadPoisons()
      ]);
      setEquipmentData(equipment);
      setMagicItems(magic);
      setPoisons(poison);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    if (activeTab === 'equipment' && equipmentData) {
      let results: EquipmentSearchResult[] = [];
      
      // Récupérer tous les équipements
      Object.entries(equipmentData.categories).forEach(([categoryKey, category]) => {
        if (category.subcategories) {
          Object.entries(category.subcategories).forEach(([subcategoryKey, subcategory]) => {
            Object.entries(subcategory.items).forEach(([itemKey, item]) => {
              results.push({
                id: itemKey,
                name: item.name,
                type: subcategory.name,
                category: category.name,
                price: item.price,
                currency: item.currency,
                ca: item.ca,
                damage: item.damage || undefined
              });
            });
          });
        }
      });

      // Filtrer par recherche
      if (searchQuery.trim()) {
        const searchResults = searchEquipment(searchQuery, equipmentData);
        results = results.filter(item => 
          searchResults.some(searchItem => searchItem.id === item.id)
        );
      }

      // Filtrer par type
      if (selectedType !== 'all') {
        results = results.filter(item => item.type === selectedType);
      }

      setFilteredEquipment(results);
      setAvailableTypes(getEquipmentTypes(equipmentData));
    } else if (activeTab === 'magic') {
      let results = magicItems;

      // Filtrer par recherche
      if (searchQuery.trim()) {
        results = searchMagicItems(searchQuery, magicItems);
      }

      // Filtrer par type
      if (selectedType !== 'all') {
        results = results.filter(item => item.type === selectedType);
      }

      setFilteredMagicItems(results);
      setAvailableTypes(getMagicItemTypes(magicItems));
    } else if (activeTab === 'poisons') {
      let results = poisons;

      // Filtrer par recherche
      if (searchQuery.trim()) {
        results = searchPoisons(searchQuery, poisons);
      }

      // Filtrer par type
      if (selectedType !== 'all') {
        results = results.filter(item => 
          item.type === selectedType || item.categorie === selectedType
        );
      }

      setFilteredPoisons(results);
      setAvailableTypes(getPoisonTypes(poisons));
    }
  };

  const handleAddEquipment = async (item: EquipmentSearchResult) => {
    try {
      const newItem: Omit<EquipmentItem, 'id'> = {
        name: item.name,
        type: item.type,
        rarity: 'Commune',
        quantity: 1,
        description: `${item.name} - ${item.category}`,
        icon: getItemIcon(item.type),
      };
      
      await addEquipmentItem(newItem);
      // Feedback visuel ou notification
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  const handleAddMagicItem = async (item: MagicItem) => {
    try {
      const newItem: Omit<EquipmentItem, 'id'> = {
        name: item.nom,
        type: item.type,
        rarity: item.rarete.charAt(0).toUpperCase() + item.rarete.slice(1),
        quantity: 1,
        description: item.description_courte || item.description_longue,
        icon: getItemIcon(item.type),
        source: item.source,
        url: item.url,
      };
      
      await addEquipmentItem(newItem);
      // Feedback visuel ou notification
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  const handleAddPoison = async (item: Poison) => {
    try {
      const newItem: Omit<EquipmentItem, 'id'> = {
        name: item.nom,
        type: `Poison (${item.type})`,
        rarity: 'Rare',
        quantity: 1,
        description: item.description,
        icon: getItemIcon(item.type),
        source: item.source,
        url: item.url,
      };
      
      await addEquipmentItem(newItem);
      // Feedback visuel ou notification
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'sword':
        return <Sword size={20} color="#F59E0B" />;
      case 'shield':
        return <Shield size={20} color="#6B46C1" />;
      case 'gem':
        return <Gem size={20} color="#DC2626" />;
      default:
        return <Package size={20} color="#6B7280" />;
    }
  };

  const renderEquipmentItem = ({ item }: { item: EquipmentSearchResult }) => {
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemIcon}>
            {getIcon(getItemIcon(item.type))}
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemType}>{item.type} • {item.category}</Text>
            {item.price !== undefined && (
              <Text style={styles.itemPrice}>
                {item.price} {item.currency === 'po' ? 'po' : item.currency === 'pa' ? 'pa' : 'pc'}
              </Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => handleAddEquipment(item)}
          >
            <Plus size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.itemDetails}>
          {item.ca && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>CA:</Text>
              <Text style={styles.detailText}>{item.ca}</Text>
            </View>
          )}
          {item.damage && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Dégâts:</Text>
              <Text style={styles.detailText}>{item.damage}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderMagicItem = ({ item }: { item: MagicItem }) => {
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemIcon}>
            {getIcon(getItemIcon(item.type))}
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.nom}</Text>
            <Text style={styles.itemType}>
              {item.type} • {item.rarete.charAt(0).toUpperCase() + item.rarete.slice(1)}
            </Text>
            {item.description_courte && (
              <Text style={styles.itemDescription} numberOfLines={2}>
                {item.description_courte}
              </Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => handleAddMagicItem(item)}
          >
            <Plus size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {item.description_longue && (
          <Text style={styles.itemDescription} numberOfLines={3}>
            {item.description_longue}
          </Text>
        )}
      </View>
    );
  };

  const renderPoisonItem = ({ item }: { item: Poison }) => {
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemIcon}>
            <Skull size={20} color="#DC2626" />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.nom}</Text>
            <Text style={styles.itemType}>
              {item.type} • {item.categorie} • {item.prix}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => handleAddPoison(item)}
          >
            <Plus size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.itemDescription} numberOfLines={3}>
          {item.description}
        </Text>
      </View>
    );
  };

  const renderTypeModal = () => (
    <Modal
      visible={showTypeModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTypeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrer par type</Text>
            <TouchableOpacity onPress={() => setShowTypeModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalList}>
            <TouchableOpacity 
              style={[styles.modalItem, selectedType === 'all' && styles.modalItemSelected]}
              onPress={() => {
                setSelectedType('all');
                setShowTypeModal(false);
              }}
            >
              <Text style={[styles.modalItemText, selectedType === 'all' && styles.modalItemTextSelected]}>
                Tous les types
              </Text>
            </TouchableOpacity>
            
            {availableTypes.map(type => (
              <TouchableOpacity 
                key={type}
                style={[styles.modalItem, selectedType === type && styles.modalItemSelected]}
                onPress={() => {
                  setSelectedType(type);
                  setShowTypeModal(false);
                }}
              >
                <Text style={[styles.modalItemText, selectedType === type && styles.modalItemTextSelected]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Chargement des équipements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Ajouter un équipement</Text>
        <Text style={styles.subtitle}>
          {activeTab === 'equipment' ? filteredEquipment.length : 
           activeTab === 'magic' ? filteredMagicItems.length : 
           filteredPoisons.length} éléments trouvés
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un équipement..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Filtre par type */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowTypeModal(true)}
        >
          <Text style={styles.filterButtonText}>
            {selectedType === 'all' ? 'Tous les types' : selectedType}
          </Text>
          <ChevronDown size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Onglets */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'equipment' && styles.tabActive]}
          onPress={() => setActiveTab('equipment')}
        >
          <Package size={16} color={activeTab === 'equipment' ? '#F59E0B' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'equipment' && styles.tabTextActive]}>
            Équipements ({filteredEquipment.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'magic' && styles.tabActive]}
          onPress={() => setActiveTab('magic')}
        >
          <Gem size={16} color={activeTab === 'magic' ? '#F59E0B' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'magic' && styles.tabTextActive]}>
            Objets Magiques ({filteredMagicItems.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'poisons' && styles.tabActive]}
          onPress={() => setActiveTab('poisons')}
        >
          <Skull size={16} color={activeTab === 'poisons' ? '#F59E0B' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'poisons' && styles.tabTextActive]}>
            Poisons ({filteredPoisons.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'equipment' ? (
        <FlatList
          data={filteredEquipment}
          renderItem={renderEquipmentItem}
          keyExtractor={(item) => item.id}
          style={styles.itemsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.itemsListContent}
        />
      ) : activeTab === 'magic' ? (
        <FlatList
          data={filteredMagicItems}
          renderItem={renderMagicItem}
          keyExtractor={(item) => item.nom}
          style={styles.itemsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.itemsListContent}
        />
      ) : (
        <FlatList
          data={filteredPoisons}
          renderItem={renderPoisonItem}
          keyExtractor={(item) => item.nom}
          style={styles.itemsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.itemsListContent}
        />
      )}

      {renderTypeModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#F59E0B',
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
    color: '#FEF3C7',
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
  filterContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  filterButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 2,
    backgroundColor: '#F3F4F6',
  },
  tabActive: {
    backgroundColor: '#FEF3C7',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
  },
  tabTextActive: {
    color: '#F59E0B',
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  itemsListContent: {
    paddingBottom: 20,
  },
  itemCard: {
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
    borderLeftColor: '#F59E0B',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  itemDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginTop: 8,
  },
  addButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    width: 60,
  },
  detailText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '80%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalClose: {
    fontSize: 20,
    color: '#6B7280',
  },
  modalList: {
    padding: 20,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalItemSelected: {
    backgroundColor: '#FEF3C7',
  },
  modalItemText: {
    fontSize: 16,
    color: '#374151',
  },
  modalItemTextSelected: {
    color: '#F59E0B',
    fontWeight: '600',
  },
}); 