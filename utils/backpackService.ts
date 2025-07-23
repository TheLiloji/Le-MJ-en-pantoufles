import AsyncStorage from '@react-native-async-storage/async-storage';
import { EquipmentItem } from './equipmentService';

export interface BackpackItem {
  itemId: string;
  name: string;
  type: string;
  rarity: string;
  quantity: number;
  description: string;
  icon: string;
  source?: string;
  url?: string;
  weight?: number;
  value?: string;
}

export interface Backpack {
  id: string;
  nom: string;
  description?: string;
  proprietaire?: string;
  items: BackpackItem[];
  capacite: {
    poids: number; // en kg
    volume: number; // en litres
    valeur: number; // en pièces d'or
    items: number; // nombre maximum d'objets
  };
  capaciteUtilisee: {
    poids: number;
    volume: number;
    valeur: number;
    items: number;
  };
  capacitePrincipale?: 'weight' | 'value' | 'items'; // Capacité principale pour la barre de progression
  dateCreation: string;
  dateModification: string;
}

const BACKPACKS_STORAGE_KEY = 'backpacks';

// Charger tous les sacs à dos
export const loadBackpacks = async (): Promise<Backpack[]> => {
  try {
    const data = await AsyncStorage.getItem(BACKPACKS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erreur lors du chargement des sacs à dos:', error);
    return [];
  }
};

// Sauvegarder tous les sacs à dos
export const saveBackpacks = async (backpacks: Backpack[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(BACKPACKS_STORAGE_KEY, JSON.stringify(backpacks));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des sacs à dos:', error);
  }
};

// Créer un nouveau sac à dos
export const createBackpack = async (nom: string, description?: string, proprietaire?: string): Promise<Backpack> => {
  const backpacks = await loadBackpacks();
  const newBackpack: Backpack = {
    id: Date.now().toString(),
    nom,
    description,
    proprietaire,
    items: [],
    capacite: {
      poids: 30, // 30 kg par défaut
      volume: 100, // 100 litres par défaut
      valeur: 1000, // 1000 po par défaut
      items: 50, // 50 objets max par défaut
    },
    capaciteUtilisee: {
      poids: 0,
      volume: 0,
      valeur: 0,
      items: 0,
    },
    capacitePrincipale: 'weight', // Capacité principale par défaut
    dateCreation: new Date().toISOString(),
    dateModification: new Date().toISOString(),
  };
  
  backpacks.push(newBackpack);
  await saveBackpacks(backpacks);
  return newBackpack;
};

// Mettre à jour un sac à dos
export const updateBackpack = async (backpack: Backpack): Promise<void> => {
  const backpacks = await loadBackpacks();
  const index = backpacks.findIndex(b => b.id === backpack.id);
  
  if (index !== -1) {
    backpack.dateModification = new Date().toISOString();
    backpacks[index] = backpack;
    await saveBackpacks(backpacks);
  }
};

// Supprimer un sac à dos
export const deleteBackpack = async (backpackId: string): Promise<void> => {
  try {
    const backpacks = await loadBackpacks();
    const filteredBackpacks = backpacks.filter(b => b.id !== backpackId);
    await saveBackpacks(filteredBackpacks);
  } catch (error) {
    console.error('Erreur dans deleteBackpack:', error);
    throw error;
  }
};

// Ajouter un équipement à un sac à dos
export const addItemToBackpack = async (backpackId: string, item: EquipmentItem): Promise<void> => {
  const backpacks = await loadBackpacks();
  const backpack = backpacks.find(b => b.id === backpackId);
  
  if (backpack) {
    const backpackItem: BackpackItem = {
      itemId: item.id,
      name: item.name,
      type: item.type,
      rarity: item.rarity,
      quantity: item.quantity,
      description: item.description,
      icon: item.icon,
      source: item.source,
      url: item.url,
      weight: calculateItemWeight(item),
      value: calculateItemValue(item),
    };
    
    // Vérifier si l'objet n'est pas déjà dans le sac
    const existingItem = backpack.items.find(i => i.itemId === backpackItem.itemId);
    if (!existingItem) {
      backpack.items.push(backpackItem);
      await recalculateBackpackCapacity(backpack);
      await updateBackpack(backpack);
    } else {
      throw new Error('Cet objet est déjà dans le sac à dos');
    }
  } else {
    throw new Error('Sac à dos non trouvé');
  }
};

// Retirer un équipement d'un sac à dos
export const removeItemFromBackpack = async (backpackId: string, itemId: string): Promise<void> => {
  const backpacks = await loadBackpacks();
  const backpack = backpacks.find(b => b.id === backpackId);
  
  if (backpack) {
    backpack.items = backpack.items.filter(i => i.itemId !== itemId);
    await recalculateBackpackCapacity(backpack);
    await updateBackpack(backpack);
  } else {
    throw new Error('Sac à dos non trouvé');
  }
};

// Mettre à jour la quantité d'un objet
export const updateItemQuantity = async (backpackId: string, itemId: string, quantity: number): Promise<void> => {
  const backpacks = await loadBackpacks();
  const backpack = backpacks.find(b => b.id === backpackId);
  
  if (backpack) {
    const item = backpack.items.find(i => i.itemId === itemId);
    if (item) {
      if (quantity <= 0) {
        // Supprimer l'objet si quantité <= 0
        backpack.items = backpack.items.filter(i => i.itemId !== itemId);
      } else {
        item.quantity = quantity;
      }
      await recalculateBackpackCapacity(backpack);
      await updateBackpack(backpack);
    }
  }
};

// Mettre à jour la capacité d'un sac à dos
export const updateBackpackCapacity = async (backpackId: string, capacite: { poids: number; volume: number; valeur: number; items: number }): Promise<void> => {
  const backpacks = await loadBackpacks();
  const backpack = backpacks.find(b => b.id === backpackId);
  
  if (backpack) {
    backpack.capacite = capacite;
    await recalculateBackpackCapacity(backpack);
    await saveBackpacks(backpacks);
  }
};

// Calculer le poids d'un objet (estimation)
const calculateItemWeight = (item: EquipmentItem): number => {
  const weightMap: { [key: string]: number } = {
    'Arme': 2,
    'Armure': 15,
    'Consommable': 0.5,
    'Objet merveilleux': 1,
    'Anneau': 0.1,
    'Baguette': 0.5,
    'Bâton': 1,
    'Parchemin': 0.1,
    'Potion': 0.5,
    'Poison': 0.2,
  };
  
  return weightMap[item.type] || 1;
};

// Calculer la valeur d'un objet
const calculateItemValue = (item: EquipmentItem): string => {
  const rarityValueMap: { [key: string]: string } = {
    'Commune': '10 po',
    'Peu commune': '50 po',
    'Rare': '500 po',
    'Très rare': '5000 po',
    'Légendaire': '50000 po',
  };
  
  return rarityValueMap[item.rarity] || '10 po';
};

// Recalculer la capacité utilisée d'un sac à dos
const recalculateBackpackCapacity = async (backpack: Backpack): Promise<void> => {
  let poidsTotal = 0;
  let volumeTotal = 0;
  let valeurTotal = 0;
  let itemsTotal = 0;
  
  backpack.items.forEach(item => {
    const poids = (item.weight || 1) * item.quantity;
    const volume = (item.weight || 1) * item.quantity * 0.5; // Estimation du volume
    const valeur = parseFloat((item.value || '10').replace(' po', '').replace(' pa', '').replace(' pc', '')) || 0;
    const valeurTotale = valeur * item.quantity; // Multiplier par la quantité
    itemsTotal += item.quantity;
    poidsTotal += poids;
    volumeTotal += volume;
    valeurTotal += valeurTotale; // Utiliser la valeur totale
  });
  
  backpack.capaciteUtilisee = {
    poids: poidsTotal,
    volume: volumeTotal,
    valeur: valeurTotal,
    items: itemsTotal,
  };
};

// Obtenir le pourcentage de capacité utilisée
export const getCapacityPercentage = (backpack: Backpack): { poids: number; volume: number } => {
  const poidsPourcentage = (backpack.capaciteUtilisee.poids / backpack.capacite.poids) * 100;
  const volumePourcentage = (backpack.capaciteUtilisee.volume / backpack.capacite.volume) * 100;
  
  return {
    poids: Math.min(poidsPourcentage, 100),
    volume: Math.min(volumePourcentage, 100),
  };
};

// Vérifier si un objet peut être ajouté au sac
export const canAddItemToBackpack = (backpack: Backpack, item: EquipmentItem): boolean => {
  const itemWeight = calculateItemWeight(item);
  const currentWeight = backpack.capaciteUtilisee.poids;
  const maxWeight = backpack.capacite.poids;
  
  return (currentWeight + itemWeight) <= maxWeight;
};

// Obtenir les statistiques d'un sac à dos
export const getBackpackStats = (backpack: Backpack) => {
  const stats = {
    totalItems: backpack.items.length,
    totalWeight: backpack.capaciteUtilisee.poids || 0,
    maxWeight: backpack.capacite.poids || 30,
    weightPercentage: backpack.capacite.poids > 0 ? (backpack.capaciteUtilisee.poids / backpack.capacite.poids) * 100 : 0,
    totalValue: backpack.capaciteUtilisee.valeur || 0,
    maxValue: backpack.capacite.valeur || 1000,
    valuePercentage: backpack.capacite.valeur > 0 ? (backpack.capaciteUtilisee.valeur / backpack.capacite.valeur) * 100 : 0,
    totalItemsCount: backpack.capaciteUtilisee.items || 0,
    maxItems: backpack.capacite.items || 50,
    itemsPercentage: backpack.capacite.items > 0 ? (backpack.capaciteUtilisee.items / backpack.capacite.items) * 100 : 0,
    itemsByType: {} as { [key: string]: number },
    itemsByRarity: {} as { [key: string]: number },
  };

  // Calculer les statistiques par type et rareté
  backpack.items.forEach(item => {
    stats.itemsByType[item.type] = (stats.itemsByType[item.type] || 0) + item.quantity;
    stats.itemsByRarity[item.rarity] = (stats.itemsByRarity[item.rarity] || 0) + item.quantity;
  });

  return stats;
}; 