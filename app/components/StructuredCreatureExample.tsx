import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StructuredCreatureCard from './StructuredCreatureCard';

// Exemple avec les données que vous avez fournies
const exampleCreatureData = {
  type: "Aberration",
  size: "M",
  alignment: "Loyal Mauvais",
  challenge: "7",
  hitDiceCount: 16,
  abilityScores: {
    for: 16,
    dex: 14,
    con: 15,
    int: 18,
    sag: 13,
    cha: 14,
  },
  savingThrows: [
    "int",
    "sag",
    "cha"
  ],
  ac: {
    armorType: "armure naturelle",
    value: 3
  },
  skills: [
    {
      name: "intimidation",
      invalid: true,
      value: 7
    },
    {
      name: "perception",
      invalid: true,
      value: 6
    },
    {
      name: "perspicacite",
      invalid: true,
      value: 6
    }
  ],
  movement: {
    walk: 9
  },
  senses: {
    darkvision: 18,
    customPassivePerception: 16
  },
  damageTypeVulnerabilities: [
    "feu"
  ],
  damageTypeResistances: [
    "acide",
    "froid"
  ],
  damageTypeImmunities: [
    "poison"
  ],
  languages: [
    "Commun des profondeurs",
    "profond",
    "langue raciale de la créature d'origine"
  ],
  telepathy: 18,
  environments: [
    "Mer / Océan"
  ],
  dungeonTypes: [
    "Ruines sous-marines"
  ],
  source: "Créatures & Oppositions",
  source_page: 23
};

export default function StructuredCreatureExample() {
  return (
    <View style={styles.container}>
      <StructuredCreatureCard 
        creature={exampleCreatureData}
        name="Aboleth"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
}); 