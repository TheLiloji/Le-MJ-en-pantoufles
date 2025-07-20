import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react-native';
import { router } from 'expo-router';
import { createGrimoire } from '../../utils/grimoireService';

export default function CreateGrimoireScreen() {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateGrimoire = async () => {
    if (!nom.trim()) {
      Alert.alert('Erreur', 'Le nom du grimoire est requis');
      return;
    }

    setLoading(true);
    try {
      const newGrimoire = await createGrimoire(nom.trim(), description.trim() || undefined);
      Alert.alert(
        'Succès',
        `Grimoire "${newGrimoire.nom}" créé avec succès !`,
        [
          {
            text: 'OK',
            onPress: () => router.push({
              pathname: '/grimoires/[id]',
              params: { id: newGrimoire.id }
            })
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      Alert.alert('Erreur', 'Impossible de créer le grimoire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.push('/(tabs)/spells')}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Nouveau Grimoire</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nom du grimoire *</Text>
          <TextInput
            style={styles.input}
            value={nom}
            onChangeText={setNom}
            placeholder="Ex: Grimoire de l'École de l'Illusion"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Description du grimoire..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity 
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateGrimoire}
          disabled={loading}
        >
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>
            {loading ? 'Création...' : 'Créer le grimoire'}
          </Text>
        </TouchableOpacity>
      </View>
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
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 