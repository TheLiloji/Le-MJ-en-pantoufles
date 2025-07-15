import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BookOpen, Users, Dice1, Sword, Map, Shield, Zap, Heart, Target, Scroll, Gem, Crown, Star, Flame, Droplets, Leaf, Mountain, Eye, Brain, Skull, Sparkles, Book, Hammer, Cross, Shield as ShieldIcon, ArrowLeft, ArrowRight, FileText, FolderOpen } from 'lucide-react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { getMainSections, getSubsections, hasSubsections } from '../../utils/sectionHierarchy';
import { markdownContent } from '../../assets/markdownContent';

export default function GrimoireScreen() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showSubsections, setShowSubsections] = useState(false);
  const mainSections = getMainSections();

  const handleSectionPress = (section: any) => {
    if (section.hasSubsections) {
      // Si c'est la même section, fermer la sélection
      if (selectedSection === section.id) {
        setSelectedSection(null);
        setShowSubsections(false);
      } else {
        // Sinon, ouvrir cette section
        setSelectedSection(section.id);
        setShowSubsections(false);
      }
    } else {
      // Section sans sous-sections, aller directement au contenu
      router.push(`/section/${section.id}`);
    }
  };

  const handleSubsectionPress = (subsectionId: string) => {
    router.push(`/section/${subsectionId}`);
  };

  const handleMainContentPress = (sectionId: string) => {
    router.push(`/section/${sectionId}`);
  };

  const handleSubsectionsPress = (sectionId: string) => {
    setShowSubsections(true);
  };

  // Vérifier si une section a du contenu principal
  const hasMainContent = (sectionId: string) => {
    return markdownContent[sectionId] !== undefined;
  };

  const getIcon = (iconType: string, color: string) => {
    const iconProps = { size: 24, color };
    switch (iconType) {
      case 'users':
        return <Users {...iconProps} />;
      case 'sword':
        return <Sword {...iconProps} />;
      case 'dice':
        return <Dice1 {...iconProps} />;
      case 'map':
        return <Map {...iconProps} />;
      case 'shield':
        return <ShieldIcon {...iconProps} />;
      case 'zap':
        return <Zap {...iconProps} />;
      case 'heart':
        return <Heart {...iconProps} />;
      case 'target':
        return <Target {...iconProps} />;
      case 'scroll':
        return <Scroll {...iconProps} />;
      case 'gem':
        return <Gem {...iconProps} />;
      case 'crown':
        return <Crown {...iconProps} />;
      case 'star':
        return <Star {...iconProps} />;
      case 'flame':
        return <Flame {...iconProps} />;
      case 'droplets':
        return <Droplets {...iconProps} />;
      case 'leaf':
        return <Leaf {...iconProps} />;
      case 'mountain':
        return <Mountain {...iconProps} />;
      case 'eye':
        return <Eye {...iconProps} />;
      case 'brain':
        return <Brain {...iconProps} />;
      case 'skull':
        return <Skull {...iconProps} />;
      case 'sparkles':
        return <Sparkles {...iconProps} />;
      case 'book':
        return <Book {...iconProps} />;
      case 'hammer':
        return <Hammer {...iconProps} />;
      case 'cross':
        return <Cross {...iconProps} />;
      default:
        return <BookOpen {...iconProps} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Grimoire D&D</Text>
        <Text style={styles.subtitle}>Référence complète en français</Text>
      </View>

      <View style={styles.welcomeCard}>
        <BookOpen size={32} color="#6B46C1" />
        <Text style={styles.welcomeTitle}>Bienvenue dans votre grimoire</Text>
        <Text style={styles.welcomeText}>
          Toutes les règles, races, classes et sorts de D&D 5e traduits et optimisés pour les joueurs français.
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Ressources Disponibles</Text>
        
        {mainSections.map((section) => (
          <View key={section.id}>
            {/* Section principale */}
            <TouchableOpacity 
              style={[
                styles.resourceCard, 
                selectedSection === section.id && styles.selectedCard
              ]} 
              onPress={() => handleSectionPress(section)}
            >
              <View style={[styles.iconContainer, { backgroundColor: section.color }]}>
                {getIcon(section.icon, '#FFFFFF')}
            </View>
            <View style={styles.resourceContent}>
              <View style={styles.resourceHeader}>
                  <Text style={styles.resourceTitle}>{section.title}</Text>
                  <View style={styles.resourceMeta}>
                    <Text style={styles.resourceCount}>{section.count}</Text>
                    {section.hasSubsections && (
                      <View style={styles.subsectionsBadge}>
                        <Text style={styles.subsectionsText}>
                          {selectedSection === section.id ? 'Fermer' : 'Ouvrir'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.resourceDescription}>{section.description}</Text>
                {section.hasSubsections && (
                  <View style={styles.expandIcon}>
                    {selectedSection === section.id ? (
                      <ArrowLeft size={16} color="#6B7280" />
                    ) : (
                      <ArrowRight size={16} color="#6B7280" />
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Options pour les sections avec sous-sections ET contenu principal */}
            {selectedSection === section.id && section.hasSubsections && hasMainContent(section.id) && !showSubsections && (
              <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={styles.optionCard}
                  onPress={() => handleMainContentPress(section.id)}
                >
                  <FileText size={20} color="#3B82F6" />
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Contenu Principal</Text>
                    <Text style={styles.optionDescription}>
                      Voir le contenu général de cette section
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.optionCard}
                  onPress={() => handleSubsectionsPress(section.id)}
                >
                  <FolderOpen size={20} color="#8B5CF6" />
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Sous-sections</Text>
                    <Text style={styles.optionDescription}>
                      Voir toutes les sous-sections disponibles
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Sous-sections (si la section est sélectionnée et qu'on veut voir les sous-sections) */}
            {selectedSection === section.id && section.hasSubsections && showSubsections && (
              <View style={styles.subsectionsContainer}>
                {getSubsections(section.id).map((subsection) => (
                  <TouchableOpacity 
                    key={subsection.id} 
                    style={styles.subsectionCard} 
                    onPress={() => handleSubsectionPress(subsection.id)}
                  >
                    <View style={styles.subsectionContent}>
                      <Text style={styles.subsectionTitle}>{subsection.title}</Text>
                      <Text style={styles.subsectionDescription}>
                        Cliquez pour voir le contenu détaillé
                      </Text>
                    </View>
                    <View style={styles.arrowContainer}>
                      <Text style={styles.arrow}>→</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Sous-sections directes (si pas de contenu principal) */}
            {selectedSection === section.id && section.hasSubsections && !hasMainContent(section.id) && (
              <View style={styles.subsectionsContainer}>
                {getSubsections(section.id).map((subsection) => (
                  <TouchableOpacity 
                    key={subsection.id} 
                    style={styles.subsectionCard} 
                    onPress={() => handleSubsectionPress(subsection.id)}
                  >
                    <View style={styles.subsectionContent}>
                      <Text style={styles.subsectionTitle}>{subsection.title}</Text>
                      <Text style={styles.subsectionDescription}>
                        Cliquez pour voir le contenu détaillé
                      </Text>
                    </View>
                    <View style={styles.arrowContainer}>
                      <Text style={styles.arrow}>→</Text>
            </View>
          </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Conseil de MJ</Text>
          <Text style={styles.tipsText}>
            Utilisez les suggestions automatiques lors de la création de personnage pour découvrir de nouvelles combinaisons race/classe intéressantes !
          </Text>
        </View>

        <View style={styles.futureCard}>
          <Text style={styles.futureTitle}>🚀 Bientôt Disponible</Text>
          <Text style={styles.futureText}>
            • Extension Chrome pour Roll20{'\n'}
            • Import/Export de personnages{'\n'}
            • Mode campagne multi-joueurs{'\n'}
            • Générateur de donjons
          </Text>
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
    backgroundColor: '#10B981',
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
    color: '#D1FAE5',
    textAlign: 'center',
    marginTop: 8,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 24,
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
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  resourceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    flexDirection: 'row',
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
  selectedCard: {
    backgroundColor: '#F0F9FF',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resourceContent: {
    flex: 1,
    position: 'relative',
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  resourceMeta: {
    alignItems: 'flex-end',
  },
  resourceCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  subsectionsBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subsectionsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resourceDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  expandIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  optionsContainer: {
    marginLeft: 20,
    marginBottom: 8,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  subsectionsContainer: {
    marginLeft: 20,
    marginBottom: 8,
  },
  subsectionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#E5E7EB',
  },
  subsectionContent: {
    flex: 1,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  subsectionDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  arrowContainer: {
    marginLeft: 12,
  },
  arrow: {
    fontSize: 16,
    color: '#6B7280',
  },
  tipsCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  futureCard: {
    backgroundColor: '#EDE9FE',
    borderRadius: 16,
    padding: 20,
    marginBottom: 100,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  futureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5B21B6',
    marginBottom: 8,
  },
  futureText: {
    fontSize: 14,
    color: '#6B21A8',
    lineHeight: 20,
  },
});