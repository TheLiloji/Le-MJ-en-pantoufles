import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, Switch } from 'react-native';
import { ArrowLeft, Plus, Package, Trash2, User, Weight, Calendar, Save, X } from 'lucide-react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { 
  loadBackpacks, 
  Backpack, 
  getBackpackStats, 
  getCapacityPercentage,
  removeItemFromBackpack,
  updateItemQuantity,
  updateBackpack
} from '@/utils/backpackService';
import { getRarityColor } from '@/utils/equipmentService';

export default function BackpackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [backpack, setBackpack] = useState<Backpack | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [capacityMode, setCapacityMode] = useState<'weight' | 'value' | 'items'>('weight');
  const [maxCapacity, setMaxCapacity] = useState('30');
  const [selectedCapacityMode, setSelectedCapacityMode] = useState<'weight' | 'value' | 'items'>('weight');
  const [isMainCapacity, setIsMainCapacity] = useState(false);

  const loadBackpackData = async () => {
    try {
      const backpacks = await loadBackpacks();
      const foundBackpack = backpacks.find(b => b.id === id);
      if (foundBackpack) {
        setBackpack(foundBackpack);
        setMaxCapacity(foundBackpack.capacite.poids.toString());
      } else {
        Alert.alert('Erreur', 'Sac à dos non trouvé');
        router.back();
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger le sac à dos');
    } finally {
      setLoading(false);
    }
  };

  // Recharger les données à chaque fois que la page devient active
  useFocusEffect(
    React.useCallback(() => {
      loadBackpackData();
    }, [id])
  );

  const handleAddItem = () => {
    router.push({
      pathname: '/backpacks/[id]/add-item',
      params: { id: id! }
    });
  };

  const handleCapacityPress = (mode: 'weight' | 'value' | 'items') => {
    setCapacityMode(mode);
    setSelectedCapacityMode(mode);
    setIsMainCapacity(backpack?.capacitePrincipale === mode);
    if (mode === 'weight') {
      setMaxCapacity(backpack?.capacite.poids.toString() || '30');
    } else if (mode === 'value') {
      setMaxCapacity(backpack?.capacite.valeur.toString() || '1000');
    } else {
      setMaxCapacity(backpack?.capacite.items.toString() || '50');
    }
    setShowCapacityModal(true);
  };

  const handleSaveCapacity = async () => {
    if (!backpack) return;

    const newMaxCapacity = parseFloat(maxCapacity);
    if (isNaN(newMaxCapacity) || newMaxCapacity <= 0) {
      Alert.alert('Erreur', 'La valeur doit être un nombre positif');
      return;
    }

    try {
      const updatedBackpack = {
        ...backpack,
        capacite: {
          ...backpack.capacite,
          [capacityMode === 'weight' ? 'poids' : capacityMode === 'value' ? 'valeur' : 'items']: newMaxCapacity
        },
        capacitePrincipale: isMainCapacity ? capacityMode : backpack.capacitePrincipale || 'weight'
      };

      await updateBackpack(updatedBackpack);
      await loadBackpackData();
      setShowCapacityModal(false);
      setIsMainCapacity(false);
      Alert.alert('Succès', 'Capacité mise à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la capacité');
    }
  };

  const handleRemoveItem = async (item: any) => {
    console.log('handleRemoveItem appelé pour:', item.name, 'itemId:', item.itemId);
    
    // Si c'est le premier clic, activer le mode suppression
    if (deletingItem !== item.itemId) {
      setDeletingItem(item.itemId);
      // Reset après 3 secondes
      setTimeout(() => setDeletingItem(null), 3000);
      return;
    }
    
    // Deuxième clic - confirmer la suppression
    setDeletingItem(null);
    console.log('Utilisateur a confirmé la suppression de l\'objet');
    try {
      console.log('Suppression de l\'objet:', item.itemId, 'du sac à dos:', id);
      await removeItemFromBackpack(id!, item.itemId);
      console.log('Objet supprimé avec succès');
      await loadBackpackData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Alert.alert('Erreur', 'Impossible de supprimer l\'objet');
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      await updateItemQuantity(id!, itemId, newQuantity);
      await loadBackpackData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la quantité');
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemIcon}>
            <Package size={20} color={getRarityColor(item.rarity)} />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemType}>{item.type}</Text>
            <Text style={[styles.itemRarity, { color: getRarityColor(item.rarity) }]}>
              {item.rarity}
            </Text>
          </View>
          <View style={styles.itemActions}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleUpdateQuantity(item.itemId, Math.max(1, item.quantity - 1))}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleUpdateQuantity(item.itemId, item.quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[
                styles.removeButton,
                deletingItem === item.itemId && styles.removeButtonConfirm
              ]}
              onPress={() => handleRemoveItem(item)}
            >
              <Trash2 size={16} color={deletingItem === item.itemId ? "#FFFFFF" : "#EF4444"} />
            </TouchableOpacity>
          </View>
        </View>

        {item.description && (
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.itemDetails}>
          {item.weight && (
            <View style={styles.detailItem}>
              <Weight size={12} color="#6B7280" />
              <Text style={styles.detailText}>{(item.weight * item.quantity).toFixed(1)} kg</Text>
            </View>
          )}
          {item.value && (
            <View style={styles.detailItem}>
              <Text style={styles.detailText}>{item.value}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Chargement du sac à dos...</Text>
      </View>
    );
  }

  if (!backpack) {
    return null;
  }

  const stats = getBackpackStats(backpack);
  const capacityPercentage = getCapacityPercentage(backpack);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{backpack.nom}</Text>
        {backpack.proprietaire && (
          <View style={styles.ownerContainer}>
            <User size={16} color="#FEF3C7" />
            <Text style={styles.ownerText}>{backpack.proprietaire}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statCard} onPress={() => handleCapacityPress('weight')}>
            <Text style={styles.statLabel}>Poids</Text>
            <Text style={styles.statValue}>
              {(stats?.totalWeight || 0).toFixed(1)}/{(backpack?.capacite?.poids || 30)} kg
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => handleCapacityPress('value')}>
            <Text style={styles.statLabel}>Valeur</Text>
            <Text style={styles.statValue}>
              {(stats?.totalValue || 0).toFixed(0)}/{(stats?.maxValue || 1000)} po
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => handleCapacityPress('items')}>
            <Text style={styles.statLabel}>Objets</Text>
            <Text style={styles.statValue}>
              {(stats?.totalItemsCount || 0)}/{(stats?.maxItems || 50)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Barre de capacité */}
        <View style={styles.capacityContainer}>
          <View style={styles.capacityHeader}>
            <Text style={styles.capacityLabel}>
              {backpack.capacitePrincipale === 'weight' ? 'Capacité en Poids' :
               backpack.capacitePrincipale === 'value' ? 'Capacité en Valeur' :
               'Capacité en Objets'}
            </Text>
            <Text style={styles.capacityPercentage}>
              {Math.round(
                backpack.capacitePrincipale === 'weight' ? (stats?.weightPercentage || 0) :
                backpack.capacitePrincipale === 'value' ? (stats?.valuePercentage || 0) :
                (stats?.itemsPercentage || 0)
              )}%
            </Text>
          </View>
          <View style={styles.capacityBar}>
            <View 
              style={[
                styles.capacityFill, 
                { 
                  width: `${Math.min(
                    backpack.capacitePrincipale === 'weight' ? (stats?.weightPercentage || 0) :
                    backpack.capacitePrincipale === 'value' ? (stats?.valuePercentage || 0) :
                    (stats?.itemsPercentage || 0), 
                    100
                  )}%` 
                },
                (backpack.capacitePrincipale === 'weight' ? (stats?.weightPercentage || 0) :
                 backpack.capacitePrincipale === 'value' ? (stats?.valuePercentage || 0) :
                 (stats?.itemsPercentage || 0)) > 80 ? styles.capacityFillWarning : null
              ]} 
            />
          </View>
        </View>

        {/* Description */}
        {backpack.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>{backpack.description}</Text>
          </View>
        )}

        {/* Liste des objets */}
        <View style={styles.itemsContainer}>
          <View style={styles.itemsHeader}>
            <Text style={styles.itemsTitle}>Objets ({backpack.items.length})</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddItem}
            >
              <Plus size={20} color="#F59E0B" />
            </TouchableOpacity>
          </View>

          {backpack.items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Package size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>Aucun objet dans ce sac</Text>
              <Text style={styles.emptySubtext}>
                Appuyez sur le bouton + pour ajouter des équipements
              </Text>
            </View>
          ) : (
            <FlatList
              data={backpack.items}
              renderItem={renderItem}
              keyExtractor={(item) => item.itemId}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.itemsList}
            />
          )}
        </View>
      </View>

      {/* Modal de capacité */}
      <Modal
        visible={showCapacityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCapacityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {capacityMode === 'weight' ? 'Capacité en Poids' : capacityMode === 'value' ? 'Capacité en Valeur' : 'Capacité en Objets'}
            </Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={maxCapacity}
              onChangeText={setMaxCapacity}
              placeholder={capacityMode === 'weight' ? '30' : capacityMode === 'value' ? '1000' : '50'}
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.checkboxContainer}>
              <Switch
                value={isMainCapacity}
                onValueChange={setIsMainCapacity}
                trackColor={{ false: '#E5E7EB', true: '#F59E0B' }}
                thumbColor={isMainCapacity ? '#FFFFFF' : '#FFFFFF'}
              />
              <Text style={styles.checkboxLabel}>Définir comme capacité principale</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleSaveCapacity}>
                <Save size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setShowCapacityModal(false)}>
                <X size={24} color="#FFFFFF" />
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
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    flex: 1,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  ownerText: {
    fontSize: 14,
    color: '#FEF3C7',
    marginLeft: 4,
  },
  settingsButton: {
    padding: 10,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  statValueWarning: {
    color: '#EF4444',
  },
  capacityContainer: {
    marginBottom: 20,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  capacityLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  capacityPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  capacityBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  capacityFillWarning: {
    backgroundColor: '#EF4444',
  },
  descriptionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  itemsContainer: {
    flex: 1,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  itemsList: {
    paddingBottom: 20,
  },
  itemCard: {
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
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  itemType: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  itemRarity: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    width: 24,
    height: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 4,
  },
  removeButtonConfirm: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },
  itemDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
  },
  modalInput: {
    width: '100%',
    height: 50,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    marginHorizontal: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
}); 