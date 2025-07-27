import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft, Package } from 'lucide-react-native';
import { router } from 'expo-router';
import { createBackpack } from '../../utils/backpackService';

export default function CreateBackpackScreen() {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [proprietaire, setProprietaire] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateBackpack = async () => {
    if (!nom.trim()) {
      Alert.alert('Erreur', 'Le nom du sac à dos est requis');
      return;
    }

    setLoading(true);
    try {
      const newBackpack = await createBackpack(nom.trim(), description.trim() || undefined, proprietaire.trim() || undefined);
      
      // Redirection vers la page Equipment après la création
      router.push('/(tabs)/equipment');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      Alert.alert('Erreur', 'Impossible de créer le sac à dos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/equipment')} 
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Créer un sac à dos</Text>
        <Text style={styles.subtitle}>
          Organisez les équipements de vos personnages
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom du sac à dos *</Text>
          <TextInput
            style={styles.input}
            value={nom}
            onChangeText={setNom}
            placeholder="Ex: Sac d'aventurier"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Propriétaire (optionnel)</Text>
          <TextInput
            style={styles.input}
            value={proprietaire}
            onChangeText={setProprietaire}
            placeholder="Ex: Aragorn"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez le contenu ou l'usage de ce sac..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity 
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateBackpack}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Package size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Créer le sac à dos</Text>
            </>
          )}
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
    backgroundColor: '#F59E0B',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FEF3C7',
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  inputGroup: {
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
    paddingTop: 12,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
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