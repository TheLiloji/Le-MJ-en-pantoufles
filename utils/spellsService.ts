import spellsData from '../assets/sorts_dnd_fr.json';

export interface Spell {
  nom: string;
  niveau: string;
  ecole: string;
  temps_incantation: string;
  portee: string;
  composantes: string;
  concentration: string;
  rituel: string;
  description: string;
  url: string;
  classes?: string[];
}

export interface SavedSpell extends Spell {
  id: string;
  dateAdded: string;
}

let savedSpells: SavedSpell[] = [];
let spellsCache: Spell[] | null = null;
let availableClassesCache: string[] | null = null;

// Fonction utilitaire pour nettoyer une chaîne (optimisée)
const cleanString = (str: string | undefined | null): string => {
  if (!str) return '';
  const trimmed = str.trim();
  if (!trimmed || /^[.\s]+$/.test(trimmed) || trimmed === '.') return '';
  return trimmed;
};

// Fonction utilitaire pour vérifier si une chaîne est valide pour l'affichage
export const isValidDisplayString = (str: string | undefined | null): boolean => {
  if (!str) return false;
  const trimmed = str.trim();
  if (!trimmed || trimmed.length === 0) return false;
  if (trimmed === '.') return false;
  if (/^[.\s]+$/.test(trimmed)) return false;
  return true;
};

// Traitement unique des sorts avec cache
const processSpellsData = async (): Promise<Spell[]> => {
  if (spellsCache) {
    return spellsCache;
  }

  const spells = spellsData as Spell[];
  
  // Traitement optimisé en une seule passe
  const processedSpells = spells
    .map(spell => ({
      ...spell,
      concentration: cleanString(spell.concentration),
      rituel: cleanString(spell.rituel),
      nom: cleanString(spell.nom),
      ecole: cleanString(spell.ecole),
      temps_incantation: cleanString(spell.temps_incantation),
      portee: cleanString(spell.portee),
      composantes: cleanString(spell.composantes),
      description: cleanString(spell.description),
      url: cleanString(spell.url),
      niveau: cleanString(spell.niveau) || '0',
      classes: spell.classes || [],
    }))
    .filter(spell => 
      spell.nom && 
      spell.nom.length > 0 && 
      spell.description && 
      spell.description.length > 0
    );

  spellsCache = processedSpells;
  return processedSpells;
};

export const loadAllSpells = async (): Promise<Spell[]> => {
  return processSpellsData();
};

export const searchSpells = async (query: string): Promise<Spell[]> => {
  const spells = await loadAllSpells();
  const searchTerm = query.toLowerCase();
  
  return spells.filter(spell => 
    spell.nom.toLowerCase().includes(searchTerm) ||
    spell.ecole.toLowerCase().includes(searchTerm) ||
    spell.description.toLowerCase().includes(searchTerm) ||
    (spell.classes && spell.classes.some(c => c.toLowerCase().includes(searchTerm)))
  );
};

export const getSpellByLevel = async (level: string): Promise<Spell[]> => {
  const spells = await loadAllSpells();
  return spells.filter(spell => spell.niveau === level);
};

export const getSpellBySchool = async (school: string): Promise<Spell[]> => {
  const spells = await loadAllSpells();
  return spells.filter(spell => spell.ecole.toLowerCase() === school.toLowerCase());
};

export const getSpellByClass = async (className: string): Promise<Spell[]> => {
  const spells = await loadAllSpells();
  return spells.filter(spell => {
    if (!spell.classes) return false;
    return spell.classes.some(c => c.toLowerCase() === className.toLowerCase());
  });
};

export const getAvailableClasses = async (): Promise<string[]> => {
  if (availableClassesCache) {
    return availableClassesCache;
  }

  const spells = await loadAllSpells();
  const allClasses = new Set<string>();
  
  spells.forEach(spell => {
    if (spell.classes) {
      spell.classes.forEach(className => {
        if (className && className.trim()) {
          allClasses.add(className.trim());
        }
      });
    }
  });
  
  const classes = Array.from(allClasses).sort();
  availableClassesCache = classes;
  return classes;
};

export const getSpellsByClassAndLevel = async (className: string, level: string): Promise<Spell[]> => {
  const spells = await getSpellByClass(className);
  return spells.filter(spell => spell.niveau === level);
};

export const addSpellToSaved = (spell: Spell): void => {
  const savedSpell: SavedSpell = {
    ...spell,
    id: Date.now().toString(),
    dateAdded: new Date().toISOString()
  };
  
  // Vérifier si le sort n'est pas déjà sauvegardé
  const exists = savedSpells.find(s => s.nom === spell.nom);
  if (!exists) {
    savedSpells.push(savedSpell);
  }
};

export const removeSpellFromSaved = (spellId: string): void => {
  savedSpells = savedSpells.filter(spell => spell.id !== spellId);
};

export const getSavedSpells = (): SavedSpell[] => {
  return [...savedSpells];
};

export const isSpellSaved = (spellName: string): boolean => {
  return savedSpells.some(spell => spell.nom === spellName);
};

// Fonction pour vider le cache si nécessaire (pour le développement)
export const clearSpellsCache = (): void => {
  spellsCache = null;
  availableClassesCache = null;
}; 