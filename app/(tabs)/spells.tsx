import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Search, Zap, Clock, Target } from 'lucide-react-native';

export default function SpellsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const spells = [
    {
      id: 1,
      name: 'Projectile Magique',
      level: 1,
      school: 'Évocation',
      castingTime: '1 action',
      range: '36 mètres',
      description: 'Trois fléchettes d\'énergie magique jaillissent...',
      damage: '1d4+1 force',
    },
    {
      id: 2,
      name: 'Bouclier',
      level: 1,
      school: 'Abjuration',
      castingTime: '1 réaction',
      range: 'Personnel',
      description: 'Une barrière invisible d\'énergie magique...',
      damage: '+5 CA',
    },
    {
      id: 3,
      name: 'Boule de Feu',
      level: 3,
      school: 'Évocation',
      castingTime: '1 action',
      range: '45 mètres',
      description: 'Une sphère incandescente explose...',
      damage: '8d6 feu',
    },
  ];

  const levelColors = {
    1: '#10B981',
    2: '#3B82F6',
    3: '#8B5CF6',
    4: '#F59E0B',
    5: '#EF4444',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Grimoire de Sorts</Text>
        <Text style={styles.subtitle}>Maîtrisez la magie</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un sort..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {spells.map((spell) => (
          <TouchableOpacity key={spell.id} style={styles.spellCard}>
            <View style={styles.spellHeader}>
              <View>
                <Text style={styles.spellName}>{spell.name}</Text>
                <Text style={styles.spellSchool}>{spell.school}</Text>
              </View>
              <View style={[styles.levelBadge, { backgroundColor: levelColors[spell.level] || '#6B7280' }]}>
                <Text style={styles.levelText}>{spell.level}</Text>
              </View>
            </View>

            <Text style={styles.spellDescription}>{spell.description}</Text>

            <View style={styles.spellDetails}>
              <View style={styles.detailItem}>
                <Clock size={14} color="#6B7280" />
                <Text style={styles.detailText}>{spell.castingTime}</Text>
              </View>
              <View style={styles.detailItem}>
                <Target size={14} color="#6B7280" />
                <Text style={styles.detailText}>{spell.range}</Text>
              </View>
              <View style={styles.detailItem}>
                <Zap size={14} color="#6B7280" />
                <Text style={styles.detailText}>{spell.damage}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    color: '#FEE2E2',
    textAlign: 'center',
    marginTop: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchBox: {
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  spellCard: {
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
  spellHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  spellName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  spellSchool: {
    fontSize: 14,
    color: '#6B7280',
  },
  levelBadge: {
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  spellDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  spellDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 2,
  },
  detailText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 4,
    fontWeight: '500',
  },
});