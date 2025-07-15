import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Users, Briefcase, Crown, Heart } from 'lucide-react-native';
import backgroundsData from '@/data/backgrounds.json';

export default function BackgroundSelection() {
  const [selectedBackground, setSelectedBackground] = useState(null);

  const handleNext = () => {
    if (selectedBackground) {
      router.push('/create/abilities');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getBackgroundIcon = (backgroundId: string) => {
    switch (backgroundId) {
      case 'soldier':
        return <Users size={24} color="#DC2626" />;
      case 'criminal':
        return <Briefcase size={24} color="#374151" />;
      case 'noble':
        return <Crown size={24} color="#F59E0B" />;
      case 'folk-hero':
        return <Heart size={24} color="#10B981" />;
      default:
        return <Users size={24} color="#6B7280" />;
    }
  };

  const getBackgroundColor = (backgroundId: string) => {
    switch (backgroundId) {
      case 'soldier':
        return '#DC2626';
      case 'criminal':
        return '#374151';
      case 'noble':
        return '#F59E0B';
      case 'folk-hero':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.stepNumber}>Étape 3/9</Text>
          <Text style={styles.title}>Choisir un Historique</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Historiques Disponibles</Text>
        
        {backgroundsData.map((background) => (
          <TouchableOpacity
            key={background.id}
            style={[
              styles.backgroundCard,
              selectedBackground?.id === background.id && styles.selectedCard,
              { borderLeftColor: getBackgroundColor(background.id) }
            ]}
            onPress={() => setSelectedBackground(background)}
          >
            <View style={styles.backgroundHeader}>
              <View style={styles.backgroundIconContainer}>
                {getBackgroundIcon(background.id)}
              </View>
              <View style={styles.backgroundInfo}>
                <Text style={styles.backgroundName}>{background.name}</Text>
                <Text style={styles.backgroundDescription}>{background.description}</Text>
              </View>
            </View>

            <View style={styles.skillsSection}>
              <Text style={styles.sectionLabel}>Compétences Maîtrisées:</Text>
              <View style={styles.skillsRow}>
                {background.skillProficiencies.map((skill, index) => (
                  <View key={index} style={styles.skillBadge}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.toolsSection}>
              <Text style={styles.sectionLabel}>Outils & Langues:</Text>
              <View style={styles.toolsRow}>
                {background.toolProficiencies.map((tool, index) => (
                  <View key={index} style={styles.toolBadge}>
                    <Text style={styles.toolText}>{tool}</Text>
                  </View>
                ))}
                {background.languages > 0 && (
                  <View style={styles.languageBadge}>
                    <Text style={styles.languageText}>
                      {background.languages} langue{background.languages > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.equipmentSection}>
              <Text style={styles.sectionLabel}>Équipement de départ:</Text>
              <View style={styles.equipmentList}>
                {background.equipment.slice(0, 3).map((item, index) => (
                  <Text key={index} style={styles.equipmentItem}>• {item}</Text>
                ))}
                {background.equipment.length > 3 && (
                  <Text style={styles.equipmentMore}>
                    +{background.equipment.length - 3} autres objets
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.featureSection}>
              <Text style={styles.featureName}>{background.feature.name}</Text>
              <Text style={styles.featureDescription}>{background.feature.description}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {selectedBackground && (
          <View style={styles.autoCalculations}>
            <Text style={styles.autoTitle}>🎯 Ajouts Automatiques</Text>
            <View style={styles.autoItem}>
              <Text style={styles.autoLabel}>Compétences ajoutées:</Text>
              <Text style={styles.autoValue}>
                {selectedBackground.skillProficiencies.join(', ')}
              </Text>
            </View>
            <View style={styles.autoItem}>
              <Text style={styles.autoLabel}>Outils maîtrisés:</Text>
              <Text style={styles.autoValue}>
                {selectedBackground.toolProficiencies.join(', ')}
              </Text>
            </View>
            <View style={styles.autoItem}>
              <Text style={styles.autoLabel}>Équipement:</Text>
              <Text style={styles.autoValue}>
                {selectedBackground.equipment.length} objets ajoutés
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedBackground && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={!selectedBackground}
        >
          <Text style={styles.nextButtonText}>Continuer</Text>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  stepNumber: {
    fontSize: 14,
    color: '#FEF3C7',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  backgroundCard: {
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
    borderWidth: 2,
    borderColor: 'transparent',
    borderLeftWidth: 4,
  },
  selectedCard: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  backgroundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backgroundIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backgroundInfo: {
    flex: 1,
  },
  backgroundName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  backgroundDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  skillsSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillBadge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  skillText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },
  toolsSection: {
    marginBottom: 12,
  },
  toolsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  toolBadge: {
    backgroundColor: '#F3E8FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  toolText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  languageBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  languageText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
  },
  equipmentSection: {
    marginBottom: 12,
  },
  equipmentList: {
    gap: 2,
  },
  equipmentItem: {
    fontSize: 12,
    color: '#4B5563',
  },
  equipmentMore: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  featureSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  featureName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  autoCalculations: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  autoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 12,
  },
  autoItem: {
    marginBottom: 8,
  },
  autoLabel: {
    fontSize: 12,
    color: '#047857',
    marginBottom: 2,
  },
  autoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nextButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
});