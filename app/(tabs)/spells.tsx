import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, Trash2, Edit3, Zap } from 'lucide-react-native';
import { router } from 'expo-router';
import { loadGrimoires, Grimoire, deleteGrimoire } from '../../utils/grimoireService';

export default function SpellsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [grimoires, setGrimoires] = useState<Grimoire[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingGrimoire, setDeletingGrimoire] = useState<string | null>(null);

  useEffect(() => {
    loadGrimoiresData();
  }, []);

  const loadGrimoiresData = async () => {
    try {
      const data = await loadGrimoires();
      setGrimoires(data);
    } catch (error) {
      console.error('Erreur lors du chargement des grimoires:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGrimoires = grimoires.filter(grimoire =>
    grimoire.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (grimoire.description && grimoire.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateGrimoire = () => {
    router.push('/grimoires/create');
  };

  const handleGrimoirePress = (grimoire: Grimoire) => {
    router.push({
      pathname: '/grimoires/[id]',
      params: { id: grimoire.id }
    });
  };

  const handleDeleteGrimoire = async (grimoire: Grimoire) => {
    console.log('handleDeleteGrimoire appelé pour:', grimoire.nom, 'id:', grimoire.id);
    
    // Si c'est le premier clic, activer le mode suppression
    if (deletingGrimoire !== grimoire.id) {
      setDeletingGrimoire(grimoire.id);
      // Reset après 3 secondes
      setTimeout(() => setDeletingGrimoire(null), 3000);
      return;
    }
    
    // Deuxième clic - confirmer la suppression
    setDeletingGrimoire(null);
    console.log('Utilisateur a confirmé la suppression');
    try {
      console.log('Appel de deleteGrimoire avec id:', grimoire.id);
      await deleteGrimoire(grimoire.id);
      console.log('deleteGrimoire terminé avec succès');
      console.log('Rechargement des données...');
      await loadGrimoiresData();
      console.log('Données rechargées');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur: Impossible de supprimer le grimoire');
    }
  };

  const getTotalSpells = (grimoire: Grimoire): number => {
    return grimoire.sorts.length;
  };

  const getTotalSlots = (grimoire: Grimoire): number => {
    return Object.values(grimoire.emplacements).reduce((total, count) => total + count, 0);
  };

  const getUsedSlots = (grimoire: Grimoire): number => {
    return Object.values(grimoire.emplacementsUtilises).reduce((total, count) => total + count, 0);
  };

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
            <Text style={styles.title}>Grimoires</Text>
            <Text style={styles.subtitle}>Gérez vos grimoires de sorts</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un grimoire..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        
        <TouchableOpacity style={styles.addButton} onPress={handleCreateGrimoire}>
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Nouveau</Text>
        </TouchableOpacity>
      </View>

      {grimoires.length === 0 ? (
        <View style={styles.emptyState}>
          <BookOpen size={64} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>Aucun grimoire</Text>
          <Text style={styles.emptyStateSubtitle}>
            Créez votre premier grimoire pour organiser vos sorts
          </Text>
          <TouchableOpacity style={styles.emptyStateButton} onPress={handleCreateGrimoire}>
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.emptyStateButtonText}>Créer un grimoire</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {filteredGrimoires.map((grimoire) => (
            <TouchableOpacity key={grimoire.id} style={styles.grimoireCard} onPress={() => handleGrimoirePress(grimoire)}>
              <View style={styles.grimoireHeader}>
                <View style={styles.grimoireInfo}>
                  <Text style={styles.grimoireName}>{grimoire.nom}</Text>
                  {grimoire.description && (
                    <Text style={styles.grimoireDescription}>{grimoire.description}</Text>
                  )}
                </View>
                <TouchableOpacity 
                  style={[
                    styles.deleteButton, 
                    { 
                      padding: 8, 
                      backgroundColor: deletingGrimoire === grimoire.id ? '#EF4444' : '#FEE2E2', 
                      borderRadius: 6 
                    }
                  ]}
                  onPress={(e) => {
                    e.stopPropagation(); // Empêcher la navigation
                    console.log('Bouton delete grimoire cliqué pour:', grimoire.nom);
                    handleDeleteGrimoire(grimoire);
                  }}
                >
                  <Trash2 size={16} color={deletingGrimoire === grimoire.id ? "#FFFFFF" : "#EF4444"} />
                </TouchableOpacity>
              </View>

              <View style={styles.grimoireStats}>
                <View style={styles.statItem}>
                  <BookOpen size={16} color="#6B7280" />
                  <Text style={styles.statText}>{getTotalSpells(grimoire)} sorts</Text>
                </View>
                <View style={styles.statItem}>
                  <Zap size={16} color="#6B7280" />
                  <Text style={styles.statText}>
                    {getUsedSlots(grimoire)}/{getTotalSlots(grimoire)} emplacements
                  </Text>
                </View>
              </View>

              <View style={styles.grimoireFooter}>
                <Text style={styles.dateText}>
                  Créé le {new Date(grimoire.dateCreation).toLocaleDateString('fr-FR')}
                </Text>
                <Text style={styles.dateText}>
                  Modifié le {new Date(grimoire.dateModification).toLocaleDateString('fr-FR')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    backgroundColor: '#DC2626',
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
    color: '#FEE2E2',
    textAlign: 'center',
    marginTop: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 20,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  grimoireCard: {
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
  grimoireHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  grimoireInfo: {
    flex: 1,
  },
  grimoireName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  grimoireDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  grimoireStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  statText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 6,
    fontWeight: '500',
  },
  grimoireFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});