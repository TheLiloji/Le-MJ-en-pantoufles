import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { Plus, Package, Trash2, User } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { loadBackpacks, deleteBackpack, Backpack, getBackpackStats } from '../../utils/backpackService';

export default function EquipmentScreen() {
  const [backpacks, setBackpacks] = useState<Backpack[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingBackpack, setDeletingBackpack] = useState<string | null>(null);

  const loadBackpacksData = async () => {
    try {
      const data = await loadBackpacks();
      setBackpacks(data);
    } catch (error) {
      console.error('Erreur lors du chargement des sacs à dos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Recharger les données à chaque fois que la page devient active
  useFocusEffect(
    React.useCallback(() => {
      loadBackpacksData();
    }, [])
  );

  const handleCreateBackpack = () => {
    router.push('/backpacks/create');
  };

  const handleBackpackPress = (backpack: Backpack) => {
    router.push({
      pathname: '/backpacks/[id]',
      params: { id: backpack.id }
    });
  };

  const handleDeleteBackpack = async (backpack: Backpack) => {
    console.log('handleDeleteBackpack appelé pour:', backpack.nom, 'backpackId:', backpack.id);
    
    // Si c'est le premier clic, activer le mode suppression
    if (deletingBackpack !== backpack.id) {
      setDeletingBackpack(backpack.id);
      // Reset après 3 secondes
      setTimeout(() => setDeletingBackpack(null), 3000);
      return;
    }
    
    // Deuxième clic - confirmer la suppression
    setDeletingBackpack(null);
    console.log('Utilisateur a confirmé la suppression du sac à dos');
    try {
      console.log('Suppression du sac à dos:', backpack.id);
      await deleteBackpack(backpack.id);
      console.log('Sac à dos supprimé avec succès');
      await loadBackpacksData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Alert.alert('Erreur', 'Impossible de supprimer le sac à dos');
    }
  };

  const renderBackpackItem = ({ item }: { item: Backpack }) => {
    const stats = getBackpackStats(item);
    const capacityPercentage = (stats.totalWeight / stats.maxWeight) * 100;
    
    return (
      <TouchableOpacity 
        style={styles.backpackCard}
        onPress={() => handleBackpackPress(item)}
      >
        <View style={styles.backpackHeader}>
          <View style={styles.backpackIcon}>
            <Package size={24} color="#F59E0B" />
          </View>
          <View style={styles.backpackInfo}>
            <Text style={styles.backpackName}>{item.nom}</Text>
            {item.proprietaire && (
              <View style={styles.ownerContainer}>
                <User size={12} color="#6B7280" />
                <Text style={styles.ownerText}>{item.proprietaire}</Text>
              </View>
            )}
            {item.description && (
              <Text style={styles.backpackDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
          <TouchableOpacity 
            style={[
              styles.deleteButton,
              deletingBackpack === item.id && styles.deleteButtonActive
            ]}
            onPress={() => handleDeleteBackpack(item)}
          >
            <Trash2 size={16} color={deletingBackpack === item.id ? "#FFFFFF" : "#EF4444"} />
          </TouchableOpacity>
        </View>

        <View style={styles.backpackStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Objets</Text>
            <Text style={styles.statValue}>{stats.totalItems}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Poids</Text>
            <Text style={styles.statValue}>
              {stats.totalWeight.toFixed(1)}/{stats.maxWeight} kg
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Capacité</Text>
            <Text style={[
              styles.statValue, 
              capacityPercentage > 80 ? styles.statValueWarning : null
            ]}>
              {capacityPercentage.toFixed(0)}%
            </Text>
          </View>
        </View>

        <View style={styles.capacityBar}>
          <View 
            style={[
              styles.capacityFill, 
              { width: `${Math.min(capacityPercentage, 100)}%` },
              capacityPercentage > 80 ? styles.capacityFillWarning : null
            ]} 
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Chargement des sacs à dos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image 
            source={require('../../assets/images/LogoMjPantoufles.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Sacs à dos</Text>
            <Text style={styles.subtitle}>
              Gérez les équipements de vos personnages
          </Text>
        </View>
        </View>
      </View>

      {backpacks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Package size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Aucun sac à dos</Text>
          <Text style={styles.emptyDescription}>
            Créez votre premier sac à dos pour organiser les équipements de vos personnages
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateBackpack}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Créer un sac à dos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={backpacks}
            renderItem={renderBackpackItem}
            keyExtractor={(item) => item.id}
            style={styles.backpacksList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.backpacksListContent}
          />
          
          <TouchableOpacity 
            style={styles.fab}
            onPress={handleCreateBackpack}
          >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
        </>
      )}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backpacksList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backpacksListContent: {
    paddingBottom: 100,
  },
  backpackCard: {
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
  backpackHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  backpackIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backpackInfo: {
    flex: 1,
  },
  backpackName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ownerText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  backpackDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonActive: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },
  backpackStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statValueWarning: {
    color: '#EF4444',
  },
  capacityBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  capacityFillWarning: {
    backgroundColor: '#EF4444',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});