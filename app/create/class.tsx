import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Heart, Shield, Zap } from 'lucide-react-native';
import classesData from '@/data/classes.json';

export default function ClassSelection() {
  const [selectedClass, setSelectedClass] = useState(null);

  const handleNext = () => {
    if (selectedClass) {
      router.push('/create/background');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getClassIcon = (classId: string) => {
    switch (classId) {
      case 'wizard':
        return <Zap size={24} color="#8B5CF6" />;
      case 'fighter':
        return <Shield size={24} color="#DC2626" />;
      case 'rogue':
        return <Heart size={24} color="#059669" />;
      default:
        return <Shield size={24} color="#6B7280" />;
    }
  };

  const getClassColor = (classId: string) => {
    switch (classId) {
      case 'wizard':
        return '#8B5CF6';
      case 'fighter':
        return '#DC2626';
      case 'rogue':
        return '#059669';
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
          <Text style={styles.stepNumber}>Étape 2/9</Text>
          <Text style={styles.title}>Choisir une Classe</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Classes Disponibles</Text>
        
        {classesData.map((characterClass) => (
          <TouchableOpacity
            key={characterClass.id}
            style={[
              styles.classCard,
              selectedClass?.id === characterClass.id && styles.selectedCard,
              { borderLeftColor: getClassColor(characterClass.id) }
            ]}
            onPress={() => setSelectedClass(characterClass)}
          >
            <View style={styles.classHeader}>
              <View style={styles.classIconContainer}>
                {getClassIcon(characterClass.id)}
              </View>
              <View style={styles.classInfo}>
                <Text style={styles.className}>{characterClass.name}</Text>
                <Text style={styles.classDescription}>{characterClass.description}</Text>
              </View>
              <View style={styles.hitDieContainer}>
                <Text style={styles.hitDieLabel}>DV</Text>
                <Text style={styles.hitDieValue}>d{characterClass.hitDie}</Text>
              </View>
            </View>

            <View style={styles.primaryAbilities}>
              <Text style={styles.sectionLabel}>Caractéristiques Principales:</Text>
              <View style={styles.abilitiesRow}>
                {characterClass.primaryAbility.map((ability, index) => (
                  <View key={index} style={styles.abilityBadge}>
                    <Text style={styles.abilityText}>
                      {ability === 'Force' ? 'FOR' :
                       ability === 'Dextérité' ? 'DEX' :
                       ability === 'Constitution' ? 'CON' :
                       ability === 'Intelligence' ? 'INT' :
                       ability === 'Sagesse' ? 'SAG' : 'CHA'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.savingThrows}>
              <Text style={styles.sectionLabel}>Jets de Sauvegarde:</Text>
              <View style={styles.savesRow}>
                {characterClass.savingThrows.map((save, index) => (
                  <View key={index} style={styles.saveBadge}>
                    <Text style={styles.saveText}>
                      {save === 'Force' ? 'FOR' :
                       save === 'Dextérité' ? 'DEX' :
                       save === 'Constitution' ? 'CON' :
                       save === 'Intelligence' ? 'INT' :
                       save === 'Sagesse' ? 'SAG' : 'CHA'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.skillsInfo}>
              <Text style={styles.sectionLabel}>
                Compétences: {characterClass.skillsCount} au choix parmi {characterClass.availableSkills.length}
              </Text>
            </View>

            {characterClass.spellcasting && (
              <View style={styles.spellcastingInfo}>
                <View style={styles.spellcastingBadge}>
                  <Zap size={16} color="#8B5CF6" />
                  <Text style={styles.spellcastingText}>
                    Lanceur de sorts ({characterClass.spellcasting.ability})
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.featuresPreview}>
              <Text style={styles.sectionLabel}>Capacités de niveau 1:</Text>
              {characterClass.features.filter(f => f.level === 1).map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureName}>{feature.name}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}

        {selectedClass && (
          <View style={styles.autoCalculations}>
            <Text style={styles.autoTitle}>🎯 Calculs Automatiques</Text>
            <View style={styles.autoItem}>
              <Text style={styles.autoLabel}>Points de Vie de départ:</Text>
              <Text style={styles.autoValue}>{selectedClass.hitDie} + modificateur de Constitution</Text>
            </View>
            <View style={styles.autoItem}>
              <Text style={styles.autoLabel}>Bonus de maîtrise:</Text>
              <Text style={styles.autoValue}>+2 (niveau 1)</Text>
            </View>
            <View style={styles.autoItem}>
              <Text style={styles.autoLabel}>Compétences à choisir:</Text>
              <Text style={styles.autoValue}>{selectedClass.skillsCount} compétences</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedClass && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={!selectedClass}
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
    backgroundColor: '#DC2626',
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
    color: '#FEE2E2',
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
  classCard: {
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
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  classIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  classDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  hitDieContainer: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  hitDieLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  hitDieValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  primaryAbilities: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  abilitiesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  abilityBadge: {
    backgroundColor: '#EDE9FE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  abilityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B46C1',
  },
  savingThrows: {
    marginBottom: 12,
  },
  savesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  saveBadge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  saveText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },
  skillsInfo: {
    marginBottom: 12,
  },
  spellcastingInfo: {
    marginBottom: 12,
  },
  spellcastingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  spellcastingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 6,
  },
  featuresPreview: {
    marginTop: 8,
  },
  featureItem: {
    marginBottom: 8,
  },
  featureName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  autoLabel: {
    fontSize: 14,
    color: '#047857',
    flex: 1,
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
    backgroundColor: '#DC2626',
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