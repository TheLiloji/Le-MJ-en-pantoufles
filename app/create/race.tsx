import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Eye, Zap } from 'lucide-react-native';
import racesData from '@/data/races.json';

export default function RaceSelection() {
  const [selectedRace, setSelectedRace] = useState(null);
  const [selectedSubRace, setSelectedSubRace] = useState(null);

  const handleNext = () => {
    if (selectedRace) {
      // Sauvegarder la sélection dans le contexte global
      router.push('/create/class');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.stepNumber}>Étape 1/9</Text>
          <Text style={styles.title}>Choisir une Race</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Races Disponibles</Text>
        
        {racesData.map((race) => (
          <TouchableOpacity
            key={race.id}
            style={[
              styles.raceCard,
              selectedRace?.id === race.id && styles.selectedCard
            ]}
            onPress={() => {
              setSelectedRace(race);
              setSelectedSubRace(null);
            }}
          >
            <View style={styles.raceHeader}>
              <Text style={styles.raceName}>{race.name}</Text>
              <View style={styles.speedBadge}>
                <Text style={styles.speedText}>{race.speed}m</Text>
              </View>
            </View>
            
            <Text style={styles.raceDescription}>{race.description}</Text>
            
            <View style={styles.traitsContainer}>
              {race.traits.slice(0, 2).map((trait, index) => (
                <View key={index} style={styles.traitBadge}>
                  <Eye size={12} color="#6B46C1" />
                  <Text style={styles.traitText}>{trait}</Text>
                </View>
              ))}
            </View>

            <View style={styles.bonusContainer}>
              <Text style={styles.bonusTitle}>Bonus de Caractéristiques:</Text>
              <View style={styles.bonusRow}>
                {Object.entries(race.abilityBonus).map(([ability, bonus]) => (
                  <View key={ability} style={styles.bonusItem}>
                    <Text style={styles.bonusAbility}>
                      {ability === 'strength' ? 'FOR' :
                       ability === 'dexterity' ? 'DEX' :
                       ability === 'constitution' ? 'CON' :
                       ability === 'intelligence' ? 'INT' :
                       ability === 'wisdom' ? 'SAG' : 'CHA'}
                    </Text>
                    <Text style={styles.bonusValue}>+{bonus}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {selectedRace && selectedRace.subRaces.length > 0 && (
          <View style={styles.subRaceSection}>
            <Text style={styles.sectionTitle}>Sous-races de {selectedRace.name}</Text>
            
            {selectedRace.subRaces.map((subRace, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.subRaceCard,
                  selectedSubRace?.name === subRace.name && styles.selectedSubRace
                ]}
                onPress={() => setSelectedSubRace(subRace)}
              >
                <Text style={styles.subRaceName}>{subRace.name}</Text>
                
                <View style={styles.subRaceBonuses}>
                  {Object.entries(subRace.abilityBonus).map(([ability, bonus]) => (
                    <View key={ability} style={styles.subRaceBonus}>
                      <Text style={styles.subRaceBonusText}>
                        {ability === 'strength' ? 'FOR' :
                         ability === 'dexterity' ? 'DEX' :
                         ability === 'constitution' ? 'CON' :
                         ability === 'intelligence' ? 'INT' :
                         ability === 'wisdom' ? 'SAG' : 'CHA'} +{bonus}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.featuresContainer}>
                  {subRace.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureBadge}>
                      <Zap size={12} color="#F59E0B" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!selectedRace || (selectedRace.subRaces.length > 0 && !selectedSubRace)) && styles.disabledButton
          ]}
          onPress={handleNext}
          disabled={!selectedRace || (selectedRace.subRaces.length > 0 && !selectedSubRace)}
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
    backgroundColor: '#6B46C1',
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
    color: '#E0E7FF',
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
  raceCard: {
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
  },
  selectedCard: {
    borderColor: '#6B46C1',
    backgroundColor: '#F8FAFC',
  },
  raceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  raceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  speedBadge: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  speedText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  raceDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  traitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  traitText: {
    fontSize: 12,
    color: '#6B46C1',
    marginLeft: 4,
    fontWeight: '500',
  },
  bonusContainer: {
    marginTop: 8,
  },
  bonusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  bonusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bonusItem: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  bonusAbility: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  bonusValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subRaceSection: {
    marginTop: 20,
  },
  subRaceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedSubRace: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  subRaceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subRaceBonuses: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  subRaceBonus: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  subRaceBonusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400E',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  featureText: {
    fontSize: 11,
    color: '#92400E',
    marginLeft: 3,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nextButton: {
    backgroundColor: '#6B46C1',
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