import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft, Settings, Weight, Save } from 'lucide-react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { loadBackpacks, updateBackpack, Backpack } from '@/utils/backpackService';

export default function BackpackSettingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [backpack, setBackpack] = useState<Backpack | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maxWeight, setMaxWeight] = useState('30');
  const [maxVolume, setMaxVolume] = useState('30');

  const loadBackpackData = async () => {
    try {
      const backpacks = await loadBackpacks();
      const foundBackpack = backpacks.find(b => b.id === id);
      if (foundBackpack) {
        setBackpack(foundBackpack);
        setMaxWeight(foundBackpack.capacite.poids.toString());
        setMaxVolume(foundBackpack.capacite.volume.toString());
      } else {
        Alert.alert('Erreur', 'Sac à dos non trouvé');
        router.back();
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger le sac à dos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadBackpackData();
    }, [id])
  );

  const handleSave = async () => {
    if (!backpack) return;

    const newMaxWeight = parseFloat(maxWeight);
    const newMaxVolume = parseFloat(maxVolume);

    if (isNaN(newMaxWeight) || newMaxWeight <= 0) {
      Alert.alert('Erreur', 'Le poids maximum doit être un nombre positif');
      return;
    }

    if (isNaN(newMaxVolume) || newMaxVolume <= 0) {
      Alert.alert('Erreur', 'Le volume maximum doit être un nombre positif');
      return;
    }

    setSaving(true);
    try {
      const updatedBackpack = {
        ...backpack,
        capacite: {
          poids: newMaxWeight,
          volume: newMaxVolume
        }
      };

      await updateBackpack(updatedBackpack);
      Alert.alert('Succès', 'Capacité du sac à dos mise à jour');
      router.back();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la capacité');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!backpack) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Paramètres</Text>
        <TouchableOpacity 
          onPress={handleSave}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Save size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Capacité du sac à dos</Text>
          <Text style={styles.sectionSubtitle}>
            Modifiez les limites de poids et de volume de votre sac à dos
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Weight size={20} color="#F59E0B" />
              <Text style={styles.label}>Poids maximum (kg)</Text>
            </View>
            <TextInput
              style={styles.input}
              value={maxWeight}
              onChangeText={setMaxWeight}
              placeholder="30"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabel}>
              <Settings size={20} color="#F59E0B" />
              <Text style={styles.label}>Volume maximum</Text>
            </View>
            <TextInput
              style={styles.input}
              value={maxVolume}
              onChangeText={setMaxVolume}
              placeholder="30"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Informations</Text>
          <Text style={styles.infoText}>
            • Le poids maximum détermine combien d'objets lourds vous pouvez porter
          </Text>
          <Text style={styles.infoText}>
            • Le volume maximum détermine combien d'objets volumineux vous pouvez transporter
          </Text>
          <Text style={styles.infoText}>
            • Ces valeurs affectent les vérifications lors de l'ajout d'objets
          </Text>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
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
  infoContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    marginBottom: 4,
  },
}); 