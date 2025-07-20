import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Zap, Clock, Target, BookOpen, Users, Tag } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { loadGrimoires, Grimoire, GrimoireSpell } from '../../../../utils/grimoireService';
import { isValidDisplayString } from '../../../../utils/spellsService';

export default function SpellDetailScreen() {
  const { id, spellId } = useLocalSearchParams<{ id: string; spellId: string }>();
  const [grimoire, setGrimoire] = useState<Grimoire | null>(null);
  const [spell, setSpell] = useState<GrimoireSpell | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpellData();
  }, [id, spellId]);

  const loadSpellData = async () => {
    try {
      const grimoires = await loadGrimoires();
      const foundGrimoire = grimoires.find(g => g.id === id);
      if (foundGrimoire) {
        setGrimoire(foundGrimoire);
        const foundSpell = foundGrimoire.sorts.find(s => s.spellId === spellId);
        if (foundSpell) {
          setSpell(foundSpell);
        } else {
          Alert.alert('Erreur', 'Sort non trouvé');
          router.back();
        }
      } else {
        Alert.alert('Erreur', 'Grimoire non trouvé');
        router.back();
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger le sort');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLink = async () => {
    if (spell?.url) {
      try {
        await Linking.openURL(spell.url);
      } catch (error) {
        Alert.alert('Erreur', 'Impossible d\'ouvrir le lien');
      }
    }
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

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!spell) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Sort non trouvé</Text>
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
        <View style={styles.headerContent}>
          <Text style={styles.title}>{spell.nom}</Text>
          <View style={styles.headerBadges}>
            <View style={[styles.levelBadge, { backgroundColor: levelColors[spell.niveau as keyof typeof levelColors] || '#6B7280' }]}>
              <Text style={styles.levelText}>Niveau {spell.niveau}</Text>
            </View>
            <View style={styles.schoolBadge}>
              <Text style={styles.schoolText}>{spell.ecole}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                 {/* Description */}
         {isValidDisplayString(spell.description) && (
           <View style={styles.section}>
             <Text style={styles.sectionTitle}>Description</Text>
             <View style={styles.descriptionCard}>
               <Text style={styles.descriptionText}>{spell.description.trim()}</Text>
             </View>
           </View>
         )}

                 {/* Détails techniques */}
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>Détails techniques</Text>
           <View style={styles.detailsCard}>
             {isValidDisplayString(spell.temps_incantation) && (
               <View style={styles.detailRow}>
                 <View style={styles.detailIcon}>
                   <Clock size={20} color="#6B7280" />
                 </View>
                 <View style={styles.detailContent}>
                   <Text style={styles.detailLabel}>Temps d'incantation</Text>
                   <Text style={styles.detailValue}>{spell.temps_incantation.trim()}</Text>
                 </View>
               </View>
             )}

             {isValidDisplayString(spell.portee) && (
               <View style={styles.detailRow}>
                 <View style={styles.detailIcon}>
                   <Target size={20} color="#6B7280" />
                 </View>
                 <View style={styles.detailContent}>
                   <Text style={styles.detailLabel}>Portée</Text>
                   <Text style={styles.detailValue}>{spell.portee.trim()}</Text>
                 </View>
               </View>
             )}

             {isValidDisplayString(spell.composantes) && (
               <View style={styles.detailRow}>
                 <View style={styles.detailIcon}>
                   <Zap size={20} color="#6B7280" />
                 </View>
                 <View style={styles.detailContent}>
                   <Text style={styles.detailLabel}>Composantes</Text>
                   <Text style={styles.detailValue}>{spell.composantes.trim()}</Text>
                 </View>
               </View>
             )}
           </View>
         </View>

        {/* Classes */}
        {spell.classes && spell.classes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Classes qui peuvent lancer ce sort</Text>
            <View style={styles.classesCard}>
              <View style={styles.classesList}>
                {spell.classes.map((className, index) => (
                  <View key={index} style={styles.classChip}>
                    <Users size={16} color="#3730A3" />
                    <Text style={styles.classChipText}>{className}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

                 {/* Tags spéciaux */}
         {(isValidDisplayString(spell.concentration) || isValidDisplayString(spell.rituel)) && (
           <View style={styles.section}>
             <Text style={styles.sectionTitle}>Propriétés spéciales</Text>
             <View style={styles.tagsCard}>
               <View style={styles.tagsList}>
                 {isValidDisplayString(spell.concentration) && (
                   <View style={styles.tag}>
                     <Tag size={16} color="#92400E" />
                     <Text style={styles.tagText}>Concentration</Text>
                   </View>
                 )}
                 {isValidDisplayString(spell.rituel) && (
                   <View style={styles.tag}>
                     <BookOpen size={16} color="#92400E" />
                     <Text style={styles.tagText}>Rituel</Text>
                   </View>
                 )}
               </View>
             </View>
           </View>
         )}

        {/* Lien externe */}
        {spell.url && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plus d'informations</Text>
            <TouchableOpacity style={styles.linkCard} onPress={handleOpenLink}>
              <View style={styles.linkContent}>
                <ExternalLink size={20} color="#DC2626" />
                <Text style={styles.linkText}>Voir sur AideDD</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
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
  },
  backButton: {
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  schoolBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  schoolText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  descriptionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIcon: {
    width: 40,
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  classesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  classesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classChip: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  classChipText: {
    fontSize: 14,
    color: '#3730A3',
    fontWeight: '600',
    marginLeft: 6,
  },
  tagsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tagsList: {
    flexDirection: 'row',
    gap: 12,
  },
  tag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
    marginLeft: 6,
  },
  linkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 100,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 100,
  },
}); 