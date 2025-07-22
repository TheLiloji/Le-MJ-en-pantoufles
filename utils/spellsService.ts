// Lazy import for better code splitting
let spellsData: Spell[] | null = null;

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
  classes: string[];
}

// Cache for expensive operations
const spellSearchCache = new Map<string, Spell[]>();
const schoolCache = new Map<string, Spell[]>();
const levelCache = new Map<number, Spell[]>();
let allSchoolsCache: string[] | null = null;

/**
 * Lazy load spells data only when needed
 */
async function loadSpellsData(): Promise<Spell[]> {
  if (spellsData === null) {
    // Dynamic import for code splitting
    const module = await import('../data/sorts_dnd_fr.json');
    spellsData = module.default;
  }
  return spellsData;
}

/**
 * Charge tous les sorts avec cache
 */
export const loadAllSpells = async (): Promise<Spell[]> => {
  return await loadSpellsData();
};

/**
 * Version synchrone pour la compatibilité ascendante
 * @deprecated Utilisez loadAllSpells() async à la place
 */
export const loadAllSpellsSync = (): Spell[] => {
  if (spellsData === null) {
    // Fallback synchrone - attention aux performances
    const spellsDataSync = require('../data/sorts_dnd_fr.json');
    spellsData = spellsDataSync as Spell[];
  }
  return spellsData;
};

/**
 * Recherche de sorts par nom avec cache
 */
export const searchSpellsByName = async (name: string): Promise<Spell[]> => {
  const cacheKey = `name_${name.toLowerCase().trim()}`;
  
  if (spellSearchCache.has(cacheKey)) {
    return spellSearchCache.get(cacheKey)!;
  }
  
  const spells = await loadSpellsData();
  const results = spells.filter(spell => 
    spell.nom.toLowerCase().includes(name.toLowerCase())
  );
  
  spellSearchCache.set(cacheKey, results);
  return results;
};

/**
 * Filtre les sorts par niveau avec cache
 */
export const filterSpellsByLevel = async (level: number): Promise<Spell[]> => {
  if (levelCache.has(level)) {
    return levelCache.get(level)!;
  }
  
  const spells = await loadSpellsData();
  const results = spells.filter(spell => spell.niveau === level);
  
  levelCache.set(level, results);
  return results;
};

/**
 * Filtre les sorts par école avec cache
 */
export const filterSpellsBySchool = async (school: string): Promise<Spell[]> => {
  const cacheKey = school.toLowerCase();
  
  if (schoolCache.has(cacheKey)) {
    return schoolCache.get(cacheKey)!;
  }
  
  const spells = await loadSpellsData();
  const results = spells.filter(spell => 
    spell.ecole.toLowerCase() === school.toLowerCase()
  );
  
  schoolCache.set(cacheKey, results);
  return results;
};

/**
 * Filtre les sorts par classe
 */
export const filterSpellsByClass = async (className: string): Promise<Spell[]> => {
  const spells = await loadSpellsData();
  return spells.filter(spell => 
    spell.classes.some(c => c.toLowerCase().includes(className.toLowerCase()))
  );
};

/**
 * Obtient toutes les écoles de magie avec cache
 */
export const getSpellSchools = async (): Promise<string[]> => {
  if (allSchoolsCache !== null) {
    return allSchoolsCache;
  }
  
  const spells = await loadSpellsData();
  const schools = new Set(spells.map(spell => spell.ecole));
  allSchoolsCache = Array.from(schools).sort();
  return allSchoolsCache;
};

/**
 * Recherche avancée avec filtres multiples et cache
 */
export const searchSpells = async (filters: {
  name?: string;
  level?: number;
  school?: string;
  className?: string;
}): Promise<Spell[]> => {
  const cacheKey = JSON.stringify(filters);
  
  if (spellSearchCache.has(cacheKey)) {
    return spellSearchCache.get(cacheKey)!;
  }
  
  let spells = await loadSpellsData();
  
  if (filters.name) {
    spells = spells.filter(spell => 
      spell.nom.toLowerCase().includes(filters.name!.toLowerCase())
    );
  }
  
  if (filters.level !== undefined) {
    spells = spells.filter(spell => spell.niveau === filters.level);
  }
  
  if (filters.school) {
    spells = spells.filter(spell => 
      spell.ecole.toLowerCase() === filters.school!.toLowerCase()
    );
  }
  
  if (filters.className) {
    spells = spells.filter(spell => 
      spell.classes.some(c => c.toLowerCase().includes(filters.className!.toLowerCase()))
    );
  }
  
  spellSearchCache.set(cacheKey, spells);
  return spells;
};

/**
 * Nettoie le cache - utile pour les tests ou la gestion mémoire
 */
export const clearSpellsCache = (): void => {
  spellSearchCache.clear();
  schoolCache.clear();
  levelCache.clear();
  allSchoolsCache = null;
}; 