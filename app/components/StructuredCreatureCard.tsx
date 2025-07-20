import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface StructuredCreatureData {
  type: string;
  size: string;
  alignment: string;
  challenge: string;
  hitDiceCount: number;
  abilityScores: {
    for: number;
    dex: number;
    con: number;
    int: number;
    sag: number;
    cha: number;
  };
  savingThrows: string[];
  ac: {
    armorType: string;
    value: number;
  };
  skills: Array<{
    name: string;
    invalid: boolean;
    value: number;
  }>;
  movement: {
    walk: number;
  };
  senses: {
    darkvision: number;
    customPassivePerception: number;
  };
  damageTypeVulnerabilities: string[];
  damageTypeResistances: string[];
  damageTypeImmunities: string[];
  languages: string[];
  telepathy: number;
  environments: string[];
  dungeonTypes: string[];
  source: string;
  source_page: number;
}

interface StructuredCreatureCardProps {
  creature: StructuredCreatureData;
  name: string;
}

export default function StructuredCreatureCard({ creature, name }: StructuredCreatureCardProps) {
  const getModifier = (score: number) => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>
            {creature.type} de taille {creature.size}, {creature.alignment}
          </Text>
        </View>

        {/* Statistiques principales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Puissance</Text>
              <Text style={styles.statValue}>{creature.challenge}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Dés de vie</Text>
              <Text style={styles.statValue}>{creature.hitDiceCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>CA</Text>
              <Text style={styles.statValue}>{creature.ac.value}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Armure</Text>
              <Text style={styles.statValue}>{creature.ac.armorType}</Text>
            </View>
          </View>
        </View>

        {/* Caractéristiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Caractéristiques</Text>
          <View style={styles.characteristicsGrid}>
            <View style={styles.characteristicItem}>
              <Text style={styles.characteristicLabel}>FOR</Text>
              <Text style={styles.characteristicScore}>{creature.abilityScores.for}</Text>
              <Text style={styles.characteristicModifier}>{getModifier(creature.abilityScores.for)}</Text>
            </View>
            <View style={styles.characteristicItem}>
              <Text style={styles.characteristicLabel}>DEX</Text>
              <Text style={styles.characteristicScore}>{creature.abilityScores.dex}</Text>
              <Text style={styles.characteristicModifier}>{getModifier(creature.abilityScores.dex)}</Text>
            </View>
            <View style={styles.characteristicItem}>
              <Text style={styles.characteristicLabel}>CON</Text>
              <Text style={styles.characteristicScore}>{creature.abilityScores.con}</Text>
              <Text style={styles.characteristicModifier}>{getModifier(creature.abilityScores.con)}</Text>
            </View>
            <View style={styles.characteristicItem}>
              <Text style={styles.characteristicLabel}>INT</Text>
              <Text style={styles.characteristicScore}>{creature.abilityScores.int}</Text>
              <Text style={styles.characteristicModifier}>{getModifier(creature.abilityScores.int)}</Text>
            </View>
            <View style={styles.characteristicItem}>
              <Text style={styles.characteristicLabel}>SAG</Text>
              <Text style={styles.characteristicScore}>{creature.abilityScores.sag}</Text>
              <Text style={styles.characteristicModifier}>{getModifier(creature.abilityScores.sag)}</Text>
            </View>
            <View style={styles.characteristicItem}>
              <Text style={styles.characteristicLabel}>CHA</Text>
              <Text style={styles.characteristicScore}>{creature.abilityScores.cha}</Text>
              <Text style={styles.characteristicModifier}>{getModifier(creature.abilityScores.cha)}</Text>
            </View>
          </View>
        </View>

        {/* Jets de sauvegarde */}
        {creature.savingThrows.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Jets de sauvegarde</Text>
            <View style={styles.tagsContainer}>
              {creature.savingThrows.map((save, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{save}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Compétences */}
        {creature.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compétences</Text>
            <View style={styles.skillsContainer}>
              {creature.skills.map((skill, index) => (
                <View key={index} style={styles.skillItem}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillValue}>+{skill.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Mouvement et sens */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mouvement et sens</Text>
          <View style={styles.movementSensesGrid}>
            <View style={styles.movementSensesItem}>
              <Text style={styles.movementSensesLabel}>Vitesse</Text>
              <Text style={styles.movementSensesValue}>{creature.movement.walk} m</Text>
            </View>
            <View style={styles.movementSensesItem}>
              <Text style={styles.movementSensesLabel}>Vision dans le noir</Text>
              <Text style={styles.movementSensesValue}>{creature.senses.darkvision} m</Text>
            </View>
            <View style={styles.movementSensesItem}>
              <Text style={styles.movementSensesLabel}>Perception passive</Text>
              <Text style={styles.movementSensesValue}>{creature.senses.customPassivePerception}</Text>
            </View>
            {creature.telepathy > 0 && (
              <View style={styles.movementSensesItem}>
                <Text style={styles.movementSensesLabel}>Télépathie</Text>
                <Text style={styles.movementSensesValue}>{creature.telepathy} m</Text>
              </View>
            )}
          </View>
        </View>

        {/* Résistances et immunités */}
        {(creature.damageTypeVulnerabilities.length > 0 || 
          creature.damageTypeResistances.length > 0 || 
          creature.damageTypeImmunities.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résistances et immunités</Text>
            
            {creature.damageTypeVulnerabilities.length > 0 && (
              <View style={styles.resistanceGroup}>
                <Text style={styles.resistanceLabel}>Vulnérabilités</Text>
                <View style={styles.tagsContainer}>
                  {creature.damageTypeVulnerabilities.map((type, index) => (
                    <View key={index} style={[styles.tag, styles.vulnerabilityTag]}>
                      <Text style={styles.tagText}>{type}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {creature.damageTypeResistances.length > 0 && (
              <View style={styles.resistanceGroup}>
                <Text style={styles.resistanceLabel}>Résistances</Text>
                <View style={styles.tagsContainer}>
                  {creature.damageTypeResistances.map((type, index) => (
                    <View key={index} style={[styles.tag, styles.resistanceTag]}>
                      <Text style={styles.tagText}>{type}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {creature.damageTypeImmunities.length > 0 && (
              <View style={styles.resistanceGroup}>
                <Text style={styles.resistanceLabel}>Immunités</Text>
                <View style={styles.tagsContainer}>
                  {creature.damageTypeImmunities.map((type, index) => (
                    <View key={index} style={[styles.tag, styles.immunityTag]}>
                      <Text style={styles.tagText}>{type}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Langues */}
        {creature.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Langues</Text>
            <View style={styles.tagsContainer}>
              {creature.languages.map((language, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{language}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Environnements */}
        {(creature.environments.length > 0 || creature.dungeonTypes.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Environnements</Text>
            <View style={styles.tagsContainer}>
              {creature.environments.map((env, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{env}</Text>
                </View>
              ))}
              {creature.dungeonTypes.map((dungeon, index) => (
                <View key={`dungeon-${index}`} style={styles.tag}>
                  <Text style={styles.tagText}>{dungeon}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Source */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Source</Text>
          <Text style={styles.sourceText}>
            {creature.source} - Page {creature.source_page}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  card: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  characteristicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  characteristicItem: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 8,
  },
  characteristicLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  characteristicScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  characteristicModifier: {
    fontSize: 12,
    color: '#6B7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  vulnerabilityTag: {
    backgroundColor: '#FEE2E2',
  },
  resistanceTag: {
    backgroundColor: '#DBEAFE',
  },
  immunityTag: {
    backgroundColor: '#D1FAE5',
  },
  skillsContainer: {
    gap: 8,
  },
  skillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  skillName: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize',
  },
  skillValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  movementSensesGrid: {
    gap: 12,
  },
  movementSensesItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movementSensesLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  movementSensesValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  resistanceGroup: {
    marginBottom: 12,
  },
  resistanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  sourceText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
}); 