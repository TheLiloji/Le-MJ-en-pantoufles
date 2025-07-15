import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Plus, Sword, Shield, Heart } from 'lucide-react-native';

export default function CharactersScreen() {
  const [characters, setCharacters] = useState([
    {
      id: 1,
      name: 'Elara la Mystique',
      race: 'Elfe',
      class: 'Sorcière',
      level: 5,
      hp: 42,
      maxHp: 42,
      ac: 15,
    },
    {
      id: 2,
      name: 'Thorin Barbe-de-Fer',
      race: 'Nain',
      class: 'Guerrier',
      level: 3,
      hp: 28,
      maxHp: 35,
      ac: 18,
    },
  ]);

  const handleCreateCharacter = () => {
    router.push('/create');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LeMjEnPantoufles</Text>
        <Text style={styles.subtitle}>Mes Personnages D&D</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {characters.map((character) => (
          <TouchableOpacity key={character.id} style={styles.characterCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.characterName}>{character.name}</Text>
                <Text style={styles.characterDetails}>
                  {character.race} {character.class} - Niveau {character.level}
                </Text>
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{character.level}</Text>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Heart size={16} color="#DC2626" />
                <Text style={styles.statText}>
                  {character.hp}/{character.maxHp}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Shield size={16} color="#6B46C1" />
                <Text style={styles.statText}>CA {character.ac}</Text>
              </View>
              <View style={styles.statItem}>
                <Sword size={16} color="#F59E0B" />
                <Text style={styles.statText}>Prêt</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={handleCreateCharacter}>
          <Plus size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Créer un Personnage</Text>
        </TouchableOpacity>
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
    backgroundColor: '#6B46C1',
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
    color: '#E0E7FF',
    textAlign: 'center',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  characterCard: {
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
    borderLeftColor: '#6B46C1',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  characterName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  characterDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  levelBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 6,
  },
  addButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 100,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});