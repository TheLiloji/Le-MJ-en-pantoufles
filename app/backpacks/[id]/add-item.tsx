import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Modal, Alert, ScrollView } from 'react-native';
import { Search, ArrowLeft, Plus, Package, Gem, Sword, Shield, ChevronDown, Skull, Eye, Circle, Zap, Crown, FileText, Droplets, Sparkles, ArrowRight, ScrollText, FlaskConical, Heart, Ghost, Dna, Syringe, Square, Brain, Wine, Shirt, Dice1, Guitar, Compass, Caravan, Box, Lightbulb, Wrench, Hammer } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  loadEquipmentData, 
  loadMagicItems, 
  loadPoisons,
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
} from '../../../utils/equipmentService';
import { canAddItemToBackpack, loadBackpacks, Backpack, addItemToBackpack, updateItemQuantity, removeItemFromBackpack, getBackpackStats } from '../../../utils/backpackService';

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

export default function AddItemToBackpackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [equipmentData, setEquipmentData] = useState<EquipmentData | null>(null);
  const [magicItems, setMagicItems] = useState<MagicItem[]>([]);
  const [poisons, setPoisons] = useState<Poison[]>([]);
  const [backpack, setBackpack] = useState<Backpack | null>(null);
  const [filteredEquipment, setFilteredEquipment] = useState<EquipmentSearchResult[]>([]);
  const [filteredMagicItems, setFilteredMagicItems] = useState<MagicItem[]>([]);
  const [filteredPoisons, setFilteredPoisons] = useState<Poison[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'equipment' | 'magic' | 'poisons' | 'custom'>('equipment');
  
  // Filtres par type
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showTypeModal, setShowTypeModal] = useState(false);

  // États pour l'objet personnalisé
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customItem, setCustomItem] = useState({
    name: '',
    type: '',
    rarity: 'Commune',
    weight: '1',
    value: '10',
    description: '',
    quantity: '1'
  });

  // Fonction pour nettoyer les descriptions et éviter les problèmes de text node
  const cleanDescription = (description: string): string => {
    if (!description) return '';
    // Supprimer les caractères problématiques et normaliser
    return description
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Supprimer les caractères de contrôle
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim();
  };

  // Fonction pour vérifier si un objet est déjà dans le sac à dos
  const getItemInBackpack = (itemName: string) => {
    if (!backpack) return null;
    return backpack.items.find(item => item.name === itemName);
  };

  // Fonction pour obtenir la quantité d'un objet dans le sac à dos
  const getItemQuantity = (itemName: string): number => {
    const item = getItemInBackpack(itemName);
    return item ? item.quantity : 0;
  };

  // Fonction pour ajouter une quantité à un objet existant
  const handleAddQuantity = async (itemName: string, currentQuantity: number) => {
    if (!backpack) return;

    const existingItem = getItemInBackpack(itemName);
    if (existingItem) {
      try {
        await updateItemQuantity(id!, existingItem.itemId, currentQuantity + 1);
        // Recharger les données du sac à dos
        const updatedBackpacks = await loadBackpacks();
        const updatedBackpack = updatedBackpacks.find(b => b.id === id);
        if (updatedBackpack) {
          setBackpack(updatedBackpack);
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        Alert.alert('Erreur', 'Impossible de mettre à jour la quantité');
      }
    }
  };

  // Fonction pour retirer une quantité d'un objet existant
  const handleRemoveQuantity = async (itemName: string, currentQuantity: number) => {
    if (!backpack) return;

    const existingItem = getItemInBackpack(itemName);
    if (existingItem && currentQuantity > 1) {
      try {
        await updateItemQuantity(id!, existingItem.itemId, currentQuantity - 1);
        // Recharger les données du sac à dos
        const updatedBackpacks = await loadBackpacks();
        const updatedBackpack = updatedBackpacks.find(b => b.id === id);
        if (updatedBackpack) {
          setBackpack(updatedBackpack);
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error);
        Alert.alert('Erreur', 'Impossible de mettre à jour la quantité');
      }
    } else if (existingItem && currentQuantity === 1) {
      // Supprimer complètement l'objet si quantité = 1
      try {
        await removeItemFromBackpack(id!, existingItem.itemId);
        // Recharger les données du sac à dos
        const updatedBackpacks = await loadBackpacks();
        const updatedBackpack = updatedBackpacks.find(b => b.id === id);
        if (updatedBackpack) {
          setBackpack(updatedBackpack);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        Alert.alert('Erreur', 'Impossible de retirer l\'objet');
      }
    }
  };
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, equipmentData, magicItems, poisons, activeTab, selectedType]);

  // Initialiser tous les onglets au chargement des données
  useEffect(() => {
    if (equipmentData && magicItems.length > 0 && poisons.length > 0) {
      // Forcer le filtrage pour tous les onglets
      const currentTab = activeTab;
      
      // Filtrer les équipements
      if (equipmentData) {
        let results: EquipmentSearchResult[] = [];
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
        setFilteredEquipment(results);
      }

      // Filtrer les objets magiques
      setFilteredMagicItems(magicItems);

      // Filtrer les poisons
      setFilteredPoisons(poisons);
    }
  }, [equipmentData, magicItems, poisons]);

  const loadData = async () => {
    try {
      const [equipment, magic, poison, backpacks] = await Promise.all([
        loadEquipmentData(),
        loadMagicItems(),
        loadPoisons(),
        loadBackpacks()
      ]);
      setEquipmentData(equipment);
      setMagicItems(magic);
      setPoisons(poison);
      
      const foundBackpack = backpacks.find(b => b.id === id);
      if (foundBackpack) {
        setBackpack(foundBackpack);
      } else {
        Alert.alert('Erreur', 'Sac à dos non trouvé');
        router.back();
      }
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
    if (!backpack) return;

    const newItem: EquipmentItem = {
      id: Date.now().toString(), // Générer un ID temporaire
      name: item.name,
      type: item.type,
      rarity: 'Commune',
      quantity: 1,
      description: `${item.name} - ${item.category}`,
      icon: getItemIcon(item.type),
    };

    if (!canAddItemToBackpack(backpack, newItem)) {
      Alert.alert('Erreur', 'Le sac à dos est trop lourd pour ajouter cet objet');
      return;
    }

          try {
        await addItemToBackpack(id!, newItem);
        // Recharger les données du sac à dos
        const updatedBackpacks = await loadBackpacks();
        const updatedBackpack = updatedBackpacks.find(b => b.id === id);
        if (updatedBackpack) {
          setBackpack(updatedBackpack);
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout:', error);
        Alert.alert('Erreur', 'Impossible d\'ajouter l\'objet');
      }
  };

  const handleAddMagicItem = async (item: MagicItem) => {
    if (!backpack) return;

    const newItem: EquipmentItem = {
      id: Date.now().toString(), // Générer un ID temporaire
      name: item.nom,
      type: item.type,
      rarity: item.rarete.charAt(0).toUpperCase() + item.rarete.slice(1),
      quantity: 1,
      description: item.description_courte || item.description_longue,
      icon: getItemIcon(item.type),
      source: item.source,
      url: item.url,
    };

    if (!canAddItemToBackpack(backpack, newItem)) {
      Alert.alert('Erreur', 'Le sac à dos est trop lourd pour ajouter cet objet');
      return;
    }

    try {
      await addItemToBackpack(id!, newItem);
      // Recharger les données du sac à dos
      const updatedBackpacks = await loadBackpacks();
      const updatedBackpack = updatedBackpacks.find(b => b.id === id);
      if (updatedBackpack) {
        setBackpack(updatedBackpack);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'objet');
    }
  };

  const handleAddPoison = async (item: Poison) => {
    if (!backpack) return;

    const newItem: EquipmentItem = {
      id: Date.now().toString(), // Générer un ID temporaire
      name: item.nom,
      type: `Poison (${item.type})`,
      rarity: 'Rare',
      quantity: 1,
      description: item.description,
      icon: getItemIcon(item.type),
      source: item.source,
      url: item.url,
    };

    if (!canAddItemToBackpack(backpack, newItem)) {
      Alert.alert('Erreur', 'Le sac à dos est trop lourd pour ajouter cet objet');
      return;
    }

    try {
      await addItemToBackpack(id!, newItem);
      // Recharger les données du sac à dos
      const updatedBackpacks = await loadBackpacks();
      const updatedBackpack = updatedBackpacks.find(b => b.id === id);
      if (updatedBackpack) {
        setBackpack(updatedBackpack);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'objet');
    }
  };

  const handleAddCustomItem = async () => {
    if (!backpack) return;

    // Validation des champs
    if (!customItem.name.trim() || !customItem.type.trim()) {
      Alert.alert('Erreur', 'Le nom et le type sont obligatoires');
      return;
    }

    const weight = parseFloat(customItem.weight);
    const value = parseFloat(customItem.value);
    const quantity = parseInt(customItem.quantity);

    if (isNaN(weight) || isNaN(value) || isNaN(quantity) || weight <= 0 || value < 0 || quantity <= 0) {
      Alert.alert('Erreur', 'Les valeurs de poids, valeur et quantité doivent être des nombres positifs');
      return;
    }

    const newItem: EquipmentItem = {
      id: Date.now().toString(),
      name: customItem.name.trim(),
      type: customItem.type.trim(),
      rarity: customItem.rarity,
      quantity: quantity,
      description: customItem.description.trim(),
      icon: 'package', // Icône par défaut
    };

    if (!canAddItemToBackpack(backpack, newItem)) {
      Alert.alert('Erreur', 'Le sac à dos est trop lourd pour ajouter cet objet');
      return;
    }

    try {
      await addItemToBackpack(id!, newItem);
      
      // Reset du formulaire
      setCustomItem({
        name: '',
        type: '',
        rarity: 'Commune',
        weight: '1',
        value: '10',
        description: '',
        quantity: '1'
      });
      setShowCustomModal(false);
      
      // Recharger les données
      loadData();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'objet');
    }
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'sword':
        return <Sword size={20} color="#F59E0B" />;
      case 'swords':
        return <Sword size={20} color="#10B981" />;
      case 'bow':
        return <ArrowRight size={20} color="#8B5CF6" />;
      case 'shield':
        return <Shield size={20} color="#6B46C1" />;
      case 'gem':
        return <Gem size={20} color="#DC2626" />;
      case 'ring':
        return <Circle size={20} color="#8B5CF6" />;
      case 'wand-sparkles':
        return <Sparkles size={20} color="#F59E0B" />;
      case 'wand':
        return <Zap size={20} color="#8B5CF6" />;
      case 'staff':
        return <Zap size={20} color="#10B981" />;
      case 'scroll-text':
        return <ScrollText size={20} color="#8B5CF6" />;
      case 'flask-conical':
        return <FlaskConical size={20} color="#EF4444" />;
      case 'wondrous':
        return <Gem size={20} color="#8B5CF6" />;
      case 'consumable':
        return <FlaskConical size={20} color="#EF4444" />;
      case 'syringe':
        return <Syringe size={20} color="#DC2626" />;
      case 'droplet':
        return <Droplets size={20} color="#3B82F6" />;
      case 'ghost':
        return <Ghost size={20} color="#8B5CF6" />;
      case 'brain':
        return <Brain size={20} color="#10B981" />;
      case 'dna':
        return <Dna size={20} color="#EF4444" />;
      case 'wine':
        return <Wine size={20} color="#8B5CF6" />;
      case 'shirt':
        return <Shirt size={20} color="#10B981" />;
      case 'dice':
        return <Dice1 size={20} color="#F59E0B" />;
      case 'guitar':
        return <Guitar size={20} color="#8B5CF6" />;
      case 'compass':
        return <Compass size={20} color="#3B82F6" />;
      case 'caravan':
        return <Caravan size={20} color="#F59E0B" />;
      case 'box':
        return <Box size={20} color="#8B5CF6" />;
      case 'lightbulb':
        return <Lightbulb size={20} color="#F59E0B" />;
      case 'wrench':
        return <Wrench size={20} color="#6B7280" />;
      case 'hammer':
        return <Hammer size={20} color="#DC2626" />;
      default:
        return <Package size={20} color="#6B7280" />;
    }
  };

  const renderEquipmentItem = ({ item }: { item: EquipmentSearchResult }) => {
    const currentQuantity = getItemQuantity(item.name);
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
          {currentQuantity === 0 ? (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => handleAddEquipment(item)}
            >
              <Plus size={16} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.quantityButtons}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleRemoveQuantity(item.name, currentQuantity)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{currentQuantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleAddQuantity(item.name, currentQuantity)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
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
    const currentQuantity = getItemQuantity(item.nom);
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
          </View>
          <View style={styles.itemActions}>
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => router.push({
                pathname: '/magic-items/[id]',
                params: { id: encodeURIComponent(item.nom) }
              })}
            >
              <Eye size={16} color="#6B7280" />
            </TouchableOpacity>
            {currentQuantity === 0 ? (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => handleAddMagicItem(item)}
              >
                <Plus size={16} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityButtons}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => handleRemoveQuantity(item.nom, currentQuantity)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{currentQuantity}</Text>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => handleAddQuantity(item.nom, currentQuantity)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {item.description_courte && item.description_courte.trim() !== '' ? (
          <View style={styles.descriptionContainer}>
            <Text style={styles.itemDescription} numberOfLines={2}>
              {cleanDescription(item.description_courte)}
            </Text>
          </View>
        ) : item.description_longue && item.description_longue.trim() !== '' && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.itemDescription} numberOfLines={3}>
              {cleanDescription(item.description_longue)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderPoisonItem = ({ item }: { item: Poison }) => {
    const currentQuantity = getItemQuantity(item.nom);
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemIcon}>
            {getIcon(getItemIcon(item.type))}
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.nom}</Text>
            <Text style={styles.itemType}>
              {item.type} • {item.categorie} • {item.prix}
            </Text>
            {item.description && item.description.trim() !== '' && (
              <Text style={styles.itemDescription} numberOfLines={2}>
                {cleanDescription(item.description)}
              </Text>
            )}
          </View>
          {currentQuantity === 0 ? (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => handleAddPoison(item)}
            >
              <Plus size={16} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.quantityButtons}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleRemoveQuantity(item.nom, currentQuantity)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{currentQuantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleAddQuantity(item.nom, currentQuantity)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
        <View style={styles.customModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrer par type</Text>
            <TouchableOpacity onPress={() => setShowTypeModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalList}>
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
          </View>
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
        <Text style={styles.title}>Ajouter un objet</Text>
        
        {/* Capacité intégrée dans le header */}
        {backpack && (
          <View style={styles.capacityContainer}>
            <View style={styles.capacityHeader}>
              <Text style={styles.capacityLabel}>
                {backpack.capacitePrincipale === 'weight' ? 'Poids' :
                 backpack.capacitePrincipale === 'value' ? 'Valeur' :
                 'Objets'}
              </Text>
              <Text style={styles.capacityPercentage}>
                {Math.round(
                  backpack.capacitePrincipale === 'weight' ? (getBackpackStats(backpack)?.weightPercentage || 0) :
                  backpack.capacitePrincipale === 'value' ? (getBackpackStats(backpack)?.valuePercentage || 0) :
                  (getBackpackStats(backpack)?.itemsPercentage || 0)
                )}%
              </Text>
            </View>
            <View style={styles.capacityBar}>
              <View 
                style={[
                  styles.capacityFill, 
                  { 
                    width: `${Math.min(
                      backpack.capacitePrincipale === 'weight' ? (getBackpackStats(backpack)?.weightPercentage || 0) :
                      backpack.capacitePrincipale === 'value' ? (getBackpackStats(backpack)?.valuePercentage || 0) :
                      (getBackpackStats(backpack)?.itemsPercentage || 0), 
                      100
                    )}%` 
                  },
                  (backpack.capacitePrincipale === 'weight' ? (getBackpackStats(backpack)?.weightPercentage || 0) :
                   backpack.capacitePrincipale === 'value' ? (getBackpackStats(backpack)?.valuePercentage || 0) :
                   (getBackpackStats(backpack)?.itemsPercentage || 0)) > 80 ? styles.capacityFillWarning : null
                ]} 
              />
            </View>
          </View>
        )}
      </View>

      {/* Barre de recherche et filtre combinés */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchBox}>
          <Search size={18} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowTypeModal(true)}
        >
          <Text style={styles.filterButtonText}>
            {selectedType === 'all' ? 'Tous' : selectedType}
          </Text>
          <ChevronDown size={14} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Onglets compacts */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'equipment' && styles.tabActive]}
          onPress={() => setActiveTab('equipment')}
        >
          <Package size={14} color={activeTab === 'equipment' ? '#F59E0B' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'equipment' && styles.tabTextActive]}>
            Équip. ({filteredEquipment.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'magic' && styles.tabActive]}
          onPress={() => setActiveTab('magic')}
        >
          <Gem size={14} color={activeTab === 'magic' ? '#F59E0B' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'magic' && styles.tabTextActive]}>
            Magique ({filteredMagicItems.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'poisons' && styles.tabActive]}
          onPress={() => setActiveTab('poisons')}
        >
          <Skull size={14} color={activeTab === 'poisons' ? '#F59E0B' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'poisons' && styles.tabTextActive]}>
            Poisons ({filteredPoisons.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'custom' && styles.tabActive]}
          onPress={() => setActiveTab('custom')}
        >
          <Plus size={14} color={activeTab === 'custom' ? '#F59E0B' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'custom' && styles.tabTextActive]}>
            Custom
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
      ) : activeTab === 'custom' ? (
        <View style={styles.customContainer}>
          <View style={styles.customCard}>
            <Text style={styles.customTitle}>Créer un objet personnalisé</Text>
            <Text style={styles.customDescription}>
              Ajoutez vos propres objets avec toutes les statistiques personnalisées
            </Text>
            <TouchableOpacity 
              style={styles.customButton}
              onPress={() => setShowCustomModal(true)}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.customButtonText}>Créer un objet</Text>
            </TouchableOpacity>
          </View>
        </View>
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

      {/* Modal pour objet personnalisé */}
      <Modal
        visible={showCustomModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCustomModal(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.customModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Créer un objet personnalisé</Text>
              <TouchableOpacity onPress={() => setShowCustomModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.customForm} showsVerticalScrollIndicator={false}>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Nom de l'objet *</Text>
                <TextInput
                  style={styles.formInput}
                  value={customItem.name}
                  onChangeText={(text) => setCustomItem({...customItem, name: text})}
                  placeholder="Ex: Épée en cristal"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Type *</Text>
                <TextInput
                  style={styles.formInput}
                  value={customItem.type}
                  onChangeText={(text) => setCustomItem({...customItem, type: text})}
                  placeholder="Ex: Arme, Armure, Outil..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Rareté</Text>
                <View style={styles.rarityContainer}>
                  {['Commune', 'Peu commune', 'Rare', 'Très rare', 'Légendaire'].map((rarity) => (
                    <TouchableOpacity
                      key={rarity}
                      style={[
                        styles.rarityButton,
                        customItem.rarity === rarity && styles.rarityButtonSelected
                      ]}
                      onPress={() => setCustomItem({...customItem, rarity})}
                    >
                      <Text style={[
                        styles.rarityButtonText,
                        customItem.rarity === rarity && styles.rarityButtonTextSelected
                      ]}>
                        {rarity}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formField, {flex: 1, marginRight: 8}]}>
                  <Text style={styles.formLabel}>Poids (kg)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={customItem.weight}
                    onChangeText={(text) => setCustomItem({...customItem, weight: text})}
                    keyboardType="numeric"
                    placeholder="1"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={[styles.formField, {flex: 1, marginLeft: 8}]}>
                  <Text style={styles.formLabel}>Valeur (po)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={customItem.value}
                    onChangeText={(text) => setCustomItem({...customItem, value: text})}
                    keyboardType="numeric"
                    placeholder="10"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Quantité</Text>
                <TextInput
                  style={styles.formInput}
                  value={customItem.quantity}
                  onChangeText={(text) => setCustomItem({...customItem, quantity: text})}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  value={customItem.description}
                  onChangeText={(text) => setCustomItem({...customItem, description: text})}
                  placeholder="Description de l'objet..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowCustomModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleAddCustomItem}
              >
                <Text style={styles.saveButtonText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: {
    position: 'absolute',
    top: 50,
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
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
  },
  filterButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 6,
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
    paddingTop: 12,
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
    paddingHorizontal: 20,
  },
  customModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '90%',
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  quantityButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 16,
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginHorizontal: 10,
  },
  capacityContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  capacityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  capacityPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FEF3C7',
  },
  capacityBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  capacityFillWarning: {
    backgroundColor: '#EF4444', // Couleur rouge pour le dépassement
  },
  customContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  customCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  customTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  customDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'center',
  },
  customButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  customForm: {
    flex: 1,
    marginTop: 10,
    marginBottom: 10,
  },
  formField: {
    marginBottom: 10,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formTextArea: {
    minHeight: 60,
    maxHeight: 80,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rarityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 6,
  },
  rarityButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  rarityButtonSelected: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  rarityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  rarityButtonTextSelected: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#F59E0B',
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: 8,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
}); 