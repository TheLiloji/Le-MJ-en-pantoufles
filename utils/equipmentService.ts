import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  rarity: string;
  quantity: number;
  description: string;
  icon: string;
  source?: string;
  url?: string;
}

export interface EquipmentCategory {
  name: string;
  description: string;
  subcategories?: {
    [key: string]: {
      name: string;
      items: {
        [key: string]: {
          name: string;
          ca?: number;
          ca_bonus?: number;
          price?: number;
          currency?: string;
          type?: string;
          damage?: string | null;
        };
      };
    };
  };
}

export interface EquipmentData {
  metadata: {
    version: string;
    description: string;
    currency: {
      pc: string;
      pa: string;
      po: string;
    };
  };
  categories: {
    [key: string]: EquipmentCategory;
  };
}

export interface MagicItem {
  nom: string;
  url: string;
  type: string;
  rarete: string;
  lien_magique: boolean;
  description_courte: string;
  description_longue: string;
  image_url?: string | null;
  source: string;
}

export interface Poison {
  nom: string;
  url: string;
  type: string;
  categorie: string;
  prix: string;
  description: string;
  image_url?: string | null;
  source: string;
}

const EQUIPMENT_STORAGE_KEY = 'user_equipment';

// Import des données JSON
const equipmentData = require('../data/equipements_dnd.json');
const magicItemsData = require('../data/objets_magiques_dnd_fr.json');
const poisonsData = require('../data/poisons_dnd_fr.json');

export const loadEquipment = async (): Promise<EquipmentItem[]> => {
  try {
    const stored = await AsyncStorage.getItem(EQUIPMENT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors du chargement de l\'équipement:', error);
    return [];
  }
};

export const saveEquipment = async (equipment: EquipmentItem[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(equipment));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'équipement:', error);
  }
};

export const addEquipmentItem = async (item: Omit<EquipmentItem, 'id'>): Promise<EquipmentItem> => {
  const equipment = await loadEquipment();
  const newItem: EquipmentItem = {
    ...item,
    id: Date.now().toString(),
  };
  
  const updatedEquipment = [...equipment, newItem];
  await saveEquipment(updatedEquipment);
  return newItem;
};

export const updateEquipmentItem = async (id: string, updates: Partial<EquipmentItem>): Promise<void> => {
  const equipment = await loadEquipment();
  const updatedEquipment = equipment.map(item => 
    item.id === id ? { ...item, ...updates } : item
  );
  await saveEquipment(updatedEquipment);
};

export const removeEquipmentItem = async (id: string): Promise<void> => {
  const equipment = await loadEquipment();
  const updatedEquipment = equipment.filter(item => item.id !== id);
  await saveEquipment(updatedEquipment);
};

export const loadEquipmentData = async (): Promise<EquipmentData> => {
  return equipmentData;
};

export const loadMagicItems = async (): Promise<MagicItem[]> => {
  return magicItemsData;
};

export const loadPoisons = async (): Promise<Poison[]> => {
  return poisonsData;
};

export const searchEquipment = (query: string, equipmentData: EquipmentData): Array<{id: string, name: string, type: string, category: string}> => {
  const results: Array<{id: string, name: string, type: string, category: string}> = [];
  
  Object.entries(equipmentData.categories).forEach(([categoryKey, category]) => {
    if (category.subcategories) {
      Object.entries(category.subcategories).forEach(([subcategoryKey, subcategory]) => {
        Object.entries(subcategory.items).forEach(([itemKey, item]) => {
          if (item.name.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              id: itemKey,
              name: item.name,
              type: subcategory.name,
              category: category.name
            });
          }
        });
      });
    }
  });
  
  return results;
};

export const searchMagicItems = (query: string, magicItems: MagicItem[]): MagicItem[] => {
  return magicItems.filter(item => 
    item.nom.toLowerCase().includes(query.toLowerCase()) ||
    item.type.toLowerCase().includes(query.toLowerCase()) ||
    item.rarete.toLowerCase().includes(query.toLowerCase())
  );
};

export const searchPoisons = (query: string, poisons: Poison[]): Poison[] => {
  return poisons.filter(item => 
    item.nom.toLowerCase().includes(query.toLowerCase()) ||
    item.type.toLowerCase().includes(query.toLowerCase()) ||
    item.categorie.toLowerCase().includes(query.toLowerCase())
  );
};

export const getRarityColor = (rarity: string): string => {
  const rarityColors: { [key: string]: string } = {
    'commune': '#6B7280',
    'peu commune': '#10B981',
    'rare': '#3B82F6',
    'très rare': '#8B5CF6',
    'légendaire': '#F59E0B',
    'Commune': '#6B7280',
    'Peu commune': '#10B981',
    'Rare': '#3B82F6',
    'Très rare': '#8B5CF6',
    'Légendaire': '#F59E0B',
  };
  
  return rarityColors[rarity] || '#6B7280';
};

export const getItemIcon = (type: string): string => {
  const iconMap: { [key: string]: string } = {
    // Armes
    'Arme': 'sword',
    'corps à corps': 'sword',
    'distance': 'sword',
    'lancer': 'sword',
    'Armes courantes': 'sword',
    'Armes de guerre': 'sword',
    
    // Armures
    'Armure': 'shield',
    'légère': 'shield',
    'intermédiaire': 'shield',
    'lourde': 'shield',
    'aucune': 'shield',
    'Boucliers': 'shield',
    'Armures': 'shield',
    
    // Consommables et objets
    'Consommable': 'gem',
    'Consommables': 'gem',
    'Objet merveilleux': 'gem',
    'Anneau': 'gem',
    'Baguette': 'gem',
    'Bâton': 'gem',
    'Parchemin': 'gem',
    'Potion': 'gem',
    
    // Poisons
    'ingestion': 'gem',
    'blessure': 'gem',
    'contact': 'gem',
    'inhalation': 'gem',
    'Plante': 'gem',
    'Toxine': 'gem',
    'Mixture': 'gem',
  };
  
  return iconMap[type] || 'package';
};

export const getEquipmentTypes = (equipmentData: EquipmentData): string[] => {
  const types = new Set<string>();
  
  Object.entries(equipmentData.categories).forEach(([categoryKey, category]) => {
    if (category.subcategories) {
      Object.entries(category.subcategories).forEach(([subcategoryKey, subcategory]) => {
        types.add(subcategory.name);
      });
    }
  });
  
  return Array.from(types).sort();
};

export const getMagicItemTypes = (magicItems: MagicItem[]): string[] => {
  const types = new Set<string>();
  magicItems.forEach(item => {
    types.add(item.type);
  });
  return Array.from(types).sort();
};

export const getPoisonTypes = (poisons: Poison[]): string[] => {
  const types = new Set<string>();
  poisons.forEach(item => {
    types.add(item.type);
    types.add(item.categorie);
  });
  return Array.from(types).sort();
}; 