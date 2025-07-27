import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Star, Shield, Zap } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getMagicItemByName, openMagicItemUrl, MagicItem, isValidDisplayString } from '../../utils/magicItemsService';

export default function MagicItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [magicItem, setMagicItem] = useState<MagicItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMagicItem = async () => {
      try {
        setLoading(true);
        const item = await getMagicItemByName(decodeURIComponent(id));
        if (item) {
          setMagicItem(item);
        } else {
          Alert.alert('Erreur', 'Objet magique non trouvé');
          router.back();
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'objet magique:', error);
        Alert.alert('Erreur', 'Impossible de charger l\'objet magique');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadMagicItem();
    }
  }, [id]);

  const handleOpenUrl = async () => {
    if (magicItem?.url) {
      await openMagicItemUrl(magicItem.url);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'commun':
        return '#6B7280';
      case 'peu commun':
        return '#10B981';
      case 'rare':
        return '#3B82F6';
      case 'très rare':
        return '#8B5CF6';
      case 'légendaire':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'anneau':
        return '#8B5CF6';
      case 'baguette':
        return '#F59E0B';
      case 'bâton':
        return '#10B981';
      case 'épée':
        return '#EF4444';
      case 'armure':
        return '#3B82F6';
      case 'bouclier':
        return '#8B5CF6';
      case 'objet merveilleux':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Chargement...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement de l'objet magique...</Text>
        </View>
      </View>
    );
  }

  if (!magicItem) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Objet non trouvé</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>L'objet magique demandé n'a pas été trouvé.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{magicItem.nom}</Text>
        <TouchableOpacity 
          style={styles.externalLinkButton}
          onPress={handleOpenUrl}
        >
          <ExternalLink size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Image de l'objet magique */}
        {magicItem.image_url && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: magicItem.image_url }}
              style={styles.magicItemImage}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Informations principales */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Type</Text>
              <View style={[styles.typeChip, { backgroundColor: getTypeColor(magicItem.type) }]}>
                <Text style={styles.typeChipText}>{magicItem.type}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Rareté</Text>
              <View style={[styles.rarityChip, { backgroundColor: getRarityColor(magicItem.rarete) }]}>
                <Text style={styles.rarityChipText}>{magicItem.rarete}</Text>
              </View>
            </View>
          </View>

          {/* Lien magique */}
          {magicItem.lien_magique && (
            <View style={styles.magicLinkContainer}>
              <Zap size={16} color="#F59E0B" />
              <Text style={styles.magicLinkText}>Lien magique requis</Text>
            </View>
          )}

          {/* Source */}
          <View style={styles.sourceContainer}>
            <Text style={styles.sourceLabel}>Source :</Text>
            <Text style={styles.sourceText}>{magicItem.source}</Text>
          </View>
        </View>

        {/* Description complète ou courte */}
        {isValidDisplayString(magicItem.description_longue) ? (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description complète</Text>
            <Text style={styles.descriptionText}>{magicItem.description_longue}</Text>
          </View>
        ) : isValidDisplayString(magicItem.description_courte) && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{magicItem.description_courte}</Text>
          </View>
        )}

        {/* Bouton pour plus d'informations */}
        <View style={styles.moreInfoSection}>
          <TouchableOpacity 
            style={styles.moreInfoButton}
            onPress={handleOpenUrl}
          >
            <ExternalLink size={16} color="#3B82F6" />
            <Text style={styles.moreInfoText}>Voir plus d'informations sur AideDD</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  externalLinkButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  magicItemImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
  },
  typeChipText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  rarityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
  },
  rarityChipText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  magicLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  magicLinkText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 8,
    fontWeight: '500',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginRight: 8,
  },
  sourceText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  descriptionSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  moreInfoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  moreInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  moreInfoText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
    marginLeft: 8,
  },
}); 