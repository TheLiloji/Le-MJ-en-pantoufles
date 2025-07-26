import { loadAllSpells, getAvailableClasses } from './spellsService';
import { loadGrimoires } from './grimoireService';
import { loadBackpacks } from './backpackService';

// Interface pour suivre l'état du préchargement
export interface PreloadStatus {
  spells: boolean;
  classes: boolean;
  grimoires: boolean;
  backpacks: boolean;
  total: number;
  completed: number;
}

let preloadStatus: PreloadStatus = {
  spells: false,
  classes: false,
  grimoires: false,
  backpacks: false,
  total: 4,
  completed: 0
};

// Fonction pour précharger toutes les données
export const preloadAllData = async (): Promise<void> => {
  console.log('🚀 Début du préchargement des données...');
  
  try {
    // Précharger les sorts (le plus lourd)
    console.log('📚 Préchargement des sorts...');
    await loadAllSpells();
    preloadStatus.spells = true;
    preloadStatus.completed++;
    console.log('✅ Sorts préchargés');

    // Précharger les classes disponibles
    console.log('🎭 Préchargement des classes...');
    await getAvailableClasses();
    preloadStatus.classes = true;
    preloadStatus.completed++;
    console.log('✅ Classes préchargées');

    // Précharger les grimoires
    console.log('📖 Préchargement des grimoires...');
    await loadGrimoires();
    preloadStatus.grimoires = true;
    preloadStatus.completed++;
    console.log('✅ Grimoires préchargés');

    // Précharger les sacs à dos
    console.log('🎒 Préchargement des sacs à dos...');
    await loadBackpacks();
    preloadStatus.backpacks = true;
    preloadStatus.completed++;
    console.log('✅ Sacs à dos préchargés');

    console.log('🎉 Préchargement terminé !');
  } catch (error) {
    console.error('❌ Erreur lors du préchargement:', error);
    throw error;
  }
};

// Fonction pour obtenir le statut du préchargement
export const getPreloadStatus = (): PreloadStatus => {
  return { ...preloadStatus };
};

// Fonction pour réinitialiser le statut (utile pour les tests)
export const resetPreloadStatus = (): void => {
  preloadStatus = {
    spells: false,
    classes: false,
    grimoires: false,
    backpacks: false,
    total: 4,
    completed: 0
  };
};

// Fonction pour vérifier si tout est préchargé
export const isPreloadComplete = (): boolean => {
  return preloadStatus.completed === preloadStatus.total;
}; 