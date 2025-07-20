import AsyncStorage from '@react-native-async-storage/async-storage';
import { Spell } from './spellsService';

export interface GrimoireSpell {
  spellId: string;
  nom: string;
  niveau: string;
  ecole: string;
  description: string;
  temps_incantation: string;
  portee: string;
  composantes: string;
  concentration: string;
  rituel: string;
  classes: string[];
  url: string;
}

export interface Grimoire {
  id: string;
  nom: string;
  description?: string;
  sorts: GrimoireSpell[];
  emplacements: {
    [niveau: string]: number; // niveau -> nombre d'emplacements
  };
  emplacementsUtilises: {
    [niveau: string]: number; // niveau -> emplacements utilisés
  };
  dateCreation: string;
  dateModification: string;
}

const GRIMOIRES_STORAGE_KEY = 'grimoires';

// Charger tous les grimoires
export const loadGrimoires = async (): Promise<Grimoire[]> => {
  try {
    const data = await AsyncStorage.getItem(GRIMOIRES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erreur lors du chargement des grimoires:', error);
    return [];
  }
};

// Sauvegarder tous les grimoires
export const saveGrimoires = async (grimoires: Grimoire[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(GRIMOIRES_STORAGE_KEY, JSON.stringify(grimoires));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des grimoires:', error);
  }
};

// Créer un nouveau grimoire
export const createGrimoire = async (nom: string, description?: string): Promise<Grimoire> => {
  const grimoires = await loadGrimoires();
  const newGrimoire: Grimoire = {
    id: Date.now().toString(),
    nom,
    description,
    sorts: [],
    emplacements: {},
    emplacementsUtilises: {},
    dateCreation: new Date().toISOString(),
    dateModification: new Date().toISOString(),
  };
  
  grimoires.push(newGrimoire);
  await saveGrimoires(grimoires);
  return newGrimoire;
};

// Mettre à jour un grimoire
export const updateGrimoire = async (grimoire: Grimoire): Promise<void> => {
  const grimoires = await loadGrimoires();
  const index = grimoires.findIndex(g => g.id === grimoire.id);
  
  if (index !== -1) {
    grimoire.dateModification = new Date().toISOString();
    grimoires[index] = grimoire;
    await saveGrimoires(grimoires);
  }
};

// Supprimer un grimoire
export const deleteGrimoire = async (grimoireId: string): Promise<void> => {
  console.log('deleteGrimoire appelé:', grimoireId);
  try {
    const grimoires = await loadGrimoires();
    console.log('Grimoires avant suppression:', grimoires.length);
    console.log('IDs des grimoires:', grimoires.map(g => g.id));
    
    const filteredGrimoires = grimoires.filter(g => g.id !== grimoireId);
    console.log('Grimoires après suppression:', filteredGrimoires.length);
    console.log('IDs des grimoires restants:', filteredGrimoires.map(g => g.id));
    
    await saveGrimoires(filteredGrimoires);
    console.log('Grimoire supprimé avec succès');
  } catch (error) {
    console.error('Erreur dans deleteGrimoire:', error);
    throw error;
  }
};

// Ajouter un sort à un grimoire
export const addSpellToGrimoire = async (grimoireId: string, spell: Spell): Promise<void> => {
  const grimoires = await loadGrimoires();
  const grimoire = grimoires.find(g => g.id === grimoireId);
  
  if (grimoire) {
    const grimoireSpell: GrimoireSpell = {
      spellId: `${spell.nom}-${spell.niveau}`, // Utiliser nom+niveau comme ID unique
      nom: spell.nom,
      niveau: spell.niveau,
      ecole: spell.ecole,
      description: spell.description,
      temps_incantation: spell.temps_incantation,
      portee: spell.portee,
      composantes: spell.composantes,
      concentration: spell.concentration,
      rituel: spell.rituel,
      classes: spell.classes || [],
      url: spell.url,
    };
    
    // Vérifier si le sort n'est pas déjà dans le grimoire
    const existingSpell = grimoire.sorts.find(s => s.spellId === grimoireSpell.spellId);
    if (!existingSpell) {
      grimoire.sorts.push(grimoireSpell);
      await updateGrimoire(grimoire);
    } else {
      throw new Error('Ce sort est déjà dans le grimoire');
    }
  } else {
    throw new Error('Grimoire non trouvé');
  }
};

// Retirer un sort d'un grimoire
export const removeSpellFromGrimoire = async (grimoireId: string, spellId: string): Promise<void> => {
  console.log('removeSpellFromGrimoire appelé:', { grimoireId, spellId });
  const grimoires = await loadGrimoires();
  const grimoire = grimoires.find(g => g.id === grimoireId);
  
  if (grimoire) {
    console.log('Grimoire trouvé, sorts avant suppression:', grimoire.sorts.length);
    grimoire.sorts = grimoire.sorts.filter(s => s.spellId !== spellId);
    console.log('Sorts après suppression:', grimoire.sorts.length);
    await updateGrimoire(grimoire);
    console.log('Grimoire mis à jour avec succès');
  } else {
    console.log('Grimoire non trouvé');
    throw new Error('Grimoire non trouvé');
  }
};

// Mettre à jour les emplacements d'un grimoire
export const updateGrimoireEmplacements = async (
  grimoireId: string, 
  emplacements: { [niveau: string]: number }
): Promise<void> => {
  const grimoires = await loadGrimoires();
  const grimoire = grimoires.find(g => g.id === grimoireId);
  
  if (grimoire) {
    grimoire.emplacements = emplacements;
    await updateGrimoire(grimoire);
  }
};

// Utiliser un emplacement de sort
export const useSpellSlot = async (grimoireId: string, niveau: string): Promise<boolean> => {
  const grimoires = await loadGrimoires();
  const grimoire = grimoires.find(g => g.id === grimoireId);
  
  if (grimoire) {
    const emplacementsDisponibles = grimoire.emplacements[niveau] || 0;
    const emplacementsUtilises = grimoire.emplacementsUtilises[niveau] || 0;
    
    if (emplacementsUtilises < emplacementsDisponibles) {
      grimoire.emplacementsUtilises[niveau] = emplacementsUtilises + 1;
      await updateGrimoire(grimoire);
      return true;
    }
  }
  return false;
};

// Restaurer un emplacement de sort
export const restoreSpellSlot = async (grimoireId: string, niveau: string): Promise<boolean> => {
  const grimoires = await loadGrimoires();
  const grimoire = grimoires.find(g => g.id === grimoireId);
  
  if (grimoire) {
    const emplacementsUtilises = grimoire.emplacementsUtilises[niveau] || 0;
    
    if (emplacementsUtilises > 0) {
      grimoire.emplacementsUtilises[niveau] = emplacementsUtilises - 1;
      await updateGrimoire(grimoire);
      return true;
    }
  }
  return false;
};

// Réinitialiser tous les emplacements utilisés
export const resetSpellSlots = async (grimoireId: string): Promise<void> => {
  const grimoires = await loadGrimoires();
  const grimoire = grimoires.find(g => g.id === grimoireId);
  
  if (grimoire) {
    grimoire.emplacementsUtilises = {};
    await updateGrimoire(grimoire);
  }
};

// Obtenir le nombre d'emplacements disponibles pour un niveau
export const getAvailableSlots = (grimoire: Grimoire, niveau: string): number => {
  const emplacementsDisponibles = grimoire.emplacements[niveau] || 0;
  const emplacementsUtilises = grimoire.emplacementsUtilises[niveau] || 0;
  return Math.max(0, emplacementsDisponibles - emplacementsUtilises);
};

// Obtenir le nombre total d'emplacements pour un niveau
export const getTotalSlots = (grimoire: Grimoire, niveau: string): number => {
  return grimoire.emplacements[niveau] || 0;
};

// Obtenir le nombre d'emplacements utilisés pour un niveau
export const getUsedSlots = (grimoire: Grimoire, niveau: string): number => {
  return grimoire.emplacementsUtilises[niveau] || 0;
}; 