import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Package, Sword, Shield, Gem, Plus } from 'lucide-react-native';

export default function EquipmentScreen() {
  const [inventory, setInventory] = useState([
    {
      id: 1,
      name: 'Épée Longue +1',
      type: 'Arme',
      rarity: 'Peu commune',
      quantity: 1,
      description: 'Une épée longue enchantée qui brille faiblement.',
      icon: 'sword',
    },
    {
      id: 2,
      name: 'Armure de Cuir Clouté',
      type: 'Armure',
      rarity: 'Commune',
      quantity: 1,
      description: 'Armure légère renforcée de clous métalliques.',
      icon: 'shield',
    },
    {
      id: 3,
      name: 'Potion de Soins',
      type: 'Consommable',
      rarity: 'Commune',
      quantity: 3,
      description: 'Rend 2d4+2 points de vie.',
      icon: 'gem',
    },
  ]);

  const rarityColors = {
    'Commune': '#6B7280',
    'Peu commune': '#10B981',
    'Rare': '#3B82F6',
    'Très rare': '#8B5CF6',
    'Légendaire': '#F59E0B',
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Équipement & Objets</Text>
        <Text style={styles.subtitle}>Votre inventaire d'aventurier</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{inventory.length}</Text>
          <Text style={styles.statLabel}>Objets</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {inventory.reduce((sum, item) => sum + item.quantity, 0)}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>15</Text>
          <Text style={styles.statLabel}>Poids (kg)</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {inventory.map((item) => (
          <TouchableOpacity key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.itemIcon}>
                {getIcon(item.icon)}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemType}>{item.type}</Text>
              </View>
              <View style={styles.itemMeta}>
                <View style={[styles.rarityBadge, { backgroundColor: rarityColors[item.rarity] }]}>
                  <Text style={styles.rarityText}>{item.rarity}</Text>
                </View>
                <Text style={styles.quantityText}>x{item.quantity}</Text>
              </View>
            </View>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Ajouter un Objet</Text>
        </TouchableOpacity>
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
    backgroundColor: '#F59E0B',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemMeta: {
    alignItems: 'flex-end',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  itemDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 100,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});