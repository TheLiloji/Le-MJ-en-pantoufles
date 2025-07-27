import { Linking } from 'react-native';

export interface MagicItem {
  nom: string;
  url: string;
  type: string;
  rarete: string;
  lien_magique: boolean;
  description_courte: string;
  description_longue: string;
  image_url: string | null;
  source: string;
}

// Cache pour les objets magiques
let magicItemsCache: MagicItem[] | null = null;

export const loadAllMagicItems = async (): Promise<MagicItem[]> => {
  if (magicItemsCache) {
    return magicItemsCache;
  }

  try {
    const response = await import('../assets/objets_magiques_dnd_fr.json');
    magicItemsCache = response.default;
    return magicItemsCache;
  } catch (error) {
    console.error('Erreur lors du chargement des objets magiques:', error);
    return [];
  }
};

export const searchMagicItems = async (query: string): Promise<MagicItem[]> => {
  const allItems = await loadAllMagicItems();
  const searchTerm = query.toLowerCase();
  
  return allItems.filter(item => 
    item.nom.toLowerCase().includes(searchTerm) ||
    item.type.toLowerCase().includes(searchTerm) ||
    item.rarete.toLowerCase().includes(searchTerm) ||
    item.description_courte.toLowerCase().includes(searchTerm) ||
    item.description_longue.toLowerCase().includes(searchTerm)
  );
};

export const getMagicItemByType = async (type: string): Promise<MagicItem[]> => {
  const allItems = await loadAllMagicItems();
  return allItems.filter(item => 
    item.type.toLowerCase() === type.toLowerCase()
  );
};

export const getMagicItemByRarity = async (rarity: string): Promise<MagicItem[]> => {
  const allItems = await loadAllMagicItems();
  return allItems.filter(item => 
    item.rarete.toLowerCase() === rarity.toLowerCase()
  );
};

export const getAvailableTypes = async (): Promise<string[]> => {
  const allItems = await loadAllMagicItems();
  const types = new Set(allItems.map(item => item.type));
  return Array.from(types).sort();
};

export const getAvailableRarities = async (): Promise<string[]> => {
  const allItems = await loadAllMagicItems();
  const rarities = new Set(allItems.map(item => item.rarete));
  return Array.from(rarities).sort();
};

export const getMagicItemByName = async (name: string): Promise<MagicItem | null> => {
  const allItems = await loadAllMagicItems();
  return allItems.find(item => item.nom === name) || null;
};

export const openMagicItemUrl = async (url: string): Promise<void> => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.error('URL non supportée:', url);
    }
  } catch (error) {
    console.error('Erreur lors de l\'ouverture de l\'URL:', error);
  }
};

export const isValidDisplayString = (str: string | null | undefined): boolean => {
  return str !== null && str !== undefined && str.trim() !== '';
}; 